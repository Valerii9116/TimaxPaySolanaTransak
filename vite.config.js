import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // To exclude specific polyfills, add them to this list.
      // Ex: exclude: ['fs'],
      // Whether to polyfill `global`.
      global: true,
      // Whether to polyfill `process`.
      process: true,
      // Whether to polyfill `Buffer`.
      buffer: true,
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    // By default, Vite doesn't include shims for NodeJS/CJS globals.
    // This is needed for some packages that still rely on them.
    'global': 'globalThis',
  },
});