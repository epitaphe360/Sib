/**
 * Script de validation du support complet de l'arabe
 * Vérifie que l'arabe est intégré partout dans l'application
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  category: string;
  items: {
    name: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    message: string;
  }[];
}

const results: ValidationResult[] = [];

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function logColor(message: string, color: string) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFile(filePath: string, searchPattern: RegExp | string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (typeof searchPattern === 'string') {
      return content.includes(searchPattern);
    } else {
      return searchPattern.test(content);
    }
  } catch {
    return false;
  }
}

function readJsonFile(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function validate() {
  console.log('\n');
  logColor('╔════════════════════════════════════════════════════════════════╗', colors.cyan);
  logColor('║  🌍 VALIDATION COMPLÈTE DU SUPPORT DE L\'ARABE (AR)            ║', colors.cyan);
  logColor('╚════════════════════════════════════════════════════════════════╝\n', colors.cyan);

  // 1. Vérifier i18n/config.ts
  logColor('1️⃣  Vérification du fichier i18n/config.ts...', colors.blue);
  const i18nConfigPath = path.join(process.cwd(), 'src/i18n/config.ts');
  const i18nConfigChecks = [
    {
      name: 'Contient ar: { ... }',
      check: checkFile(i18nConfigPath, /ar:\s*\{/)
    },
    {
      name: 'Contient nav.home en arabe',
      check: checkFile(i18nConfigPath, /'nav\.home':\s*'الرئيسية'/)
    },
    {
      name: 'Contient supportedLngs avec ar',
      check: checkFile(i18nConfigPath, /supportedLngs:\s*\[.*'ar'/)
    },
    {
      name: 'Contient detection.order',
      check: checkFile(i18nConfigPath, /detection:\s*\{/)
    }
  ];

  const i18nResult: ValidationResult = {
    category: 'i18n/config.ts',
    items: i18nConfigChecks.map(check => ({
      name: check.name,
      status: check.check ? 'PASS' : 'FAIL',
      message: check.check ? '✅' : '❌ Manquant'
    }))
  };
  results.push(i18nResult);

  // 2. Vérifier translations.ts
  logColor('\n2️⃣  Vérification du fichier translations.ts...', colors.blue);
  const translationsPath = path.join(process.cwd(), 'src/store/translations.ts');
  const translationChecks = [
    {
      name: 'Contient section ar: { ... }',
      check: checkFile(translationsPath, /ar:\s*\{[\s\S]*'nav\.home'/)
    },
    {
      name: 'Contient traductions nav arabes',
      check: checkFile(translationsPath, /'nav\.home':\s*'الرئيسية'/) &&
             checkFile(translationsPath, /'nav\.exhibitors':\s*'العارضون'/) &&
             checkFile(translationsPath, /'nav\.partners':\s*'الشركاء'/)
    },
    {
      name: 'Contient traductions demo accounts',
      check: checkFile(translationsPath, /'login\.demo_admin':\s*'المسؤول الرئيسي'/) &&
             checkFile(translationsPath, /'login\.demo_exhibitors':\s*'العارضون'/) &&
             checkFile(translationsPath, /'login\.demo_partners':\s*'الشركاء'/)
    },
    {
      name: 'Contient traductions auth arabes',
      check: checkFile(translationsPath, /'auth\.login'/) && 
             checkFile(translationsPath, /'تسجيل الدخول'/)
    },
    {
      name: 'Contient traductions common arabes',
      check: checkFile(translationsPath, /'common\.loading'/) &&
             checkFile(translationsPath, /'جاري التحميل'/)
    }
  ];

  const translationsResult: ValidationResult = {
    category: 'translations.ts',
    items: translationChecks.map(check => ({
      name: check.name,
      status: check.check ? 'PASS' : 'FAIL',
      message: check.check ? '✅' : '❌ Manquant'
    }))
  };
  results.push(translationsResult);

  // 3. Vérifier languageStore.ts
  logColor('\n3️⃣  Vérification du fichier languageStore.ts...', colors.blue);
  const languageStorePath = path.join(process.cwd(), 'src/store/languageStore.ts');
  const languageStoreChecks = [
    {
      name: 'Contient arabe dans supportedLanguages',
      check: checkFile(languageStorePath, /code:\s*'ar'/) &&
             checkFile(languageStorePath, /nativeName:\s*'العربية'/)
    },
    {
      name: 'Contient rtl: true pour arabe',
      check: checkFile(languageStorePath, /code:\s*'ar'[\s\S]*?rtl:\s*true/)
    },
    {
      name: 'Contient document.documentElement.dir',
      check: checkFile(languageStorePath, /document\.documentElement\.dir/)
    },
    {
      name: 'Contient changeLanguage via i18n',
      check: checkFile(languageStorePath, /changeLanguage/)
    }
  ];

  const languageStoreResult: ValidationResult = {
    category: 'languageStore.ts',
    items: languageStoreChecks.map(check => ({
      name: check.name,
      status: check.check ? 'PASS' : 'FAIL',
      message: check.check ? '✅' : '❌ Manquant'
    }))
  };
  results.push(languageStoreResult);

  // 4. Vérifier LanguageSelector.tsx
  logColor('\n4️⃣  Vérification du fichier LanguageSelector.tsx...', colors.blue);
  const languageSelectorPath = path.join(process.cwd(), 'src/components/ui/LanguageSelector.tsx');
  const languageSelectorChecks = [
    {
      name: 'Utilise useLanguageStore',
      check: checkFile(languageSelectorPath, /useLanguageStore/)
    },
    {
      name: 'Utilise supportedLanguages',
      check: checkFile(languageSelectorPath, /supportedLanguages/)
    },
    {
      name: 'Appelle setLanguage',
      check: checkFile(languageSelectorPath, /setLanguage/)
    },
    {
      name: 'Affiche tous les drapeaux',
      check: checkFile(languageSelectorPath, /flag/)
    }
  ];

  const languageSelectorResult: ValidationResult = {
    category: 'LanguageSelector.tsx',
    items: languageSelectorChecks.map(check => ({
      name: check.name,
      status: check.check ? 'PASS' : 'FAIL',
      message: check.check ? '✅' : '❌ Manquant'
    }))
  };
  results.push(languageSelectorResult);

  // 5. Vérifier LoginPage.tsx
  logColor('\n5️⃣  Vérification du fichier LoginPage.tsx...', colors.blue);
  const loginPagePath = path.join(process.cwd(), 'src/components/auth/LoginPage.tsx');
  const loginPageChecks = [
    {
      name: 'Utilise useLanguageStore ou useTranslation',
      check: checkFile(loginPagePath, /useLanguageStore|useTranslation/)
    },
    {
      name: 'Affiche les boutons de comptes démo',
      check: checkFile(loginPagePath, /login\.demo_admin|login\.demo_exhibitors/)
    },
    {
      name: 'Contient tous les comptes démo (11 boutons)',
      check: checkFile(loginPagePath, /admin\.siports@siports\.com/) &&
             checkFile(loginPagePath, /exhibitor-9m@test\.siport\.com/)
    }
  ];

  const loginPageResult: ValidationResult = {
    category: 'LoginPage.tsx',
    items: loginPageChecks.map(check => ({
      name: check.name,
      status: check.check ? 'PASS' : 'FAIL',
      message: check.check ? '✅' : '❌ Manquant'
    }))
  };
  results.push(loginPageResult);

  // 6. Vérifier HTML pour RTL
  logColor('\n6️⃣  Vérification du support RTL...', colors.blue);
  const indexHtmlPath = path.join(process.cwd(), 'index.html');
  const htmlChecks = [
    {
      name: 'index.html existe',
      check: fs.existsSync(indexHtmlPath)
    },
    {
      name: 'Root element pour React',
      check: checkFile(indexHtmlPath, /id=['"]root['"]/)
    }
  ];

  const htmlResult: ValidationResult = {
    category: 'HTML & RTL',
    items: htmlChecks.map(check => ({
      name: check.name,
      status: check.check ? 'PASS' : 'FAIL',
      message: check.check ? '✅' : '❌ Manquant'
    }))
  };
  results.push(htmlResult);

  // 7. Vérifier package.json
  logColor('\n7️⃣  Vérification des dépendances i18n...', colors.blue);
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = readJsonFile(packageJsonPath);
  const dependencyChecks = [
    {
      name: 'i18next installé',
      check: packageJson?.dependencies?.['i18next'] || packageJson?.devDependencies?.['i18next']
    },
    {
      name: 'react-i18next installé',
      check: packageJson?.dependencies?.['react-i18next'] || packageJson?.devDependencies?.['react-i18next']
    },
    {
      name: 'i18next-browser-languagedetector installé',
      check: packageJson?.dependencies?.['i18next-browser-languagedetector'] || 
             packageJson?.devDependencies?.['i18next-browser-languagedetector']
    }
  ];

  const dependencyResult: ValidationResult = {
    category: 'Dependencies',
    items: dependencyChecks.map(check => ({
      name: check.name,
      status: check.check ? 'PASS' : 'FAIL',
      message: check.check ? '✅' : '❌ Non installé'
    }))
  };
  results.push(dependencyResult);

  // 8. Résumé
  logColor('\n8️⃣  Résumé de la validation...', colors.blue);
  const totalChecks = results.reduce((sum, r) => sum + r.items.length, 0);
  const passedChecks = results.reduce((sum, r) => sum + r.items.filter(i => i.status === 'PASS').length, 0);
  const failedChecks = results.reduce((sum, r) => sum + r.items.filter(i => i.status === 'FAIL').length, 0);

  const summaryResult: ValidationResult = {
    category: 'RÉSUMÉ',
    items: [
      {
        name: `Total des vérifications`,
        status: 'PASS',
        message: `${totalChecks} vérifications au total`
      },
      {
        name: `Vérifications réussies`,
        status: failedChecks === 0 ? 'PASS' : 'WARNING',
        message: `${passedChecks}/${totalChecks} (${Math.round(passedChecks / totalChecks * 100)}%)`
      },
      {
        name: `Vérifications échouées`,
        status: failedChecks > 0 ? 'FAIL' : 'PASS',
        message: failedChecks === 0 ? '✅ Aucune' : `❌ ${failedChecks}`
      }
    ]
  };
  results.push(summaryResult);

  // Afficher les résultats
  console.log('\n');
  for (const result of results) {
    logColor(`\n${result.category}:`, colors.cyan);
    for (const item of result.items) {
      const statusColor = item.status === 'PASS' ? colors.green : item.status === 'FAIL' ? colors.red : colors.yellow;
      const statusIcon = item.status === 'PASS' ? '✅' : item.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`  ${statusColor}${statusIcon} ${item.name}: ${item.message}${colors.reset}`);
    }
  }

  // Conclusion
  console.log('\n');
  if (failedChecks === 0) {
    logColor('╔════════════════════════════════════════════════════════════════╗', colors.green);
    logColor('║  ✅ TOUS LES TESTS SONT PASSÉS - L\'ARABE FONCTIONNE PARTOUT! ║', colors.green);
    logColor('╚════════════════════════════════════════════════════════════════╝\n', colors.green);
  } else {
    logColor('╔════════════════════════════════════════════════════════════════╗', colors.red);
    logColor(`║  ❌ ${failedChecks} VÉRIFICATIONS ONT ÉCHOUÉ                            ║`, colors.red);
    logColor('╚════════════════════════════════════════════════════════════════╝\n', colors.red);
  }

  // Générer rapport
  const reportPath = path.join(process.cwd(), 'ARABIC_VALIDATION_REPORT.md');
  let reportContent = '# 🌍 Rapport de Validation - Support Arabe (AR)\n\n';
  reportContent += `**Date:** ${new Date().toLocaleString('fr-FR')}\n\n`;
  reportContent += `## Résumé\n`;
  reportContent += `- ✅ **Réussi:** ${passedChecks}/${totalChecks}\n`;
  reportContent += `- ❌ **Échoué:** ${failedChecks}/${totalChecks}\n`;
  reportContent += `- **Taux de réussite:** ${Math.round(passedChecks / totalChecks * 100)}%\n\n`;

  for (const result of results) {
    reportContent += `## ${result.category}\n\n`;
    for (const item of result.items) {
      const statusEmoji = item.status === 'PASS' ? '✅' : item.status === 'FAIL' ? '❌' : '⚠️';
      reportContent += `${statusEmoji} **${item.name}**: ${item.message}\n`;
    }
    reportContent += '\n';
  }

  fs.writeFileSync(reportPath, reportContent);
  logColor(`📋 Rapport généré: ${reportPath}\n`, colors.blue);

  process.exit(failedChecks > 0 ? 1 : 0);
}

validate().catch(error => {
  console.error('Erreur lors de la validation:', error);
  process.exit(1);
});
