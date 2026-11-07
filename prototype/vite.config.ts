import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Сборка в один dist/index.html: открывается двойным кликом и публикуется по ссылке
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
