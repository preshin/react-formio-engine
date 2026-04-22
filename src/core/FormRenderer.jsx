import { useRef, useEffect, useImperativeHandle, forwardRef, useContext } from 'react';
import { Form as FormioForm } from '@formio/js';
import { FormEngineContext } from './FormEngineProvider';

const FormRenderer = forwardRef(function FormRenderer(
  { src, form, submission, options = {}, onSubmit, onChange, onError, onRender,
    onCustomEvent, onSubmitDone, onFormLoad, onAttach, onBuild, onFocus, onBlur,
    onInitialized, formioform, ...restProps },
  ref
) {
  const elementRef = useRef(null);
  const formioRef = useRef(null);
  const instanceRef = useRef(null);
  const createPromiseRef = useRef(null);
  const theme = useContext(FormEngineContext);

  // Expose formio instance via ref (matches old API: ref.formio)
  useImperativeHandle(ref, () => ({
    get formio() {
      return formioRef.current;
    },
  }));

  useEffect(() => {
    const formDef = src || form;
    if (!formDef || !elementRef.current) return;

    const opts = { ...options };

    // When onSubmit is a prop, route it through a beforeSubmit hook so the
    // submit button stays in its loading state until the caller's async
    // work resolves. Supports three patterns:
    //   1. onSubmit returns a Promise  → await it
    //   2. onSubmit emits manually     → listen once for submitDone/Error
    //   3. onSubmit throws synchronously → treat as rejection
    if (typeof onSubmit === 'function') {
      const userHooks = opts.hooks || {};
      const userBeforeSubmit = userHooks.beforeSubmit;

      opts.hooks = {
        ...userHooks,
        beforeSubmit: (submission, next) => {
          const runOnSubmit = () => {
            const formio = formioRef.current;

            // Schema-only forms / nosubmit never emit submitDone themselves,
            // so we must emit it ourselves on success.
            const needsManualDoneEmit = () =>
              formio && (formio.nosubmit || !formio.formio);

            // Defensive: formio's own button listeners can leave the spinner
            // `<i>` attached to the DOM when the button gets redrawn between
            // click and completion (element.loader becomes orphaned). Force
            // loading/disabled off on every submit button via its component
            // ref to guarantee the spinner is cleared.
            const resetSubmitButtons = () => {
              if (!formio || typeof formio.everyComponent !== 'function') return;
              formio.everyComponent((c) => {
                if (
                  c &&
                  c.component &&
                  c.component.type === 'button' &&
                  c.component.action === 'submit'
                ) {
                  try {
                    c.loading = false;
                    c.disabled = false;
                  } catch (_) {
                    // best-effort — ignore
                  }
                }
              });
            };

            let result;
            try {
              result = onSubmit(submission);
            } catch (err) {
              next(err);
              if (formio) formio.emit('submitError', err);
              resetSubmitButtons();
              return;
            }

            if (result && typeof result.then === 'function') {
              result.then(
                (data) => {
                  next();
                  if (needsManualDoneEmit()) {
                    formio.emit('submitDone', data ?? submission);
                  }
                  resetSubmitButtons();
                },
                (err) => {
                  const e = err || { message: 'Submission failed' };
                  next(e);
                  if (formio) formio.emit('submitError', e);
                  resetSubmitButtons();
                },
              );
              return;
            }

            // Legacy manual-emit pattern: onSubmit returned nothing, so wait
            // for the caller to emit submitDone/submitError on the formio ref.
            // If neither is ever emitted the button stays loading — that
            // surfaces the caller's missing completion signal rather than
            // hiding it.
            if (!formio) {
              next();
              return;
            }
            const cleanup = () => {
              formio.off('submitDone', onDone);
              formio.off('submitError', onErr);
            };
            const onDone = () => {
              cleanup();
              next();
              resetSubmitButtons();
            };
            const onErr = (err) => {
              cleanup();
              next(err || { message: 'Submission failed' });
              resetSubmitButtons();
            };
            formio.on('submitDone', onDone);
            formio.on('submitError', onErr);
          };

          if (typeof userBeforeSubmit === 'function') {
            userBeforeSubmit(submission, (err) =>
              err ? next(err) : runOnSubmit(),
            );
          } else {
            runOnSubmit();
          }
        },
      };
    }

    const FormClass = formioform || FormioForm;
    const instance = new FormClass(elementRef.current, formDef, opts);
    instanceRef.current = instance;

    createPromiseRef.current = instance.ready.then((formio) => {
      formioRef.current = formio;
      if (src) {
        formio.src = formDef;
      } else {
        formio.form = formDef;
      }
      return formio;
    });

    // Map formio.xxx events to onXxx props
    instance.onAny(function (event, ...args) {
      if (event.startsWith('formio.')) {
        // When onSubmit is a prop we already invoke it from the beforeSubmit
        // hook above; skip the onAny dispatch to avoid calling it twice.
        if (event === 'formio.submit' && typeof onSubmit === 'function') {
          return;
        }
        const funcName = 'on' + event.charAt(7).toUpperCase() + event.slice(8);
        const allProps = {
          onSubmit, onChange, onError, onRender, onCustomEvent, onSubmitDone,
          onFormLoad, onAttach, onBuild, onFocus, onBlur, onInitialized,
          ...restProps,
        };
        if (typeof allProps[funcName] === 'function') {
          allProps[funcName](...args);
        }
      }
    });

    // Set submission after form is ready
    createPromiseRef.current.then(() => {
      if (submission && formioRef.current) {
        formioRef.current.submission = submission;
      }
    });

    return () => {
      if (formioRef.current) {
        formioRef.current.destroy(true);
        formioRef.current = null;
      }
    };
  }, [src, form]); // Re-create when src or form changes

  // Handle submission prop updates
  useEffect(() => {
    if (submission && formioRef.current) {
      formioRef.current.submission = submission;
    }
  }, [submission]);

  return <div ref={elementRef} className={theme?.className || ''} />;
});

FormRenderer.displayName = 'FormRenderer';

export default FormRenderer;
