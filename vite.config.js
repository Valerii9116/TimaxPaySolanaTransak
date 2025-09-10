import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin is essential for wallet libraries that rely on Node.js
    // built-in modules. This is a common reason for mobile wallet connection failures.
    nodePolyfills({
      protocolImports: true,
    }),
  ],
  server: {
    // This proxy configuration is for local development. It mimics the Azure
    // deployment environment by forwarding API requests from the Vite dev server
    // (e.g., localhost:5173/api/getConfig) to your local Azure Functions server
    // (running on localhost:7071). This prevents the 404 error locally.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7071',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Configuration for the production build
    outDir: 'dist', // Specifies the output directory for built files
  }
});
