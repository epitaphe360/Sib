import { useCallback, useEffect, useState } from 'react';
import {
  APK_DEFAULT_SALON_PARTNERS,
  mergeApkSalonPartners,
  partnersBannerSlot,
  type SalonPartnersCms,
} from '../config/mobileAppDefaultContent';
import {
  DEFAULT_MOBILE_APP_CONTENT,
  fetchMobileAppContent,
  mergeMobileAppContent,
  type MobileAppContent,
} from '../services/mobileAppContentService';

export type SalonPartnersDisplay = {
  salonKey: string;
  partners: SalonPartnersCms;
  bannerUrl: string | null;
  displayMode: 'banner' | 'list';
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

function resolvePartners(
  salonKey: string,
  content: MobileAppContent,
): Pick<SalonPartnersDisplay, 'partners' | 'bannerUrl' | 'displayMode'> {
  const merged = mergeApkSalonPartners(content.salonPartners);
  const partners: SalonPartnersCms = merged[salonKey] ?? APK_DEFAULT_SALON_PARTNERS[salonKey] ?? { groups: [] };
  const displayMode = partners.displayMode === 'list' ? 'list' : 'banner';
  const bannerSlot = partnersBannerSlot(salonKey);
  const bannerUrl =
    content.images[bannerSlot]?.trim() ||
    (salonKey === 'sib' ? '/sib-ma/static/banner.jpg' : null);

  return { partners, bannerUrl, displayMode };
}

export function useSalonPartnersCms(salonKey = 'sib'): SalonPartnersDisplay {
  const [content, setContent] = useState<MobileAppContent>(DEFAULT_MOBILE_APP_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchMobileAppContent());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement sponsors impossible');
      setContent(DEFAULT_MOBILE_APP_CONTENT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resolved = resolvePartners(salonKey, mergeMobileAppContent(content));

  return {
    salonKey,
    ...resolved,
    loading,
    error,
    reload: load,
  };
}

export function getSalonPartnersPayload(
  salonKey: string,
  content: MobileAppContent,
): { partners: SalonPartnersCms; bannerUrl: string | null; displayMode: 'banner' | 'list' } {
  return resolvePartners(salonKey, mergeMobileAppContent(content));
}
