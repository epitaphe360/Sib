import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@urbaevent/cache/';

export interface CacheEntry<T> {
  data: T;
  savedAt: number;
  expiresAt: number;
}

export async function saveCache<T>(key: string, data: T, ttlMs = 4 * 60 * 60 * 1000): Promise<void> {
  const now = Date.now();
  const entry: CacheEntry<T> = { data, savedAt: now, expiresAt: now + ttlMs };
  await AsyncStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry));
}

export async function loadCache<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(`${PREFIX}${key}`);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() > entry.expiresAt) {
      await AsyncStorage.removeItem(`${PREFIX}${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function clearCache(key: string): Promise<void> {
  await AsyncStorage.removeItem(`${PREFIX}${key}`);
}

export const CACHE_KEYS = {
  events: 'events',
  exhibitors: 'exhibitors',
  connections: 'connections',
  scanHistory: 'scan-history',
} as const;
