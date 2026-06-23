import type { ImageSourcePropType } from 'react-native';

/** Logo master local — aligné référence Play Store com.urbavent */
export const BRAND_LOGO_LOCAL = require('../../assets/brand/urbaevent-logo-master.png') as ImageSourcePropType;

/** Logos badge par défaut (bundlés — pas de dépendance HTTP sib2026.ma) */
export const BADGE_LOGO_LOCAL = {
  'logo-sib2026': require('../../assets/brand/logo-sib2026.png') as ImageSourcePropType,
  'logo-ministere': require('../../assets/brand/logo-ministere.png') as ImageSourcePropType,
} as const;

export type BadgeLogoKey = keyof typeof BADGE_LOGO_LOCAL;

export const BRAND_COLORS = {
  primary: '#1B365D',
  accent: '#4598D1',
  platformBg: '#F9F9FF',
} as const;

export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.urbacom.urbaevent';

export function getBrandLogoSource(remoteUrl?: string | null): ImageSourcePropType | { uri: string } {
  if (remoteUrl?.startsWith('http')) return { uri: remoteUrl };
  return BRAND_LOGO_LOCAL;
}

/** Résout un logo badge (URL distante, brand:// local, ou fallback castor UrbaEvent). */
export function getBadgeLogoSource(pathOrUrl?: string | null): ImageSourcePropType | { uri: string } | null {
  if (!pathOrUrl?.trim()) return null;
  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return { uri: trimmed };
  const brandKey = trimmed
    .replace(/^brand:\/\//, '')
    .replace(/^\/+/, '')
    .replace(/\.png$/i, '') as BadgeLogoKey;
  if (brandKey in BADGE_LOGO_LOCAL) return BADGE_LOGO_LOCAL[brandKey];
  return getBrandLogoSource(null);
}
