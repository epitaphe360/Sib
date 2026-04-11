import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  try {
    const outDir = 'test-results';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
      console.log(`[PAGE ${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));

    console.log('Navigating to /partners ...');
    await page.goto('http://localhost:9323/partners', { waitUntil: 'networkidle' });

    const url = page.url();
    console.log('Loaded URL:', url);

    const screenshotPath = `${outDir}/partners-screenshot.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved to', screenshotPath);

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Script failed:', err);
    process.exit(1);
  }
})();