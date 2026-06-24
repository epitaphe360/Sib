import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Salon } from '../types';
import { resolveSalonThemeKey } from '../data/urbaCatalog';

export type SalonEventWindow = {
  validFrom: Date;
  validUntil: Date;
  label: string;
};

const SALON_EVENT_WINDOWS: Record<string, SalonEventWindow> = {
  sib: {
    validFrom: new Date('2026-11-25T08:00:00+01:00'),
    validUntil: new Date('2026-11-29T23:59:59+01:00'),
    label: '25–29 novembre 2026',
  },
  sir: {
    validFrom: new Date('2026-06-01T08:00:00+01:00'),
    validUntil: new Date('2026-06-30T23:59:59+01:00'),
    label: 'Juin 2026',
  },
  sip: {
    validFrom: new Date('2027-03-01T08:00:00+01:00'),
    validUntil: new Date('2027-03-31T23:59:59+01:00'),
    label: 'Mars 2027',
  },
  btp: {
    validFrom: new Date('2026-09-01T08:00:00+01:00'),
    validUntil: new Date('2026-09-30T23:59:59+01:00'),
    label: 'Septembre 2026',
  },
  sie: {
    validFrom: new Date('2027-10-01T08:00:00+01:00'),
    validUntil: new Date('2027-10-31T23:59:59+01:00'),
    label: 'Octobre 2027',
  },
};

export function getSalonEventWindow(salon: Pick<Salon, 'id' | 'slug' | 'code'>): SalonEventWindow | null {
  const key = resolveSalonThemeKey(salon);
  return SALON_EVENT_WINDOWS[key] ?? null;
}

export async function getActiveSalonEventWindow(): Promise<SalonEventWindow | null> {
  const salonId = await AsyncStorage.getItem('@urbaevent/active_salon_id');
  if (!salonId) return SALON_EVENT_WINDOWS.sib;
  const key = salonId.trim().toLowerCase();
  if (SALON_EVENT_WINDOWS[key]) return SALON_EVENT_WINDOWS[key];
  return null;
}

export function applyEventWindowToBadge<T extends { validFrom: Date; validUntil: Date }>(
  badge: T,
  window: SalonEventWindow | null
): T {
  if (!window) return badge;
  return { ...badge, validFrom: window.validFrom, validUntil: window.validUntil };
}
