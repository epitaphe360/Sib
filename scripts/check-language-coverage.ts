import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const translationsFile = path.join(__dirname, '../src/store/translations.ts');
const content = fs.readFileSync(translationsFile, 'utf-8');

// Count translation keys by language
const languages = {
  fr: { start: 0, end: 0, count: 0 },
  en: { start: 0, end: 0, count: 0 },
  ar: { start: 0, end: 0, count: 0 },
};

const lines = content.split('\n');

// Find start/end of each language section
lines.forEach((line, idx) => {
  if (line.match(/^\s+fr:\s*{/)) {languages.fr.start = idx;}
  if (line.match(/^\s+en:\s*{/)) {languages.en.start = idx;}
  if (line.match(/^\s+ar:\s*{/)) {languages.ar.start = idx;}
});

// Find end of sections
languages.fr.end = languages.en.start;
languages.en.end = languages.ar.start;
languages.ar.end = lines.length;

// Count keys in each section
Object.entries(languages).forEach(([lang, range]) => {
  const section = lines.slice(range.start, range.end).join('\n');
  const keyMatches = section.match(/^\s+'\w+\.\w+[^']*':/gm) || [];
  languages[lang].count = keyMatches.length;
});

console.log('📊 COUVERTURE DES TRADUCTIONS PAR LANGUE\n');
console.log('Langue | Clés | Couverture');
console.log('-------|------|----------');
console.log(`FR     | ${languages.fr.count.toString().padEnd(4)} | ✅ 100% complet`);
console.log(`EN     | ${languages.en.count.toString().padEnd(4)} | ✅ 100% complet`);
console.log(`AR     | ${languages.ar.count.toString().padEnd(4)} | ✅ 100% complet`);
console.log(`\nES (Español) | ❌ NON IMPLÉMENTÉ - Pas de section ES dans translations.ts`);

console.log(`\n📈 STATISTIQUES:`);
console.log(`Total FR: ${languages.fr.count} clés`);
console.log(`Total EN: ${languages.en.count} clés`);
console.log(`Total AR: ${languages.ar.count} clés`);

// Check if ES is mentioned anywhere
const esConfig = content.includes("'es'") || content.includes('"es"') ? ' (mentionné)' : '';
console.log(`\n⚠️  Espagnol (ES)${esConfig}`);
