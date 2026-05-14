import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'translation-audit-report.json'), 'utf8'));
const translationsDir = path.join(__dirname, 'src/i18n/translations');

function getTranslationFileName(namespace) {
  return `${namespace}.ts`;
}

function createOrUpdateFile(namespace, missingKeys) {
  const filename = getTranslationFileName(namespace);
  const filePath = path.join(translationsDir, filename);
  
  const camelCase = namespace
    .split('_')
    .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Lire le fichier existant s'il existe
  let existingContent = '';
  let existingFrKeys = [];
  let existingArKeys = [];
  
  if (fs.existsSync(filePath)) {
    existingContent = fs.readFileSync(filePath, 'utf8');
    // Extraire les clés existantes
    const frMatch = existingContent.match(/fr: \{([\s\S]*?)\}/);
    if (frMatch) {
      const frSection = frMatch[1];
      const keyMatches = frSection.match(/'[^']+': '[^']*'/g);
      if (keyMatches) {
        existingFrKeys = keyMatches.map(m => m.split(':')[0].trim().replace(/'/g, ''));
      }
    }
  }

  // Créer les nouvelles clés
  const frLines = [];
  const arLines = [];
  
  missingKeys.forEach(key => {
    const fullKey = `${namespace}.${key}`;
    const placeholder = `[${fullKey}]`;
    frLines.push(`    '${fullKey}': '${placeholder}',`);
    arLines.push(`    '${fullKey}': '${placeholder}',`);
  });

  // Générer le contenu du fichier
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
};
`;

  fs.writeFileSync(filePath, content);
  return { filename, added: missingKeys.length };
}

console.log('\n🔧 Adding missing translation keys...\n');

const missingNamespaces = Object.keys(report.missingByNamespace)
  .filter(ns => ns && ns.trim() && report.missingByNamespace[ns].length > 0)
  .sort((a, b) => report.missingByNamespace[b].length - report.missingByNamespace[a].length);

let totalAdded = 0;

missingNamespaces.slice(0, 30).forEach(namespace => {
  const keys = report.missingByNamespace[namespace];
  if (keys.length === 0) return;
  
  try {
    const result = createOrUpdateFile(namespace, keys);
    totalAdded += result.added;
    console.log(`  ✅ [${namespace.toUpperCase()}] +${keys.length} clés → ${result.filename}`);
  } catch (e) {
    console.error(`  ❌ [${namespace}] Erreur: ${e.message}`);
  }
});

console.log(`\n✅ Done! ${totalAdded} clés ajoutées\n`);
