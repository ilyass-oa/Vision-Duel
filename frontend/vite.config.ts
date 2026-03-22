import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Allow access from tunnel hostnames (ngrok/cloudflare).
    allowedHosts: true,
    // Allow access from any origin (needed for ngrok/cloudflare tunnel)
    strictPort: true,
    cors: true,
    proxy: {
      '/api/': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    strictPort: true,
    cors: true,
    proxy: {
      '/api/': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
