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

// ReactComponent (Field class) for backward compat with custom components
export const ReactComponent = Components.components.field;

// baseEditForm for custom component settings forms
export const baseEditForm = Components.baseEditForm;

// Form schema helpers
export { removeSubmitFormio, removeAutoFocusFormio } from './utils/helpers';

// Re-export Formio singleton for advanced usage (component registration, etc.)
export const Formio = _Formio;
