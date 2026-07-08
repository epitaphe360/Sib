import AsyncStorage from '@react-native-async-storage/async-storage';
import { SALONS, DEFAULT_SALON_ID } from '../data/salons';
import type { Salon } from '../types';

const STORAGE_KEY = '@urbaevent/active_salon_id';
const LEGACY_KEY = '@sib/active_salon_id';
const SALONS_CACHE_KEY = '@urbaevent/salons';

async function resolveFromSalonList(id: string, list: Salon[]): Promise<{ salonId: string; salonName: string } | null> {
  const match = list.find(
    (s) => s.id === id || s.slug === id || s.code.toLowerCase() === id.toLowerCase(),
  );
  if (!match) return null;
  return {
    salonId: match.slug ?? match.id,
    salonName: match.name,
  };
}

/** Salon actif pour catégoriser un scan (slug stable pour stats). */
export async function resolveSalonForScan(): Promise<{ salonId: string; salonName: string }> {
  let id = (await AsyncStorage.getItem(STORAGE_KEY)) ?? (await AsyncStorage.getItem(LEGACY_KEY));
  if (!id) id = DEFAULT_SALON_ID;

  try {
    const raw = await AsyncStorage.getItem(SALONS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { items?: Salon[] };
      const fromCache = await resolveFromSalonList(id, parsed.items ?? []);
      if (fromCache) return fromCache;
    }
  } catch {
    // ignore cache parse errors
  }

  const fromStatic = await resolveFromSalonList(id, SALONS);
  if (fromStatic) return fromStatic;

  return {
    salonId: id,
    salonName: id.toUpperCase(),
  };
}
