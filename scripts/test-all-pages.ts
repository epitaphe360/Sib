/**
 * Script de test complet de toutes les pages et fonctions
 * Capture toutes les erreurs console et génère un rapport
 */

import { chromium, Browser, Page, ConsoleMessage } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ErrorReport {
  url: string;
  type: 'error' | 'warning' | 'network' | 'crash';
  message: string;
  timestamp: string;
  stack?: string;
}

interface TestResult {
  page: string;
  url: string;
  status: 'success' | 'error' | 'warning';
  errors: ErrorReport[];
  loadTime: number;
  screenshot?: string;
}

// Toutes les routes à tester
const ROUTES_TO_TEST = [
  { path: '/', name: 'Home', requiresAuth: false },
  { path: '/login', name: 'Login', requiresAuth: false },
  { path: '/register', name: 'Register', requiresAuth: false },
  { path: '/register-visitor', name: 'Register Visitor', requiresAuth: false },
  { path: '/register-partner', name: 'Register Partner', requiresAuth: false },
  { path: '/register-exhibitor', name: 'Register Exhibitor', requiresAuth: false },
  { path: '/exhibitors', name: 'Exhibitors List', requiresAuth: false },
  { path: '/products', name: 'Products', requiresAuth: false },
  { path: '/subscription', name: 'Subscription Plans', requiresAuth: false },
  { path: '/contact', name: 'Contact', requiresAuth: false },
  { path: '/about', name: 'About', requiresAuth: false },
  { path: '/dashboard', name: 'Dashboard', requiresAuth: true },
  { path: '/profile', name: 'Profile', requiresAuth: true },
  { path: '/appointments', name: 'Appointments', requiresAuth: true },
  { path: '/messages', name: 'Messages', requiresAuth: true },
  { path: '/favorites', name: 'Favorites', requiresAuth: true },
  { path: '/badge', name: 'Badge', requiresAuth: true },
  { path: '/admin', name: 'Admin Dashboard', requiresAuth: true, adminOnly: true },
  { path: '/admin/users', name: 'Admin Users', requiresAuth: true, adminOnly: true },
  { path: '/admin/exhibitors', name: 'Admin Exhibitors', requiresAuth: true, adminOnly: true },
];

// Comptes de test
const TEST_ACCOUNTS = {
  visitor: { email: 'visitor-vip@test.sib2026.ma', password: 'Test@123456' },
  partner: { email: 'partner-gold@test.sib2026.ma', password: 'Test@123456' },
  exhibitor: { email: 'exhibitor-18m@test.sib2026.ma', password: 'Test@123456' },
  admin: { email: 'admin@sib2026.ma', password: 'Admin@123456' },
};

class PageTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];
  private baseUrl: string;
  private reportDir: string;

  constructor(baseUrl: string = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
    this.reportDir = path.join(process.cwd(), 'test-reports', `run-${Date.now()}`);
    fs.mkdirSync(this.reportDir, { recursive: true });
  }

  async init() {
    console.log('🚀 Initialisation du navigateur...');
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
    
    // Capturer les erreurs console
    this.setupConsoleListeners();
  }

  private setupConsoleListeners() {
    if (!this.page) return;

    const currentErrors: ErrorReport[] = [];

    this.page.on('console', (msg: ConsoleMessage) => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        currentErrors.push({
          url: this.page?.url() || '',
          type: type as 'error' | 'warning',
          message: msg.text(),
          timestamp: new Date().toISOString(),
        });
      }
    });

    this.page.on('pageerror', (error) => {
      currentErrors.push({
        url: this.page?.url() || '',
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
        stack: error.stack,
      });
    });

    this.page.on('requestfailed', (request) => {
      currentErrors.push({
        url: this.page?.url() || '',
        type: 'network',
        message: `Failed to load: ${request.url()} - ${request.failure()?.errorText}`,
        timestamp: new Date().toISOString(),
      });
    });

    // Stocker les erreurs pour chaque test
    (this.page as any)._currentErrors = currentErrors;
  }

  async login(accountType: keyof typeof TEST_ACCOUNTS) {
    if (!this.page) throw new Error('Page not initialized');

    const account = TEST_ACCOUNTS[accountType];
    console.log(`🔐 Connexion en tant que ${accountType}...`);

    await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle' });
    await this.page.fill('input[type="email"]', account.email);
    await this.page.fill('input[type="password"]', account.password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(2000);
  }

  async logout() {
    if (!this.page) return;
    
    try {
      await this.page.goto(`${this.baseUrl}/logout`, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.log('⚠️ Logout failed, clearing storage...');
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
  }

  async testPage(route: typeof ROUTES_TO_TEST[0]): Promise<TestResult> {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`\n📄 Test de la page: ${route.name} (${route.path})`);
    
    const startTime = Date.now();
    const errors: ErrorReport[] = [];
    const url = `${this.baseUrl}${route.path}`;

    try {
      // Réinitialiser les erreurs
      (this.page as any)._currentErrors = [];

      // Naviguer vers la page
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      // Attendre que la page soit chargée
      await this.page.waitForTimeout(3000);

      // Récupérer les erreurs capturées
      const capturedErrors = (this.page as any)._currentErrors as ErrorReport[];
      errors.push(...capturedErrors);

      // Prendre une capture d'écran
      const screenshotPath = path.join(this.reportDir, `${route.name.replace(/\s+/g, '-')}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });

      const loadTime = Date.now() - startTime;

      // Tester les interactions communes
      await this.testCommonInteractions(route);

      const result: TestResult = {
        page: route.name,
        url,
        status: errors.filter(e => e.type === 'error').length > 0 ? 'error' : 
                errors.length > 0 ? 'warning' : 'success',
        errors,
        loadTime,
        screenshot: screenshotPath,
      };

      this.results.push(result);
      
      console.log(`  ✅ Status: ${result.status}`);
      console.log(`  ⏱️  Temps de chargement: ${loadTime}ms`);
      console.log(`  🐛 Erreurs: ${errors.filter(e => e.type === 'error').length}`);
      console.log(`  ⚠️  Warnings: ${errors.filter(e => e.type === 'warning').length}`);

      return result;
    } catch (error: any) {
      const loadTime = Date.now() - startTime;
      console.log(`  ❌ Erreur: ${error.message}`);

      const result: TestResult = {
        page: route.name,
        url,
        status: 'error',
        errors: [{
          url,
          type: 'crash',
          message: error.message,
          timestamp: new Date().toISOString(),
          stack: error.stack,
        }],
        loadTime,
      };

      this.results.push(result);
      return result;
    }
  }

  async testCommonInteractions(route: typeof ROUTES_TO_TEST[0]) {
    if (!this.page) return;

    try {
      // Tester le scroll
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await this.page.waitForTimeout(500);

      // Tester les boutons (ne pas cliquer, juste vérifier présence)
      const buttons = await this.page.$$('button');
      console.log(`  🔘 Boutons trouvés: ${buttons.length}`);

      // Tester les liens
      const links = await this.page.$$('a');
      console.log(`  🔗 Liens trouvés: ${links.length}`);

      // Tester les formulaires
      const forms = await this.page.$$('form');
      console.log(`  📝 Formulaires trouvés: ${forms.length}`);

    } catch (error) {
      console.log(`  ⚠️ Erreur lors du test d'interactions: ${error}`);
    }
  }

  async runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 DÉMARRAGE DES TESTS COMPLETS');
    console.log('='.repeat(60));

    // 1. Tester les pages publiques
    console.log('\n📖 TEST DES PAGES PUBLIQUES');
    const publicPages = ROUTES_TO_TEST.filter(r => !r.requiresAuth);
    for (const route of publicPages) {
      await this.testPage(route);
    }

    // 2. Tester avec compte visiteur
    console.log('\n👤 TEST AVEC COMPTE VISITEUR');
    await this.login('visitor');
    const visitorPages = ROUTES_TO_TEST.filter(r => r.requiresAuth && !r.adminOnly);
    for (const route of visitorPages) {
      await this.testPage(route);
    }
    await this.logout();

    // 3. Tester avec compte exposant
    console.log('\n🏢 TEST AVEC COMPTE EXPOSANT');
    await this.login('exhibitor');
    for (const route of visitorPages) {
      await this.testPage(route);
    }
    await this.logout();

    // 4. Tester avec compte admin
    console.log('\n👑 TEST AVEC COMPTE ADMIN');
    await this.login('admin');
    const allPages = ROUTES_TO_TEST.filter(r => r.requiresAuth);
    for (const route of allPages) {
      await this.testPage(route);
    }

    // Générer le rapport
    await this.generateReport();
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 GÉNÉRATION DU RAPPORT');
    console.log('='.repeat(60));

    const totalTests = this.results.length;
    const successCount = this.results.filter(r => r.status === 'success').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    const allErrors = this.results.flatMap(r => r.errors);
    const criticalErrors = allErrors.filter(e => e.type === 'error' || e.type === 'crash');

    // Rapport console
    console.log(`\n📈 RÉSUMÉ:`);
    console.log(`  Total de pages testées: ${totalTests}`);
    console.log(`  ✅ Succès: ${successCount} (${((successCount/totalTests)*100).toFixed(1)}%)`);
    console.log(`  ⚠️  Warnings: ${warningCount}`);
    console.log(`  ❌ Erreurs: ${errorCount}`);
    console.log(`  🐛 Erreurs critiques: ${criticalErrors.length}`);

    // Rapport JSON
    const jsonReport = {
      summary: {
        totalTests,
        successCount,
        warningCount,
        errorCount,
        criticalErrorsCount: criticalErrors.length,
        testDate: new Date().toISOString(),
      },
      results: this.results,
      criticalErrors: criticalErrors.map(e => ({
        page: this.results.find(r => r.url === e.url)?.page,
        ...e
      })),
    };

    const jsonPath = path.join(this.reportDir, 'report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    console.log(`\n💾 Rapport JSON sauvegardé: ${jsonPath}`);

    // Rapport Markdown
    const mdReport = this.generateMarkdownReport(jsonReport);
    const mdPath = path.join(this.reportDir, 'REPORT.md');
    fs.writeFileSync(mdPath, mdReport);
    console.log(`📄 Rapport Markdown sauvegardé: ${mdPath}`);

    // Rapport des corrections
    const fixes = this.generateFixesScript(criticalErrors);
    const fixesPath = path.join(this.reportDir, 'FIXES_NEEDED.md');
    fs.writeFileSync(fixesPath, fixes);
    console.log(`🔧 Script de corrections: ${fixesPath}`);

    console.log('\n✨ Tests terminés!\n');
  }

  private generateMarkdownReport(report: any): string {
    let md = `# Rapport de Test Complet - SIB 2026\n\n`;
    md += `**Date:** ${new Date().toLocaleString('fr-FR')}\n\n`;
    md += `## 📊 Résumé\n\n`;
    md += `| Métrique | Valeur |\n`;
    md += `|----------|--------|\n`;
    md += `| Pages testées | ${report.summary.totalTests} |\n`;
    md += `| ✅ Succès | ${report.summary.successCount} (${((report.summary.successCount/report.summary.totalTests)*100).toFixed(1)}%) |\n`;
    md += `| ⚠️ Warnings | ${report.summary.warningCount} |\n`;
    md += `| ❌ Erreurs | ${report.summary.errorCount} |\n`;
    md += `| 🐛 Erreurs critiques | ${report.summary.criticalErrorsCount} |\n\n`;

    md += `## 📄 Détail par Page\n\n`;
    for (const result of report.results) {
      const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      md += `### ${icon} ${result.page}\n\n`;
      md += `- **URL:** ${result.url}\n`;
      md += `- **Status:** ${result.status}\n`;
      md += `- **Temps de chargement:** ${result.loadTime}ms\n`;
      
      if (result.errors.length > 0) {
        md += `- **Erreurs (${result.errors.length}):**\n`;
        result.errors.forEach((err: any) => {
          md += `  - [${err.type.toUpperCase()}] ${err.message}\n`;
        });
      }
      md += `\n`;
    }

    if (report.criticalErrors.length > 0) {
      md += `## 🐛 Erreurs Critiques à Corriger\n\n`;
      report.criticalErrors.forEach((err: any, i: number) => {
        md += `### ${i + 1}. ${err.page || 'Unknown'}\n\n`;
        md += `\`\`\`\n${err.message}\n\`\`\`\n\n`;
        if (err.stack) {
          md += `**Stack Trace:**\n\`\`\`\n${err.stack}\n\`\`\`\n\n`;
        }
      });
    }

    return md;
  }

  private generateFixesScript(errors: ErrorReport[]): string {
    let md = `# Corrections à Appliquer\n\n`;
    md += `**Généré automatiquement le:** ${new Date().toLocaleString('fr-FR')}\n\n`;

    // Grouper les erreurs par type
    const errorsByType = errors.reduce((acc, err) => {
      const key = err.message.split(':')[0] || 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(err);
      return acc;
    }, {} as Record<string, ErrorReport[]>);

    Object.entries(errorsByType).forEach(([type, errs]) => {
      md += `## ${type} (${errs.length})\n\n`;
      errs.forEach((err, i) => {
        md += `### ${i + 1}. ${err.url}\n\n`;
        md += `**Message:** ${err.message}\n\n`;
        md += `**Solution suggérée:**\n`;
        md += this.suggestFix(err.message);
        md += `\n\n`;
      });
    });

    return md;
  }

  private suggestFix(errorMessage: string): string {
    if (errorMessage.includes('Failed to load resource')) {
      return `- Vérifier que l'URL est correcte\n- Ajouter un fallback ou une gestion d'erreur\n- Utiliser try-catch pour les requêtes réseau\n`;
    }
    if (errorMessage.includes('is not defined')) {
      return `- Importer la variable/fonction manquante\n- Vérifier l'ordre des imports\n- Ajouter une vérification de null/undefined\n`;
    }
    if (errorMessage.includes('Cannot read')) {
      return `- Utiliser l'optional chaining (?.) \n- Vérifier que l'objet existe avant d'accéder à la propriété\n- Ajouter une valeur par défaut\n`;
    }
    if (errorMessage.includes('404')) {
      return `- Vérifier que la table Supabase existe\n- Ajouter une gestion d'erreur avec try-catch\n- Utiliser une requête conditionnelle\n`;
    }
    if (errorMessage.includes('400')) {
      return `- Vérifier les noms de colonnes dans la requête\n- Corriger les foreign keys\n- Vérifier les RLS policies\n`;
    }
    return `- Analyser l'erreur en détail\n- Ajouter des logs pour déboguer\n- Implémenter une gestion d'erreur appropriée\n`;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Fonction principale
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:5173';
  const tester = new PageTester(baseUrl);

  try {
    await tester.init();
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  } finally {
    await tester.close();
  }
}

// Exécution si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

export { PageTester, TEST_ACCOUNTS };
