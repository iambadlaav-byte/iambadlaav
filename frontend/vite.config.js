import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Shared Zod validators — frontend and backend share one source of truth
      '@validators': path.resolve(__dirname, '../packages/validators/src'),
      // Convenience alias for src-relative imports
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api requests to the Express backend
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
    target: 'esnext',
    // Warn when chunk exceeds 200KB gzipped (CONSTRAINT-PERF-001)
    chunkSizeWarningLimit: 200,
  },
});
