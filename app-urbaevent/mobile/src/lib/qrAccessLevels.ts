import { normalizePartnerTierDb } from './partnerTier';

export const ACCESS_LEVELS = {
  visitor_free: { level: 'free', zones: ['public', 'exhibition_hall'] },
  visitor_premium: { level: 'premium', zones: ['public', 'exhibition_hall', 'vip_lounge', 'networking_area'] },
  visitor_vip: { level: 'vip', zones: ['public', 'exhibition_hall', 'vip_lounge', 'networking_area'] },
  exhibitor: { level: 'exhibitor', zones: ['public', 'exhibition_hall', 'stand', 'backstage'] },
  partner_museum: { level: 'museum', zones: ['public', 'exhibition_hall', 'partner_area', 'stand'] },
  partner_silver: { level: 'silver', zones: ['public', 'exhibition_hall', 'partner_area', 'stand', 'vip_lounge'] },
  partner_gold: { level: 'gold', zones: ['public', 'exhibition_hall', 'partner_area', 'stand', 'vip_lounge'] },
  partner_platinium: { level: 'platinium', zones: ['public', 'exhibition_hall', 'partner_area', 'stand', 'vip_lounge', 'backstage'] },
  admin: { level: 'admin', zones: ['*'] },
  security: { level: 'security', zones: ['*'] },
} as const;

export function getAccessKey(user: {
  type: string;
  visitor_level?: string | null;
  partner_tier?: string | null;
  status?: string | null;
}): keyof typeof ACCESS_LEVELS {
  if (user.type === 'admin') return 'admin';
  if (user.type === 'security') return 'security';
  if (user.type === 'exhibitor') return 'exhibitor';
  if (user.type === 'partner') {
    const tier = normalizePartnerTierDb(user.partner_tier);
    const key = `partner_${tier}` as keyof typeof ACCESS_LEVELS;
    return key in ACCESS_LEVELS ? key : 'partner_museum';
  }
  const vl =
    user.status === 'pending_payment' ? 'free' : (user.visitor_level ?? 'free');
  if (vl === 'premium' || vl === 'vip') return 'visitor_premium';
  return 'visitor_free';
}

export function checkZoneAccess(
  userType: string,
  userLevel: string | null | undefined,
  partnerTier: string | null | undefined,
  requiredZone: string,
  status?: string | null,
): boolean {
  const key = getAccessKey({
    type: userType,
    visitor_level: userLevel,
    partner_tier: partnerTier,
    status,
  });
  const zones = ACCESS_LEVELS[key].zones as readonly string[];
  return zones.includes('*') || zones.includes(requiredZone);
}
