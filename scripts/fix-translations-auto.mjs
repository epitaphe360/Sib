#!/usr/bin/env node
/**
 * Script de correction automatique des problèmes de traduction
 * Ajoute useTranslation et remplace les textes hardcodés
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');

// Mapping des textes hardcodés vers les clés de traduction
const translationMap = {
  // Admin pages
  'Gestion des Exposants': 'admin.exhibitors_management',
  'Gestion des Partenaires': 'admin.partners_management',
  'Gestion des Événements': 'admin.events_management',
  'Gestion des Utilisateurs': 'admin.users_management',
  'Gestion des Médias': 'admin.media_management',
  'Gestion des Articles': 'admin.news_management',
  'Gestion des Pavillons Thématiques': 'admin.pavilions_management',
  'Gestion des Visiteurs VIP': 'admin.vip_visitors',
  'Gestion des Lives Studio': 'admin.live_studio_management',
  'Gestionnaire de médias': 'admin.media_manager',
  'Retour au dashboard': 'common.back_to_dashboard',
  'Retour à la gestion des médias': 'admin.back_to_media',
  
  // Actions
  'Nouvel Exposant': 'admin.new_exhibitor',
  'Nouveau Partenaire': 'admin.new_partner',
  'Nouvel Événement': 'admin.new_event',
  'Nouvel Article': 'admin.new_article',
  'Créer': 'common.create',
  'Modifier': 'common.edit',
  'Supprimer': 'common.delete',
  'Ajouter': 'common.add',
  'Enregistrer': 'common.save',
  'Annuler': 'common.cancel',
  'Rechercher': 'common.search',
  'Filtrer': 'common.filter',
  
  // Status
  'En attente': 'common.pending',
  'Vérifiés': 'common.verified',
  'Non vérifiés': 'common.not_verified',
  'Total Exposants': 'admin.total_exhibitors',
  'Total Partenaires': 'admin.total_partners',
  'Total Utilisateurs': 'admin.total_users',
  'Catégories': 'common.categories',
  
  // Messages
  'Êtes-vous sûr de vouloir supprimer': 'messages.confirm_delete',
  'Êtes-vous sûr': 'messages.confirm_action',
  'Aucun exposant trouvé': 'messages.no_exhibitors',
  'Aucun partenaire trouvé': 'messages.no_partners',
  'Aucun événement trouvé': 'messages.no_events',
  'Impossible de récupérer': 'messages.fetch_error',
  'Erreur lors du chargement': 'messages.loading_error',
  'Erreur lors de la suppression': 'messages.delete_error',
  'supprimé avec succès': 'messages.deleted',
  
  // Descriptions
  'Gérez tous les exposants de la plateforme': 'admin.manage_exhibitors_desc',
  'Gérez tous les partenaires de la plateforme': 'admin.manage_partners_desc',
  'Gérez tous les événements de la plateforme': 'admin.manage_events_desc',
  'Gérez tous les utilisateurs de la plateforme': 'admin.manage_users_desc'
};

const filesToFix = [
  'src/pages/admin/ExhibitorManagementPage.tsx',
  'src/pages/admin/PartnerManagementPage.tsx',
  'src/pages/admin/EventManagementPage.tsx',
  'src/pages/admin/NewsManagementPage.tsx',
  'src/pages/admin/PavillonsPage.tsx',
  'src/pages/admin/VIPVisitorsPage.tsx',
  'src/pages/admin/MediaManagerPage.tsx',
  'src/pages/admin/media/MediaManagementPage.tsx',
  'src/pages/admin/media/CreateMediaPage.tsx',
  'src/pages/admin/media/EditMediaPage.tsx',
  'src/pages/admin/media/LiveEventManager.tsx'
];

function addUseTranslation(content) {
  // Check if already has useTranslation
  if (content.includes('useTranslation')) {
    return content;
  }
  
  // Find import section
  const importEnd = content.lastIndexOf('import');
  if (importEnd === -1) return content;
  
  const nextSemicolon = content.indexOf(';', importEnd);
  if (nextSemicolon === -1) return content;
  
  // Add import after last import
  const beforeImport = content.substring(0, nextSemicolon + 1);
  const afterImport = content.substring(nextSemicolon + 1);
  
  const newImport = `\nimport { useTranslation } from '../../hooks/useTranslation';`;
  
  // Find component function and add const { t } = useTranslation();
  const componentMatch = afterImport.match(/(export default function \w+\([^)]*\) \{)/);
  if (!componentMatch) return content;
  
  const hookLine = `\n  const { t } = useTranslation();\n`;
  const updatedAfter = afterImport.replace(componentMatch[1], componentMatch[1] + hookLine);
  
  return beforeImport + newImport + updatedAfter;
}

function replaceHardcodedStrings(content) {
  let updated = content;
  
  for (const [hardcoded, key] of Object.entries(translationMap)) {
    // Replace in JSX (both single and double quotes)
    const patterns = [
      new RegExp(`(['"])${escapeRegExp(hardcoded)}\\1`, 'g'),
      new RegExp(`>{hardcoded}<`, 'g')
    ];
    
    patterns.forEach(pattern => {
      updated = updated.replace(pattern, (match) => {
        if (match.startsWith('>')) {
          return `>{t('${key}')}<`;
        }
        return `{t('${key}')}`;
      });
    });
  }
  
  return updated;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fixFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Fichier non trouvé: ${filePath}`);
    return false;
  }
  
  console.log(`🔧 Traitement: ${filePath}`);
  
  const original = fs.readFileSync(fullPath, 'utf-8');
  let updated = original;
  
  // Step 1: Add useTranslation hook
  updated = addUseTranslation(updated);
  
  // Step 2: Replace hardcoded strings
  updated = replaceHardcodedStrings(updated);
  
  if (updated === original) {
    console.log(`   → Aucun changement nécessaire`);
    return false;
  }
  
  // Backup original
  fs.writeFileSync(fullPath + '.bak', original);
  
  // Write updated
  fs.writeFileSync(fullPath, updated);
  console.log(`   ✅ Corrigé (backup: ${filePath}.bak)`);
  return true;
}

console.log('🚀 Correction automatique des traductions\n');
console.log('=' + '='.repeat(79) + '\n');

let fixed = 0;
for (const file of filesToFix) {
  if (fixFile(file)) {
    fixed++;
  }
}

console.log('\n' + '=' + '='.repeat(79));
console.log(`\n✅ ${fixed} fichier(s) corrigé(s)\n`);
console.log('💡 Les fichiers originaux sont sauvegardés avec l\'extension .bak\n');
console.log('⚠️  IMPORTANT: Testez l\'application et vérifiez les modifications avant de commit\n');
