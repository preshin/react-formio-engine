import { Formio } from '@formio/js';

/**
 * Register a custom component with the form engine.
 *
 * @param {string} type - Component type identifier (e.g., 'colorpicker')
 * @param {Class} component - Component class (from createFormComponent or a raw formiojs component class)
 */
export function registerComponent(type, component) {
  Formio.registerComponent(type, component);
}
