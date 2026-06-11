/** Visuels SIB 2026 — CDN sib.ma (npm run build:figma pour assets locaux optionnels) */

import { FLAG_ICONS, resolveHomeImage } from '../../../config/sibMaRemoteUrls';

function asset(name: string): { webp: string; jpg: string; src: string; srcSet: string } {
  const jpg = resolveHomeImage(`/mockup/${name}.jpg`);
  return {
    webp: jpg,
    jpg,
    src: jpg,
    srcSet: `${jpg} 1x, ${jpg} 2x`,
  };
}

export const SIB2026_ASSETS = {
  hero: asset('hero-hall'),
  hero2k: asset('hero-hall-2k'),
  portraits: [
    asset('portrait-1'),
    asset('portrait-2'),
    asset('portrait-3'),
    asset('portrait-4'),
  ],
  timeline: [
    asset('timeline-1'),
    asset('timeline-2'),
    asset('timeline-3'),
    asset('timeline-4'),
    asset('timeline-5'),
  ],
  reservePhoto: asset('reserve-photo'),
  salonCards: {
    exposer: asset('salon-card-1'),
    visiter: asset('salon-card-2'),
    sib_talks: asset('salon-card-3'),
    b2b: asset('salon-card-4'),
    diner: asset('salon-card-5'),
    international: asset('salon-card-6'),
  },
  flags: FLAG_ICONS,
} as const;

export type ImageAsset = ReturnType<typeof asset>;
export type SalonCardKey = keyof typeof SIB2026_ASSETS.salonCards;

const CARD_KEY_ORDER = ['exposer', 'visiter', 'sib_talks', 'b2b', 'diner', 'international'] as const;

const SALON_CARD_PHOTOS: Record<(typeof CARD_KEY_ORDER)[number], string> = {
  exposer: resolveHomeImage('/sib-ma/2_1e3351c897.png'),
  visiter: resolveHomeImage('/sib-ma/7_7474f5a087.png'),
  sib_talks: resolveHomeImage('/sib-ma/3_c9f5820a94.png'),
  b2b: resolveHomeImage('/sib-ma/4_9d2cb5a776.png'),
  diner: resolveHomeImage('/sib-ma/1_a559ea5363.png'),
  international: resolveHomeImage('/sib-ma/5_833920f28a.png'),
};

export function getSalonCardBg(key: string, forceMockup = false): { webp: string; jpg: string } {
  if (!forceMockup && key in SALON_CARD_PHOTOS) {
    const src = SALON_CARD_PHOTOS[key as (typeof CARD_KEY_ORDER)[number]];
    return { webp: src, jpg: src };
  }
  const idx = CARD_KEY_ORDER.indexOf(key as (typeof CARD_KEY_ORDER)[number]);
  const n = idx >= 0 ? idx + 1 : 1;
  const src = resolveHomeImage(`/mockup/salon-card-${n}.jpg`);
  return { webp: src, jpg: src };
}
