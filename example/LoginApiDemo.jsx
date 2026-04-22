import React, { useRef } from 'react';
import { Form } from '../src/index';

// Schema as provided by the user (agentx-dashboard login form)
const loginForm = {
  display: 'form',
  components: [
    {
      id: 'eiupizq',
      key: 'email',
      type: 'email',
      input: true,
      label: 'Email',
      inputType: 'email',
      validate: { required: true },
      validateOn: 'change',
      tableView: true,
      persistent: true,
      labelPosition: 'top',
    },
    {
      id: 'emvo7dp',
      key: 'password',
      type: 'password',
      input: true,
      label: 'Password',
      inputType: 'text',
      protected: true,
      validate: { required: true },
      validateOn: 'change',
      persistent: true,
      labelPosition: 'top',
    },
    {
      id: 'e8j0bd',
      key: 'html',
      tag: 'p',
      type: 'htmlelement',
      input: false,
      label: 'HTML',
      content: "<a class='forgot-password'>Don't remember your password?</a>",
    },
    {
      id: 'e91k1hm',
      key: 'html1',
      tag: 'p',
      type: 'htmlelement',
      input: false,
      label: 'HTML',
      content:
        'By continuing, you agree to our <a href="https://www.workato.com/legal/services-privacy-policy">Terms and Conditions</a>.',
    },
    {
      id: 'em0y7pc',
      key: 'submit',
      type: 'button',
      input: true,
      label: 'Login Now',
      theme: 'primary',
      action: 'submit',
      size: 'md',
      tableView: false,
      disableOnInvalid: false,
    },
  ],
};

const PREFILL = { email: 'test@test.test', password: 'test' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Mocked login API:
//   password === 'test'  → resolves after 600ms  → button shows ✓
//   anything else        → rejects  after 800ms  → button shows ✗
// Caller just returns the promise; <Form /> handles loader / ✓ / ✗.

const login = async (submission) => {
  const email = submission?.data?.email;
  const password = submission?.data?.password;

  if (password === 'test') {
    await sleep(600);
    return { ok: true, token: 'mock-jwt-token', user: { email } };
  }

  await sleep(800);
  const err = new Error('Invalid email or password');
  err.status = 401;
  throw err;
};


export default function LoginApiDemo() {
  const myRef = useRef(null);

  // Legacy manual-emit pattern: `login` does not return a promise. It kicks
  // off an async task and later calls `formio.emit('submitDone')` or
  // `formio.emit('submitError')` via the ref. <Form /> holds the button in
  // its loading state until one of those fires.
  //   password === 'test' → success after 600ms (✓)
  //   anything else       → failure after 800ms (✗)

  // const login = (submission) => {
  //   const success = submission?.data?.password === 'test';
  //   setTimeout(() => {
  //     if (success) {
  //       myRef.current?.formio?.emit('submitDone');
  //     } else {
  //       myRef.current?.formio?.emit('submitError');
  //     }
  //   }, success ? 600 : 800);
  // };

  return (
    <div style={{ marginBottom: 40 }}>
      <h2>Login API Demo (mocked)</h2>
      <p style={{ color: '#666' }}>
        Mocked async login. The button shows a loader while the promise is
        pending, then ✓ on resolve or ✗ on reject.
        <br />
        Password <code>test</code> → resolves after 600ms (✓).
        <br />
        Any other password → rejects after 800ms with{' '}
        <code>Invalid email or password</code> (✗).
      </p>

      <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, maxWidth: 480 }}>
        <Form
          src={loginForm}
          submission={{ data: PREFILL }}
          options={{ noAlerts: true }}
          onSubmit={login}
          ref={myRef}
        />
      </div>
    </div>
  );
}
