# react-formio-engine

React functional components for form rendering and building, powered by [formiojs](https://github.com/formio/formio.js). Drop-in replacement for `@formio/react` with no class components.

## Install

```bash
npm install react-formio-engine
```

## Quick Start

```jsx
import { Form } from 'react-formio-engine';
import 'bootstrap/dist/css/bootstrap.css';
import 'formiojs/dist/formio.full.css';

const schema = {
  display: 'form',
  components: [
    { type: 'textfield', key: 'name', label: 'Name', validate: { required: true } },
    { type: 'email', key: 'email', label: 'Email' },
    { type: 'button', action: 'submit', label: 'Submit' },
  ],
};

function App() {
  return <Form src={schema} onSubmit={({ data }) => console.log(data)} />;
}
```

## Exports

| Export | Description |
|--------|-------------|
| `Form` / `FormRenderer` | Renders a form from a JSON schema |
| `FormBuilder` | Drag-and-drop form builder |
| `Formio` | Formio singleton for advanced usage |
| `FormEngineProvider` | Theme context provider |
| `ReactComponent` | Base class for custom components (backward compat) |
| `baseEditForm` | Base settings form for custom component editors |
| `createFormComponent` | Factory for custom components (functional API) |
| `registerComponent` | Register a custom component type |
| `removeSubmitFormio` | Remove submit buttons from a form schema |
| `removeAutoFocusFormio` | Remove autofocus from form components |

## Form Renderer

```jsx
import { Form } from 'react-formio-engine';

<Form
  src={formSchema}                    // Form JSON schema
  submission={{ data: { name: 'John' } }}  // Initial data
  options={{ noAlerts: true }}        // Formio options
  onSubmit={({ data }) => {}}        // Submit callback
  onChange={(submission) => {}}       // Change callback
  ref={formRef}                      // Access formRef.formio.submit()
/>
```

## Form Builder

```jsx
import { FormBuilder } from 'react-formio-engine';

<FormBuilder
  form={{ display: 'form', components: [] }}
  options={{
    builder: {
      basic: false,
      customBasic: {
        title: 'Fields',
        default: true,
        components: { textfield: true, email: true, textarea: true, button: true },
      },
    },
  }}
  onChange={(schema) => console.log(schema)}
/>
```

## Custom Components

```jsx
import { createFormComponent, Formio } from 'react-formio-engine';

const MyColorPicker = createFormComponent({
  type: 'colorpicker',
  label: 'Color Picker',
  icon: 'paint-brush',
  render: ({ value, onChange }) => (
    <input type="color" value={value || '#000'} onChange={(e) => onChange(e.target.value)} />
  ),
});

// Register for use in forms
Formio.registerComponent('colorpicker', MyColorPicker);
```

## Theme Provider

```jsx
import { FormEngineProvider, Form } from 'react-formio-engine';

<FormEngineProvider theme="antd">
  <Form src={schema} />
</FormEngineProvider>
```

## Backward Compatibility

- Supports the same JSON schema format as formio.js v4
- `ReactComponent` and `baseEditForm` re-exported for existing custom components
- Drop-in API compatible with `@formio/react`

## Keywords

`react` `formio` `form-builder` `form-renderer` `json-schema-form` `drag-and-drop` `form-engine` `formiojs` `functional-components`

## License

MIT
