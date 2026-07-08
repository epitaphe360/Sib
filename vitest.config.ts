import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// React charge son build production (et casse act()/RTL) si NODE_ENV=production.
// On force un mode non-production pour les tests unitaires.
if (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'e2e/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        'wordpress-plugin/'
      ]
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/e2e/**',
      '**/tests/e2e/**',
      'tests/*.spec.ts',
      '**/*.spec.ts',
      // Miroir obsolète : dupliqué depuis src/ et apps/mobile/, source de faux échecs.
      // La source de vérité est src/ (web) et apps/mobile/ (mobile).
      'app-urbaevent/**',
      // Les tests mobile tournent avec apps/mobile/vitest.config.ts (env node), pas ici (jsdom).
      'tests/unit/mobile/**',
      'apps/mobile/**',
      // Exclure le cache Trunk (outil de linting externe) qui pollue les résultats
      '**/AppData/**',
      '**/.cache/trunk/**',
      '**/trunk/**',
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
