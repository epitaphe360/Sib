import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_TIMEOUT_MS = 2500;

async function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), STORAGE_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

/** Migration one-shot depuis SecureStore (limite 2048 o sur Android → sessions Supabase tronquées). */
async function migrateFromSecureStore(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    const legacy = await withTimeout(SecureStore.getItemAsync(key), null);
    if (!legacy) return null;
    await AsyncStorage.setItem(key, legacy);
    await SecureStore.deleteItemAsync(key).catch(() => undefined);
    return legacy;
  } catch {
    return null;
  }
}

/** Stockage auth Supabase — AsyncStorage (pas de limite de taille) avec timeout anti-blocage. */
export const supabaseAuthStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const stored = await withTimeout(AsyncStorage.getItem(key), null);
    if (stored !== null) return stored;
    return migrateFromSecureStore(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await withTimeout(AsyncStorage.setItem(key, value), undefined);
  },
  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key).catch(() => undefined);
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(key).catch(() => undefined);
    }
  },
};
