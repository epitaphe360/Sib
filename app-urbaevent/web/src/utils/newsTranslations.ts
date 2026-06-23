/**
 * News Article Translations
 * Maps article IDs to their translation keys
 */

export const articleTranslationMap = {
  'fallback-1': {
    titleKey: 'article.SIB_2026',
    excerptKey: 'article.SIB_excerpt',
    contentKey: 'article.SIB_content'
  },
  'fallback-2': {
    titleKey: 'article.innovation_title',
    excerptKey: 'article.innovation_excerpt',
    contentKey: 'article.innovation_content'
  },
  'fallback-3': {
    titleKey: 'article.durability_title',
    excerptKey: 'article.durability_excerpt',
    contentKey: 'article.durability_content'
  },
  'fallback-4': {
    titleKey: 'article.mediterranean_title',
    excerptKey: 'article.mediterranean_excerpt',
    contentKey: 'article.mediterranean_content'
  },
  'fallback-5': {
    titleKey: 'article.careers_title',
    excerptKey: 'article.careers_excerpt',
    contentKey: 'article.careers_content'
  },
  'fallback-6': {
    titleKey: 'article.security_title',
    excerptKey: 'article.security_excerpt',
    contentKey: 'article.security_content'
  }
};

/**
 * Get translation keys for an article
 */
export function getArticleTranslationKeys(articleId: string) {
  return articleTranslationMap[articleId as keyof typeof articleTranslationMap] || null;
}
