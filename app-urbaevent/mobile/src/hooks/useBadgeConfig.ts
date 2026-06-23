import { useEffect, useState } from 'react';
import { DEFAULT_BADGE_CONFIG, fetchBadgeConfig, type BadgeConfig } from '../api/badgeConfig';

let cachedConfig: BadgeConfig | null = null;
let inflight: Promise<BadgeConfig> | null = null;

export function prefetchBadgeConfig(): Promise<BadgeConfig> {
  if (cachedConfig) return Promise.resolve(cachedConfig);
  if (!inflight) {
    inflight = fetchBadgeConfig().then((cfg) => {
      cachedConfig = cfg;
      inflight = null;
      return cfg;
    });
  }
  return inflight;
}

/** Charge la config admin /admin/badge-config (Supabase badge_config_v1). */
export function useBadgeConfig() {
  const [config, setConfig] = useState<BadgeConfig>(cachedConfig ?? DEFAULT_BADGE_CONFIG);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    let cancelled = false;
    prefetchBadgeConfig()
      .then((cfg) => { if (!cancelled) setConfig(cfg); })
      .catch(() => { if (!cancelled) setConfig(DEFAULT_BADGE_CONFIG); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { config, loading };
}

export function invalidateBadgeConfigCache() {
  cachedConfig = null;
  inflight = null;
}
