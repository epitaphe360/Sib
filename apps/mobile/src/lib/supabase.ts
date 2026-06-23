import '../lib/cryptoPolyfill';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  Constants.expoConfig?.extra?.supabaseUrl ??
  '';

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const STORAGE_TIMEOUT_MS = 4000;

/** SecureStore peut bloquer au démarrage sur certains Android — fallback AsyncStorage. */
async function withStorageFallback<T>(
  secureOp: () => Promise<T>,
  fallbackOp: () => Promise<T>,
): Promise<T> {
  try {
    return await Promise.race([
      secureOp(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('SecureStore timeout')), STORAGE_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return fallbackOp();
  }
}

const SecureStoreAdapter = {
  getItem: (key: string) =>
    withStorageFallback(
      () => SecureStore.getItemAsync(key),
      () => AsyncStorage.getItem(key),
    ),
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: SecureStoreAdapter } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
