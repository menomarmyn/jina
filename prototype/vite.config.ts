import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Две страницы: index.html — сайт-кейс, app.html — живой прототип JINA
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { site: resolve(__dirname, 'index.html'), app: resolve(__dirname, 'app.html') },
    },
  },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
