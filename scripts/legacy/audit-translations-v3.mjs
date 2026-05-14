#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Audit des clés de traduction manquantes - VERSION FINALE
 * Les traductions sont structurées comme { fr: { 'key.path': 'value', ... }, ... }
 */

const srcDir = path.join(__dirname, 'src');
let usedKeys = new Set();
const keyPattern = /t\(['"]([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*)['"]/g;

function extractTranslationKeys(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = keyPattern.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }
  } catch (e) {
    // Ignorer
  }
}

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        extractTranslationKeys(filePath);
      }
    });
  } catch (e) {
    // Ignorer
  }
}

console.log('\n[1] Extracting translation keys used in code...\n');
walkDir(srcDir);
console.log(`    FOUND: ${usedKeys.size} keys\n`);

// 2. Charger les traductions existantes
console.log('[2] Loading translation definitions...\n');

const translationsDir = path.join(__dirname, 'src/i18n/translations');
const translationFiles = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

let definedKeys = new Set();

translationFiles.forEach(file => {
  const content = fs.readFileSync(path.join(translationsDir, file), 'utf8');
  
  // Extraire toutes les clés du format 'key.path': 'value'
  const keyMatch = /'([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*)'\s*:/g;
  let match;
  
  while ((match = keyMatch.exec(content)) !== null) {
    definedKeys.add(match[1]);
  }
});

console.log(`    FOUND: ${definedKeys.size} keys\n`);

// 3. Analyser
const missingKeys = Array.from(usedKeys)
  .filter(key => !definedKeys.has(key))
  .sort();

const unusedKeys = Array.from(definedKeys)
  .filter(key => !usedKeys.has(key))
  .sort();

console.log('='.repeat(80) + '\n');

if (missingKeys.length > 0) {
  console.log(`[WARNING] ${missingKeys.length} MISSING TRANSLATION KEYS:\n`);
  
  const keysByNamespace = {};
  missingKeys.forEach(key => {
    const parts = key.split('.');
    const namespace = parts[0];
    const keyName = parts.slice(1).join('.');
    
    if (!keysByNamespace[namespace]) {
      keysByNamespace[namespace] = [];
    }
    keysByNamespace[namespace].push(keyName);
  });
  
  Object.entries(keysByNamespace).sort().forEach(([namespace, keys]) => {
    console.log(`[${namespace.toUpperCase()}] (${keys.length}):`);
    keys.sort().slice(0, 20).forEach(key => {
      console.log(`  - ${namespace}.${key}`);
    });
    if (keys.length > 20) {
      console.log(`  ... and ${keys.length - 20} more`);
    }
    console.log('');
  });
} else {
  console.log('OK - No missing keys!\n');
}

console.log('='.repeat(80) + '\n');

if (unusedKeys.length > 0) {
  console.log(`[INFO] ${unusedKeys.length} UNUSED TRANSLATION KEYS:\n`);
  
  const keysByNamespace = {};
  unusedKeys.forEach(key => {
    const parts = key.split('.');
    const namespace = parts[0];
    const keyName = parts.slice(1).join('.');
    
    if (!keysByNamespace[namespace]) {
      keysByNamespace[namespace] = [];
    }
    keysByNamespace[namespace].push(keyName);
  });
  
  Object.entries(keysByNamespace).sort().forEach(([namespace, keys]) => {
    if (keys.length > 0) {
      console.log(`[${namespace.toUpperCase()}] (${keys.length}):`);
      keys.sort().slice(0, 10).forEach(key => {
        console.log(`  - ${namespace}.${key}`);
      });
      if (keys.length > 10) {
        console.log(`  ... and ${keys.length - 10} more`);
      }
      console.log('');
    }
  });
}

console.log('='.repeat(80) + '\n');
console.log('SUMMARY:');
console.log(`  Used keys:     ${usedKeys.size}`);
console.log(`  Defined keys:  ${definedKeys.size}`);
console.log(`  Missing:       ${missingKeys.length}`);
console.log(`  Unused:        ${unusedKeys.length}\n`);

// Sauvegarder les clés manquantes dans un fichier
const missingReport = {
  summary: {
    used: usedKeys.size,
    defined: definedKeys.size,
    missing: missingKeys.length,
    unused: unusedKeys.length,
    timestamp: new Date().toISOString()
  },
  missingByNamespace: Object.fromEntries(
    Object.entries(
      missingKeys.reduce((acc, key) => {
        const [ns, ...rest] = key.split('.');
        if (!acc[ns]) acc[ns] = [];
        acc[ns].push(rest.join('.'));
        return acc;
      }, {})
    ).sort()
  ),
  unusedByNamespace: Object.fromEntries(
    Object.entries(
      unusedKeys.reduce((acc, key) => {
        const [ns, ...rest] = key.split('.');
        if (!acc[ns]) acc[ns] = [];
        acc[ns].push(rest.join('.'));
        return acc;
      }, {})
    ).sort()
  )
};

fs.writeFileSync(
  path.join(__dirname, 'translation-audit-report.json'),
  JSON.stringify(missingReport, null, 2)
);

console.log('Report saved to: translation-audit-report.json\n');
