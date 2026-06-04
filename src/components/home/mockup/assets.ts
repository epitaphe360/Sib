/** Assets extraits de la maquette HD */
export const MOCKUP_ASSETS = {
  heroPhoto: '/mockup/hero-photo.jpg',
  portraits: [
    '/mockup/portrait-1.jpg',
    '/mockup/portrait-2.jpg',
    '/mockup/portrait-3.jpg',
    '/mockup/portrait-4.jpg',
  ] as const,
  salonCards: [
    '/mockup/salon-card-1.jpg',
    '/mockup/salon-card-2.jpg',
    '/mockup/salon-card-3.jpg',
    '/mockup/salon-card-4.jpg',
    '/mockup/salon-card-5.jpg',
    '/mockup/salon-card-6.jpg',
  ] as const,
  reserve: '/mockup/reserve-bg.jpg',
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
