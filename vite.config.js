import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin is essential for wallet connections to work correctly
    nodePolyfills({
      global: true,
      buffer: true,
      process: true,
    }),
  ],
  server: {
    // Proxy API requests to the Azure Functions backend during development
    proxy: {
      '/api': 'http://localhost:7071',
    },
  },
  define: {
    // Necessary polyfill for some wallet libraries
    'process.env': {}
  }
});
