import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_SALON_KEY = '@urbaevent/pending_salon_id';
const PENDING_SALON_BADGE_KEY = '@urbaevent/pending_salon_badge';

export async function savePendingSalonEntry(salonId: string, openBadge = false): Promise<void> {
  await AsyncStorage.setItem(PENDING_SALON_KEY, salonId);
  if (openBadge) {
    await AsyncStorage.setItem(PENDING_SALON_BADGE_KEY, '1');
  } else {
    await AsyncStorage.removeItem(PENDING_SALON_BADGE_KEY);
  }
}

export async function consumePendingSalonEntry(): Promise<{ salonId: string; openBadge: boolean } | null> {
  const salonId = await AsyncStorage.getItem(PENDING_SALON_KEY);
  if (!salonId) return null;
  const openBadge = (await AsyncStorage.getItem(PENDING_SALON_BADGE_KEY)) === '1';
  await AsyncStorage.multiRemove([PENDING_SALON_KEY, PENDING_SALON_BADGE_KEY]);
  return { salonId, openBadge };
}
