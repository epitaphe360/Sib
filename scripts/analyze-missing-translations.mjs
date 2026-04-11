#!/usr/bin/env node

/**
 * Script d'analyse des clés de traduction manquantes dans l'application SIPORTV3
 * 
 * Ce script :
 * 1. Lit toutes les clés existantes dans src/i18n/config.ts
 * 2. Recherche tous les appels à t('...') dans les fichiers .tsx
 * 3. Identifie les clés manquantes
 * 4. Génère un rapport détaillé par section
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Lire le fichier de configuration des traductions
const configPath = './src/i18n/config.ts';
const configContent = readFileSync(configPath, 'utf-8');

// Extraire toutes les clés FR existantes
function extractExistingKeys(configContent) {
  const keys = new Set();
  const frSection = configContent.match(/fr:\s*\{[\s\S]*?translation:\s*\{([\s\S]*?)\n\s{4}\}\s*\}/);
  
  if (!frSection) {
    console.error('❌ Impossible de trouver la section FR dans config.ts');
    return keys;
  }

  const content = frSection[1];
  
  // Extraire les clés avec une regex récursive
  function extractKeysFromObject(text, prefix = '') {
    // Trouver les propriétés au niveau actuel
    const propertyRegex = /(\w+):\s*({|'[^']*'|"[^"]*")/g;
    let match;
    
    while ((match = propertyRegex.exec(text)) !== null) {
      const key = match[1];
      const value = match[2];
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value === '{') {
        // C'est un objet imbriqué, trouver son contenu
        const startPos = match.index + match[0].length;
        let braceCount = 1;
        let endPos = startPos;
        
        while (braceCount > 0 && endPos < text.length) {
          if (text[endPos] === '{') braceCount++;
          if (text[endPos] === '}') braceCount--;
          endPos++;
        }
        
        const objectContent = text.substring(startPos, endPos - 1);
        extractKeysFromObject(objectContent, fullKey);
      } else {
        // C'est une valeur de chaîne
        keys.add(fullKey);
      }
    }
  }
  
  extractKeysFromObject(content);
  
  return keys;
}

// Rechercher tous les fichiers .tsx récursivement
function findTsxFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer node_modules et .git
      if (!file.startsWith('.') && file !== 'node_modules') {
        findTsxFiles(filePath, fileList);
      }
    } else if (extname(file) === '.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Extraire toutes les clés utilisées dans les fichiers .tsx
function extractUsedKeys(tsxFiles) {
  const usedKeys = new Map(); // Map<key, Set<filePath>>
  
  // Patterns à rechercher
  const patterns = [
    /t\(['"`]([^'"`]+)['"`]\)/g,                    // t('key')
    /t\(['"`]([^'"`]+)['"`]\s*,/g,                  // t('key', ...)
    /\{t\(['"`]([^'"`]+)['"`]\)\}/g,                // {t('key')}
    /i18n\.t\(['"`]([^'"`]+)['"`]\)/g,              // i18n.t('key')
  ];
  
  tsxFiles.forEach(file => {
    try {
      const content = readFileSync(file, 'utf-8');
      
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const key = match[1];
          if (!usedKeys.has(key)) {
            usedKeys.set(key, new Set());
          }
          usedKeys.get(key).add(file);
        }
      });
    } catch (error) {
      console.error(`⚠️ Erreur lors de la lecture de ${file}:`, error.message);
    }
  });
  
  return usedKeys;
}

// Obtenir le contexte d'utilisation dans un fichier
function getUsageContext(filePath, searchKey) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`t('${searchKey}')`) || lines[i].includes(`t("${searchKey}")`)) {
        // Retourner la ligne et son numéro
        return {
          line: i + 1,
          code: lines[i].trim()
        };
      }
    }
  } catch (error) {
    // Ignorer les erreurs
  }
  
  return null;
}

// Organiser les clés manquantes par section
function organizeBySection(missingKeys) {
  const sections = {};
  
  missingKeys.forEach(key => {
    const parts = key.split('.');
    const section = parts[0] || 'root';
    
    if (!sections[section]) {
      sections[section] = [];
    }
    
    sections[section].push(key);
  });
  
  return sections;
}

// Programme principal
console.log('🔍 ANALYSE DES CLÉS DE TRADUCTION MANQUANTES\n');
console.log('=' .repeat(80));

// 1. Extraire les clés existantes
console.log('\n📖 Extraction des clés existantes depuis config.ts...');
const existingKeys = extractExistingKeys(configContent);
console.log(`✅ ${existingKeys.size} clés trouvées dans config.ts\n`);

// 2. Trouver tous les fichiers .tsx
console.log('📁 Recherche des fichiers .tsx...');
const tsxFiles = findTsxFiles('./src');
console.log(`✅ ${tsxFiles.length} fichiers .tsx trouvés\n`);

// 3. Extraire toutes les clés utilisées
console.log('🔎 Extraction des clés utilisées dans les fichiers .tsx...');
const usedKeys = extractUsedKeys(tsxFiles);
console.log(`✅ ${usedKeys.size} clés distinctes utilisées dans le code\n`);

// 4. Identifier les clés manquantes
console.log('🎯 Identification des clés manquantes...\n');
const missingKeys = [];

usedKeys.forEach((files, key) => {
  if (!existingKeys.has(key)) {
    missingKeys.push(key);
  }
});

if (missingKeys.length === 0) {
  console.log('✅ Aucune clé manquante trouvée ! 🎉\n');
  process.exit(0);
}

console.log(`❌ ${missingKeys.length} clés manquantes identifiées\n`);
console.log('=' .repeat(80));

// 5. Organiser par section et afficher le rapport
const sections = organizeBySection(missingKeys);
const sectionNames = Object.keys(sections).sort();

console.log('\n📊 RAPPORT DÉTAILLÉ PAR SECTION\n');

sectionNames.forEach(section => {
  const keys = sections[section].sort();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📦 SECTION: ${section.toUpperCase()}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Total: ${keys.length} clés manquantes\n`);
  
  keys.forEach((key, index) => {
    console.log(`${index + 1}. Clé manquante: ${key}`);
    
    const files = usedKeys.get(key);
    console.log(`   📄 Utilisée dans ${files.size} fichier(s):`);
    
    files.forEach(file => {
      const relativePath = file.replace(/\\/g, '/').replace('./src/', '');
      const context = getUsageContext(file, key);
      
      if (context) {
        console.log(`      - ${relativePath}:${context.line}`);
        console.log(`        ${context.code}`);
      } else {
        console.log(`      - ${relativePath}`);
      }
    });
    
    console.log('');
  });
});

// 6. Résumé final
console.log('\n' + '='.repeat(80));
console.log('📋 RÉSUMÉ GLOBAL');
console.log('='.repeat(80));
console.log(`\nClés existantes:     ${existingKeys.size}`);
console.log(`Clés utilisées:      ${usedKeys.size}`);
console.log(`Clés manquantes:     ${missingKeys.length}`);
console.log(`Sections affectées:  ${sectionNames.length}\n`);

console.log('Sections avec le plus de clés manquantes:');
const sortedSections = sectionNames
  .map(name => ({ name, count: sections[name].length }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);

sortedSections.forEach((section, index) => {
  console.log(`  ${index + 1}. ${section.name}: ${section.count} clés`);
});

console.log('\n' + '='.repeat(80));
console.log('\n✨ Analyse terminée !\n');
