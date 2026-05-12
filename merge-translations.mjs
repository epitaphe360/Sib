import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'translation-audit-report.json'), 'utf8'));
const translationsDir = path.join(__dirname, 'src/i18n/translations');

// Namespaces qui existent déjà et doivent être fusionnés
const existingNamespaces = [
  'admin', 'partner', 'chatbot', 'exhibitor', 'common', 'networking',
  'countdown', 'media', 'appointments', 'events', 'dashboard', 'errors',
  'auth', 'badge', 'visitor', 'form', 'partners', 'minisite', 'matching',
  'accommodations', 'exhibitors', 'appointment', 'event'
];

function parseTranslationFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extraire les sections fr et ar
  const result = { fr: {}, ar: {} };
  
  // Chercher les clés dans la section fr
  const frMatch = content.match(/fr:\s*\{([\s\S]*?)\},/);
  if (frMatch) {
    const frSection = frMatch[1];
    const keyMatches = frSection.match(/'([^']+)':\s*'([^']*)'/g);
    if (keyMatches) {
      keyMatches.forEach(match => {
        const [key, value] = match.split(':').map(s => s.trim());
        const cleanKey = key.replace(/'/g, '');
        const cleanValue = value.replace(/^'|'$/g, '');
        result.fr[cleanKey] = cleanValue;
      });
    }
  }
  
  // Chercher les clés dans la section ar
  const arMatch = content.match(/ar:\s*\{([\s\S]*?)\},?\n\s*\}/);
  if (arMatch) {
    const arSection = arMatch[1];
    const keyMatches = arSection.match(/'([^']+)':\s*'([^']*)'/g);
    if (keyMatches) {
      keyMatches.forEach(match => {
        const [key, value] = match.split(':').map(s => s.trim());
        const cleanKey = key.replace(/'/g, '');
        const cleanValue = value.replace(/^'|'$/g, '');
        result.ar[cleanKey] = cleanValue;
      });
    }
  }
  
  return result;
}

function updateExistingFile(namespace, newKeys) {
  const filePath = path.join(translationsDir, `${namespace}.ts`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ℹ️  [${namespace.toUpperCase()}] Fichier n'existe pas, en créer un nouveau...`);
    return;
  }
  
  // Charger les traductions existantes
  const existing = parseTranslationFile(filePath);
  
  // Ajouter les nouvelles clés
  let addedCount = 0;
  newKeys.forEach(key => {
    const fullKey = `${namespace}.${key}`;
    if (!existing.fr[fullKey]) {
      const placeholder = `[${fullKey}]`;
      existing.fr[fullKey] = placeholder;
      existing.ar[fullKey] = placeholder;
      addedCount++;
    }
  });
  
  if (addedCount === 0) {
    console.log(`  ✅ [${namespace.toUpperCase()}] Déjà à jour`);
    return;
  }
  
  // Générer le contenu
  const camelCase = namespace
    .split('_')
    .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Trier les clés
  const frKeys = Object.keys(existing.fr).sort();
  const arKeys = Object.keys(existing.ar).sort();
  
  const frLines = frKeys.map(k => `    '${k}': '${existing.fr[k]}',`);
  const arLines = arKeys.map(k => `    '${k}': '${existing.ar[k]}',`);
  
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
  console.log(`  ✅ [${namespace.toUpperCase()}] +${addedCount} clés ajoutées`);
}

console.log('\n🔀 Merging existing and new translation keys...\n');

existingNamespaces.forEach(namespace => {
  const keys = report.missingByNamespace[namespace];
  if (!keys || keys.length === 0) return;
  
  try {
    updateExistingFile(namespace, keys);
  } catch (e) {
    console.error(`  ❌ [${namespace}] Erreur: ${e.message}`);
  }
});

console.log('\n✅ Fusion terminée!\n');
