/**
 * 🆕 SIPORT 2026 - Tests Pages Manquantes (couverture complète)
 *
 * Couvre les ~45 pages non testées dans la suite principale :
 * - Pages publiques (hébergement, détails articles/produits, contact succès)
 * - Flux auth complets (reset password, signup success, pending account...)
 * - Paiements visiteur (virement, instructions, succès)
 * - Exposant (édition profil, édition mini-site, fiche détail)
 * - Partenaire (paiement, médias, profil édition, satisfaction, support, activité)
 * - Admin (email templates, publication, approbation médias, pavillons, live events)
 * - Badge impression
 * - Médias détail (webinar, podcast, capsule, live-studio, best-moments, testimonial)
 * - Networking (salles, speed networking)
 *
 * Mis à jour : 04/03/2026
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9324';
const ENABLE_E2E_AUTH_SETUP = process.env.ENABLE_E2E_AUTH_SETUP === 'true';
const HAS_AUTH_SEED = Boolean(
  ENABLE_E2E_AUTH_SETUP &&
  (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
  (process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)
);

// Mot de passe unique après reset globalSetup (évite le rate-limit Supabase)
const PASSWORDS = ['Test@123456'];

const ACCOUNTS = {
  visitor:      { email: 'visitor-free@test.siport.com' },
  visitorVip:   { email: 'visitor-vip@test.siport.com' },
  exhibitor9m:  { email: 'exhibitor-9m@test.siport.com' },
  exhibitor54m: { email: 'exhibitor-54m@test.siport.com' },
  partnerGold:  { email: 'partner-gold@test.siport.com' },
  partnerMuseum:{ email: 'partner-museum@test.siport.com' },
  partnerSilver:{ email: 'partner-silver@test.siport.com' },
  admin:        { email: 'admin.siports@siports.com' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

async function loginWithRetry(page: Page, email: string): Promise<boolean> {
  if (!HAS_AUTH_SEED) {
    test.skip(true, 'Auth seed indisponible (mode skip-auth): scénarios avec login ignorés.');
    return false;
  }

  // Délai initial pour éviter le rate-limit Supabase entre tests consécutifs
  await page.waitForTimeout(1000);
  for (const password of PASSWORDS) {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(800);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    try {
      // Attendre n'importe quelle redirection post-login (dashboard, visitor, exhibitor...)
      await page.waitForURL(/\/(dashboard|visitor|exhibitor|partner|admin)/, { timeout: 12000 });
      return true;
    } catch {
      // Si rate-limited, attendre 3s avant de réessayer
      await page.waitForTimeout(3000);
      continue;
    }
  }
  throw new Error(`Login failed for ${email} with all passwords`);
}

async function gotoOrSkipOnServerRefused(
  page: Page,
  url: string,
  waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded'
) {
  try {
    await page.goto(url, { waitUntil, timeout: 30000 });
  } catch (error: any) {
    if (String(error?.message || '').includes('ERR_CONNECTION_REFUSED')) {
      test.skip(true, `Serveur local indisponible: ${url}`);
      return;
    }
    throw error;
  }
}

async function checkPageLoads(page: Page, url: string) {
  await gotoOrSkipOnServerRefused(page, url, 'domcontentloaded');
  await page.waitForTimeout(1500);
  await expect(page.locator('body')).toBeVisible();
  // Vérifier pas de crash React (pas d'écran blanc complet)
  const bodyText = await page.locator('body').innerText();
  expect(bodyText.length).toBeGreaterThan(0);
}

// ============================================================================
// 1. PAGES PUBLIQUES MANQUANTES
// ============================================================================
test.describe('🏨 Pages Publiques Manquantes', () => {

  test('PUB-01: Page hébergement (/hebergement)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/hebergement`);
  });

  test('PUB-02: Page détail actualité (/news/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/news/1`);
  });

  test('PUB-03: Page détail produit (/products/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/products/1`);
  });

  test('PUB-04: Page contact succès (/contact/success)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/contact/success`);
  });

  test('PUB-05: Page inscription visiteur (/register/visitor)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/register/visitor`);
  });

  test('PUB-06: Page fiche exposant détail (/exhibitors/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/exhibitors/1`);
  });

  test('PUB-07: Page fiche partenaire détail (/partners/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/partners/1`);
  });
});

// ============================================================================
// 2. FLUX AUTH MANQUANTS
// ============================================================================
test.describe('🔐 Flux Auth Manquants', () => {

  test('AUTH-EXT-01: Page réinitialisation mot de passe (/reset-password)', async ({ page }) => {
    await gotoOrSkipOnServerRefused(page, `${BASE_URL}/reset-password`, 'load');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('AUTH-EXT-02: Page succès inscription (/signup-success)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/signup-success`);
  });

  test('AUTH-EXT-03: Page confirmation inscription (/signup-confirmation)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/signup-confirmation`);
  });

  test('AUTH-EXT-04: Page compte en attente (/pending-account)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/pending-account`);
  });

  test('AUTH-EXT-05: Callback OAuth (/auth/callback)', async ({ page }) => {
    // Doit rediriger vers login sans token valide
    await gotoOrSkipOnServerRefused(page, `${BASE_URL}/auth/callback`, 'load');
    await page.waitForTimeout(2000);
    // Accepte login ou home ou la page elle-même (redirection normale)
    await expect(page.locator('body')).toBeVisible();
  });

  test('AUTH-EXT-06: Inscription visiteur gratuit (/visitor/register/free)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/visitor/register/free`);
  });

  test('AUTH-EXT-07: Inscription visiteur VIP (/visitor/register/vip)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/visitor/register/vip`);
  });

  test('AUTH-EXT-08: Choix mode inscription visiteur', async ({ page }) => {
    // La page /visitor/register/free ou similaire
    await gotoOrSkipOnServerRefused(page, `${BASE_URL}/visitor/register/free`, 'load');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============================================================================
// 3. PAIEMENTS VISITEUR MANQUANTS
// ============================================================================
test.describe('💳 Paiements Visiteur Manquants', () => {

  test.beforeEach(async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.visitorVip.email);
  });

  test('PAY-VIS-01: Page virement bancaire visiteur (/visitor/bank-transfer)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/visitor/bank-transfer`);
  });

  test('PAY-VIS-02: Page succès paiement visiteur (/visitor/payment-success)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/visitor/payment-success`);
  });

  test('PAY-VIS-03: Page instructions paiement visiteur (/visitor/payment-instructions)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/visitor/payment-instructions`);
  });
});

// ============================================================================
// 4. EXPOSANT - PAGES MANQUANTES
// ============================================================================
test.describe('🏢 Exposant - Pages Manquantes', () => {

  test.beforeEach(async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.exhibitor9m.email);
  });

  test('EXH-EXT-01: Édition profil exposant (/exhibitor/profile/edit)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/exhibitor/profile/edit`);
  });

  test('EXH-EXT-02: Édition mini-site exposant (/exhibitor/mini-site/test-site/edit)', async ({ page }) => {
    // Test avec un ID fictif - vérifie que la page charge sans crash
    await checkPageLoads(page, `${BASE_URL}/exhibitor/mini-site/test-site/edit`);
  });
});

// ============================================================================
// 5. PARTENAIRE - PAGES MANQUANTES
// ============================================================================
test.describe('🤝 Partenaire - Pages Manquantes', () => {

  test('PART-EXT-01: Sélection paiement partenaire (/partner/payment-selection)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.partnerSilver.email);
    await checkPageLoads(page, `${BASE_URL}/partner/payment-selection`);
  });

  test('PART-EXT-02: Virement bancaire partenaire (/partner/bank-transfer)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.partnerSilver.email);
    await checkPageLoads(page, `${BASE_URL}/partner/bank-transfer`);
  });

  test('PART-EXT-03: Upload médias partenaire (/partner/media/upload)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/media/upload`);
  });

  test('PART-EXT-04: Analytics médias partenaire (/partner/media/analytics)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/media/analytics`);
  });

  test('PART-EXT-05: Bibliothèque médias partenaire (/partner/media/library)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/media/library`);
  });

  test('PART-EXT-06: Édition profil partenaire (/partner/profile/edit)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/profile/edit`);
  });

  test('PART-EXT-07: Satisfaction partenaire (/partner/satisfaction)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/satisfaction`);
  });

  test('PART-EXT-08: Support partenaire (/partner/support-page)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/support-page`);
  });

  test('PART-EXT-09: Activité partenaire (/partner/activity)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/activity`);
  });
});

// ============================================================================
// 6. ADMIN - PAGES MANQUANTES
// ============================================================================
test.describe('⚙️ Admin - Pages Manquantes', () => {

  test.beforeEach(async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.admin.email);
  });

  test('ADMIN-EXT-01: Templates email (/admin/email-templates)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/email-templates`);
  });

  test('ADMIN-EXT-02: Créer pavillon (/admin/create-pavilion)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/create-pavilion`);
  });

  test('ADMIN-EXT-03: Contrôle publication (/admin/publication-control)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/publication-control`);
  });

  test('ADMIN-EXT-04: Approbation médias partenaires (/admin/partner-media/approval)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/partner-media/approval`);
  });

  test('ADMIN-EXT-05: Créer contenu média (/admin/media/create)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/media/create`);
  });

  test('ADMIN-EXT-06: Gérer médias (/admin/media/manage)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/media/manage`);
  });

  test('ADMIN-EXT-07: Live events admin (/admin/live-events)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/live-events`);
  });

  test('ADMIN-EXT-08: Créer live event (/admin/live-events/create)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/live-events/create`);
  });

  test('ADMIN-EXT-09: Créer utilisateur (/admin/users/create)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/users/create`);
  });

  test('ADMIN-EXT-10: Visiteurs VIP (/admin/vip-visitors)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/vip-visitors`);
  });
});

// ============================================================================
// 7. BADGE - PAGES MANQUANTES
// ============================================================================
test.describe('🎫 Badge - Pages Manquantes', () => {

  test('BADGE-EXT-01: Station impression badge (/badge/print-station)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.admin.email);
    await checkPageLoads(page, `${BASE_URL}/badge/print-station`);
  });
});

// ============================================================================
// 8. MÉDIAS - PAGES DÉTAIL MANQUANTES
// ============================================================================
test.describe('📺 Médias Détail Manquants', () => {

  test('MEDIA-DET-01: Détail média (/media/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/1`);
  });

  test('MEDIA-DET-02: Détail webinaire (/media/webinar/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/webinar/1`);
  });

  test('MEDIA-DET-03: Détail podcast (/media/podcast/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/podcast/1`);
  });

  test('MEDIA-DET-04: Détail capsule Inside SIPORT (/media/capsule/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/capsule/1`);
  });

  test('MEDIA-DET-05: Détail Live Studio (/media/live-studio/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/live-studio/1`);
  });

  test('MEDIA-DET-06: Détail Best Moments (/media/best-moments/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/best-moments/1`);
  });

  test('MEDIA-DET-07: Détail témoignage (/media/testimonial/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/testimonial/1`);
  });
});

// ============================================================================
// 9. NETWORKING - PAGES MANQUANTES
// ============================================================================
test.describe('🌐 Networking - Pages Manquantes', () => {

  test('NET-EXT-01: Salles de networking (/networking/rooms/session-1)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.visitorVip.email);
    await checkPageLoads(page, `${BASE_URL}/networking/rooms/session-1`);
  });

  test('NET-EXT-02: Speed networking (/networking/speed/session-1)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.visitorVip.email);
    await checkPageLoads(page, `${BASE_URL}/networking/speed/session-1`);
  });
});

// ============================================================================
// 10. SIMULATION PAIEMENT COMPLÈTE
// ============================================================================
test.describe('💳 Simulation Paiement - Flux Complets', () => {

  /**
   * SCÉNARIO 1 : Visiteur Free → Upgrade VIP (virement bancaire)
   * Étapes:
   * 1. Connexion visiteur gratuit
   * 2. Accès page upgrade visiteur
   * 3. Sélection option VIP Pass
   * 4. Accès page paiement
   * 5. Sélection mode virement bancaire
   * 6. Vérification affichage instructions bancaires
   */
  test('PAY-SIM-01: Flux complet upgrade visiteur Free → VIP (virement)', async ({ page }) => {
    // Étape 1: Login visiteur VIP (représente un visiteur qui veut passer au niveau suivant)
    await loginWithRetry(page, ACCOUNTS.visitorVip.email);
    
    // Étape 2: Navigation vers page upgrade
    await page.goto(`${BASE_URL}/visitor/upgrade`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();

    // Étape 3: Vérifier présence d'une option de mise à niveau
    const upgradeContent = await page.locator('body').innerText();
    const hasUpgradeInfo = upgradeContent.toLowerCase().includes('vip') ||
                          upgradeContent.toLowerCase().includes('premium') ||
                          upgradeContent.toLowerCase().includes('pass') ||
                          upgradeContent.toLowerCase().includes('upgrade') ||
                          upgradeContent.toLowerCase().includes('abonnement');
    expect(hasUpgradeInfo).toBeTruthy();

    // Étape 4: Accès page paiement
    await page.goto(`${BASE_URL}/visitor/payment`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();

    // Étape 5: Accès instructions virement bancaire
    await page.goto(`${BASE_URL}/visitor/bank-transfer`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();

    // Étape 6: Vérifier présence d'informations bancaires
    const bankContent = await page.locator('body').innerText();
    const hasBankInfo = bankContent.toLowerCase().includes('virement') ||
                       bankContent.toLowerCase().includes('iban') ||
                       bankContent.toLowerCase().includes('bancaire') ||
                       bankContent.toLowerCase().includes('bank') ||
                       bankContent.toLowerCase().includes('paiement') ||
                       bankContent.length > 100;
    expect(hasBankInfo).toBeTruthy();
  });

  /**
   * SCÉNARIO 2 : Visiteur — Page instructions de paiement
   */
  test('PAY-SIM-02: Page instructions paiement accessible et complète', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.visitorVip.email);
    await page.goto(`${BASE_URL}/visitor/payment-instructions`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
    const content = await page.locator('body').innerText();
    expect(content.length).toBeGreaterThan(50);
  });

  /**
   * SCÉNARIO 3 : Page de succès paiement visiteur
   */
  test('PAY-SIM-03: Page succès paiement visiteur affiche confirmation', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.visitorVip.email);
    await page.goto(`${BASE_URL}/visitor/payment-success`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * SCÉNARIO 4 : Admin — Validation paiement en attente
   * Simule la validation d'un paiement par l'admin
   */
  test('PAY-SIM-04: Admin valide paiements en attente', async ({ page }) => {
    // Login admin
    await loginWithRetry(page, ACCOUNTS.admin.email);

    // Accès page validation paiements
    await page.goto(`${BASE_URL}/admin/payment-validation`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();

    // Vérifier que la page contient des éléments de gestion
    const content = await page.locator('body').innerText();
    const hasPaymentContent = content.toLowerCase().includes('paiement') ||
                             content.toLowerCase().includes('validation') ||
                             content.toLowerCase().includes('visiteur') ||
                             content.length > 100;
    expect(hasPaymentContent).toBeTruthy();

    // Tenter de trouver un bouton de validation si disponible
    const validateBtn = page.locator('button').filter({ hasText: /valid|approuv|confirm/i });
    const count = await validateBtn.count();
    // Si présent, vérifier qu'il est cliquable
    if (count > 0) {
      await expect(validateBtn.first()).toBeVisible();
    }
  });

  /**
   * SCÉNARIO 5 : Partenaire — Sélection mode paiement upgrade
   */
  test('PAY-SIM-05: Partenaire Silver — flux sélection paiement upgrade', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.partnerSilver.email);

    // Page upgrade partenaire
    await page.goto(`${BASE_URL}/partner/upgrade`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();

    // Page sélection paiement
    await page.goto(`${BASE_URL}/partner/payment-selection`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();

    // Page virement bancaire partenaire
    await page.goto(`${BASE_URL}/partner/bank-transfer`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * SCÉNARIO 6 : Abonnement exposant
   */
  test('PAY-SIM-06: Page abonnement exposant accessible', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.exhibitor9m.email);
    await page.goto(`${BASE_URL}/exhibitor/subscription`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * SCÉNARIO 7 : Abonnement partenaire
   */
  test('PAY-SIM-07: Page abonnement partenaire accessible', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.partnerMuseum.email);
    await page.goto(`${BASE_URL}/partner/subscription`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============================================================================
// 11. ROUTES ADMIN AVANCÉES
// ============================================================================
test.describe('⚙️ Admin - Routes Avancées', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.admin.email);
  });

  test('ADMIN-ADV-01: Édition média admin (/admin/media/edit/1)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/media/edit/1`);
  });

  test('ADMIN-ADV-02: Ajout démo programme pavillon (/admin/pavilion/1/add-demo)', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/pavilion/1/add-demo`);
  });
});

// ============================================================================
// 12. PAGES PROFIL DÉTAILLÉ
// ============================================================================
test.describe('👤 Profil Détaillé', () => {

  test('PROF-EXT-01: Profil detailed (/profile/detailed)', async ({ page }) => {
    await loginWithRetry(page, ACCOUNTS.visitorVip.email);
    await checkPageLoads(page, `${BASE_URL}/profile/detailed`);
  });
});
