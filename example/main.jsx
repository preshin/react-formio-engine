import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Form, FormBuilder, FormEngineProvider, Formio } from '../src/index';
import 'bootstrap/dist/css/bootstrap.css';
import '../src/themes/default.css';
import LoginApiDemo from './LoginApiDemo';

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

// Form specifically for testing the two bug fixes:
//   1. Number field — typing 0 as first digit should not be stripped
//   2. Required validation — submit with empty fields must show errors
const bugFixForm = {
  display: 'form',
  components: [
    {
      type: 'number',
      key: 'quantity',
      label: 'Quantity (try typing 0, then another digit — should keep the 0)',
      input: true,
      validate: { required: true },
      placeholder: 'e.g. 07, 0.5, 042',
    },
    {
      type: 'number',
      key: 'price',
      label: 'Price (required — leave empty and hit Submit to test validation)',
      input: true,
      validate: { required: true },
    },
    {
      type: 'textfield',
      key: 'name',
      label: 'Name (required)',
      input: true,
      validate: { required: true },
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

function BugFixDemo() {
  const [submitted, setSubmitted] = useState(null);

  return (
    <div style={{ marginBottom: 40 }}>
      <h2>Bug Fix Verification</h2>
      <ul style={{ color: '#555', lineHeight: 1.8 }}>
        <li>
          <strong>Number — leading zero:</strong> Type <code>07</code> or <code>0.5</code> in
          the Quantity field. The <code>0</code> should NOT be stripped.
        </li>
        <li>
          <strong>Required validation:</strong> Leave fields empty and click Submit.
          Inline error messages should appear (not silently blocked).
        </li>
      </ul>
      <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8 }}>
        <Form
          src={bugFixForm}
          options={{ noAlerts: true }}
          onSubmit={(sub) => setSubmitted(sub.data)}
        />
      </div>
      {submitted && (
        <div style={{ marginTop: 16 }}>
          <h4>✅ Submitted Data:</h4>
          <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </div>
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
        <LoginApiDemo />
        <hr />
        <BugFixDemo />
        <hr />
        <FormRendererDemo />
        <FormRendererWithDataDemo />
        <FormBuilderDemo />
      </div>
    </FormEngineProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
