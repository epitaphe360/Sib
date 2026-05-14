import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Extract used keys from code
const usedKeysRegex = /t\(['"]([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*)['"]/gi;
let usedKeys = new Set();

function scanDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!file.startsWith('.') && !['node_modules', 'dist', '.git'].includes(file)) {
          scanDir(fullPath);
        }
      } else if (/\.(tsx?|jsx?)$/.test(file)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          let match;
          while ((match = usedKeysRegex.exec(content))) {
            usedKeys.add(match[1].toLowerCase());
          }
        } catch (e) {
          console.error(`Error reading ${fullPath}: ${e.message}`);
        }
      }
    }
  } catch (e) {
    console.error(`Error scanning ${dir}: ${e.message}`);
  }
}

console.log('[1] Extracting translation keys from code...');
scanDir(path.join(__dirname, 'src'));
console.log(`     FOUND: ${usedKeys.size} keys\n`);

// Load defined keys
let definedKeys = new Set();

console.log('[2] Loading defined translation keys...');
const translationsDir = path.join(__dirname, 'src/i18n/translations');
try {
  const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts'));
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(translationsDir, file), 'utf8');
      const keysRegex = /'([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*)':/gi;
      let match;
      while ((match = keysRegex.exec(content))) {
        definedKeys.add(match[1].toLowerCase());
      }
    } catch (e) {
      console.error(`Error reading ${file}: ${e.message}`);
    }
  }
} catch (e) {
  console.error(`Error reading translations directory: ${e.message}`);
}
console.log(`     FOUND: ${definedKeys.size} keys\n`);

// Find missing
const missing = Array.from(usedKeys).filter(k => !definedKeys.has(k)).sort();

console.log('\n================================================================================');
console.log('\nMISSING KEYS (' + missing.length + '):\n');
missing.forEach(k => console.log('  - ' + k));

console.log('\n================================================================================');
console.log('\nSUMMARY:');
console.log(`  Used keys:     ${usedKeys.size}`);
console.log(`  Defined keys:  ${definedKeys.size}`);
console.log(`  Missing:       ${missing.length}`);

// Save to file for later processing
fs.writeFileSync('missing-keys.json', JSON.stringify(missing, null, 2));
console.log('\nMissing keys saved to: missing-keys.json');
