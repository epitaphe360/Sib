import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'translation-audit-report.json'), 'utf8'));
const translationsDir = path.join(__dirname, 'src/i18n/translations');

function addMissingKeysToFile(filePath, namespace, keys) {
  if (!fs.existsSync(filePath)) return 0;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  let addedCount = 0;
  keys.forEach(key => {
    const fullKey = `'${namespace}.${key}'`;
    // Vérifier si la clé existe déjà
    if (!content.includes(fullKey)) {
      // Trouver la fin de la section fr: {
      const frMatch = content.match(/fr:\s*\{[\s\S]*?\n\s*\},/);
      if (frMatch) {
        const insertion = `    ${fullKey}: '[${namespace}.${key}]',\n`;
        content = content.replace(frMatch[0], frMatch[0].replace(/\n\s*\},/, `,\n${insertion}\n  },`));
        addedCount++;
      }
    }
  });
  
  if (addedCount > 0) {
    fs.writeFileSync(filePath, content);
  }
  
  return addedCount;
}

console.log('\n📝 Adding remaining missing keys to existing files...\n');

const missingNamespaces = Object.keys(report.missingByNamespace)
  .filter(ns => ns && report.missingByNamespace[ns].length > 0)
  .sort((a, b) => report.missingByNamespace[b].length - report.missingByNamespace[a].length);

let totalAdded = 0;

// Focus on the files that existed originally and need updates
const targetNamespaces = ['common', 'nav', 'visitor', 'accommodation', 'media', 'badge', 'error', 'auth'];

targetNamespaces.forEach(namespace => {
  const keys = report.missingByNamespace[namespace];
  if (!keys || keys.length === 0) return;
  
  const filePath = path.join(translationsDir, `${namespace}.ts`);
  if (!fs.existsSync(filePath)) {
    // Créer un nouveau fichier
    const camelCase = namespace
      .split('_')
      .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    const frLines = keys.map(k => `    '${namespace}.${k}': '[${namespace}.${k}]',`);
    const arLines = keys.map(k => `    '${namespace}.${k}': '[${namespace}.${k}]',`);
    
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
    totalAdded += keys.length;
    console.log(`  ✨ [${namespace.toUpperCase()}] Created new file with ${keys.length} clés`);
  } else {
    const added = addMissingKeysToFile(filePath, namespace, keys);
    if (added > 0) {
      totalAdded += added;
      console.log(`  ✅ [${namespace.toUpperCase()}] +${added} clés`);
    }
  }
});

console.log(`\n✅ Done! ${totalAdded} clés ajoutées\n`);
