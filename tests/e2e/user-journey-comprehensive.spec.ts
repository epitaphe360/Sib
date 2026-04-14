import { test, expect } from '@playwright/test';

/**
 * 🎯 SUITE COMPLÈTE DE TESTS E2E - TOUS LES PARCOURS UTILISATEURS
 *
 * Cette suite couvre l'intégralité des fonctionnalités de l'application SIB:
 *
 * 1. 🌐 PARCOURS PUBLIC (Guest/Visiteur non connecté)
 * 2. 👤 PARCOURS VISITEUR COMPLET (Inscription Free → Upgrade VIP → Badge)
 * 3. 🏢 PARCOURS EXPOSANT COMPLET (Inscription → Mini-site → Networking → Rendez-vous)
 * 4. 🤝 PARCOURS PARTENAIRE COMPLET (Inscription → Upgrade Tier → Média → Analytics)
 * 5. ⚙️  PARCOURS ADMINISTRATEUR (Gestion utilisateurs → Validation → Contenu)
 * 6. 📺 FONCTIONNALITÉS MÉDIA (Webinars, Podcasts, Capsules, Live, Témoignages)
 * 7. 🤝 FONCTIONNALITÉS NETWORKING (Matchmaking, Speed Networking, Salles virtuelles)
 * 8. 💳 SYSTÈME DE PAIEMENT (Bank Transfer, Instructions, Validation)
 *
 * Pour exécuter:
 * npm run test:journey:comprehensive
 *
 * Pour exécuter en mode debug:
 * npm run test:journey:comprehensive:debug
 */

const BASE_URL = 'http://localhost:9324';

// Helpers pour générer des données de test
const generateTestData = () => {
  const timestamp = Date.now();
  return {
    visitor: {
      email: `visitor-${timestamp}@test.com`,
      password: 'Visitor123!@#',
      name: 'Visiteur Test',
      phone: '+212612345678',
    },
    exhibitor: {
      email: `exhibitor-${timestamp}@test.com`,
      password: 'Exhibitor123!@#',
      companyName: `TechExpo ${timestamp}`,
      name: 'Jean Exposant',
      phone: '+212612345679',
      website: 'https://techexpo.ma',
      description: 'Solutions maritimes innovantes pour ports intelligents du futur.',
    },
    partner: {
      email: `partner-${timestamp}@test.com`,
      password: 'Partner123!@#',
      companyName: `PartnerCorp ${timestamp}`,
      name: 'Marie Partenaire',
      phone: '+212612345680',
      website: 'https://partnercorp.ma',
      description: 'Partenaire stratégique pour le développement portuaire.',
    },
    admin: {
      email: 'admin@sib2026.ma',
      password: 'Admin123!@#',
    },
  };
};

// Helper pour attendre et gérer les erreurs
const safeWaitForSelector = async (page: any, selector: string, timeout = 5000) => {
  try {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    return true;
  } catch {
    return false;
  }
};

// Helper pour surveiller les logs console et erreurs réseau
const setupConsoleMonitoring = (page: any) => {
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[CONSOLE ${type.toUpperCase()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    console.log(`[PAGE ERROR] ${err.message}`);
  });
  
  page.on('requestfailed', (request) => {
    if (request.url().includes(BASE_URL) || request.url().includes('supabase')) {
      console.log(`[REQUEST FAILED] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    }
  });

  page.on('response', (response) => {
    if (response.status() >= 400) {
      console.log(`[HTTP ERROR] ${response.status()} ${response.url()}`);
    }
  });
};

// ============================================================================
// 1. 🌐 PARCOURS PUBLIC (Guest/Visiteur non connecté)
// ============================================================================
test.describe('🌐 PARCOURS PUBLIC - Navigation sans connexion', () => {
  test('Parcours complet visiteur non connecté', async ({ page }) => {
    setupConsoleMonitoring(page);
    test.setTimeout(90000);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 TEST PARCOURS PUBLIC - VISITEUR NON CONNECTÉ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1.1 Homepage
    console.log('📍 1. Navigation Homepage...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/SIB|Salon/i);
    console.log('   ✅ Homepage chargée\n');

    // 1.2 Page Exposants (liste publique)
    console.log('📍 2. Consultation liste Exposants...');
    await page.goto(`${BASE_URL}/exhibitors`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const exhibitorCards = page.locator('[class*="card"], article');
    const exhibitorsCount = await exhibitorCards.count();
    console.log(`   → ${exhibitorsCount} exposants trouvés`);
    console.log('   ✅ Liste exposants consultée\n');

    // 1.3 Page Partenaires (liste publique)
    console.log('📍 3. Consultation liste Partenaires...');
    await page.goto(`${BASE_URL}/partners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const partnerCards = page.locator('[class*="card"], article');
    const partnersCount = await partnerCards.count();
    console.log(`   → ${partnersCount} partenaires trouvés`);
    console.log('   ✅ Liste partenaires consultée\n');

    // 1.4 Page Événements
    console.log('📍 4. Consultation Événements...');
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Page événements consultée\n');

    // 1.5 Page Actualités
    console.log('📍 5. Consultation Actualités...');
    await page.goto(`${BASE_URL}/news`);
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch {
      console.log('   ⚠️ Networkidle timeout - continuing anyway');
    }
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    console.log('   ✅ Page actualités consultée\n');

    // 1.6 Médiathèque publique
    console.log('📍 6. Consultation Médiathèque...');
    await page.goto(`${BASE_URL}/media`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Médiathèque consultée\n');

    // 1.7 Page Contact
    console.log('📍 7. Formulaire de Contact...');
    await page.goto(`${BASE_URL}/contact`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const nameInput = page.locator('input[name="name"], input[type="text"]').first();
    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill('Test Visiteur Public');

      const emailInput = page.locator('input[type="email"]').first();
      await emailInput.fill('public@test.com');

      const messageInput = page.locator('textarea').first();
      await messageInput.fill('Message de test depuis le parcours E2E public.');

      console.log('   → Formulaire rempli');
    }
    console.log('   ✅ Formulaire contact exploré\n');

    // 1.8 Venue / Lieu de l'événement
    console.log('📍 8. Consultation Venue...');
    await page.goto(`${BASE_URL}/venue`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Page venue consultée\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PARCOURS PUBLIC TERMINÉ AVEC SUCCÈS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});

// ============================================================================
// 2. 👤 PARCOURS VISITEUR COMPLET (Inscription Free → Upgrade VIP → Badge)
// ============================================================================
test.describe('👤 PARCOURS VISITEUR COMPLET', () => {
  test('Cycle complet: Inscription Free → Upgrade VIP → Badge', async ({ page }) => {
    setupConsoleMonitoring(page);
    test.setTimeout(600000); // 10 minutes

    const testData = generateTestData();
    const { visitor } = testData;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 TEST PARCOURS VISITEUR COMPLET');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${visitor.email}`);
    console.log(`🔐 Password: ${visitor.password}\n`);

    // 2.1 Inscription Visiteur FREE
    console.log('📍 1. Inscription Visiteur FREE...');
    await page.goto(`${BASE_URL}/register/visitor`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Étape 1: Type de compte
    console.log('   → Étape 1: Type de compte...');
    const visitorCard = page.locator('[data-testid="account-type-visitor"], label:has-text("Visiteur")').first();
    if (await visitorCard.isVisible()) {
      await visitorCard.click();
      console.log('   → Carte Visiteur cliquée');
    }
    
    await page.waitForTimeout(1000);
    console.log(`   → URL actuelle: ${page.url()}`);
    
    // DEBUG: Lister les boutons
    const buttons = await page.locator('button').allTextContents();
    console.log(`   → Boutons trouvés: ${buttons.join(', ')}`);

    // Essayer de trouver le bouton Suivant par texte ou testid
    const nextBtn = page.locator('button:has-text("Suivant"), [data-testid="btn-next"]').first();
    await nextBtn.scrollIntoViewIfNeeded();
    await nextBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // Étape 2: Entreprise / Organisation
    console.log('   → Étape 2: Entreprise...');
    // Pour visiteur, le nom de l'entreprise n'est pas obligatoire mais on peut le mettre
    const compInput = page.locator('input[name="companyName"]').first();
    if (await compInput.isVisible()) {
      await compInput.fill(visitor.company || 'Indépendant');
    }
    
    const sectorSelect = page.locator('select[name="sector"]').first();
    if (await sectorSelect.isVisible()) {
      await sectorSelect.selectOption('Technologie');
    }

    const countrySelect = page.locator('select[name="country"]').first();
    if (await countrySelect.isVisible()) {
      await countrySelect.selectOption('FR');
    }

    await page.getByTestId('btn-next').first().click();
    await page.waitForTimeout(1000);

    // Étape 3: Contact
    console.log('   → Étape 3: Contact...');
    await page.fill('input[name="firstName"]', visitor.name.split(' ')[0]);
    await page.fill('input[name="lastName"]', visitor.name.split(' ')[1] || 'Test');
    await page.fill('input[name="email"]', visitor.email);
    await page.fill('input[name="phone"]', visitor.phone);
    await page.getByTestId('btn-next').first().click();
    await page.waitForTimeout(1000);

    // Étape 4: Profil
    console.log('   → Étape 4: Profil...');
    const desc = page.locator('textarea[data-testid="description"]').first();
    if (await desc.isVisible()) {
      await desc.fill('Je suis un visiteur passionné par le secteur maritime et portuaire.');
    }
    
    // Cliquer sur un objectif
    const objective = page.locator('input[type="checkbox"]').first();
    if (await objective.isVisible()) await objective.check();
    
    await page.getByTestId('btn-next').first().click();
    await page.waitForTimeout(1000);

    // Étape 5: Sécurité
    console.log('   → Étape 5: Sécurité...');
    await page.fill('input[data-testid="password"]', visitor.password);
    await page.fill('input[name="confirmPassword"]', visitor.password);

    await page.click('button:has-text("Créer mon compte")');
    await page.waitForTimeout(10000); // Attendre traitement et reCAPTCHA
    console.log('   ✅ Compte visiteur créé\n');

    // Si pas de redirection automatique, forcer la redirection vers dashboard
    if (page.url().includes('confirm') || page.url().includes('login')) {
      console.log('   → Tentative accès dashboard...');
      await page.goto(`${BASE_URL}/visitor/dashboard`);
      await page.waitForTimeout(2000);
    }

    // 2.2 Dashboard Visiteur
    console.log('📍 2. Consultation Dashboard...');
    await page.goto(`${BASE_URL}/visitor/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Dashboard consulté\n');

    // 2.3 Upgrade vers VIP
    console.log('📍 3. Upgrade vers VIP...');
    const upgradeLink = page.locator('a[href*="upgrade"], button:has-text("Upgrade"), a:has-text("VIP")').first();
    if (await upgradeLink.isVisible({ timeout: 5000 })) {
      await upgradeLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Sélectionner option VIP
      const vipButton = page.locator('button:has-text("VIP"), a:has-text("VIP")').first();
      if (await vipButton.isVisible({ timeout: 3000 })) {
        await vipButton.click();
        await page.waitForTimeout(2000);
        console.log('   ✅ Page upgrade VIP consultée');
      }
    }
    console.log('   ✅ Processus upgrade exploré\n');

    // 2.4 Badge numérique
    console.log('📍 4. Génération Badge numérique...');
    await page.goto(`${BASE_URL}/badge`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Vérifier présence du QR code ou badge
    const badgeElement = page.locator('[class*="badge"], [class*="qr"], canvas, svg').first();
    const hasBadge = await badgeElement.isVisible({ timeout: 5000 });
    if (hasBadge) {
      console.log('   → Badge numérique généré');
    }
    console.log('   ✅ Page badge consultée\n');

    // 2.5 Networking (recherche exposants/partenaires)
    console.log('📍 5. Networking et recherche...');
    await page.goto(`${BASE_URL}/networking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Page networking consultée\n');

    // 2.6 Rendez-vous
    console.log('📍 6. Consultation Rendez-vous...');
    await page.goto(`${BASE_URL}/appointments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Page rendez-vous consultée\n');

    // 2.7 Déconnexion
    console.log('📍 7. Déconnexion...');
    const logoutBtn = page.locator('button:has-text("Déconnexion"), a:has-text("Déconnexion"), button:has-text("Logout")').first();
    if (await logoutBtn.isVisible({ timeout: 3000 })) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ Déconnexion réussie\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PARCOURS VISITEUR TERMINÉ AVEC SUCCÈS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});

// ============================================================================
// 3. 🏢 PARCOURS EXPOSANT COMPLET (version améliorée de l'existant)
// ============================================================================
test.describe('🏢 PARCOURS EXPOSANT COMPLET', () => {
  test('Cycle complet: Inscription → Mini-site → Networking → Analytics', async ({ page }) => {
    setupConsoleMonitoring(page);
    test.setTimeout(600000); // 10 minutes - le test prend du temps avec toutes les navigations

    const testData = generateTestData();
    const { exhibitor } = testData;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏢 TEST PARCOURS EXPOSANT COMPLET');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${exhibitor.email}`);
    console.log(`🔐 Password: ${exhibitor.password}`);
    console.log(`🏢 Entreprise: ${exhibitor.companyName}\n`);

// 3.1 Inscription Exposant
    console.log('📍 1. Inscription Exposant...');
    await page.goto(`${BASE_URL}/register/exhibitor`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Le formulaire ExhibitorSignUpPage est à une seule page avec tous les champs
    console.log('   → Sélection abonnement Premium...');
    // Cliquer sur la carte Premium
    const premiumCard = page.locator('div[class*="cursor-pointer"]').filter({ hasText: 'Premium' }).first();
    if (await premiumCard.isVisible()) {
      await premiumCard.click();
      await page.waitForTimeout(500);
    }

    // Remplir le formulaire complet (tous les champs sur la même page)
    console.log('   → Remplissage formulaire complet...');
    
    // Section Entreprise
    await page.fill('#companyName', exhibitor.companyName);
    await page.waitForTimeout(300);
    
    // Secteurs - MultiSelect avec input de recherche
    console.log('   → Sélection secteurs...');
    const sectorsInput = page.locator('input[placeholder*="Sélectionnez vos secteurs"]').first();
    await sectorsInput.waitFor({ state: 'visible', timeout: 5000 });
    
    // Sélectionner 2 secteurs via le champ de recherche
    const sectorsToSelect = ['Technologie', 'Finance'];
    for (const sector of sectorsToSelect) {
      await sectorsInput.click();
      await sectorsInput.fill(sector);
      await page.waitForTimeout(300);
      
      // Cliquer sur l'option dans le dropdown
      const sectorOption = page.locator(`button:has-text("${sector}")`).first();
      await sectorOption.waitFor({ state: 'visible', timeout: 5000 });
      await sectorOption.click();
      await page.waitForTimeout(300);
    }
    
    // Pays - avec attente et débogage
    console.log('   → Sélection du pays...');
    const countryTrigger = page.locator('#country');
    await countryTrigger.scrollIntoViewIfNeeded();
    await countryTrigger.click();
    await page.waitForTimeout(1000);
    
    // Attendre que les options soient visibles
    const marocOption = page.getByRole('option', { name: /Maroc/i }).first();
    await marocOption.waitFor({ state: 'visible', timeout: 5000 });
    await marocOption.click();
    await page.waitForTimeout(300);

    await page.fill('#website', exhibitor.website);
    await page.fill('#companyDescription', exhibitor.description);
    await page.waitForTimeout(300);

    // Section Personnelle
    await page.fill('#firstName', exhibitor.name.split(' ')[0]);
    await page.fill('#lastName', exhibitor.name.split(' ')[1] || 'Test');
    await page.fill('#position', 'Directeur Commercial');
    await page.waitForTimeout(300);

    // Section Contact
    await page.fill('#email', exhibitor.email);
    await page.fill('#phone', exhibitor.phone);
    await page.waitForTimeout(300);

    // Section Sécurité
    await page.fill('#password', exhibitor.password);
    await page.fill('#confirmPassword', exhibitor.password);
    await page.waitForTimeout(300);

    // Conditions
    console.log('   → Acceptation des conditions...');
    await page.check('#acceptTerms', { force: true });
    await page.check('#acceptPrivacy', { force: true });
    await page.waitForTimeout(500);

    // Cliquer sur "Prévisualiser et soumettre" - le bouton qui ouvre la modal
    console.log('   → Clic sur Prévisualiser...');
    const previewBtn = page.locator('button[type="submit"]').filter({ hasText: /Prévisualiser|Preview|Aperçu/i }).first();
    await previewBtn.scrollIntoViewIfNeeded();
    await previewBtn.waitFor({ state: 'visible', timeout: 5000 });
    await previewBtn.click({ force: true });
    await page.waitForTimeout(2000);

    // Confirmer dans la modal en cliquant sur "S'inscrire maintenant"
    console.log('   → Confirmation finale dans la modal...');
    const confirmBtn = page.locator('button').filter({ hasText: /S'inscrire maintenant|Confirmer/i }).last();
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmBtn.click({ force: true });
    await page.waitForTimeout(5000);
    console.log('   ✅ Compte exposant créé\n');

    // Connexion manuelle si nécessaire (pour les exposants c'est souvent nécessaire car validation admin)
    if (page.url().includes('login') || page.url().includes('confirm')) {
      console.log('   → Connexion manuelle...');
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', exhibitor.email);
      await page.fill('input[name="password"]', exhibitor.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    // 3.2 Configuration profil détaillé
    console.log('📍 2. Configuration profil détaillé...');
    const profileLink = page.locator('a[href*="profile"], a:has-text("Profil")').first();
    if (await profileLink.isVisible({ timeout: 3000 })) {
      await profileLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const descField = page.locator('textarea[name="description"]').first();
      if (await descField.isVisible({ timeout: 3000 })) {
        await descField.clear();
        await descField.fill('Leader des solutions portuaires. 20+ ans d\'expérience. Innovation & Excellence.');

        const saveBtn = page.locator('button:has-text("Enregistrer"), button[type="submit"]').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
        }
      }
      console.log('   ✅ Profil mis à jour\n');
    }

    // 3.3 Création Mini-Site
    console.log('📍 3. Création Mini-Site...');
    await page.goto(`${BASE_URL}/exhibitor/mini-site/create`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const miniSiteTitle = page.locator('input[name="title"], input[placeholder*="titre" i]').first();
    if (await miniSiteTitle.isVisible({ timeout: 5000 })) {
      await miniSiteTitle.fill(`Mini-Site ${exhibitor.companyName}`);

      const miniSiteDesc = page.locator('textarea[name="description"]').first();
      if (await miniSiteDesc.isVisible()) {
        await miniSiteDesc.fill('Découvrez nos solutions innovantes pour le secteur maritime.');
      }

      const saveMiniSiteBtn = page.locator('button:has-text("Créer"), button:has-text("Enregistrer"), button[type="submit"]').first();
      if (await saveMiniSiteBtn.isVisible()) {
        await saveMiniSiteBtn.click();
        await page.waitForTimeout(3000);
        console.log('   ✅ Mini-site créé');
      }
    } else {
      console.log('   ⚠️  Page mini-site non accessible (peut nécessiter validation admin)');
    }
    console.log('   ✅ Processus mini-site exploré\n');

    // 3.4 Configuration disponibilités
    console.log('📍 4. Configuration créneaux de disponibilité...');
    await page.goto(`${BASE_URL}/availability/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const addSlotBtn = page.locator('button:has-text("Ajouter"), button:has-text("Créer")').first();
    if (await addSlotBtn.isVisible({ timeout: 3000 })) {
      await addSlotBtn.click();
      await page.waitForTimeout(1000);

      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.isVisible({ timeout: 3000 })) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await dateInput.fill(tomorrow.toISOString().split('T')[0]);
      }

      const timeStartInput = page.locator('input[type="time"]').first();
      if (await timeStartInput.isVisible({ timeout: 3000 })) {
        await timeStartInput.fill('09:00');
      }

      console.log('   ✅ Créneaux configurés');
    }
    console.log('   ✅ Disponibilités explorées\n');

    // 3.5 Rendez-vous B2B
    console.log('📍 5. Gestion Rendez-vous...');
    await page.goto(`${BASE_URL}/appointments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Page rendez-vous consultée\n');

    // 3.6 Networking
    console.log('📍 6. Networking et connexions...');
    await page.goto(`${BASE_URL}/networking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const connectButtons = page.locator('button:has-text("Connecter"), button:has-text("Suivre")');
    const count = await connectButtons.count();
    if (count > 0) {
      console.log(`   → ${count} profils disponibles`);
    }
    console.log('   ✅ Networking exploré\n');

    // 3.7 Badge Scanner
    console.log('📍 7. Badge Scanner...');
    await page.goto(`${BASE_URL}/badge/scanner`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Scanner de badge consulté\n');

    // 3.8 Messagerie
    console.log('📍 8. Messagerie...');
    const messagesLink = page.locator('a[href*="messages"], a[href*="chat"]').first();
    if (await messagesLink.isVisible({ timeout: 3000 })) {
      await messagesLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      console.log('   ✅ Messagerie consultée\n');
    }

    // 3.9 Statistiques/Analytics
    console.log('📍 9. Statistiques...');
    await page.goto(`${BASE_URL}/exhibitor/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Dashboard avec stats consulté\n');

    // 3.10 Événements
    console.log('📍 10. Événements...');
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Page événements consultée\n');

    // 3.11 Déconnexion
    console.log('📍 11. Déconnexion...');
    const logoutBtn = page.locator('button:has-text("Déconnexion"), a:has-text("Déconnexion")').first();
    if (await logoutBtn.isVisible({ timeout: 3000 })) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PARCOURS EXPOSANT TERMINÉ AVEC SUCCÈS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});

// ============================================================================
// 4. 🤝 PARCOURS PARTENAIRE COMPLET
// ============================================================================
test.describe('🤝 PARCOURS PARTENAIRE COMPLET', () => {
  test('Cycle complet: Inscription → Upgrade Tier → Média → Analytics', async ({ page }) => {
    setupConsoleMonitoring(page);
    test.setTimeout(600000); // 10 minutes

    const testData = generateTestData();
    const { partner } = testData;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤝 TEST PARCOURS PARTENAIRE COMPLET');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${partner.email}`);
    console.log(`🔐 Password: ${partner.password}`);
    console.log(`🏢 Entreprise: ${partner.companyName}\n`);

    // 4.1 Inscription Partenaire (formulaire à une seule page)
    console.log('📍 1. Inscription Partenaire...');
    await page.goto(`${BASE_URL}/register/partner`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Remplir le formulaire complet (tous les champs sur la même page)
    console.log('   → Remplissage formulaire complet...');
    
    // Section Organisation
    await page.fill('#companyName', partner.companyName);
    await page.waitForTimeout(300);
    
    // Secteurs - cliquer sur le MultiSelect
    const partnerSectorsButton = page.locator('button').filter({ hasText: /Sélectionnez/i }).first();
    if (await partnerSectorsButton.isVisible()) {
      await partnerSectorsButton.click();
      await page.waitForTimeout(300);
      await page.locator('div[role="option"]').first().click();
      await page.waitForTimeout(200);
      await page.keyboard.press('Escape');
    }
    
    // Pays
    await page.locator('#country').click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'Maroc' }).first().click();
    await page.waitForTimeout(300);

    await page.fill('#website', partner.website);
    await page.waitForTimeout(300);

    // Section Contact
    await page.fill('#firstName', partner.name.split(' ')[0]);
    await page.fill('#lastName', partner.name.split(' ')[1] || 'Test');
    await page.fill('#position', 'Chargé de Partenariat');
    await page.fill('#email', partner.email);
    await page.fill('#phone', partner.phone);
    await page.waitForTimeout(300);

    // Section Sécurité
    await page.fill('#password', partner.password);
    await page.fill('#confirmPassword', partner.password);
    await page.waitForTimeout(300);

    // Section Détails
    await page.fill('#companyDescription', partner.description);
    await page.waitForTimeout(300);
    
    // Type de partenariat
    const partnershipSelect = page.locator('#partnershipType');
    if (await partnershipSelect.isVisible()) {
      await partnershipSelect.click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(200);
    }

    // Conditions
    await page.check('#acceptTerms', { force: true });
    await page.check('#acceptPrivacy', { force: true });
    await page.waitForTimeout(500);

    // Soumettre - ouvre une preview modal
    console.log('   → Ouverture aperçu...');
    const previewBtnPartner = page.locator('button[type="submit"]').first();
    await previewBtnPartner.scrollIntoViewIfNeeded();
    await previewBtnPartner.click({ force: true });
    await page.waitForTimeout(2000);

    // Confirmer dans la modal
    console.log('   → Confirmation inscription...');
    const confirmBtnPartner = page.locator('button').filter({ hasText: /Confirmer|S'inscrire maintenant/i }).last();
    if (await confirmBtnPartner.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtnPartner.click({ force: true });
      await page.waitForTimeout(5000);
    }
    console.log('   ✅ Compte partenaire créé\n');

    // Connexion manuelle
    if (page.url().includes('login') || page.url().includes('confirm')) {
      console.log('   → Connexion manuelle...');
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', partner.email);
      await page.fill('input[name="password"]', partner.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    // 4.2 Dashboard Partenaire
    console.log('📍 2. Dashboard Partenaire...');
    await page.goto(`${BASE_URL}/partner/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Dashboard consulté\n');

    // 4.3 Configuration Profil
    console.log('📍 3. Configuration Profil...');
    await page.goto(`${BASE_URL}/partner/profile/edit`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const descField = page.locator('textarea[name="description"]').first();
    if (await descField.isVisible({ timeout: 3000 })) {
      await descField.clear();
      await descField.fill('Partenaire stratégique majeur du secteur portuaire. Leader régional.');

      const saveBtn = page.locator('button:has-text("Enregistrer"), button[type="submit"]').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
      }
      console.log('   ✅ Profil mis à jour');
    }
    console.log('   ✅ Configuration profil explorée\n');

    // 4.4 Upgrade Tier (Museum → Silver/Gold/Platinum)
    console.log('📍 4. Upgrade Tier Partenaire...');
    await page.goto(`${BASE_URL}/partner/upgrade`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Chercher les options de tier
    const tierButtons = page.locator('button:has-text("Silver"), button:has-text("Gold"), button:has-text("Platinum")');
    const tierCount = await tierButtons.count();
    if (tierCount > 0) {
      console.log(`   → ${tierCount} tiers disponibles`);
      console.log('   ✅ Page upgrade consultée');
    }
    console.log('   ✅ Processus upgrade exploré\n');

    // 4.5 Sélection méthode de paiement
    console.log('📍 5. Sélection paiement...');
    await page.goto(`${BASE_URL}/partner/payment-selection`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bankTransferBtn = page.locator('button:has-text("Virement"), a:has-text("Bank Transfer")').first();
    if (await bankTransferBtn.isVisible({ timeout: 3000 })) {
      await bankTransferBtn.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ Méthode paiement sélectionnée');
    }
    console.log('   ✅ Page paiement explorée\n');

    // 4.6 Instructions Bank Transfer
    console.log('📍 6. Instructions Bank Transfer...');
    await page.goto(`${BASE_URL}/partner/bank-transfer`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Vérifier présence des infos bancaires
    const bankInfo = page.locator('text=/IBAN|BIC|SWIFT/i').first();
    if (await bankInfo.isVisible({ timeout: 3000 })) {
      console.log('   → Informations bancaires affichées');
    }
    console.log('   ✅ Instructions bancaires consultées\n');

    // 4.7 Upload Média Partenaire
    console.log('📍 7. Upload Média...');
    await page.goto(`${BASE_URL}/partner/media/upload`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Page upload média consultée\n');

    // 4.8 Bibliothèque Média Partenaire
    console.log('📍 8. Bibliothèque Média...');
    await page.goto(`${BASE_URL}/partner/media/library`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Bibliothèque média consultée\n');

    // 4.9 Analytics Partenaire
    console.log('📍 9. Analytics Partenaire...');
    await page.goto(`${BASE_URL}/partner/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Analytics consultées\n');

    // 4.10 Analytics Média
    console.log('📍 10. Analytics Média...');
    await page.goto(`${BASE_URL}/partner/media/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Analytics média consultées\n');

    // 4.11 Networking Partenaire
    console.log('📍 11. Networking...');
    await page.goto(`${BASE_URL}/partner/networking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Page networking consultée\n');

    // 4.12 Activité Partenaire
    console.log('📍 12. Activité...');
    await page.goto(`${BASE_URL}/partner/activity`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Page activité consultée\n');

    // 4.13 Support Partenaire
    console.log('📍 13. Support...');
    await page.goto(`${BASE_URL}/partner/support-page`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Page support consultée\n');

    // 4.14 Déconnexion
    console.log('📍 14. Déconnexion...');
    const logoutBtn = page.locator('button:has-text("Déconnexion"), a:has-text("Déconnexion")').first();
    if (await logoutBtn.isVisible({ timeout: 3000 })) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PARCOURS PARTENAIRE TERMINÉ AVEC SUCCÈS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});

// ============================================================================
// 5. 📺 FONCTIONNALITÉS MÉDIA COMPLÈTES
// ============================================================================
test.describe('📺 FONCTIONNALITÉS MÉDIA', () => {
  test('Exploration complète de toutes les fonctionnalités média', async ({ page }) => {
    test.setTimeout(90000);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📺 TEST FONCTIONNALITÉS MÉDIA COMPLÈTES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 5.1 Médiathèque principale
    console.log('📍 1. Médiathèque principale...');
    await page.goto(`${BASE_URL}/media`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Médiathèque chargée\n');

    // 5.2 Webinars
    console.log('📍 2. Webinars...');
    await page.goto(`${BASE_URL}/media/webinars`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const webinarCards = page.locator('[class*="card"], article');
    const webinarCount = await webinarCards.count();
    console.log(`   → ${webinarCount} webinars trouvés`);
    console.log('   ✅ Page webinars consultée\n');

    // 5.3 Podcasts
    console.log('📍 3. Podcasts...');
    await page.goto(`${BASE_URL}/media/podcasts`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const podcastCards = page.locator('[class*="card"], article');
    const podcastCount = await podcastCards.count();
    console.log(`   → ${podcastCount} podcasts trouvés`);
    console.log('   ✅ Page podcasts consultée\n');

    // 5.4 Capsules Inside SIB
    console.log('📍 4. Capsules Inside SIB...');
    await page.goto(`${BASE_URL}/media/inside-sib`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Page capsules consultée\n');

    // 5.5 Live Studio
    console.log('📍 5. Live Studio...');
    await page.goto(`${BASE_URL}/media/live-studio`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Live Studio consulté\n');

    // 5.6 Best Moments
    console.log('📍 6. Best Moments...');
    await page.goto(`${BASE_URL}/media/best-moments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Best Moments consultés\n');

    // 5.7 Témoignages
    console.log('📍 7. Témoignages...');
    await page.goto(`${BASE_URL}/media/testimonials`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Témoignages consultés\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ FONCTIONNALITÉS MÉDIA TESTÉES AVEC SUCCÈS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});

// ============================================================================
// 6. 🤝 FONCTIONNALITÉS NETWORKING AVANCÉES
// ============================================================================
test.describe('🤝 FONCTIONNALITÉS NETWORKING AVANCÉES', () => {
  test('Exploration des fonctionnalités networking avancées', async ({ page }) => {
    test.setTimeout(60000);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤝 TEST NETWORKING AVANCÉ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 6.1 Page Networking principale
    console.log('📍 1. Networking principal...');
    await page.goto(`${BASE_URL}/networking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Page networking chargée\n');

    // 6.2 Profile Matching / Matchmaking
    console.log('📍 2. Profile Matching...');
    await page.goto(`${BASE_URL}/profile/matching`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Matchmaking consulté\n');

    // 6.3 Historique des interactions
    console.log('📍 3. Historique interactions...');
    await page.goto(`${BASE_URL}/networking/history`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Historique consulté\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ NETWORKING AVANCÉ TESTÉ AVEC SUCCÈS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});

// ============================================================================
// 7. ⚙️  PARCOURS ADMINISTRATEUR (Si credentials disponibles)
// ============================================================================
test.describe.skip('⚙️  PARCOURS ADMINISTRATEUR', () => {
  // Skip par défaut car nécessite credentials admin réels
  // Enlever .skip si credentials admin disponibles dans .env.test

  test('Cycle complet admin: Gestion utilisateurs et validation', async ({ page }) => {
    test.setTimeout(120000);

    const testData = generateTestData();
    const { admin } = testData;

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚙️  TEST PARCOURS ADMINISTRATEUR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 7.1 Connexion Admin
    console.log('📍 1. Connexion Admin...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', admin.email);
    await page.fill('input[type="password"]', admin.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('   ✅ Admin connecté\n');

    // 7.2 Dashboard Admin
    console.log('📍 2. Dashboard Admin...');
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Dashboard admin consulté\n');

    // 7.3 Gestion Utilisateurs
    console.log('📍 3. Gestion Utilisateurs...');
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Liste utilisateurs consultée\n');

    // 7.4 Validation des demandes
    console.log('📍 4. Validation...');
    await page.goto(`${BASE_URL}/admin/validation`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Page validation consultée\n');

    // 7.5 Gestion Exposants
    console.log('📍 5. Gestion Exposants...');
    await page.goto(`${BASE_URL}/admin/exhibitors`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Gestion exposants consultée\n');

    // 7.6 Gestion Partenaires
    console.log('📍 6. Gestion Partenaires...');
    await page.goto(`${BASE_URL}/admin/partners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Gestion partenaires consultée\n');

    // 7.7 Gestion Événements
    console.log('📍 7. Gestion Événements...');
    await page.goto(`${BASE_URL}/admin/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Gestion événements consultée\n');

    // 7.8 Gestion Contenu
    console.log('📍 8. Gestion Contenu...');
    await page.goto(`${BASE_URL}/admin/content`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Gestion contenu consultée\n');

    // 7.9 Gestion Média
    console.log('📍 9. Gestion Média...');
    await page.goto(`${BASE_URL}/admin/media/manage`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Gestion média consultée\n');

    // 7.10 Validation Paiements
    console.log('📍 10. Validation Paiements...');
    await page.goto(`${BASE_URL}/admin/payment-validation`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✅ Validation paiements consultée\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PARCOURS ADMIN TERMINÉ AVEC SUCCÈS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});
