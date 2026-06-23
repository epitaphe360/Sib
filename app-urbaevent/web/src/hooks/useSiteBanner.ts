import { useEffect, useState } from 'react';
import { BannerKey, getBannerDefaultSrc, getBannerFallbackSrc } from '../config/banners';
import { resolveBannerSrc } from '../services/bannerService';

export function useSiteBanner(key: BannerKey) {
  const fallback = getBannerDefaultSrc(key);
  const secondaryFallback = getBannerFallbackSrc(key);
  const [src, setSrc] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resolveBannerSrc(key)
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(fallback);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, fallback]);

  return { src, loading, fallback, secondaryFallback };
}
