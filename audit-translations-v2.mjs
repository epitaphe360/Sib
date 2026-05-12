#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Audit des clés de traduction manquantes - VERSION CORRIGÉE
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

console.log('\n🔍 Extraction des cles de traduction utilisees...\n');
walkDir(srcDir);
console.log(`OK - ${usedKeys.size} cles trouvees\n`);

// 2. Charger les traductions existantes
console.log('Loading translation definitions...\n');

const translationsDir = path.join(__dirname, 'src/i18n/translations');
const translationFiles = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

let definedKeys = new Set();

translationFiles.forEach(file => {
  const content = fs.readFileSync(path.join(translationsDir, file), 'utf8');
  const namespace = file.replace('.ts', '');
  
  // Cherche les clés valides au format: key: ou key: {
  const keyPattern = /^\s*([a-z][a-z0-9_]*)[\s:]/gm;
  let match;
  
  while ((match = keyPattern.exec(content)) !== null) {
    const key = match[1];
    const fullKey = `${namespace}.${key}`;
    definedKeys.add(fullKey);
  }
});

console.log(`OK - ${definedKeys.size} cles definies\n`);

// 3. Analyser
const missingKeys = Array.from(usedKeys)
  .filter(key => !definedKeys.has(key))
  .sort();

const unusedKeys = Array.from(definedKeys)
  .filter(key => !usedKeys.has(key))
  .sort();

console.log('='.repeat(80) + '\n');

if (missingKeys.length > 0) {
  console.log(`WARNING: ${missingKeys.length} MISSING TRANSLATION KEYS:\n`);
  
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
    console.log(`[${namespace}] (${keys.length}):`);
    keys.sort().forEach(key => {
      console.log(`  - ${namespace}.${key}`);
    });
    console.log('');
  });
} else {
  console.log('OK - No missing keys!\n');
}

console.log('='.repeat(80) + '\n');

if (unusedKeys.length > 0) {
  console.log(`INFO: ${unusedKeys.length} UNUSED TRANSLATION KEYS:\n`);
  
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
      console.log(`[${namespace}] (${keys.length}):`);
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
