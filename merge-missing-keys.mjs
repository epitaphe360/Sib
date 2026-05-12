import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'translation-audit-report.json'), 'utf8'));
const translationsDir = path.join(__dirname, 'src/i18n/translations');

// Lire un fichier de traductions et extraire les clés existantes
function readTranslationFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const result = { fr: {}, ar: {}, en: {} };
  
  // Extraire les sections fr, ar, en via regex pour préserver la structure
  const frMatch = content.match(/fr:\s*\{([\s\S]*?)\n\s*\},/);
  if (frMatch) {
    const keyMatches = frMatch[1].match(/'([^']+)':\s*'([^']*)'/g);
    if (keyMatches) {
      keyMatches.forEach(match => {
        const [key, val] = match.split(':').map((s, i) => {
          s = s.trim();
          return i === 0 ? s.replace(/'/g, '') : s.replace(/^'|'$/g, '');
        });
        result.fr[key] = val;
      });
    }
  }
  
  const arMatch = content.match(/ar:\s*\{([\s\S]*?)\n\s*\},/);
  if (arMatch) {
    const keyMatches = arMatch[1].match(/'([^']+)':\s*'([^']*)'/g);
    if (keyMatches) {
      keyMatches.forEach(match => {
        const [key, val] = match.split(':').map((s, i) => {
          s = s.trim();
          return i === 0 ? s.replace(/'/g, '') : s.replace(/^'|'$/g, '');
        });
        result.ar[key] = val;
      });
    }
  }
  
  const enMatch = content.match(/en:\s*\{([\s\S]*?)\n\s*\},/);
  if (enMatch) {
    const keyMatches = enMatch[1].match(/'([^']+)':\s*'([^']*)'/g);
    if (keyMatches) {
      keyMatches.forEach(match => {
        const [key, val] = match.split(':').map((s, i) => {
          s = s.trim();
          return i === 0 ? s.replace(/'/g, '') : s.replace(/^'|'$/g, '');
        });
        result.en[key] = val;
      });
    }
  }
  
  return result;
}

// Mettre à jour un fichier avec les clés manquantes
function updateTranslationFile(namespace, missingKeys) {
  const filePath = path.join(translationsDir, `${namespace}.ts`);
  
  if (!fs.existsSync(filePath)) {
    return 0;
  }
  
  // Lire le fichier existant
  const existing = readTranslationFile(filePath);
  
  // Ajouter les clés manquantes
  let addedCount = 0;
  missingKeys.forEach(key => {
    const fullKey = `${namespace}.${key}`;
    if (!existing.fr[fullKey]) {
      existing.fr[fullKey] = `[${fullKey}]`;
      addedCount++;
    }
    if (!existing.ar[fullKey]) {
      existing.ar[fullKey] = `[${fullKey}]`;
    }
    if (!existing.en[fullKey]) {
      existing.en[fullKey] = `[${fullKey}]`;
    }
  });
  
  if (addedCount === 0) {
    return 0;
  }
  
  // Générer le camelCase
  const camelCase = namespace
    .split('_')
    .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  // Construire le nouveau fichier
  const frKeys = Object.keys(existing.fr).sort();
  const arKeys = Object.keys(existing.ar).sort();
  const enKeys = Object.keys(existing.en).sort();
  
  const frLines = frKeys.map(k => `    '${k}': '${existing.fr[k].replace(/'/g, "\\'")}',`);
  const arLines = arKeys.map(k => `    '${k}': '${existing.ar[k].replace(/'/g, "\\'")}',`);
  const enLines = enKeys.map(k => `    '${k}': '${existing.en[k].replace(/'/g, "\\'")}',`);
  
  const content = `/**
 * Traductions pour ${namespace}
 */

export const ${camelCase}Translations = {
  fr: {
${frLines.join('\n')}
  },
  ar: {
${arLines.join('\n')}
  },
  en: {
${enLines.join('\n')}
  },
};
`;
  
  fs.writeFileSync(filePath, content);
  return addedCount;
}

console.log('\n📝 Merging missing keys with existing translations...\n');

const namespaces = Object.keys(report.missingByNamespace)
  .filter(ns => ns && report.missingByNamespace[ns].length > 0)
  .sort((a, b) => report.missingByNamespace[b].length - report.missingByNamespace[a].length);

let totalAdded = 0;

namespaces.forEach(namespace => {
  const keys = report.missingByNamespace[namespace];
  if (!keys || keys.length === 0) return;
  
  const addedCount = updateTranslationFile(namespace, keys);
  if (addedCount > 0) {
    totalAdded += addedCount;
    console.log(`  ✅ [${namespace.toUpperCase()}] +${addedCount} clés`);
  }
});

console.log(`\n✅ Done! ${totalAdded} clés ajoutées\n`);
