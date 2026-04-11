/**
 * Script pour nettoyer les clés dupliquées dans translations.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const translationsPath = path.join(__dir, '..', 'src', 'store', 'translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf-8');

// Fonction pour extraire les clés d'une section
function extractKeysFromSection(content, sectionName) {
  // Trouver le début de la section
  const regex = new RegExp(`${sectionName}:\\s*{([\\s\\S]*?)(?:^\\s*[a-z]+:\\s*{|^\\s*};)`, 'm');
  const match = content.match(regex);
  
  if (!match) {
    console.error(`Could not find ${sectionName} section`);
    return null;
  }

  const sectionContent = match[1];
  const keyValueMap = new Map();
  const keyRegex = /'([^']+)':\s*'([^']*(?:\\.'[^']*)*)'/g;
  let keyMatch;
  
  let duplicateCount = 0;
  while ((keyMatch = keyRegex.exec(sectionContent)) !== null) {
    const key = keyMatch[1];
    const value = keyMatch[2];
    
    if (keyValueMap.has(key)) {
      duplicateCount++;
      console.log(`  ⚠️  Duplicate key in ${sectionName}: ${key}`);
    } else {
      keyValueMap.set(key, value);
    }
  }
  
  if (duplicateCount > 0) {
    console.log(`  Removed ${duplicateCount} duplicates from ${sectionName}`);
  }
  
  return { content: sectionContent, keyValueMap, duplicateCount };
}

console.log('🔍 Cleaning translations.ts...');

const frSection = extractKeysFromSection(translationsContent, 'fr');
const enSection = extractKeysFromSection(translationsContent, 'en');

if (!frSection || !enSection) {
  console.error('❌ Failed to parse translations');
  process.exit(1);
}

console.log(`📊 Found ${frSection.keyValueMap.size} unique FR keys (removed ${frSection.duplicateCount} duplicates)`);
console.log(`📊 Found ${enSection.keyValueMap.size} unique EN keys (removed ${enSection.duplicateCount} duplicates)`);

// Générer le nouveau fichier
const header = translationsContent.substring(0, translationsContent.indexOf('fr:'));
const footer = '\n};\n';

let result = header;
result += 'fr: {\n';

for (const [key, value] of frSection.keyValueMap.entries()) {
  const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  result += `    '${key}': '${escapedValue}',\n`;
}

result += '  },\n\n  en: {\n';

for (const [key, value] of enSection.keyValueMap.entries()) {
  const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  result += `    '${key}': '${escapedValue}',\n`;
}

result += '  }\n' + footer;

// Sauvegarder le fichier nettoyé
fs.writeFileSync(translationsPath, result, 'utf-8');

console.log('✅ Translations.ts cleaned successfully!');


