// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './tests/setup.js',
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    bail: true, // Arrête l'exécution en cas d'échec
    watchExclude: ['dist', 'node_modules'], // Fichiers à exclure de la surveillance
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      exclude: ['node_modules/', 'tests/'],
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@models': resolve(__dirname, './models'),
      '@controllers': resolve(__dirname, './controllers'),
      '@routes': resolve(__dirname, './routes'),
      '@config': resolve(__dirname, './config'),
    },
  },
});
