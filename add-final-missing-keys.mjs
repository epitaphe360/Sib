import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load missing keys
const missingKeys = JSON.parse(fs.readFileSync('missing-keys.json', 'utf8'));

// Group keys by namespace
const keysByNamespace = {};

missingKeys.forEach(key => {
  if (key.length <= 2 || !key.includes('.')) {
    // Single letter or simple keys go to common
    if (!keysByNamespace['common']) keysByNamespace['common'] = [];
    keysByNamespace['common'].push(key);
  } else {
    // Split by first dot
    const [ns, ...rest] = key.split('.');
    if (!keysByNamespace[ns]) keysByNamespace[ns] = [];
    keysByNamespace[ns].push(key);
  }
});

console.log('📝 Adding 188 missing translation keys...\n');

const translationsDir = path.join(__dirname, 'src/i18n/translations');

// Process each namespace
for (const [namespace, keys] of Object.entries(keysByNamespace)) {
  const filePath = path.join(translationsDir, `${namespace}.ts`);
  let content = '';
  let existingKeys = {};
  
  // Read existing file if it exists
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
    
    // Parse existing keys
    const keysRegex = /'([^']+)':\s*'[^']*'/g;
    let match;
    while ((match = keysRegex.exec(content))) {
      existingKeys[match[1]] = true;
    }
  }
  
  // Filter to only new keys
  const newKeys = keys.filter(k => !existingKeys[k]);
  
  if (newKeys.length === 0) {
    console.log(`  ⏭️  [${namespace.toUpperCase()}] No new keys to add`);
    continue;
  }
  
  if (fs.existsSync(filePath)) {
    // Append to existing file
    const insertPoint = content.lastIndexOf('},');
    if (insertPoint > -1) {
      const before = content.substring(0, insertPoint);
      const after = content.substring(insertPoint);
      
      // Add new keys
      let additions = '';
      newKeys.sort().forEach(k => {
        additions += `    '${k}': '[${k}]',\n`;
      });
      
      // Remove trailing comma from last key if needed and add new keys
      const beforeTrimmed = before.replace(/,\s*$/, '');
      content = beforeTrimmed + ',\n' + additions + after;
      
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ [${namespace.toUpperCase()}] +${newKeys.length} clés`);
    }
  } else {
    // Create new file
    const fileContent = `export const ${namespace}Translations = {
  fr: {
`;
    
    let translations = fileContent;
    newKeys.sort().forEach(k => {
      translations += `    '${k}': '[${k}]',\n`;
    });
    
    translations += `  },
  ar: {
`;
    
    newKeys.sort().forEach(k => {
      translations += `    '${k}': '[${k}]',\n`;
    });
    
    translations += `  }
};\n`;
    
    fs.writeFileSync(filePath, translations);
    console.log(`  ✨ [${namespace.toUpperCase()}] Created with ${newKeys.length} clés`);
  }
}

console.log('\n✅ Done! All missing keys added');

// Run audit to verify
console.log('\n🔍 Running verification audit...');
const usedKeysRegex = /t\(['"]([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*)['"]/gi;
let usedKeys = new Set();

function scanDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!file.startsWith('.') && !['node_modules', 'dist', '.git'].includes(file)) {
          scanDir(fullPath);
        }
      } else if (/\.(tsx?|jsx?)$/.test(file)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        let match;
        while ((match = usedKeysRegex.exec(content))) {
          usedKeys.add(match[1].toLowerCase());
        }
      }
    }
  } catch (e) {}
}

scanDir(path.join(__dirname, 'src'));

let definedKeys = new Set();
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts'));
for (const file of files) {
  const content = fs.readFileSync(path.join(translationsDir, file), 'utf8');
  const keysRegex = /'([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*)':/gi;
  let match;
  while ((match = keysRegex.exec(content))) {
    definedKeys.add(match[1].toLowerCase());
  }
}

const stillMissing = Array.from(usedKeys).filter(k => !definedKeys.has(k));
console.log(`\n✅ VERIFIED:`);
console.log(`  Used keys:     ${usedKeys.size}`);
console.log(`  Defined keys:  ${definedKeys.size}`);
console.log(`  Still missing: ${stillMissing.length}`);

if (stillMissing.length > 0) {
  console.log('\nRemaining missing keys:');
  stillMissing.slice(0, 20).forEach(k => console.log(`  - ${k}`));
  if (stillMissing.length > 20) {
    console.log(`  ... and ${stillMissing.length - 20} more`);
  }
}
