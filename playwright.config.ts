import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: '.',
  testMatch: ['**/*.spec.ts'],
  globalSetup: './tests/global-setup.ts',  // Provisionnement comptes de test
  timeout: 60000, // 60s par test (1 seul mot de passe après globalSetup)
  workers: 1, // 1 worker pour éviter les conflits de screenshots
  retries: 1, // 1 retry en cas d'erreur transitoire (connexion réseau, etc.)
  fullyParallel: false, // Pas de parallélisation
  maxFailures: 0, // Continuer même en cas d'échec pour voir tous les résultats
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:9324',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000,
    navigationTimeout: 60000,
    trace: 'off', // Désactivé pour la vitesse
    screenshot: 'on', // Prendre tous les screenshots
    screenshotDir: 'screenshoots/inscription partenaire',
    video: 'off',
  },
  webServer: {
    command: 'npm run dev -- --port 9324',
    port: 9324,
    reuseExistingServer: true,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
});
