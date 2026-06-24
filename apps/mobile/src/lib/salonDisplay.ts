import type { ImageSourcePropType } from 'react-native';
import { SALON_LOGO_LOCAL } from '../config/brandAssets';
import { getUrbaSalonTheme, resolveSalonThemeKey } from '../data/urbaCatalog';
import type { Salon } from '../types';

/** Retire les suffixes redondants « (SIB) », « — SIB », etc. */
export function cleanSalonName(name: string): string {
  return name
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s*—\s*SIB\s*$/i, '')
    .replace(/\s*-\s*SIB\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSalonBrandLogo(salon: Salon): ImageSourcePropType | null {
  const key = resolveSalonThemeKey(salon);
  if (key === 'sib') return SALON_LOGO_LOCAL.sib;
  return getUrbaSalonTheme(salon).image ?? null;
}

export function getSalonEditionLabel(salon: Salon): string | undefined {
  return salon.edition?.trim() || getUrbaSalonTheme(salon).edition || undefined;
}
