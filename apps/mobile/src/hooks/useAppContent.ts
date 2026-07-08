import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_MOBILE_APP_CONTENT,
  fetchAppContentRemote,
  mergeAppContent,
  type MobileAppContent,
} from '../api/appContent';

const STORAGE_KEY = '@urbaevent/app_content_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

type CachedPayload = { content: MobileAppContent; cachedAt: number };

let memoryCache: CachedPayload | null = null;
let inflight: Promise<MobileAppContent> | null = null;
let loadGeneration = 0;

type ContentListener = (content: MobileAppContent) => void;
const listeners = new Set<ContentListener>();

function emit(content: MobileAppContent) {
  listeners.forEach((listener) => listener(content));
}

function isMemoryFresh(): boolean {
  return Boolean(memoryCache && Date.now() - memoryCache.cachedAt < CACHE_TTL_MS);
}

async function readDiskCache(): Promise<CachedPayload | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!parsed?.content) return null;
    return {
      content: mergeAppContent(parsed.content),
      cachedAt: parsed.cachedAt ?? 0,
    };
  } catch {
    return null;
  }
}

async function writeDiskCache(content: MobileAppContent): Promise<void> {
  const payload: CachedPayload = { content, cachedAt: Date.now() };
  memoryCache = payload;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // cache optionnel
  }
}

function isRemoteNewer(remote: MobileAppContent, local: MobileAppContent | null): boolean {
  if (!local?.updatedAt) return true;
  if (!remote.updatedAt) return false;
  return new Date(remote.updatedAt).getTime() > new Date(local.updatedAt).getTime();
}

async function loadAppContent(force = false): Promise<MobileAppContent> {
  if (!force && isMemoryFresh() && memoryCache) {
    return memoryCache.content;
  }

  if (!force && inflight !== null) {
    return inflight;
  }

  const generation = ++loadGeneration;

  inflight = (async () => {
    const disk = await readDiskCache();
    if (disk && !memoryCache) {
      memoryCache = disk;
      emit(disk.content);
    }

    const baseline = memoryCache?.content ?? disk?.content ?? DEFAULT_MOBILE_APP_CONTENT;

    try {
      const remote = await fetchAppContentRemote();
      if (generation !== loadGeneration) return baseline;
      if (force || isRemoteNewer(remote, baseline) || remote.version !== baseline.version) {
        await writeDiskCache(remote);
        if (generation !== loadGeneration) return baseline;
        emit(remote);
        return remote;
      }
      if (!memoryCache) {
        await writeDiskCache(baseline);
      }
      return baseline;
    } catch {
      return baseline;
    } finally {
      if (generation === loadGeneration) {
        inflight = null;
      }
    }
  })();

  return inflight;
}

/** Appelé au boot — cache disque immédiat + refresh réseau en arrière-plan. */
export function prefetchAppContent(force = false): Promise<MobileAppContent> {
  return loadAppContent(force);
}

export async function reloadAppContent(): Promise<MobileAppContent> {
  memoryCache = null;
  return loadAppContent(true);
}

export function useAppContent() {
  const [content, setContent] = useState<MobileAppContent>(
    memoryCache?.content ?? DEFAULT_MOBILE_APP_CONTENT,
  );
  const [loading, setLoading] = useState(!memoryCache);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const next = await reloadAppContent();
      setContent(next);
      return next;
    } catch {
      setContent(DEFAULT_MOBILE_APP_CONTENT);
      return DEFAULT_MOBILE_APP_CONTENT;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onUpdate = (next: MobileAppContent) => setContent(next);
    listeners.add(onUpdate);

    void readDiskCache().then((disk) => {
      if (disk) {
        memoryCache = disk;
        setContent(disk.content);
        setLoading(false);
      }
    });

    loadAppContent(false)
      .then((next) => setContent(next))
      .catch(() => setContent(DEFAULT_MOBILE_APP_CONTENT))
      .finally(() => setLoading(false));

    return () => {
      listeners.delete(onUpdate);
    };
  }, []);

  return { content, loading, reload };
}

export function usePullToRefreshCms() {
  const { reload } = useAppContent();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  return { refreshing, onRefresh };
}

export function useHeroSubtitle(content: MobileAppContent, language: string): string {
  if (language === 'ar') return content.hero.subtitleAr || DEFAULT_MOBILE_APP_CONTENT.hero.subtitleAr;
  if (language === 'en') return content.hero.subtitleEn || DEFAULT_MOBILE_APP_CONTENT.hero.subtitleEn;
  return content.hero.subtitleFr || DEFAULT_MOBILE_APP_CONTENT.hero.subtitleFr;
}

export function usePlatformStats(content: MobileAppContent) {
  return content.platformStats?.length
    ? content.platformStats
    : DEFAULT_MOBILE_APP_CONTENT.platformStats;
}
