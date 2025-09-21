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
      // Exclude node:fs since it's not needed for browser
      exclude: ['fs'],
    }),
  ],
  server: {
    port: 5173,
    host: true, // Allow external connections
    proxy: {
      '/api': {
        target: 'http://localhost:7072', // Updated port to avoid conflicts
        changeOrigin: true,
        secure: false,
        timeout: 60000, // 60 second timeout
      },
    },
  },
  define: {
    // By default, Vite doesn't include shims for NodeJS/CJS globals.
    // This is needed for some packages that still rely on them.
    'global': 'globalThis',
    // Define process.env for browser compatibility
    'process.env': {},
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'solana-vendor': [
            '@solana/web3.js', 
            '@solana/wallet-adapter-base',
            '@solana/wallet-adapter-react',
            '@solana/wallet-adapter-react-ui'
          ],
          'wagmi-vendor': [
            'wagmi',
            'viem',
            '@web3modal/wagmi'
          ],
          'ui-vendor': [
            'react',
            'react-dom',
            'lucide-react'
          ]
        }
      }
    }
  },
  optimizeDeps: {
    // Pre-bundle these dependencies
    include: [
      'react',
      'react-dom',
      '@solana/web3.js',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
      'wagmi',
      'viem',
      '@web3modal/wagmi/react'
    ],
    // Exclude problematic dependencies from pre-bundling
    exclude: [
      '@solana/wallet-adapter-wallets'
    ]
  },
  // Enable source maps for better debugging
  css: {
    devSourcemap: true
  }
});