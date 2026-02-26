/**
 * Remove submit button(s) from a form schema.
 *
 * @param {Object} src - Form schema with components array
 * @returns {Object} - Form schema with submit buttons filtered out
 */
export const removeSubmitFormio = (src) => {
  if (src && src.components) {
    const filteredComponents = src.components.filter(
      (component) => component.action !== 'submit'
    );
    return { display: src.display, components: filteredComponents };
  }
  return src;
};

/**
 * Remove autofocus from all form components.
 *
 * @param {Object} src - Form schema with components array
 * @returns {Object} - Form schema with autofocus disabled on all components
 */
export const removeAutoFocusFormio = (src) => {
  const formioComponents = src?.components;
  if (formioComponents) {
    const updatedFormComp = formioComponents.map((formioComp) => ({
      ...formioComp,
      autofocus: false,
    }));
    return { ...src, components: updatedFormComp };
  }
  return src;
};
