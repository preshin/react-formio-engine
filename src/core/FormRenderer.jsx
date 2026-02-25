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
