/**
 * Résout une image du site : Supabase (custom upload) → CDN défaut.
 * Usage : const { src } = useSiteImage('home_hero_hall');
 */
import { useEffect, useState } from 'react';
import { resolveSiteImage } from '../services/siteImagesService';
import { getSiteImageDefault, type SiteImageKey } from '../config/siteImagesConfig';

export function useSiteImage(key: SiteImageKey) {
  const fallback = getSiteImageDefault(key);
  const [src, setSrc] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resolveSiteImage(key)
      .then(url => { if (!cancelled) setSrc(url); })
      .catch(() => { if (!cancelled) setSrc(fallback); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [key, fallback]);

  return { src, loading, fallback };
}
