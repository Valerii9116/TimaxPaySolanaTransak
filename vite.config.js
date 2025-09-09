import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin provides the necessary Node.js polyfills for Web3 libraries.
    nodePolyfills({
      global: true,
      buffer: true,
      process: true,
    }),
  ],
  define: {
    // By default, Vite does not define `global`. This is needed for some Web3 libraries.
    'global': {},
  },
  server: {
    // This proxy is needed for local development to connect to your Azure Functions API
    proxy: {
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true,
      },
    },
  },
});

