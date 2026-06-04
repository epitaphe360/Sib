/**
 * Images embarquées dans l'APK (assets/images/) + URLs de secours en ligne.
 */
import { ImageSourcePropType } from 'react-native';

const local = {
  hero: require('../../assets/images/hero.jpg'),
  networking: require('../../assets/images/networking.jpg'),
  expo: require('../../assets/images/expo.jpg'),
  morocco: require('../../assets/images/morocco.jpg'),
  conference: require('../../assets/images/conference.jpg'),
  construction: require('../../assets/images/construction.jpg'),
  architecture: require('../../assets/images/architecture.jpg'),
  banner: require('../../assets/images/banner.jpg'),
} as const satisfies Record<string, ImageSourcePropType>;

export type ImageKey = keyof typeof local;

export const APP_IMAGES = local;

export const SALON_IMAGES: Record<string, ImageSourcePropType> = {
  sib: local.hero,
  sir: local.architecture,
  sip: local.morocco,
  btp: local.construction,
  sie: local.expo,
};

export const EVENT_TYPE_IMAGES: Record<string, ImageSourcePropType> = {
  conference: local.conference,
  workshop: local.networking,
  keynote: local.expo,
  default: local.conference,
};

export function eventImage(type?: string): ImageSourcePropType {
  const key = (type ?? 'default').toLowerCase();
  return EVENT_TYPE_IMAGES[key] ?? EVENT_TYPE_IMAGES.default;
}
