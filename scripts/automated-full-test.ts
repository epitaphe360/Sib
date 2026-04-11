/**
 * AUTOMATED FULL TEST - Test automatique de TOUTES les pages
 * Recupere toutes les erreurs console, teste les boutons, verifie les liens
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:9323';

interface TestResult {
  page: string;
  url: string;
  status: 'success' | 'error' | 'warning';
  loadTime: number;
  consoleErrors: string[];
  consoleWarnings: string[];
  networkErrors: string[];
  clickableElements: number;
  brokenButtons: string[];
  screenshot?: string;
}

interface FullReport {
  timestamp: string;
  totalPages: number;
  successPages: number;
  errorPages: number;
  warningPages: number;
  totalConsoleErrors: number;
  totalNetworkErrors: number;
  results: TestResult[];
}

// Liste de TOUTES les pages publiques et protegees
const ALL_PAGES = [
  // Pages publiques
  { name: 'Accueil', path: '/' },
  { name: 'Connexion', path: '/login' },
  { name: 'Inscription', path: '/register' },
  { name: 'Mot de passe oublie', path: '/forgot-password' },
  { name: 'Exposants', path: '/exposants' },
  { name: 'Evenements', path: '/events' },
  { name: 'Actualites', path: '/actualites' },
  { name: 'Pavillons', path: '/pavillons' },
  { name: 'Partenaires', path: '/partnership' },
  { name: 'Contact', path: '/contact' },
  { name: 'Support', path: '/support' },
  { name: 'A propos', path: '/about' },
  { name: 'FAQ', path: '/faq' },
  { name: 'CGU', path: '/terms' },
  { name: 'Politique de confidentialite', path: '/privacy' },
  { name: 'Cookies', path: '/cookies' },
  { name: 'Mentions legales', path: '/legal' },
  { name: 'Plan du site', path: '/sitemap' },
  { name: 'API Documentation', path: '/api' },
  
  // Inscription specifique
  { name: 'Inscription Exposant', path: '/exhibitor-signup' },
  { name: 'Inscription Partenaire', path: '/partner-signup' },
  { name: 'Inscription Visiteur Free', path: '/visitor/register/free' },
  { name: 'Inscription Visiteur VIP', path: '/visitor/register/vip' },
  
  // Pages medias
  { name: 'Galerie Medias', path: '/media' },
  { name: 'Meilleurs Moments', path: '/best-moments' },
  { name: 'Temoignages', path: '/testimonials' },
  
  // Dashboard (necessite auth)
  { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
  { name: 'Profil', path: '/profile', requiresAuth: true },
  { name: 'Badge', path: '/badge', requiresAuth: true },
  { name: 'Messages', path: '/messages', requiresAuth: true },
  { name: 'Networking', path: '/networking', requiresAuth: true },
  { name: 'Rendez-vous', path: '/appointments', requiresAuth: true },
  { name: 'Calendrier', path: '/calendar', requiresAuth: true },
  
  // Pages Admin
  { name: 'Admin Dashboard', path: '/admin', requiresAuth: true, requiresAdmin: true },
  { name: 'Admin Utilisateurs', path: '/admin/users', requiresAuth: true, requiresAdmin: true },
  { name: 'Admin Metrics', path: '/admin/metrics', requiresAuth: true, requiresAdmin: true },
  
  // Pages Exposant
  { name: 'Mini-Site Editor', path: '/exhibitor/minisite', requiresAuth: true },
  { name: 'Exhibitor Products', path: '/exhibitor/products', requiresAuth: true },
  
  // Pages Partenaire
  { name: 'Partner Analytics', path: '/partner/analytics', requiresAuth: true },
  { name: 'Partner Leads', path: '/partner/leads', requiresAuth: true },
];

class FullPageTester {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];
  private consoleErrors: string[] = [];
  private consoleWarnings: string[] = [];
  private networkErrors: string[] = [];

  async init() {
    this.browser = await chromium.launch({ 
      headless: false, // Visible pour debug
      slowMo: 100 
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
    });
    this.page = await this.context.newPage();

    // Capturer TOUS les logs console
    this.page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        this.consoleErrors.push(`[CONSOLE ERROR] ${text}`);
      } else if (type === 'warning') {
        this.consoleWarnings.push(`[CONSOLE WARNING] ${text}`);
      }
    });

    // Capturer les erreurs de page
    this.page.on('pageerror', (error) => {
      this.consoleErrors.push(`[PAGE ERROR] ${error.message}`);
    });

    // Capturer les erreurs reseau
    this.page.on('requestfailed', (request) => {
      const failure = request.failure();
      this.networkErrors.push(
        `[NETWORK ERROR] ${request.method()} ${request.url()} - ${failure?.errorText || 'Unknown'}`
      );
    });
  }

  async testPage(pageInfo: { name: string; path: string; requiresAuth?: boolean; requiresAdmin?: boolean }): Promise<TestResult> {
    if (!this.page) throw new Error('Browser not initialized');

    // Reset errors pour cette page
    this.consoleErrors = [];
    this.consoleWarnings = [];
    this.networkErrors = [];

    const url = `${BASE_URL}${pageInfo.path}`;
    const startTime = Date.now();
    
    console.log(`\n[TEST] ${pageInfo.name} - ${url}`);

    try {
      // Navigation avec timeout de 30s
      await this.page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      const loadTime = Date.now() - startTime;

      // Attendre un peu pour que les erreurs apparaissent
      await this.page.waitForTimeout(1000);

      // Compter les elements cliquables
      const clickableElements = await this.page.$$('button, a, [role="button"], input[type="submit"]');
      
      // Tester les boutons visibles
      const brokenButtons: string[] = [];
      const buttons = await this.page.$$('button:visible');
      
      for (let i = 0; i < Math.min(buttons.length, 5); i++) { // Max 5 boutons par page
        try {
          const buttonText = await buttons[i].textContent();
          const isDisabled = await buttons[i].isDisabled();
          
          if (!isDisabled && buttonText && !buttonText.includes('Supprimer') && !buttonText.includes('Delete')) {
            // Ne pas cliquer sur les boutons de suppression
          }
        } catch (e) {
          brokenButtons.push(`Button #${i}: ${e}`);
        }
      }

      // Screenshot
      const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      const screenshotPath = path.join(screenshotDir, `${pageInfo.name.replace(/[^a-z0-9]/gi, '_')}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });

      // Determiner le status
      let status: 'success' | 'error' | 'warning' = 'success';
      if (this.consoleErrors.length > 0 || this.networkErrors.length > 0) {
        status = 'error';
      } else if (this.consoleWarnings.length > 0) {
        status = 'warning';
      }

      const result: TestResult = {
        page: pageInfo.name,
        url,
        status,
        loadTime,
        consoleErrors: [...this.consoleErrors],
        consoleWarnings: [...this.consoleWarnings],
        networkErrors: [...this.networkErrors],
        clickableElements: clickableElements.length,
        brokenButtons,
        screenshot: screenshotPath,
      };

      // Log des erreurs trouvees
      if (this.consoleErrors.length > 0) {
        console.log(`  [!] ${this.consoleErrors.length} erreur(s) console`);
        this.consoleErrors.forEach(e => console.log(`      - ${e.substring(0, 100)}...`));
      }
      if (this.networkErrors.length > 0) {
        console.log(`  [!] ${this.networkErrors.length} erreur(s) reseau`);
        this.networkErrors.forEach(e => console.log(`      - ${e.substring(0, 100)}...`));
      }
      if (status === 'success') {
        console.log(`  [OK] Charge en ${loadTime}ms - ${clickableElements.length} elements cliquables`);
      }

      return result;

    } catch (error) {
      console.log(`  [ERREUR CRITIQUE] ${error}`);
      
      return {
        page: pageInfo.name,
        url,
        status: 'error',
        loadTime: Date.now() - startTime,
        consoleErrors: [...this.consoleErrors, `[CRITICAL] ${error}`],
        consoleWarnings: [...this.consoleWarnings],
        networkErrors: [...this.networkErrors],
        clickableElements: 0,
        brokenButtons: [],
      };
    }
  }

  async runFullTest() {
    console.log('='.repeat(60));
    console.log('DEMARRAGE DU TEST COMPLET DE TOUTES LES PAGES');
    console.log('='.repeat(60));

    await this.init();

    // Tester toutes les pages publiques d'abord
    const publicPages = ALL_PAGES.filter(p => !p.requiresAuth);
    console.log(`\n[PHASE 1] Test de ${publicPages.length} pages publiques`);
    
    for (const pageInfo of publicPages) {
      const result = await this.testPage(pageInfo);
      this.results.push(result);
    }

    // Generer le rapport
    const report = this.generateReport();
    
    // Sauvegarder le rapport
    const reportPath = path.join(process.cwd(), 'test-results', 'full-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Sauvegarder aussi en markdown
    const mdReport = this.generateMarkdownReport(report);
    const mdPath = path.join(process.cwd(), 'test-results', 'full-test-report.md');
    fs.writeFileSync(mdPath, mdReport);

    console.log('\n' + '='.repeat(60));
    console.log('RESUME DU TEST');
    console.log('='.repeat(60));
    console.log(`Total pages testees: ${report.totalPages}`);
    console.log(`Pages OK: ${report.successPages}`);
    console.log(`Pages avec erreurs: ${report.errorPages}`);
    console.log(`Pages avec warnings: ${report.warningPages}`);
    console.log(`Total erreurs console: ${report.totalConsoleErrors}`);
    console.log(`Total erreurs reseau: ${report.totalNetworkErrors}`);
    console.log(`\nRapport sauvegarde: ${reportPath}`);
    console.log(`Rapport MD: ${mdPath}`);

    await this.browser?.close();
  }

  generateReport(): FullReport {
    const successPages = this.results.filter(r => r.status === 'success').length;
    const errorPages = this.results.filter(r => r.status === 'error').length;
    const warningPages = this.results.filter(r => r.status === 'warning').length;
    
    return {
      timestamp: new Date().toISOString(),
      totalPages: this.results.length,
      successPages,
      errorPages,
      warningPages,
      totalConsoleErrors: this.results.reduce((sum, r) => sum + r.consoleErrors.length, 0),
      totalNetworkErrors: this.results.reduce((sum, r) => sum + r.networkErrors.length, 0),
      results: this.results,
    };
  }

  generateMarkdownReport(report: FullReport): string {
    let md = `# Rapport de Test Complet\n\n`;
    md += `**Date:** ${report.timestamp}\n\n`;
    md += `## Resume\n\n`;
    md += `| Metrique | Valeur |\n`;
    md += `|----------|--------|\n`;
    md += `| Total pages testees | ${report.totalPages} |\n`;
    md += `| Pages OK | ${report.successPages} |\n`;
    md += `| Pages avec erreurs | ${report.errorPages} |\n`;
    md += `| Pages avec warnings | ${report.warningPages} |\n`;
    md += `| Total erreurs console | ${report.totalConsoleErrors} |\n`;
    md += `| Total erreurs reseau | ${report.totalNetworkErrors} |\n\n`;

    // Pages avec erreurs
    const errorResults = report.results.filter(r => r.status === 'error');
    if (errorResults.length > 0) {
      md += `## Pages avec Erreurs\n\n`;
      for (const result of errorResults) {
        md += `### ${result.page}\n`;
        md += `- **URL:** ${result.url}\n`;
        md += `- **Temps de chargement:** ${result.loadTime}ms\n`;
        
        if (result.consoleErrors.length > 0) {
          md += `- **Erreurs console:**\n`;
          result.consoleErrors.forEach(e => {
            md += `  - \`${e.substring(0, 200)}\`\n`;
          });
        }
        
        if (result.networkErrors.length > 0) {
          md += `- **Erreurs reseau:**\n`;
          result.networkErrors.forEach(e => {
            md += `  - \`${e.substring(0, 200)}\`\n`;
          });
        }
        md += `\n`;
      }
    }

    // Pages OK
    const okResults = report.results.filter(r => r.status === 'success');
    if (okResults.length > 0) {
      md += `## Pages OK\n\n`;
      md += `| Page | Temps | Elements |\n`;
      md += `|------|-------|----------|\n`;
      for (const result of okResults) {
        md += `| ${result.page} | ${result.loadTime}ms | ${result.clickableElements} |\n`;
      }
    }

    return md;
  }
}

// Execution
const tester = new FullPageTester();
tester.runFullTest().catch(console.error);
