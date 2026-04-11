/**
 * Hook pour gérer la traduction des articles
 * Version optimisée: Utilise les colonnes title_en/excerpt_en/content_en de Supabase
 */

import { useMemo } from 'react';
import { useTranslation } from './useTranslation';

export interface TranslatedArticle {
  title: string;
  excerpt: string;
  content: string;
}

/**
 * Hook pour obtenir l'article dans la langue courante
 * Utilise les colonnes *_en de la DB si disponibles, sinon fallback sur FR
 */
export function useArticleTranslation(article: any): TranslatedArticle {
  const { currentLanguage } = useTranslation();

  return useMemo(() => {
    if (!article) {
      return { title: '', excerpt: '', content: '' };
    }

    // Si anglais et que les colonnes EN existent
    if (currentLanguage === 'en' && article.title_en) {
      return {
        title: article.title_en || article.title || '',
        excerpt: article.excerpt_en || article.excerpt || '',
        content: article.content_en || article.content || ''
      };
    }

    // Par défaut, retourner la version française
    return {
      title: article.title || '',
      excerpt: article.excerpt || '',
      content: article.content || ''
    };
  }, [article, currentLanguage]);
}
