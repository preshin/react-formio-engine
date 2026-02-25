import { useRef, useEffect } from 'react';
import { FormBuilder as FormioFormBuilder } from '@formio/js';

const FormBuilder = ({
  form,
  options = {},
  onChange,
  onSaveComponent,
  onUpdateComponent,
  onDeleteComponent,
  onCancelComponent,
  onEditComponent,
  Builder,
}) => {
  const elementRef = useRef(null);
  const builderRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const BuilderClass = Builder || FormioFormBuilder;
    const formCopy = { ...form };
    const optsCopy = { ...options };

    // Destroy previous builder if re-initializing
    if (builderRef.current) {
      builderRef.current.instance?.destroy(true);
    }

    const builder = new BuilderClass(elementRef.current.firstChild, formCopy, optsCopy);
    builderRef.current = builder;

    builder.ready.then(() => {
      // Emit initial onChange
      emitChange();

      // Component lifecycle events
      if (onSaveComponent) builder.instance.on('saveComponent', onSaveComponent);
      if (onUpdateComponent) builder.instance.on('updateComponent', onUpdateComponent);
      if (onDeleteComponent) builder.instance.on('removeComponent', onDeleteComponent);
      if (onCancelComponent) builder.instance.on('cancelComponent', onCancelComponent);
      if (onEditComponent) builder.instance.on('editComponent', onEditComponent);

      // Schema change events
      builder.instance.on('addComponent', emitChange);
      builder.instance.on('saveComponent', emitChange);
      builder.instance.on('updateComponent', emitChange);
      builder.instance.on('removeComponent', emitChange);
      builder.instance.on('deleteComponent', emitChange);
      builder.instance.on('pdfUploaded', emitChange);
    });

    function emitChange() {
      if (typeof onChange === 'function' && builderRef.current?.instance) {
        onChange(builderRef.current.instance.form);
      }
    }

    return () => {
      if (builderRef.current?.instance) {
        builderRef.current.instance.destroy(true);
        builderRef.current = null;
      }
    };
    // Only re-initialize when form display mode changes.
    // Options and callbacks are captured via refs/closures — no need to re-create
    // the builder when they change (matches original @converselabs behavior).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.display]);

  return (
    <div ref={elementRef}>
      <div />
    </div>
  );
};

FormBuilder.displayName = 'FormBuilder';

export default FormBuilder;
