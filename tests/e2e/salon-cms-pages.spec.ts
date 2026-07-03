import { test, expect } from '@playwright/test';

test.describe('Pages salon UrbaEvent (CMS)', () => {
  test('hub /salons affiche UrbaEvent et les cartes salons', async ({ page }) => {
    await page.goto('/salons');
    await expect(page.getByRole('heading', { name: 'UrbaEvent', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Choisissez votre Salon' })).toBeVisible();
    const cards = page.locator('section').filter({ hasText: 'Choisissez votre Salon' });
    await expect(cards.getByText('SIB').first()).toBeVisible();
    await expect(cards.getByText('SIR').first()).toBeVisible();
  });

  test('page détail /salon/sir charge le contenu SIR', async ({ page }) => {
    await page.goto('/salon/sir');
    await expect(page.getByRole('heading', { name: /Immobilier/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'À propos du SIR' })).toBeVisible();
    await expect(page.getByText('Casablanca, Maroc').first()).toBeVisible();
  });

  test('page détail /salon/btp charge le contenu BTP', async ({ page }) => {
    await page.goto('/salon/btp');
    await expect(page.getByRole('heading', { name: 'Salon International du BTP' })).toBeVisible();
    await expect(page.getByText('Tanger, Maroc').first()).toBeVisible();
  });
});
