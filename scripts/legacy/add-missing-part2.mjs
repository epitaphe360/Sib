import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'translation-audit-report.json'), 'utf8'));
const translationsDir = path.join(__dirname, 'src/i18n/translations');

function createOrUpdateFile(namespace, missingKeys) {
  const filename = `${namespace}.ts`;
  const filePath = path.join(translationsDir, filename);
  
  const camelCase = namespace
    .split('_')
    .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const frLines = [];
  const arLines = [];
  
  missingKeys.forEach(key => {
    const fullKey = `${namespace}.${key}`;
    const placeholder = `[${fullKey}]`;
    frLines.push(`    '${fullKey}': '${placeholder}',`);
    arLines.push(`    '${fullKey}': '${placeholder}',`);
  });

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

console.log('\n🔧 Adding remaining missing translation keys...\n');

const missingNamespaces = Object.keys(report.missingByNamespace)
  .filter(ns => ns && ns.trim() && report.missingByNamespace[ns].length > 0)
  .sort((a, b) => report.missingByNamespace[b].length - report.missingByNamespace[a].length);

let totalAdded = 0;
const startIndex = 30;

missingNamespaces.slice(startIndex).forEach(namespace => {
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
console.log(`Total namespaces: ${missingNamespaces.length}`);
console.log(`Total clés manquantes ajoutées: ${missingNamespaces.reduce((sum, ns) => sum + report.missingByNamespace[ns].length, 0)}\n`);
