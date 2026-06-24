import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_BADGE_CONFIG, fetchBadgeConfig, type BadgeConfig } from '../api/badgeConfig';

const CACHE_TTL_MS = 2 * 60 * 1000;

let cachedConfig: BadgeConfig | null = null;
let cachedAt = 0;
let inflight: Promise<BadgeConfig> | null = null;

type ConfigListener = (cfg: BadgeConfig) => void;
const listeners = new Set<ConfigListener>();

function emitConfig(cfg: BadgeConfig) {
  listeners.forEach((listener) => listener(cfg));
}

function isCacheFresh(): boolean {
  return Boolean(cachedConfig && Date.now() - cachedAt < CACHE_TTL_MS);
}

async function loadBadgeConfig(force = false): Promise<BadgeConfig> {
  if (!force && isCacheFresh() && cachedConfig) {
    return cachedConfig;
  }

  if (!force && inflight) {
    return inflight;
  }

  inflight = fetchBadgeConfig()
    .then((cfg) => {
      cachedConfig = cfg;
      cachedAt = Date.now();
      inflight = null;
      emitConfig(cfg);
      return cfg;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });

  return inflight;
}

export function prefetchBadgeConfig(force = false): Promise<BadgeConfig> {
  return loadBadgeConfig(force);
}

/** Force le rechargement depuis Supabase (après modification admin web). */
export async function reloadBadgeConfig(): Promise<BadgeConfig> {
  cachedConfig = null;
  cachedAt = 0;
  inflight = null;
  return loadBadgeConfig(true);
}

/** Charge la config admin /admin/badge-config (Supabase badge_config_v1). */
export function useBadgeConfig() {
  const [config, setConfig] = useState<BadgeConfig>(cachedConfig ?? DEFAULT_BADGE_CONFIG);
  const [loading, setLoading] = useState(!cachedConfig);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const cfg = await reloadBadgeConfig();
      setConfig(cfg);
      return cfg;
    } catch {
      setConfig(DEFAULT_BADGE_CONFIG);
      return DEFAULT_BADGE_CONFIG;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onUpdate = (cfg: BadgeConfig) => setConfig(cfg);
    listeners.add(onUpdate);

    loadBadgeConfig(false)
      .then((cfg) => {
        setConfig(cfg);
      })
      .catch(() => {
        setConfig(DEFAULT_BADGE_CONFIG);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      listeners.delete(onUpdate);
    };
  }, []);

  return { config, loading, reload };
}

export function invalidateBadgeConfigCache() {
  cachedConfig = null;
  cachedAt = 0;
  inflight = null;
}
