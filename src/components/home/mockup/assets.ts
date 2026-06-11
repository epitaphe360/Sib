import { resolveHomeImage } from '../../../config/sibMaRemoteUrls';

/** Assets maquette — résolus vers le CDN sib.ma */
export const MOCKUP_ASSETS = {
  heroPhoto: resolveHomeImage('/mockup/hero-photo.jpg'),
  portraits: [
    resolveHomeImage('/mockup/portrait-1.jpg'),
    resolveHomeImage('/mockup/portrait-2.jpg'),
    resolveHomeImage('/mockup/portrait-3.jpg'),
    resolveHomeImage('/mockup/portrait-4.jpg'),
  ] as const,
  salonCards: [
    resolveHomeImage('/mockup/salon-card-1.jpg'),
    resolveHomeImage('/mockup/salon-card-2.jpg'),
    resolveHomeImage('/mockup/salon-card-3.jpg'),
    resolveHomeImage('/mockup/salon-card-4.jpg'),
    resolveHomeImage('/mockup/salon-card-5.jpg'),
    resolveHomeImage('/mockup/salon-card-6.jpg'),
  ] as const,
  reserve: resolveHomeImage('/mockup/reserve-bg.jpg'),
} as const;

export const MOCKUP_CARD_KEYS = ['exposer', 'visiter', 'sib_talks', 'b2b', 'diner', 'international'] as const;

export function getMockupCardBg(key: string): string {
  const idx = MOCKUP_CARD_KEYS.indexOf(key as (typeof MOCKUP_CARD_KEYS)[number]);
  return MOCKUP_ASSETS.salonCards[idx >= 0 ? idx : 0];
}

/** Image carte complète (texte inclus) — menu dropdown uniquement */
export function getMockupCardImage(key: string): string {
  return getMockupCardBg(key);
}
