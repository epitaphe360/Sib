#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Audit des clés de traduction manquantes
 */

// 1. Extraire toutes les clés de traduction utilisées dans le code
console.log('🔍 Extraction des clés de traduction utilisées...\n');

const srcDir = path.join(__dirname, 'src');
let usedKeys = new Set();

function extractTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern: t('namespace.key' ou t("namespace.key"
  const patterns = [
    /t\(['"]([a-z_]+\.[a-z_\.]+)['"]\)/g,
    /t\(['"]([a-z_]+)['"]\)/g,
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }
  });
}

// Parcourir tous les fichiers TypeScript/TSX
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      extractTranslationKeys(filePath);
    }
  });
}

walkDir(srcDir);

console.log(`✅ ${usedKeys.size} clés trouvées dans le code\n`);

// 2. Charger les traductions existantes
console.log('📖 Chargement des traductions existantes...\n');

const translationsDir = path.join(__dirname, 'src/i18n/translations');
const translationFiles = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

let definedKeys = new Set();
let translationsByNamespace = {};

translationFiles.forEach(file => {
  const content = fs.readFileSync(path.join(translationsDir, file), 'utf8');
  const namespace = file.replace('.ts', '');
  
  // Extraire les clés depuis le fichier
  // Cherche pattern: key: 'value' ou key: { ... }
  const keyPattern = /^\s*([a-z_]+):/gm;
  let match;
  let nestedKeys = [];
  
  while ((match = keyPattern.exec(content)) !== null) {
    const key = match[1];
    const fullKey = `${namespace}.${key}`;
    definedKeys.add(fullKey);
    
    if (!translationsByNamespace[namespace]) {
      translationsByNamespace[namespace] = [];
    }
    translationsByNamespace[namespace].push(key);
  }
});

console.log(`✅ ${definedKeys.size} clés trouvées dans les traductions\n`);

// 3. Comparer et identifier les clés manquantes
console.log('🔎 Analyse des clés manquantes...\n');

const missingKeys = Array.from(usedKeys).filter(key => !definedKeys.has(key));
const unusedKeys = Array.from(definedKeys).filter(key => !usedKeys.has(key));

if (missingKeys.length > 0) {
  console.log(`⚠️  ${missingKeys.length} CLÉS MANQUANTES:\n`);
  
  const keysByNamespace = {};
  missingKeys.forEach(key => {
    const [namespace, ...rest] = key.split('.');
    const keyName = rest.join('.');
    
    if (!keysByNamespace[namespace]) {
      keysByNamespace[namespace] = [];
    }
    keysByNamespace[namespace].push(keyName);
  });
  
  Object.entries(keysByNamespace).sort().forEach(([namespace, keys]) => {
    console.log(`\n📋 ${namespace} (${keys.length}):`);
    keys.sort().forEach(key => {
      console.log(`   • ${namespace}.${key}`);
    });
  });
} else {
  console.log('✅ Aucune clé manquante!\n');
}

// 4. Optionnel: afficher les clés inutilisées
console.log('\n' + '='.repeat(80) + '\n');

if (unusedKeys.length > 0) {
  console.log(`ℹ️  ${unusedKeys.length} clés non utilisées dans le code:\n`);
  
  const keysByNamespace = {};
  unusedKeys.forEach(key => {
    const [namespace, ...rest] = key.split('.');
    const keyName = rest.join('.');
    
    if (!keysByNamespace[namespace]) {
      keysByNamespace[namespace] = [];
    }
    keysByNamespace[namespace].push(keyName);
  });
  
  Object.entries(keysByNamespace).sort().forEach(([namespace, keys]) => {
    console.log(`\n📋 ${namespace} (${keys.length}):`);
    keys.sort().slice(0, 10).forEach(key => {
      console.log(`   • ${namespace}.${key}`);
    });
    if (keys.length > 10) {
      console.log(`   ... et ${keys.length - 10} autres`);
    }
  });
} else {
  console.log('✅ Aucune clé inutilisée!\n');
}

console.log('\n' + '='.repeat(80) + '\n');
console.log('📊 RÉSUMÉ:');
console.log(`   • Clés utilisées: ${usedKeys.size}`);
console.log(`   • Clés définies: ${definedKeys.size}`);
console.log(`   • Manquantes: ${missingKeys.length}`);
console.log(`   • Inutilisées: ${unusedKeys.length}\n`);
