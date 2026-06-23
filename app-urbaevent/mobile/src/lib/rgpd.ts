import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RgpdConsent } from '../types';

const RGPD_KEY = '@sib/rgpd_consent';
const RGPD_VERSION = '1.0';

export async function getRgpdConsent(): Promise<RgpdConsent | null> {
  try {
    const raw = await AsyncStorage.getItem(RGPD_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RgpdConsent;
  } catch {
    return null;
  }
}

export async function saveRgpdConsent(accepted: boolean): Promise<void> {
  const consent: RgpdConsent = {
    accepted,
    date: new Date().toISOString(),
    version: RGPD_VERSION,
  };
  await AsyncStorage.setItem(RGPD_KEY, JSON.stringify(consent));
}

export async function hasAcceptedRgpd(): Promise<boolean> {
  const consent = await getRgpdConsent();
  if (!consent) return false;
  return consent.accepted && consent.version === RGPD_VERSION;
}

export async function clearRgpdConsent(): Promise<void> {
  await AsyncStorage.removeItem(RGPD_KEY);
}
