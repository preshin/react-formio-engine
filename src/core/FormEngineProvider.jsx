import { createContext } from 'react';

export const FormEngineContext = createContext({ theme: 'default' });

const FormEngineProvider = ({ theme = 'default', children }) => {
  const value = {
    theme,
    className: `form-engine-theme-${theme}`,
  };

  return (
    <FormEngineContext.Provider value={value}>
      {children}
    </FormEngineContext.Provider>
  );
};

FormEngineProvider.displayName = 'FormEngineProvider';

export default FormEngineProvider;
