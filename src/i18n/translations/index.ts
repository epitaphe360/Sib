/**
 * Index centralisé de toutes les traductions
 * Importe et combine tous les modules de traductions
 */

import { navigationTranslations } from './navigation';
import { commonTranslations } from './common';
import { authTranslations } from './auth';
import { dashboardTranslations } from './dashboard';
import { exhibitorsTranslations } from './exhibitors';
import { partnersTranslations } from './partners';
import { eventsTranslations } from './events';
import { appointmentsTranslations } from './appointments';
import { formsTranslations } from './forms';
import { errorsTranslations } from './errors';
import { mediaTranslations } from './media';
import { matchingTranslations } from './matching';
import { apiTranslations } from './api';
import { minisiteTranslations } from './minisite';
import { badgeTranslations } from './badge';
import { networkingTranslations } from './networking';
import { accommodationTranslations } from './accommodation';
import { visitorTranslations } from './visitor';

type TranslationObject = Record<string, string>;
type LanguageTranslations = Record<string, TranslationObject>;

/**
 * Fusionne plusieurs objets de traductions
 */
function mergeTranslations(...translationObjects: LanguageTranslations[]): LanguageTranslations {
  const result: LanguageTranslations = {};

  translationObjects.forEach(translations => {
    Object.keys(translations).forEach(lang => {
      if (!result[lang]) {
        result[lang] = {};
      }
      Object.assign(result[lang], translations[lang]);
    });
  });

  return result;
}

/**
 * Toutes les traductions de l'application
 * Organisées par module pour faciliter la maintenance
 */
export const allTranslations = mergeTranslations(
  navigationTranslations,
  commonTranslations,
  authTranslations,
  dashboardTranslations,
  exhibitorsTranslations,
  partnersTranslations,
  eventsTranslations,
  appointmentsTranslations,
  formsTranslations,
  errorsTranslations,
  mediaTranslations,
  matchingTranslations,
  apiTranslations,
  minisiteTranslations,
  networkingTranslations,
  badgeTranslations,
  accommodationTranslations,
  visitorTranslations
);

// Après fusion, s'assurer que les langues cibles (en, ar) contiennent
// toutes les clés (fallback vers le français). Cela évite les clés manquantes
// à l'exécution et permet d'ajouter l'arabe progressivement.
['en', 'ar'].forEach((lang) => {
  if (!allTranslations[lang]) {
    allTranslations[lang] = {} as Record<string, string>;
  }
  Object.keys(allTranslations.fr || {}).forEach((key) => {
    if (!(key in allTranslations[lang])) {
      // copier la valeur FR comme placeholder
      allTranslations[lang][key] = allTranslations.fr[key];
    }
  });
});

/**
 * Langues supportées
 */
export const supportedLanguages = ['fr', 'en', 'ar'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

/**
 * Fonction utilitaire pour obtenir une traduction
 */
export function getTranslation(
  key: string,
  lang: SupportedLanguage = 'fr',
  fallback?: string
): string {
  return allTranslations[lang]?.[key] || fallback || key;
}

