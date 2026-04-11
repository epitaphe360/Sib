import { defineConfig, devices } from '@playwright/test';

/**
 * SIPORTV3 - Configuration E2E Tests Ultra-Complète
 */
export default defineConfig({
  testDir: './e2e/tests',

  // Timeout pour les tests
  timeout: 60 * 1000, // 60 secondes par test

  // Nombre de tentatives en cas d'échec
  retries: process.env.CI ? 2 : 0,

  // Exécution parallèle
  workers: process.env.CI ? 1 : 3,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list']
  ],

  // Configuration globale
  use: {
    // URL de base
    baseURL: process.env.BASE_URL || 'http://localhost:9323',

    // Trace on first retry
    trace: 'on-first-retry',

    // Screenshots
    screenshot: 'only-on-failure',

    // Video
    video: 'retain-on-failure',

    // Timeouts
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },

  // Projets de test (multi-browser)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Serveur de développement
  // Note: Comment this out to run tests against an already-running dev server
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
