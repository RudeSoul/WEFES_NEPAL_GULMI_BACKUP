import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@wefes/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@wefes/database': path.resolve(__dirname, '../../packages/database/src'),
      '@wefes/wefes-engine': path.resolve(__dirname, '../../engines/nexus/src'),
    },
  },
});
