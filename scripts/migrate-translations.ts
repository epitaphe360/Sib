/**
 * Script de migration des traductions
 * Extrait les traductions de l'ancien fichier monolithique vers les nouveaux modules
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Configuration des domaines et leurs préfixes de clés
const domains = {
  navigation: ['nav.'],
  common: ['common.'],
  auth: ['auth.', 'login.', 'register.', 'password.', 'signup.'],
  dashboard: ['dashboard.', 'stats.', 'metrics.'],
  exhibitors: ['exhibitor', 'pages.exhibitors.', 'sector.'],
  partners: ['partner', 'pages.partners.'],
  events: ['event', 'pages.events.'],
  appointments: ['appointment', 'calendar.', 'availability.'],
  chat: ['chat.', 'message.'],
  forms: ['form.', 'validation.', 'field.'],
  errors: ['error.'],
  media: ['media.'],
  visitor: ['visitor.'],
  menu: ['menu.'],
  participate: ['participate.'],
};

interface Translations {
  [lang: string]: {
    [key: string]: string;
  };
}

/**
 * Lit le fichier de traductions monolithique
 */
function readOldTranslations(filePath: string): Translations {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Extraire l'objet allTranslations
    const match = content.match(/export const allTranslations = ({[\s\S]*?});/);
    if (!match) {
      throw new Error('Impossible de trouver allTranslations');
    }
    
    // Évaluer (attention : à utiliser uniquement pour migration)
    const translationsString = match[1];
    // Cette méthode est simplifiée - dans la vraie migration, 
    // utilisez un parser AST comme @babel/parser
    
    console.log('⚠️ Note: Ce script nécessite une implémentation complète avec un parser AST');
    console.log('📝 Pour l\'instant, faites la migration manuellement en suivant le guide');
    
    return {};
  } catch (error) {
    console.error('❌ Erreur lors de la lecture:', error);
    return {};
  }
}

/**
 * Groupe les traductions par domaine
 */
function groupTranslationsByDomain(translations: Translations): Record<string, Translations> {
  const grouped: Record<string, Translations> = {};
  
  // Initialiser les groupes
  Object.keys(domains).forEach(domain => {
    grouped[domain] = { fr: {}, en: {} };
  });
  grouped['other'] = { fr: {}, en: {} };
  
  // Grouper chaque clé selon son préfixe
  Object.keys(translations).forEach(lang => {
    Object.keys(translations[lang]).forEach(key => {
      let found = false;
      
      for (const [domain, prefixes] of Object.entries(domains)) {
        if (prefixes.some(prefix => key.startsWith(prefix))) {
          grouped[domain][lang][key] = translations[lang][key];
          found = true;
          break;
        }
      }
      
      if (!found) {
        grouped['other'][lang][key] = translations[lang][key];
      }
    });
  });
  
  return grouped;
}

/**
 * Génère le contenu d'un fichier de traductions
 */
function generateTranslationFile(domain: string, translations: Translations): string {
  const content = `/**
 * Traductions pour ${domain}
 */

export const ${domain}Translations = ${JSON.stringify(translations, null, 2).replace(/"([^"]+)":/g, '$1:')};
`;
  
  return content;
}

/**
 * Affiche les statistiques
 */
function displayStats(grouped: Record<string, Translations>) {
  console.log('\n📊 Statistiques de migration:\n');
  
  Object.entries(grouped).forEach(([domain, translations]) => {
    const frKeys = Object.keys(translations.fr || {}).length;
    const enKeys = Object.keys(translations.en || {}).length;
    
    if (frKeys > 0 || enKeys > 0) {
      console.log(`${domain.padEnd(20)} | FR: ${String(frKeys).padStart(4)} clés | EN: ${String(enKeys).padStart(4)} clés`);
    }
  });
}

// Exécution
console.log('🚀 Migration des traductions\n');
console.log('📁 Lecture du fichier source...');

const sourcePath = join(__dirname, '../src/store/translations.ts');
const translations = readOldTranslations(sourcePath);

console.log('📦 Groupement par domaine...');
const grouped = groupTranslationsByDomain(translations);

displayStats(grouped);

console.log('\n✅ Pour continuer la migration:');
console.log('1. Consultez TRANSLATION_REFACTORING_GUIDE.md');
console.log('2. Migrez manuellement module par module');
console.log('3. Testez après chaque migration');
console.log('4. Supprimez l\'ancien fichier une fois terminé');
