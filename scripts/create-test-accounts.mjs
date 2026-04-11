// ========================================
// CRÉATION AUTOMATIQUE DES COMPTES DE TEST
// VIA PLAYWRIGHT (Frontend)
// ========================================
import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

const TEST_ACCOUNTS = [
  {
    email: 'visitor-free@test.siport.com',
    password: 'Test@1234567',
    firstName: 'Visiteur',
    lastName: 'Free Test',
    phone: '+33123456789',
    type: 'visitor'
  },
  {
    email: 'visitor-vip@test.siport.com',
    password: 'Test@1234567',
    firstName: 'Visiteur',
    lastName: 'VIP Test',
    phone: '+33123456790',
    type: 'visitor'
  },
  {
    email: 'exhibitor-9m@test.siport.com',
    password: 'Test@1234567',
    firstName: 'Exposant',
    lastName: '9m Test',
    phone: '+33123456791',
    type: 'exhibitor'
  },
  {
    email: 'admin-test@test.siport.com',
    password: 'Test@1234567',
    firstName: 'Admin',
    lastName: 'Test',
    phone: '+33123456799',
    type: 'admin'
  }
];

async function registerAccount(page, account) {
  try {
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForLoadState('networkidle');
    console.log(`  ↳ Page d'inscription chargée`);
    
    // Étape 1: Sélectionner type
    const typeText = account.type === 'visitor' ? 'Visiteur' : account.type === 'exhibitor' ? 'Exposant' : 'Admin';
    const typeButton = page.locator(`text="${typeText}"`);
    if (await typeButton.count() > 0) {
      await typeButton.first().click({ timeout: 5000 });
    }
    console.log(`  ↳ Type sélectionné: ${typeText}`);
    await page.waitForTimeout(500);
    
    // Cliquer Suivant
    let nextBtn = page.locator('button[type="button"]:has-text("Suivant")');
    if (await nextBtn.count() > 0) {
      await nextBtn.first().click({ timeout: 5000 });
      await page.waitForTimeout(800);
    }
    
    // Étape 2: Secteur/Pays
    const sectorSelect = page.locator('select[name="sector"], select[id*="sector"]');
    const countrySelect = page.locator('select[name="country"], select[id*="country"]');
    
    if (await sectorSelect.count() > 0) {
      await sectorSelect.first().selectOption({ label: 'Technologie' }).catch(() => {});
    }
    if (await countrySelect.count() > 0) {
      await countrySelect.first().selectOption({ label: 'France' }).catch(() => {});
    }
    console.log(`  ↳ Secteur/Pays sélectionnés`);
    await page.waitForTimeout(500);
    
    nextBtn = page.locator('button[type="button"]:has-text("Suivant")');
    if (await nextBtn.count() > 0) {
      await nextBtn.first().click({ timeout: 5000 });
      await page.waitForTimeout(800);
    }
    
    // Étape 3: Contact
    const firstNameInput = page.locator('input[name="firstName"], input[id*="firstName"], input[placeholder*="Prénom"]');
    const lastNameInput = page.locator('input[name="lastName"], input[id*="lastName"], input[placeholder*="Nom"]');
    const emailInput = page.locator('input[name="email"], input[id*="email"], input[type="email"]');
    const phoneInput = page.locator('input[name="phone"], input[id*="phone"], input[type="tel"]');
    
    if (await firstNameInput.count() > 0) await firstNameInput.first().fill(account.firstName);
    if (await lastNameInput.count() > 0) await lastNameInput.first().fill(account.lastName);
    if (await emailInput.count() > 0) await emailInput.first().fill(account.email);
    if (await phoneInput.count() > 0) await phoneInput.first().fill(account.phone);
    console.log(`  ↳ Infos contact remplies`);
    await page.waitForTimeout(500);
    
    nextBtn = page.locator('button[type="button"]:has-text("Suivant")');
    if (await nextBtn.count() > 0) {
      await nextBtn.first().click({ timeout: 5000 });
      await page.waitForTimeout(800);
    }
    
    // Étape 4: Objectifs (optionnel)
    const objectifCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await objectifCheckboxes.count();
    if (checkboxCount > 0) {
      for (let i = 0; i < Math.min(3, checkboxCount); i++) {
        await objectifCheckboxes.nth(i).click({ force: true }).catch(() => {});
      }
      console.log(`  ↳ ${Math.min(3, checkboxCount)} objectifs sélectionnés`);
      await page.waitForTimeout(500);
      
      nextBtn = page.locator('button[type="button"]:has-text("Suivant")');
      if (await nextBtn.count() > 0) {
        await nextBtn.first().click({ timeout: 5000 });
        await page.waitForTimeout(800);
      }
    }
    
    // Étape 5: Profil (description optionnelle)
    const profileDesc = page.locator('textarea[name="description"], textarea[id*="description"]');
    if (await profileDesc.count() > 0) {
      // Skip, juste cliquer Suivant
      nextBtn = page.locator('button[type="button"]:has-text("Suivant")');
      if (await nextBtn.count() > 0) {
        await nextBtn.first().click({ timeout: 5000 });
        await page.waitForTimeout(800);
      }
    }
    
    // Étape 6: Mot de passe
    const passwordInput = page.locator('input[name="password"], input[id*="password"]').nth(0);
    const confirmInput = page.locator('input[name="confirmPassword"], input[id*="confirm"]').nth(0);
    
    if (await passwordInput.count() > 0) await passwordInput.fill(account.password);
    if (await confirmInput.count() > 0) await confirmInput.fill(account.password);
    console.log(`  ↳ Mot de passe défini`);
    await page.waitForTimeout(500);
    
    // Cliquer S'inscrire
    const submitBtn = page.locator('button[type="submit"], button:has-text("S\'inscrire"), button:has-text("Inscrire")');
    if (await submitBtn.count() > 0) {
      await submitBtn.first().click({ timeout: 5000 });
    }
    
    // Attendre la page de succès
    await page.waitForTimeout(1000);
    const successMsg = page.locator('text=succès, text=Bienvenue, text=Créé, text=inscription réussie, text=Felicitations');
    const successPage = page.locator('h1:has-text("succès"), h1:has-text("Bienvenue"), div:has-text("Compte créé")');
    
    if (await successMsg.count() > 0 || await successPage.count() > 0) {
      console.log(`  ↳ ✅ Page de succès affichée`);
      await page.waitForTimeout(3000);
    } else {
      console.log(`  ↳ 📄 Inscription complétée`);
      await page.waitForTimeout(2000);
    }
    
    return { success: true, email: account.email };
  } catch (error) {
    console.error(`  ↳ Erreur détail: ${error.message}`);
    return { success: false, email: account.email, error: error.message };
  }
}

async function createTestAccounts() {
  console.log('🚀 Création automatique des comptes de test via Playwright...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const account of TEST_ACCOUNTS) {
    console.log(`📝 Création: ${account.email}...`);
    const result = await registerAccount(page, account);
    
    if (result.success) {
      console.log(`✅ ${result.email} - Créé avec succès`);
      successCount++;
    } else {
      console.log(`❌ ${result.email} - Erreur: ${result.error}`);
      errorCount++;
    }
    
    await page.waitForTimeout(2000);
  }
  
  await browser.close();
  
  console.log(`\n📊 Résultat:`);
  console.log(`✅ Succès: ${successCount}/${TEST_ACCOUNTS.length}`);
  console.log(`❌ Erreurs: ${errorCount}/${TEST_ACCOUNTS.length}`);
  
  process.exit(errorCount > 0 ? 1 : 0);
}

createTestAccounts().catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
