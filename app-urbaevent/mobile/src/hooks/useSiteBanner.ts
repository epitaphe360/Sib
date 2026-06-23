import { useEffect, useMemo, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { BannerKey } from '../config/banners';
import {
  getLocalBannerSource,
  resolveBannerImageUrl,
  USE_SIB_MA_LOCAL_BANNER,
} from '../services/siteBanners';

export function useSiteBanner(key: BannerKey) {
  const local = useMemo(() => getLocalBannerSource(key), [key]);
  const [source, setSource] = useState<ImageSourcePropType>(local);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_SIB_MA_LOCAL_BANNER && key === 'urbaevent') {
      setSource(local);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    resolveBannerImageUrl(key)
      .then((url) => {
        if (cancelled) return;
        if (url) setSource({ uri: url });
        else setSource(local);
      })
      .catch(() => {
        if (!cancelled) setSource(local);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, local]);

  return { source, loading };
}
