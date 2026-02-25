import { createRoot } from 'react-dom/client';
import { Components } from '@formio/js';

/**
 * Factory function for creating custom formio components using a functional API.
 *
 * Internally creates a class (required by formiojs engine) but the public API
 * is purely functional — consumers never write class components.
 *
 * @param {Object} config
 * @param {string} config.type - Component type identifier (e.g., 'colorpicker')
 * @param {string} config.label - Display label in the builder
 * @param {string} config.icon - Font Awesome icon name (e.g., 'paint-brush')
 * @param {string} [config.group='basic'] - Builder group
 * @param {number} [config.weight=10] - Sort weight in builder
 * @param {*} [config.defaultValue=''] - Default value for new instances
 * @param {Function} [config.settingsForm] - Settings form factory for the builder
 * @param {Function} config.render - React render function ({ value, onChange, component, data }) => JSX
 * @returns {Class} - A formiojs-compatible component class
 */
export function createFormComponent({
  type,
  label,
  icon,
  group = 'basic',
  weight = 10,
  defaultValue = '',
  settingsForm,
  render,
}) {
  // Get Field class from Components registry (avoids restricted deep imports in @formio/js v5)
  const Base = Components.components.field;

  return class CustomFormComponent extends Base {
    static get builderInfo() {
      return {
        title: label,
        icon: icon || 'cog',
        group: group,
        documentation: '',
        weight: weight,
        schema: CustomFormComponent.schema(),
      };
    }

    static schema() {
      return Base.schema({
        type,
        label,
        defaultValue: defaultValue ?? '',
      });
    }

    static editForm = settingsForm;

    constructor(component, options, data) {
      super(component, options, data);
      this._root = null;
    }

    updateValue = (value) => {
      const newValue = value === undefined || value === null ? this.getValue() : value;
      const changed = newValue !== undefined ? this.hasChanged(newValue, this.dataValue) : false;
      this.dataValue = Array.isArray(newValue) ? [...newValue] : newValue;
      this.updateOnChange({}, changed);
      return true;
    };

    render() {
      return super.render(`<div ref="react-${this.id}"></div>`);
    }

    attach(element) {
      super.attach(element);
      this.loadRefs(element, { [`react-${this.id}`]: 'single' });

      const reactEl = this.refs[`react-${this.id}`];
      if (reactEl) {
        this._root = createRoot(reactEl);
        this._root.render(
          render({
            component: this.component,
            value: this.dataValue,
            onChange: this.updateValue,
            data: this.data,
          })
        );

        if (this.shouldSetValue) {
          this.setValue(this.dataForSetting);
          this.updateValue(this.dataForSetting);
        }
      }
      return Promise.resolve();
    }

    detach() {
      const reactEl = this.refs[`react-${this.id}`];
      if (reactEl && this._root) {
        this._root.unmount();
        this._root = null;
      }
      super.detach();
    }

    setValue(value) {
      if (this._root) {
        this._root.render(
          render({
            component: this.component,
            value: value,
            onChange: this.updateValue,
            data: this.data,
          })
        );
        this.shouldSetValue = false;
      } else {
        this.shouldSetValue = true;
        this.dataForSetting = value;
      }
    }

    getValue() {
      return this.dataValue;
    }
  };
}
