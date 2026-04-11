import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
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
      ],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/e2e/**',
      '**/tests/e2e/**',
      'tests/*.spec.ts',
      '**/*.spec.ts'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
