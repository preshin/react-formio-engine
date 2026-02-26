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

// ---------------------------------------------------------------------------

// ReactComponent (Field class) for backward compat with custom components
export const ReactComponent = Components.components.field;

// baseEditForm for custom component settings forms
export const baseEditForm = Components.baseEditForm;

// Form schema helpers
export { removeSubmitFormio, removeAutoFocusFormio } from './utils/helpers';

// Re-export Formio singleton for advanced usage (component registration, etc.)
export const Formio = _Formio;
