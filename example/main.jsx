import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Form, FormBuilder, FormEngineProvider, Formio } from '../src/index';
import 'bootstrap/dist/css/bootstrap.css';
import '../src/themes/default.css';

// Suppress "Missing projectId" warnings — we use formiojs purely client-side
Formio.setProjectUrl(window.location.href);
Formio.setBaseUrl(window.location.href);

// ---------- Sample form schemas ----------

const contactForm = {
  display: 'form',
  components: [
    {
      type: 'textfield',
      key: 'firstName',
      label: 'First Name',
      input: true,
      validate: { required: true },
    },
    {
      type: 'textfield',
      key: 'lastName',
      label: 'Last Name',
      input: true,
    },
    {
      type: 'email',
      key: 'email',
      label: 'Email Address',
      input: true,
      validate: { required: true },
    },
    {
      type: 'phoneNumber',
      key: 'phone',
      label: 'Phone Number',
      input: true,
    },
    {
      type: 'textarea',
      key: 'message',
      label: 'Message',
      input: true,
      rows: 4,
    },
    {
      type: 'select',
      key: 'category',
      label: 'Category',
      input: true,
      data: {
        values: [
          { label: 'General Inquiry', value: 'general' },
          { label: 'Support', value: 'support' },
          { label: 'Sales', value: 'sales' },
        ],
      },
    },
    {
      type: 'checkbox',
      key: 'agree',
      label: 'I agree to the terms',
      input: true,
    },
    {
      type: 'button',
      action: 'submit',
      label: 'Submit',
      theme: 'primary',
    },
  ],
};

// ---------- Demo Components ----------

function FormRendererDemo() {
  const [submitted, setSubmitted] = useState(null);
  const formRef = useRef(null);

  const handleSubmit = (submission) => {
    setSubmitted(submission.data);
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <h2>Form Renderer</h2>
      <p style={{ color: '#666' }}>
        Renders a form from a JSON schema. This uses the same schema format as
        the old @converselabs/react-formio package.
      </p>
      <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8 }}>
        <Form
          ref={formRef}
          src={contactForm}
          options={{ noAlerts: true }}
          onSubmit={handleSubmit}
        />
      </div>
      {submitted && (
        <div style={{ marginTop: 16 }}>
          <h4>Submitted Data:</h4>
          <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function FormRendererWithDataDemo() {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2>Form Renderer with Initial Data</h2>
      <p style={{ color: '#666' }}>
        Tests the <code>submission</code> prop — pre-populates the form.
      </p>
      <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8 }}>
        <Form
          src={contactForm}
          submission={{
            data: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              category: 'support',
            },
          }}
          options={{ noAlerts: true }}
          onSubmit={(sub) => alert('Submitted: ' + JSON.stringify(sub.data))}
        />
      </div>
    </div>
  );
}

function FormBuilderDemo() {
  const [schema, setSchema] = useState(null);

  return (
    <div style={{ marginBottom: 40 }}>
      <h2>Form Builder</h2>
      <p style={{ color: '#666' }}>
        Drag-and-drop form builder. The JSON schema output is shown below.
      </p>
      <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8 }}>
        <FormBuilder
          form={{ display: 'form', components: [] }}
          options={{
            builder: {
              basic: false,
              advanced: false,
              premium: false,
              data: false,
              layout: false,
              customBasic: {
                title: 'Fields',
                default: true,
                weight: 1,
                components: {
                  textfield: true,
                  email: true,
                  textarea: true,
                  checkbox: true,
                  select: true,
                  radio: true,
                  number: true,
                  button: true,
                },
              },
            },
          }}
          onChange={(form) => setSchema(form)}
        />
      </div>
      {schema && (
        <details style={{ marginTop: 16 }}>
          <summary>View JSON Schema Output</summary>
          <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto' }}>
            {JSON.stringify(schema, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

// ---------- App ----------

function App() {
  return (
    <FormEngineProvider theme="default">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
        <h1>react-formio-engine — Demo</h1>
        <p>
          This demo verifies that FormRenderer, FormBuilder, and the theme
          provider work correctly.
        </p>
        <hr />
        <FormRendererDemo />
        <FormRendererWithDataDemo />
        <FormBuilderDemo />
      </div>
    </FormEngineProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
