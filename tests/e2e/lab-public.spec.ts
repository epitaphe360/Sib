import { test, expect } from '@playwright/test';

test.describe('Elitech Lab public shell', () => {
  test('landing + logins + request form render', async ({ page }) => {
    await page.goto('/lab');
    await expect(page.getByRole('heading', { name: /portail laboratoire/i })).toBeVisible();

    await page.goto('/lab/login');
    await expect(page.getByRole('heading', { name: /connexion laboratoire/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /entrer/i })).toBeDisabled();
    await expect(page.getByText('Comptes démo')).toBeVisible();
    await expect(page.getByRole('button', { name: /Admin/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Madame Zineb/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Technique/i })).toBeVisible();

    await page.goto('/lab/client-login');
    await expect(page.getByRole('heading', { name: /espace client/i })).toBeVisible();
    await expect(page.getByText('Comptes démo')).toBeVisible();
    await expect(page.getByRole('button', { name: /Client Atlas Oils/i })).toBeVisible();

    await page.goto('/lab/request-form');
    await expect(page.getByRole('heading', { name: /demande d’analyse/i })).toBeVisible();
    await expect(page.getByText(/étape 1 sur 5/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^continuer$/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /envoyer la demande/i })).toHaveCount(0);

    await page.getByRole('textbox', { name: 'Société', exact: true }).fill('Atlas Oils');
    await page.getByRole('textbox', { name: 'Prénom', exact: true }).fill('Sara');
    await page.getByRole('textbox', { name: 'Nom', exact: true }).fill('Benali');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('sara@atlas.ma');
    await page.getByRole('textbox', { name: 'Téléphone', exact: true }).fill('661234567');
    await expect(page.getByRole('button', { name: /^continuer$/i })).toBeEnabled();
    await page.getByRole('button', { name: /^continuer$/i }).click();
    await expect(page.getByText(/étape 2 sur 5/i)).toBeVisible();
    await expect(page.getByText(/échantillon à analyser/i)).toBeVisible();
    await page.getByLabel(/type d.échantillon/i).selectOption('alimentaire');
    await page.getByLabel(/produit exact/i).fill('huile d’olive');
    await page.getByRole('button', { name: /^continuer$/i }).click();
    await expect(page.getByText(/étape 3 sur 5/i)).toBeVisible();
    await page.getByLabel(/objectif analytique/i).selectOption('controle_qualite');
    await page.getByLabel(/analyses souhaitées/i).fill('pH, acidité');
    await page.getByRole('button', { name: /^continuer$/i }).click();
    await expect(page.getByText(/étape 4 sur 5/i)).toBeVisible();
    await page.getByRole('combobox', { name: /prélèvement/i }).selectOption('client');
    await page.getByRole('button', { name: /^continuer$/i }).click();
    await expect(page.getByText(/étape 5 sur 5/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /envoyer la demande/i })).toBeVisible();
    await page.getByRole('button', { name: /retour/i }).click();
    await expect(page.getByText(/étape 4 sur 5/i)).toBeVisible();
  });

  test('request form stays compact on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/lab/request-form');
    await expect(page.getByText(/étape 1 sur 5/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^continuer$/i })).toBeVisible();
  });

  test('admin mfa and inbox stay behind login', async ({ page }) => {
    await page.goto('/lab/admin/mfa');
    await expect(page).toHaveURL(/\/lab\/login/);
    await page.goto('/lab/admin/inbox');
    await expect(page).toHaveURL(/\/lab\/login/);
  });
});
