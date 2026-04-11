/**
 * Hook pour gérer la traduction des partenaires
 * Retourne le contenu traduit mot par mot selon la langue active
 */

import { useMemo } from 'react';
import { useTranslation } from './useTranslation';

export interface TranslatedPartner {
  name: string;
  category: string;
  description: string;
  sector: string;
}

/**
 * Hook pour obtenir le partenaire dans la langue courante
 * Utilise les colonnes *_en de la DB si disponibles, sinon fallback sur FR
 */
export function usePartnerTranslation(partner: any): TranslatedPartner {
  const { currentLanguage } = useTranslation();

  return useMemo(() => {
    if (!partner) {
      return { name: '', category: '', description: '', sector: '' };
    }

    // Si anglais et que les colonnes EN existent
    if (currentLanguage === 'en') {
      return {
        name: partner.name_en || partner.name || '',
        category: partner.category_en || partner.category || '',
        description: partner.description_en || partner.description || '',
        sector: partner.sector_en || partner.sector || ''
      };
    }

    // Par défaut, retourner la version française
    return {
      name: partner.name || '',
      category: partner.category || '',
      description: partner.description || '',
      sector: partner.sector || ''
    };
  }, [partner, currentLanguage]);
}
