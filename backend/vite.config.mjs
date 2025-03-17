// vite.config.mjs
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './tests/setup.js'
  }
});
