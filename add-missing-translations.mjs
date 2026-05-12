import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger le rapport d'audit
const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'translation-audit-report.json'), 'utf8'));

const translationsDir = path.join(__dirname, 'src/i18n/translations');

// Fonction pour charger les traductions existantes
function loadTranslations(filename) {
  const filePath = path.join(translationsDir, filename);
  if (!fs.existsSync(filePath)) {
    return { fr: {}, ar: {} };
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Extraire la partie fr et ar
    const match = content.match(/export const \w+Translations = ({[\s\S]*});/);
    if (match) {
      const obj = eval('(' + match[1] + ')');
      return obj;
    }
  } catch (e) {
    console.error(`Error loading ${filename}:`, e.message);
  }
  
  return { fr: {}, ar: {} };
}

// Fonction pour générer le contenu du fichier
function generateTranslationFile(namespace, keys) {
  const camelCase = namespace
    .split('_')
    .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  const translationKey = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  
  // Créer les clés avec des placeholders en français et anglais
  const frKeys = {};
  const arKeys = {};
  
  keys.forEach(key => {
    const frValue = `[${namespace}.${key}]`;
    const arValue = `[${namespace}.${key}]`;
    frKeys[`${namespace}.${key}`] = frValue;
    arKeys[`${namespace}.${key}`] = arValue;
  });
  
  // Générer le contenu du fichier
  const content = `/**
 * Traductions pour ${namespace}
 */

export const ${camelCase}Translations = {
  fr: {
${Object.entries(frKeys).map(([k, v]) => `    '${k}': '${v}',`).join('\n')}
  },
  ar: {
${Object.entries(arKeys).map(([k, v]) => `    '${k}': '${v}',`).join('\n')}
  },
};
`;
  
  return content;
}

// Ajouter les clés manquantes aux fichiers existants ou créer de nouveaux fichiers
console.log('\n📝 Adding missing translation keys...\n');

const missingNamespaces = Object.keys(report.missingByNamespace)
  .filter(ns => ns && report.missingByNamespace[ns].length > 0)
  .sort((a, b) => report.missingByNamespace[b].length - report.missingByNamespace[a].length);

let createdCount = 0;
let updatedCount = 0;

missingNamespaces.forEach(namespace => {
  const keys = report.missingByNamespace[namespace];
  const count = keys.length;
  
  const filename = `${namespace}.ts`;
  const filePath = path.join(translationsDir, filename);
  
  // Charger les traductions existantes
  const existing = loadTranslations(filename);
  
  // Ajouter les clés manquantes
  let added = 0;
  keys.forEach(key => {
    const fullKey = `${namespace}.${key}`;
    if (!existing.fr[fullKey]) {
      existing.fr[fullKey] = `[${fullKey}]`;
      existing.ar[fullKey] = `[${fullKey}]`;
      added++;
    }
  });
  
  if (added > 0) {
    // Générer le contenu
    const camelCase = namespace
      .split('_')
      .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    const content = `/**
 * Traductions pour ${namespace}
 */

export const ${camelCase}Translations = {
  fr: {
${Object.entries(existing.fr).map(([k, v]) => `    '${k}': '${v}',`).join('\n')}
  },
  ar: {
${Object.entries(existing.ar).map(([k, v]) => `    '${k}': '${v}',`).join('\n')}
  },
};
`;
    
    fs.writeFileSync(filePath, content);
    
    if (fs.existsSync(filePath)) {
      updatedCount++;
      console.log(`  ✅ [${namespace}] ${added}/${count} clés ajoutées (total: ${Object.keys(existing.fr).length})`);
    }
  }
});

console.log(`\n✅ Mise à jour terminée!`);
console.log(`   • Fichiers updated: ${updatedCount}`);
console.log(`   • Total clés ajoutées: ${Object.values(report.missingByNamespace).flat().length}\n`);
