import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppUser } from '../types';

const KEY = '@urbaevent/user-profile-cache';

export async function readCachedAppUser(userId: string): Promise<AppUser | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppUser;
    return parsed?.id === userId ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeCachedAppUser(user: AppUser): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    // cache optionnel
  }
}

export async function clearCachedAppUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
