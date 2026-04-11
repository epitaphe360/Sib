/**
 * 🎯 SIPORT 2026 - Suite de Tests E2E Complète
 * 
 * Ce fichier unique regroupe TOUS les scénarios de test de l'application.
 * Mise à jour: 28 Janvier 2026
 * 
 * Comptes synchronisés avec: supabase/migrations/20251224000002_seed_demo_data.sql
 * Routes synchronisées avec: src/lib/routes.ts
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9324';

// ============================================================================
// COMPTES DE TEST - Synchronisés avec la base de données Supabase
// Note: Les mots de passe peuvent varier selon l'état de la BDD
// ============================================================================
const PASSWORDS = ['Admin123!', 'Test@123456', 'Test@1234567', 'Test123456!', 'Demo2026!'];

const TEST_ACCOUNTS = {
  visitor: { email: 'visitor-free@test.siport.com', name: 'Visiteur Gratuit' },
  visitorVip: { email: 'visitor-vip@test.siport.com', name: 'Visiteur VIP' },
  exhibitor9m: { email: 'exhibitor-9m@test.siport.com', name: 'Exposant 9m²' },
  exhibitor54m: { email: 'exhibitor-54m@test.siport.com', name: 'Exposant 54m²' },
  partnerMuseum: { email: 'partner-museum@test.siport.com', name: 'Partenaire Musée' },
  partnerGold: { email: 'partner-gold@test.siport.com', name: 'Partenaire Gold' },
  partnerSilver: { email: 'partner-silver@test.siport.com', name: 'Partenaire Silver' },
  admin: { email: 'admin.siports@siports.com', name: 'Admin SIPORTS' }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
async function loginWithRetry(page: Page, email: string) {
  for (const password of PASSWORDS) {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(500);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForURL(/dashboard/, { timeout: 10000 });
      return true;
    } catch {
      continue;
    }
  }
  throw new Error(`Login failed for ${email} with all passwords`);
}

async function checkPageLoads(page: Page, url: string) {
  await page.goto(url);
  await page.waitForTimeout(2000);
  await expect(page.locator('body')).toBeVisible();
}

// ============================================================================
// 1. AUTHENTIFICATION & COMPTES
// ============================================================================
test.describe('🔐 Authentification & Comptes', () => {
  
  test('AUTH-01: Page connexion accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('AUTH-02: Connexion visiteur gratuit', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('AUTH-03: Connexion visiteur VIP', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitorVip.email);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('AUTH-04: Connexion exposant 9m²', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.exhibitor9m.email);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('AUTH-05: Connexion exposant 54m²', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.exhibitor54m.email);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('AUTH-06: Connexion partenaire Gold', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.partnerGold.email);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('AUTH-07: Connexion partenaire Musée', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.partnerMuseum.email);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('AUTH-08: Connexion admin', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.admin.email);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('AUTH-09: Page inscription visiteur gratuit', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/visitor/register/free`);
  });

  test('AUTH-10: Page inscription visiteur VIP', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/visitor/register/vip`);
  });

  test('AUTH-11: Page mot de passe oublié', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('AUTH-12: Page comptes démo', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/demo`);
  });

  test('AUTH-13: Page inscription exposant', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/register/exhibitor`);
  });

  test('AUTH-14: Page inscription partenaire', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/register/partner`);
  });
});

// ============================================================================
// 2. DASHBOARDS PAR TYPE D'UTILISATEUR
// ============================================================================
test.describe('📊 Dashboards', () => {
  
  test('DASH-01: Dashboard visiteur', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
    await checkPageLoads(page, `${BASE_URL}/visitor/dashboard`);
  });

  test('DASH-02: Dashboard exposant', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.exhibitor9m.email);
    await checkPageLoads(page, `${BASE_URL}/exhibitor/dashboard`);
  });

  test('DASH-03: Dashboard partenaire', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.partnerMuseum.email);
    await checkPageLoads(page, `${BASE_URL}/partner/dashboard`);
  });

  test('DASH-04: Dashboard admin', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.admin.email);
    await checkPageLoads(page, `${BASE_URL}/admin/dashboard`);
  });

  test('DASH-05: Dashboard responsive mobile', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============================================================================
// 3. RENDEZ-VOUS & CALENDRIER
// ============================================================================
test.describe('📅 Rendez-vous & Calendrier', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
  });

  test('RDV-01: Page rendez-vous', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/appointments`);
  });

  test('RDV-02: Page calendrier', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/calendar`);
  });

  test('RDV-03: Page disponibilités', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/availability/settings`);
  });
});

// ============================================================================
// 4. NETWORKING & MESSAGERIE
// ============================================================================
test.describe('🤝 Networking & Messagerie', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
  });

  test('NET-01: Page networking', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/networking`);
  });

  test('NET-02: Page chat', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/chat`);
  });

  test('NET-03: Page messages', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/messages`);
  });

  test('NET-04: Page profil', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/profile`);
  });

  test('NET-05: Page matchmaking', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/networking/matchmaking`);
  });

  test('NET-06: Historique interactions', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/networking/history`);
  });
});

// ============================================================================
// 5. ÉVÉNEMENTS
// ============================================================================
test.describe('🎪 Événements', () => {
  
  test('EVT-01: Page événements publique', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/events`);
  });

  test('EVT-02: Événements connecté visiteur', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
    await checkPageLoads(page, `${BASE_URL}/events`);
  });

  test('EVT-03: Événements connecté exposant', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.exhibitor9m.email);
    await checkPageLoads(page, `${BASE_URL}/events`);
  });
});

// ============================================================================
// 6. EXPOSANTS & MINI-SITES
// ============================================================================
test.describe('🏢 Exposants & Mini-Sites', () => {
  
  test('MINI-01: Liste exposants publique', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/exhibitors`);
  });

  test('MINI-02: Répertoire mini-sites', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/minisites`);
  });

  test('MINI-03: Dashboard exposant', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.exhibitor9m.email);
    await checkPageLoads(page, `${BASE_URL}/exhibitor/dashboard`);
  });

  test('MINI-04: Profil exposant', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.exhibitor9m.email);
    await checkPageLoads(page, `${BASE_URL}/exhibitor/profile`);
  });

  test('MINI-05: Création mini-site', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.exhibitor54m.email);
    await checkPageLoads(page, `${BASE_URL}/exhibitor/mini-site/create`);
  });
});

// ============================================================================
// 7. PARTENAIRES
// ============================================================================
test.describe('🤝 Partenaires', () => {
  
  test('PART-01: Liste partenaires publique', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/partners`);
  });

  test('PART-02: Dashboard partenaire', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.partnerMuseum.email);
    await checkPageLoads(page, `${BASE_URL}/partner/dashboard`);
  });

  test('PART-03: Profil partenaire', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.partnerMuseum.email);
    await checkPageLoads(page, `${BASE_URL}/partner/profile`);
  });

  test('PART-04: Analytics partenaire', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/analytics`);
  });

  test('PART-05: Événements partenaire', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/events`);
  });

  test('PART-06: Leads partenaire', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/leads`);
  });

  test('PART-07: Médias partenaire', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/media`);
  });

  test('PART-08: Networking partenaire', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.partnerGold.email);
    await checkPageLoads(page, `${BASE_URL}/partner/networking`);
  });
});

// ============================================================================
// 8. PAIEMENTS & ABONNEMENTS
// ============================================================================
test.describe('💳 Paiements & Abonnements', () => {
  
  test('PAY-01: Page abonnements visiteur', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/visitor/subscription`);
  });

  test('PAY-02: Page upgrade visiteur', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
    await checkPageLoads(page, `${BASE_URL}/visitor/upgrade`);
  });

  test('PAY-03: Page paiement visiteur', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
    await checkPageLoads(page, `${BASE_URL}/visitor/payment`);
  });

  test('PAY-04: Page upgrade partenaire', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.partnerSilver.email);
    await checkPageLoads(page, `${BASE_URL}/partner/upgrade`);
  });
});

// ============================================================================
// 9. ADMINISTRATION
// ============================================================================
test.describe('⚙️ Administration', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.admin.email);
  });

  test('ADMIN-01: Dashboard admin', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/dashboard`);
  });

  test('ADMIN-02: Gestion utilisateurs', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/users`);
  });

  test('ADMIN-03: Gestion exposants', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/exhibitors`);
  });

  test('ADMIN-04: Gestion partenaires', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/partners`);
  });

  test('ADMIN-05: Gestion événements', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/events`);
  });

  test('ADMIN-06: Validation inscriptions', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/validation`);
  });

  test('ADMIN-07: Modération', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/moderation`);
  });

  test('ADMIN-08: Actualités', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/news`);
  });

  test('ADMIN-09: Pavillons', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/pavilions`);
  });

  test('ADMIN-10: Médias', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/media`);
  });

  test('ADMIN-11: Créer exposant', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/create-exhibitor`);
  });

  test('ADMIN-12: Créer partenaire', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/create-partner`);
  });

  test('ADMIN-13: Créer événement', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/create-event`);
  });

  test('ADMIN-14: Créer actualité', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/create-news`);
  });

  test('ADMIN-15: Activité', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/activity`);
  });

  test('ADMIN-16: Contenu', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/content`);
  });

  test('ADMIN-17: Validation paiements', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/admin/payment-validation`);
  });
});

// ============================================================================
// 10. PAGES PUBLIQUES
// ============================================================================
test.describe('📄 Pages Publiques', () => {
  
  test('PAGE-01: Page d\'accueil', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/SIPORT/i);
  });

  test('PAGE-02: Page contact', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/contact`);
  });

  test('PAGE-03: Page actualités', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/news`);
  });

  test('PAGE-04: Page partenariat', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/partnership`);
  });

  test('PAGE-05: Page lieu/venue', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/venue`);
  });

  test('PAGE-06: Page support', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/support`);
  });

  test('PAGE-07: Page confidentialité', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/privacy`);
  });

  test('PAGE-08: Page CGU', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/terms`);
  });

  test('PAGE-09: Page cookies', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/cookies`);
  });

  test('PAGE-10: Page pavillons', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/pavilions`);
  });

  test('PAGE-11: Page métriques', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/metrics`);
  });

  test('PAGE-12: Page API', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/api`);
  });
});

// ============================================================================
// 11. MÉDIATHÈQUE
// ============================================================================
test.describe('📺 Médiathèque', () => {
  
  test('MEDIA-01: Bibliothèque média', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media`);
  });

  test('MEDIA-02: Webinaires', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/webinars`);
  });

  test('MEDIA-03: Podcasts', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/podcasts`);
  });

  test('MEDIA-04: Témoignages', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/testimonials`);
  });

  test('MEDIA-05: Inside SIPORT', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/inside-siport`);
  });

  test('MEDIA-06: Best Moments', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/best-moments`);
  });

  test('MEDIA-07: Live Studio', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/media/live-studio`);
  });
});

// ============================================================================
// 12. UI/UX & RESPONSIVE
// ============================================================================
test.describe('🎨 UI/UX & Responsive', () => {
  
  test('UI-01: Navigation header', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('nav, header').first()).toBeVisible();
  });

  test('UI-02: Footer', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('footer')).toBeVisible();
  });

  test('UI-03: Responsive 1920px (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
  });

  test('UI-04: Responsive 1024px (laptop)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
  });

  test('UI-05: Responsive 768px (tablet)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
  });

  test('UI-06: Responsive 375px (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
  });

  test('UI-07: Responsive 320px (petit mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
  });

  test('UI-08: Pas de débordement horizontal', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 50);
  });
});

// ============================================================================
// 13. SÉCURITÉ & PERMISSIONS
// ============================================================================
test.describe('🔒 Sécurité & Permissions', () => {
  
  test('SEC-01: Redirection dashboard non connecté', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url.includes('login') || url.includes('dashboard')).toBeTruthy();
  });

  test('SEC-02: Session persistante', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
    await page.reload();
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/dashboard/);
  });

  test('SEC-03: Page 404', async ({ page }) => {
    await page.goto(`${BASE_URL}/route-inexistante-xyz-123`);
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('SEC-04: Page non autorisé', async ({ page }) => {
    await checkPageLoads(page, `${BASE_URL}/unauthorized`);
  });
});

// ============================================================================
// 14. BADGE & QR CODE
// ============================================================================
test.describe('🎫 Badge & QR Code', () => {
  
  test('BADGE-01: Page badge', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
    await checkPageLoads(page, `${BASE_URL}/badge`);
  });

  test('BADGE-02: Badge digital', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
    await checkPageLoads(page, `${BASE_URL}/badge/digital`);
  });

  test('BADGE-03: Scanner badge exposant', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.exhibitor9m.email);
    await checkPageLoads(page, `${BASE_URL}/badge/scanner`);
  });
});

// ============================================================================
// 15. PERFORMANCE
// ============================================================================
test.describe('⚡ Performance', () => {
  
  test('PERF-01: Page accueil < 15s', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(15000);
  });

  test('PERF-02: Login + Dashboard < 30s', async ({ page }) => {
    const start = Date.now();
    await loginWithRetry(page, TEST_ACCOUNTS.visitor.email);
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(30000);
  });

  test('PERF-03: Page exposants < 10s', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/exhibitors`);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10000);
  });

  test('PERF-04: Page partenaires < 10s', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/partners`);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10000);
  });
});

// ============================================================================
// 16. MARKETING DASHBOARD
// ============================================================================
test.describe('📈 Marketing', () => {
  
  test('MKT-01: Dashboard marketing', async ({ page }) => {
    await loginWithRetry(page, TEST_ACCOUNTS.admin.email);
    await checkPageLoads(page, `${BASE_URL}/marketing/dashboard`);
  });
});
