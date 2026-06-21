/** Tiers partenaires en base (QR / badge) */
export type PartnerTierDb = 'museum' | 'silver' | 'gold' | 'platinium';

/** Tiers réseautage (alignés web) */
export type PartnerTierNetworking = 'bronze' | 'silver' | 'gold' | 'platinum';

export function normalizePartnerTierDb(tier?: string | null): PartnerTierDb {
  const t = (tier ?? 'museum').toLowerCase();
  if (t === 'bronze') return 'museum';
  if (t === 'platinum') return 'platinium';
  if (t === 'museum' || t === 'silver' || t === 'gold' || t === 'platinium') return t;
  return 'museum';
}

export function partnerTierForNetworking(tier?: string | null): PartnerTierNetworking {
  const db = normalizePartnerTierDb(tier);
  if (db === 'museum') return 'bronze';
  if (db === 'platinium') return 'platinum';
  return db;
}
