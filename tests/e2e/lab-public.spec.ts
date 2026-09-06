import { test, expect } from '@playwright/test';

test.describe('Elitech Lab public shell', () => {
  test('landing + logins + request form render', async ({ page }) => {
    await page.goto('/lab');
    await expect(page.getByRole('heading', { name: /portail laboratoire/i })).toBeVisible();

    await page.goto('/lab/login');
    await expect(page.getByRole('heading', { name: /connexion laboratoire/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /entrer/i })).toBeDisabled();

    await page.goto('/lab/client-login');
    await expect(page.getByRole('heading', { name: /espace client/i })).toBeVisible();

    await page.goto('/lab/request-form');
    await expect(page.getByRole('heading', { name: /demande/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /envoyer la demande/i })).toBeDisabled();
  });

  test('admin mfa and inbox stay behind login', async ({ page }) => {
    await page.goto('/lab/admin/mfa');
    await expect(page).toHaveURL(/\/lab\/login/);
    await page.goto('/lab/admin/inbox');
    await expect(page).toHaveURL(/\/lab\/login/);
  });
});
