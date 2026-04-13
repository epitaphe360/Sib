import { useState, useEffect } from 'react';
import { getPageContent } from '../lib/pageContent';

/**
 * Hook React pour récupérer le contenu CMS d'une page vitrine.
 *
 * Retourne les champs personnalisés stockés dans Supabase.
 * Si un champ est absent, la page peut utiliser une valeur par défaut codée en dur.
 *
 * Usage :
 *   const cms = usePageContent('presentation');
 *   <h1>{cms.hero_title || 'Titre par défaut'}</h1>
 */
export function usePageContent(pageSlug: string): Record<string, string> {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    getPageContent(pageSlug)
      .then((data) => { if (!cancelled) setContent(data); })
      .catch(() => { /* silently use hardcoded defaults */ });
    return () => { cancelled = true; };
  }, [pageSlug]);

  return content;
}
