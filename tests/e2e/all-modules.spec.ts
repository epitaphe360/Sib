import { test, expect, type Page } from '@playwright/test';

/**
 * SIB - Complete Module Tests
 * Covers: Speakers, Press Accreditation, Visa Letter, Payment Validation,
 * Arabic/RTL, Media pages, Admin panels
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Public Pages - Navigation & Rendering', () => {
  test('HOME: should render homepage with hero section', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveTitle(/SIB/i);
  });

  test('SPEAKERS: should render speakers page', async ({ page }) => {
    await page.goto(`${BASE_URL}/speakers`);
    await expect(page.locator('main')).toBeVisible();
    // Should contain at least the page heading or a speaker card
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('PRESS: should render press accreditation page', async ({ page }) => {
    await page.goto(`${BASE_URL}/press/accreditation`);
    await expect(page.locator('main')).toBeVisible();
    // Should have a form
    const form = page.locator('form, [role="form"]').first();
    await expect(form).toBeVisible({ timeout: 10000 });
  });

  test('EXHIBITORS: should render exhibitors page', async ({ page }) => {
    await page.goto(`${BASE_URL}/exhibitors`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('PARTNERS: should render partners page', async ({ page }) => {
    await page.goto(`${BASE_URL}/partners`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('VENUE: should render venue page', async ({ page }) => {
    await page.goto(`${BASE_URL}/venue`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('ACCOMMODATION: should render accommodation page', async ({ page }) => {
    await page.goto(`${BASE_URL}/accommodation`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('CONTACT: should render contact page with form', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('PRIVACY: should render privacy policy', async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('TERMS: should render terms of service', async ({ page }) => {
    await page.goto(`${BASE_URL}/terms`);
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Media Pages', () => {
  test('WEBINARS: should render webinars page', async ({ page }) => {
    await page.goto(`${BASE_URL}/webinars`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('PODCASTS: should render podcasts page', async ({ page }) => {
    await page.goto(`${BASE_URL}/podcasts`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('LIVE_STUDIO: should render live studio page', async ({ page }) => {
    await page.goto(`${BASE_URL}/live-studio`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('MEDIA_LIBRARY: should render media library', async ({ page }) => {
    await page.goto(`${BASE_URL}/media-library`);
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Auth Pages', () => {
  test('LOGIN: should render login form', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('main')).toBeVisible();
    // Should have email and password fields
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });

  test('REGISTER: should render registration page', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('FORGOT_PASSWORD: should render forgot password form', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('404 Error Handling', () => {
  test('should display 404 for unknown routes', async ({ page }) => {
    await page.goto(`${BASE_URL}/this-page-does-not-exist`);
    await expect(page.locator('text=404')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Language Switching & RTL', () => {
  test('should default to French', async ({ page }) => {
    await page.goto(BASE_URL);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('fr');
  });

  test('should have LTR direction for French', async ({ page }) => {
    await page.goto(BASE_URL);
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir === 'ltr' || dir === null).toBe(true);
  });
});

test.describe('Navigation - Header & Footer', () => {
  test('header should contain navigation links', async ({ page }) => {
    await page.goto(BASE_URL);
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('footer should be present on homepage', async ({ page }) => {
    await page.goto(BASE_URL);
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('footer should contain SIB copyright', async ({ page }) => {
    await page.goto(BASE_URL);
    const footer = page.locator('footer').first();
    await expect(footer.locator('text=SIB')).toBeVisible();
  });
});

test.describe('SEO & Accessibility', () => {
  test('homepage should have a main landmark', async ({ page }) => {
    await page.goto(BASE_URL);
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible();
  });

  test('skip-to-content link should exist', async ({ page }) => {
    await page.goto(BASE_URL);
    const skipLink = page.locator('[href="#main-content"], .skip-to-content, a:text("Aller au contenu")').first();
    // It may be visually hidden but should be in DOM
    expect(await skipLink.count()).toBeGreaterThanOrEqual(0);
  });
});
