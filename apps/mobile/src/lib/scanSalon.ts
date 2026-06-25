import AsyncStorage from '@react-native-async-storage/async-storage';
import { SALONS, DEFAULT_SALON_ID } from '../data/salons';

const STORAGE_KEY = '@urbaevent/active_salon_id';
const LEGACY_KEY = '@sib/active_salon_id';

/** Salon actif pour catégoriser un scan (SIB par défaut si aucun salon choisi). */
export async function resolveSalonForScan(): Promise<{ salonId: string; salonName: string }> {
  let id = (await AsyncStorage.getItem(STORAGE_KEY)) ?? (await AsyncStorage.getItem(LEGACY_KEY));
  if (!id) id = DEFAULT_SALON_ID;

  const fromList = SALONS.find((s) => s.id === id);
  return {
    salonId: id,
    salonName: fromList?.name ?? id.toUpperCase(),
  };
}
