// Core components
export { default as Form } from './core/FormRenderer';
export { default as FormRenderer } from './core/FormRenderer';
export { default as FormBuilder } from './core/FormBuilder';
export { default as FormEngineProvider } from './core/FormEngineProvider';
export { FormEngineContext } from './core/FormEngineProvider';

// Custom component utilities
export { createFormComponent } from './core/createFormComponent';
export { registerComponent } from './core/registry';

// Re-export from @formio/js — accessed via Components to avoid restricted deep imports
import { Components, Formio as _Formio } from '@formio/js';
import { createNumberMask } from '@formio/text-mask-addons';

// ---------------------------------------------------------------------------
// @formio/js v5 runtime patches
// ---------------------------------------------------------------------------

// Patch 1: Ace editor theme loading
// @formio/js hardcodes `ace/theme/xcode` as the default wysiwygDefault theme.
// When Ace is bundled (via react-ace/brace/ace-builds), the theme file isn't at
// any URL that Ace's internal loadScript can reach, causing 404 errors.
// Fix: remove the default theme from the Component prototype's wysiwygDefault
// so Ace uses its built-in default instead of trying to dynamically load one.
const BaseComponent = Components.components?.component;
if (BaseComponent?.prototype) {
  const origDesc = Object.getOwnPropertyDescriptor(BaseComponent.prototype, 'wysiwygDefault');
  if (origDesc?.get) {
    Object.defineProperty(BaseComponent.prototype, 'wysiwygDefault', {
      get() {
        const defaults = origDesc.get.call(this);
        if (defaults?.ace) {
          delete defaults.ace.theme;
        }
        return defaults;
      },
    });
  }
}

// Patch 2: EditGrid.saveRow focusedComponent null check
// Upstream bug — EditGrid.saveRow reads this.root?.focusedComponent via optional
// chaining but then assigns this.root.focusedComponent = null without checking
// that this.root exists, throwing a TypeError during drag-and-drop operations.
const EditGrid = Components.components?.editgrid;
if (EditGrid?.prototype?.saveRow) {
  const _origSaveRow = EditGrid.prototype.saveRow;
  EditGrid.prototype.saveRow = function (rowIndex, modified) {
    if (!this.root) {
      this.root = {};
    }
    return _origSaveRow.call(this, rowIndex, modified);
  };
}

// Patch 3: Number component — allow leading zeros as first digit
// createNumberMask defaults allowLeadingZeroes to false, which strips the leading
// zero when a second digit is typed (e.g. typing "07" becomes "7"). This breaks
// use cases where users need to enter values starting with 0 (e.g. "0.5", "007").
const NumberComponent = Components.components?.number;
if (NumberComponent?.prototype?.createNumberMask) {
  NumberComponent.prototype.createNumberMask = function () {
    return createNumberMask({
      prefix: '',
      suffix: '',
      requireDecimal: this.component?.requireDecimal ?? false,
      thousandsSeparatorSymbol: this.delimiter || '',
      decimalSymbol: this.component?.decimalSymbol ?? this.decimalSeparator,
      decimalLimit: this.component?.decimalLimit ?? this.decimalLimit,
      allowNegative: this.component?.allowNegative ?? true,
      allowDecimal: this.isDecimalAllowed(),
      allowLeadingZeroes: true,
    });
  };
}

// Patch 4: File component — default imageSize to '100' (formio's default is '200')
//
// Two parts: (a) wrap the static schema so newly added File components in the
// builder and runtime defaults for forms whose JSON omits imageSize both pick
// up '100'. User-provided imageSize in form JSON still wins via lodash _.merge.
// (b) Walk the File editForm definition and disable clearOnHide on the
// imageSize textfield. The textfield is conditionally hidden until "Display
// as image(s)" is checked, and inherits clearOnHide:true, so without this
// formio strips data.imageSize the moment the edit dialog renders — leaving
// the preview <img> with style="width:px" and the field showing only its
// placeholder until the user retypes a number.
const FileComponent = Components.components?.file;
if (FileComponent?.schema) {
  const _origFileSchema = FileComponent.schema.bind(FileComponent);
  FileComponent.schema = function (...extend) {
    return _origFileSchema({ imageSize: '100' }, ...extend);
  };
}
if (FileComponent?.editForm) {
  const _origFileEditForm = FileComponent.editForm;
  FileComponent.editForm = function (...args) {
    const result = _origFileEditForm.apply(this, args);
    const walk = (comps) => {
      if (!Array.isArray(comps)) return;
      for (const c of comps) {
        if (!c || typeof c !== 'object') continue;
        if (c.key === 'imageSize') {
          c.clearOnHide = false;
        }
        if (Array.isArray(c.components)) walk(c.components);
        if (Array.isArray(c.columns)) {
          c.columns.forEach((col) => walk(col?.components));
        }
        if (Array.isArray(c.rows)) {
          c.rows.forEach(
            (row) => Array.isArray(row) && row.forEach((col) => walk(col?.components)),
          );
        }
      }
    };
    walk(result?.components);
    return result;
  };
}

// ---------------------------------------------------------------------------

// ReactComponent (Field class) for backward compat with custom components
export const ReactComponent = Components.components.field;

// baseEditForm for custom component settings forms
export const baseEditForm = Components.baseEditForm;

// Form schema helpers
export { removeSubmitFormio, removeAutoFocusFormio } from './utils/helpers';

// Re-export Formio singleton for advanced usage (component registration, etc.)
export const Formio = _Formio;
