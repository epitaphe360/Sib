import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const EMAIL = 'visitor-free@test.siport.com';
const PASSWORD = 'Test@1234567';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  try {
    console.log('Opening login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(500);

    await page.fill('input[type="email"]', EMAIL).catch(() => {});
    await page.fill('input[type="password"]', PASSWORD).catch(() => {});

    console.log('Submitting login form...');
    await Promise.all([
      page.click('button[type="submit"]').catch(() => {}),
      page.waitForTimeout(3000)
    ]);

    await page.waitForTimeout(2000);
    const url = page.url();
    console.log('Current URL:', url);

    const screenshotPath = './scripts/debug-login-visitor-free.png';
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    console.log('Screenshot saved to', screenshotPath);

    const html = await page.content();
    const preview = html.slice(0, 2000).replace(/\n/g, ' ');
    fs.writeFileSync('./scripts/debug-login-visitor-free.html', preview);
    console.log('Saved HTML preview to ./scripts/debug-login-visitor-free.html');

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during debug login:', err);
    await page.screenshot({ path: './scripts/debug-login-error.png', fullPage: true }).catch(() => {});
    await browser.close();
    process.exit(1);
  }
})();
