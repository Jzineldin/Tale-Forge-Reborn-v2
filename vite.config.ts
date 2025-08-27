import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    port: 3000,
    hmr: {
      port: 3000,
      host: 'localhost',
    },
    proxy: {
      '/api/health': {
        target: 'http://localhost:54321/functions/v1/api-health',
        changeOrigin: true,
        rewrite: (path) => '',
      },
      '/api/stories': {
        target: 'http://localhost:54321/functions/v1',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Route based on HTTP method
            if (req.method === 'GET') {
              // Change target to list-stories for GET requests
              proxyReq.path = '/functions/v1/list-stories';
            } else if (req.method === 'POST') {
              // Change target to create-story for POST requests
              proxyReq.path = '/functions/v1/create-story';
            }
          });
        },
        rewrite: (path) => '',
      },
    },
  },
  preview: {
    port: 3000,
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});