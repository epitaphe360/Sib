/**
 * Images embarquées dans l'APK — photos professionnelles SIB / salons uniquement.
 * Pas de stock Unsplash (paysages, fleurs, etc.).
 */
import { ImageSourcePropType } from 'react-native';

const hero = require('../../assets/images/sib-ma-hero-bg.jpg');
const banner = require('../../assets/images/sib-ma-banner-bg.jpg');
const hall = require('../../assets/images/hall.jpg');
const b2b = require('../../assets/images/b2b.jpg');
const inauguration = require('../../assets/images/inauguration.jpg');
const section = require('../../assets/images/sib-ma-section02.jpg');
const plan = require('../../assets/images/plan.jpg');
const conference = require('../../assets/images/conference.jpg');
const construction = require('../../assets/images/construction.jpg');
const networking = require('../../assets/images/networking.jpg');

const local = {
  hero,
  networking,
  expo: hall,
  morocco: hall,
  conference,
  construction,
  architecture: section,
  banner,
  logoSib: require('../../assets/images/logo-sib-salon.png'),
  inauguration,
  plan,
  b2b,
  hall,
} as const satisfies Record<string, ImageSourcePropType>;

export type ImageKey = keyof typeof local;

export const APP_IMAGES = local;

/** Visuels salons — hall, stands, B2B, chantier (aucune photo décorative). */
export const SALON_IMAGES: Record<string, ImageSourcePropType> = {
  sib: hall,
  sir: b2b,
  sip: inauguration,
  btp: construction,
  sie: section,
};

export const EVENT_TYPE_IMAGES: Record<string, ImageSourcePropType> = {
  conference,
  workshop: conference,
  keynote: inauguration,
  default: hero,
};

export function eventImage(type?: string): ImageSourcePropType {
  const key = (type ?? 'default').toLowerCase();
  return EVENT_TYPE_IMAGES[key] ?? EVENT_TYPE_IMAGES.default;
}
