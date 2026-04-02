import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  // Dev server mode: serve the example/ demo app
  if (command === 'serve') {
    return {
      plugins: [react()],
      // Force a single React instance regardless of where it's imported from
      // (prevents "Invalid hook call" when @formio/js pulls in its own React)
      resolve: {
        dedupe: ['react', 'react-dom'],
      },
      // Handle JSX in .js and .jsx files
      esbuild: {
        loader: 'jsx',
        include: /\.jsx?$/,
      },
      // optimizeDeps needed because @formio/js is CJS
      optimizeDeps: {
        include: ['@formio/js'],
        esbuildOptions: {
          loader: { '.js': 'jsx' },
        },
      },
    };
  }

  // Build mode: library output
  return {
    plugins: [react()],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.js'),
        name: 'FormEngine',
        formats: ['es', 'umd'],
        fileName: (format) => `form-engine.${format}.js`,
      },
      rollupOptions: {
        // Externalize react, react-dom, and all @formio/js imports
        external: (id) => {
          if (id === 'react' || id === 'react-dom' || id.startsWith('react-dom/')) return true;
          if (id === '@formio/js' || id.startsWith('@formio/js/')) return true;
          if (id === 'eventemitter2') return true;
          return false;
        },
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react-dom/client': 'ReactDOMClient',
            '@formio/js': 'Formio',
          },
        },
      },
    },
  };
});
