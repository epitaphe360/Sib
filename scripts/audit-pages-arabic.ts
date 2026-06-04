/**
 * Audit complet du support Arabe sur toutes les pages
 * Vérifie quelles pages utilisent useTranslation ou useLanguageStore
 */

import * as fs from 'fs';
import * as path from 'path';

interface PageAudit {
  name: string;
  path: string;
  hasTranslation: boolean;
  hasLanguageStore: boolean;
  supportsArabic: boolean;
  reason: string;
}

const pagesDir = path.join(process.cwd(), 'src/pages');
const results: PageAudit[] = [];

function getAllPages(dir: string): string[] {
  const files: string[] = [];

  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function checkFile(filePath: string, pattern: RegExp): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return pattern.test(content);
  } catch {
    return false;
  }
}

function getPageName(filePath: string): string {
  return path.relative(pagesDir, filePath).replace(/\\/g, '/');
}

async function audit() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  🌍 AUDIT COMPLET DU SUPPORT ARABE - TOUTES LES PAGES          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const pages = getAllPages(pagesDir).sort();

  console.log(`📊 Scanning ${pages.length} pages...\n`);

  for (const pagePath of pages) {
    const pageName = getPageName(pagePath);
    const hasTranslation = checkFile(pagePath, /useTranslation/);
    const hasLanguageStore = checkFile(pagePath, /useLanguageStore/);
    const supportsArabic = hasTranslation || hasLanguageStore;

    let reason = '';
    if (supportsArabic) {
      if (hasTranslation && hasLanguageStore) {
        reason = '✅ Utilise useTranslation + useLanguageStore';
      } else if (hasTranslation) {
        reason = '✅ Utilise useTranslation (hooks/useTranslation)';
      } else if (hasLanguageStore) {
        reason = '✅ Utilise useLanguageStore (Zustand)';
      }
    } else {
      reason = '❌ Pas de traduction détectée';
    }

    results.push({
      name: path.basename(pagePath),
      path: pageName,
      hasTranslation,
      hasLanguageStore,
      supportsArabic,
      reason
    });
  }

  // Résumé
  const totalPages = results.length;
  const supportedPages = results.filter(r => r.supportsArabic).length;
  const unsupportedPages = results.filter(r => !r.supportsArabic).length;
  const withTranslation = results.filter(r => r.hasTranslation).length;
  const withLanguageStore = results.filter(r => r.hasLanguageStore).length;

  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('RÉSUMÉ GLOBAL');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  console.log(`📈 Total des pages: ${totalPages}`);
  console.log(`✅ Pages avec traduction: ${supportedPages}/${totalPages} (${Math.round(supportedPages/totalPages*100)}%)`);
  console.log(`   - Utilisant useTranslation: ${withTranslation}`);
  console.log(`   - Utilisant useLanguageStore: ${withLanguageStore}`);
  console.log(`❌ Pages SANS traduction: ${unsupportedPages}/${totalPages}\n`);

  if (unsupportedPages > 0) {
    console.log('───────────────────────────────────────────────────────────────────');
    console.log('⚠️  PAGES SANS SUPPORT ARABE');
    console.log('───────────────────────────────────────────────────────────────────\n');

    results.filter(r => !r.supportsArabic).forEach(page => {
      console.log(`❌ ${page.path}`);
    });
  }

  // Pages par catégorie
  const categories: { [key: string]: PageAudit[] } = {};
  results.forEach(page => {
    const category = page.path.split('/')[0] || 'root';
    if (!categories[category]) {categories[category] = [];}
    categories[category].push(page);
  });

  console.log('\n───────────────────────────────────────────────────────────────────');
  console.log('📂 PAGES PAR CATÉGORIE');
  console.log('───────────────────────────────────────────────────────────────────\n');

  for (const [category, pages] of Object.entries(categories).sort()) {
    const supported = pages.filter(p => p.supportsArabic).length;
    const icon = supported === pages.length ? '✅' : supported > 0 ? '⚠️' : '❌';
    console.log(`${icon} ${category.padEnd(20)} : ${supported}/${pages.length} pages`);
  }

  // Générer rapport
  const reportPath = path.join(process.cwd(), 'PAGES_ARABIC_SUPPORT_AUDIT.md');
  let reportContent = '# 🌍 Audit Complet - Support Arabe sur Toutes les Pages\n\n';
  reportContent += `**Date:** ${new Date().toLocaleString('fr-FR')}\n`;
  reportContent += `**Total des pages:** ${totalPages}\n\n`;

  reportContent += `## 📊 Résumé\n\n`;
  reportContent += `| Métrique | Valeur |\n`;
  reportContent += `|----------|--------|\n`;
  reportContent += `| Pages avec traduction | ${supportedPages}/${totalPages} (${Math.round(supportedPages/totalPages*100)}%) |\n`;
  reportContent += `| Pages avec useTranslation | ${withTranslation} |\n`;
  reportContent += `| Pages avec useLanguageStore | ${withLanguageStore} |\n`;
  reportContent += `| Pages SANS traduction | ${unsupportedPages} |\n\n`;

  reportContent += `## ✅ Pages avec Support Arabe (${supportedPages})\n\n`;
  results.filter(r => r.supportsArabic).forEach(page => {
    reportContent += `- ✅ **${page.path}** - ${page.reason}\n`;
  });

  if (unsupportedPages > 0) {
    reportContent += `\n## ❌ Pages SANS Support Arabe (${unsupportedPages})\n\n`;
    results.filter(r => !r.supportsArabic).forEach(page => {
      reportContent += `- ❌ **${page.path}** - À ajouter\n`;
    });
  }

  reportContent += `\n## 📂 Pages par Catégorie\n\n`;
  for (const [category, pages] of Object.entries(categories).sort()) {
    const supported = pages.filter(p => p.supportsArabic).length;
    const icon = supported === pages.length ? '✅' : supported > 0 ? '⚠️' : '❌';
    reportContent += `\n### ${icon} ${category} (${supported}/${pages.length})\n\n`;
    pages.forEach(page => {
      const pageIcon = page.supportsArabic ? '✅' : '❌';
      reportContent += `${pageIcon} ${page.name}\n`;
    });
  }

  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n📋 Rapport généré: ${reportPath}\n`);

  // Conclusion
  const percentage = Math.round(supportedPages/totalPages*100);
  if (percentage === 100) {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  🎉 EXCELLENT - 100% DES PAGES SUPPORTENT L\'ARABE!            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  } else if (percentage >= 90) {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log(`║  ✅ BON - ${percentage}% DES PAGES SUPPORTENT L'ARABE               ║`);
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  } else if (percentage >= 75) {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log(`║  ⚠️  ACCEPTABLE - ${percentage}% DES PAGES SUPPORTENT L'ARABE        ║`);
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  } else {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log(`║  ❌ INSUFFISANT - ${percentage}% DES PAGES SUPPORTENT L'ARABE        ║`);
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  }
}

audit().catch(error => {
  console.error('Erreur lors de l\'audit:', error);
  process.exit(1);
});
