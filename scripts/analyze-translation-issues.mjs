#!/usr/bin/env node
/**
 * Script d'analyse urgente des problèmes de traduction
 * Détecte les textes hardcodés et les clés manquantes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');
const problems = {
  hardcodedStrings: [],
  missingTranslations: [],
  componentsMissingUseTranslation: []
};

// Patterns de textes hardcodés en français
const frenchTextPatterns = [
  /['"]Gestion des [A-ZÀ-Ü][a-zà-ü]+['"]/g,
  /['"]Tableau de bord['"]/g,
  /['"](Créer|Modifier|Supprimer|Ajouter|Filtrer|Rechercher|Enregistrer|Annuler)\s/g,
  /['"]En attente['"]/g,
  /['"]Aucun\s[a-z]+\s(trouvé|disponible)['"]/g,
  /['"]Êtes-vous sûr/g
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.relative(srcDir, filePath);
  
  // Skip translation files
  if (filename.includes('translations.ts') || filename.includes('i18n')) {
    return;
  }
  
  // Vérifier si c'est un composant React/page
  const isComponent = content.includes('export default') || content.includes('export function');
  
  if (isComponent) {
    // Vérifier si useTranslation est importé
    const hasUseTranslation = content.includes("import { useTranslation }") || 
                               content.includes("import { useTranslation as");
    const usesTranslation = content.includes("useTranslation()") || content.includes("const { t }");
    
    // Chercher les textes hardcodés
    frenchTextPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          problems.hardcodedStrings.push({
            file: filename,
            text: match,
            hasTranslation: hasUseTranslation
          });
        });
      }
    });
    
    // Pages admin sans traduction
    if (filename.includes('pages/admin') && !hasUseTranslation && content.includes('export default')) {
      problems.componentsMissingUseTranslation.push({
        file: filename,
        type: 'admin-page'
      });
    }
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      scanDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      scanFile(fullPath);
    }
  }
}

console.log('🔍 Analyse des problèmes de traduction...\n');
scanDirectory(srcDir);

console.log('📊 RAPPORT DE DIAGNOSTIC\n');
console.log('=' + '='.repeat(79));

// Problème 1: Composants admin sans traduction
console.log('\n🔴 CRITIQUE: Pages admin sans système de traduction');
console.log(`   ${problems.componentsMissingUseTranslation.length} fichiers affectés`);
problems.componentsMissingUseTranslation.slice(0, 10).forEach(item => {
  console.log(`   - ${item.file}`);
});

// Problème 2: Textes hardcodés
console.log(`\n⚠️  URGENT: Textes français hardcodés détectés`);
console.log(`   ${problems.hardcodedStrings.length} occurrences trouvées`);

// Grouper par fichier
const byFile = {};
problems.hardcodedStrings.forEach(item => {
  if (!byFile[item.file]) {
    byFile[item.file] = [];
  }
  byFile[item.file].push(item.text);
});

const topOffenders = Object.entries(byFile)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10);

topOffenders.forEach(([file, texts]) => {
  console.log(`\n   📄 ${file} (${texts.length} textes hardcodés)`);
  texts.slice(0, 3).forEach(text => {
    console.log(`      → ${text}`);
  });
});

// Solutions recommandées
console.log('\n\n💡 SOLUTIONS RECOMMANDÉES\n');
console.log('=' + '='.repeat(79));
console.log(`
1. Ajouter useTranslation aux pages admin (${problems.componentsMissingUseTranslation.length} fichiers)
   - ExhibitorManagementPage.tsx
   - PartnerManagementPage.tsx
   - EventManagementPage.tsx
   etc.

2. Remplacer les textes hardcodés par t('key')
   - "Gestion des Exposants" → t('admin.exhibitors_management')
   - "Tableau de bord" → t('admin.dashboard')
   - "Rechercher" → t('common.search')

3. Ajouter les clés manquantes dans store/translations.ts
   - Vérifier cohérence FR/EN/AR
   - Ajouter traductions pour pages admin

4. Tester le changement de langue dans l'interface
`);

console.log('\n✅ Analyse terminée\n');

// Sauvegarder rapport
const reportPath = path.join(__dirname, '../TRANSLATION_ISSUES_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(problems, null, 2));
console.log(`📝 Rapport détaillé sauvegardé: ${reportPath}\n`);
