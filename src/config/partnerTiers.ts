/**
 * Configuration des types de partenaires SIB Maroc
 * 6 catégories : Organisateurs, Co-organisateurs, Sponsor Officiel,
 *                Organisateur Délégué, Nos Partenaires, Nos Partenaires Presse
 */

export type PartnerTier =
  | 'organizer'
  | 'co_organizer'
  | 'official_sponsor'
  | 'delegated_organizer'
  | 'partner'
  | 'press_partner';

export interface PartnerTierConfig {
  id: PartnerTier;
  name: string;
  displayName: string;
  price: number;
  color: string;
  icon: string;

  // Quotas et limites
  quotas: {
    appointments: number;
    eventRegistrations: number;
    mediaUploads: number;
    teamMembers: number;
    standsAllowed: number;
    promotionalEmails: number;
    showcaseProducts: number;
    analyticsAccess: boolean;
    leadExports: number;
  };

  // Fonctionnalités incluses
  features: string[];

  // Avantages exclusifs
  exclusivePerks: string[];
}

export const PARTNER_TIERS: Record<PartnerTier, PartnerTierConfig> = {
  organizer: {
    id: 'organizer',
    name: 'Organisateurs',
    displayName: 'Organisateurs',
    price: 0,
    color: '#C8A951',
    icon: '🏛️',
    quotas: {
      appointments: -1,
      eventRegistrations: -1,
      mediaUploads: -1,
      teamMembers: -1,
      standsAllowed: -1,
      promotionalEmails: -1,
      showcaseProducts: -1,
      analyticsAccess: true,
      leadExports: -1,
    },
    features: [
      'Organisateur principal du salon',
      'Logo en position dominante sur tous les supports',
      'Accès complet à toutes les zones',
      'Stands illimités',
    ],
    exclusivePerks: [
      'Gestion complète de l\'événement',
      'Visibilité maximale sur tous les canaux',
    ],
  },

  co_organizer: {
    id: 'co_organizer',
    name: 'Co-organisateurs',
    displayName: 'Co-organisateurs',
    price: 0,
    color: '#B8860B',
    icon: '🤝',
    quotas: {
      appointments: -1,
      eventRegistrations: -1,
      mediaUploads: -1,
      teamMembers: -1,
      standsAllowed: -1,
      promotionalEmails: -1,
      showcaseProducts: -1,
      analyticsAccess: true,
      leadExports: -1,
    },
    features: [
      'Co-organisation du salon',
      'Logo en 1ère ligne sur tous les supports',
      'Accès VIP complet',
      'Stands multiples',
    ],
    exclusivePerks: [
      'Co-branding officiel de l\'événement',
      'Représentation institutionnelle',
    ],
  },

  official_sponsor: {
    id: 'official_sponsor',
    name: 'Sponsor Officiel',
    displayName: 'Sponsor Officiel',
    price: 0,
    color: '#1B6CA8',
    icon: '⭐',
    quotas: {
      appointments: -1,
      eventRegistrations: -1,
      mediaUploads: 200,
      teamMembers: 20,
      standsAllowed: 3,
      promotionalEmails: -1,
      showcaseProducts: 100,
      analyticsAccess: true,
      leadExports: -1,
    },
    features: [
      'Sponsor principal du salon',
      'Logo en 1ère ligne partout',
      'Stand exposition premium',
      'Rendez-vous B2B illimités',
      'Visibilité sur tous les supports officiels',
    ],
    exclusivePerks: [
      'Mention "Sponsor Officiel" sur tous les supports',
      'Espace VIP dédié',
      'Présence dans les communications officielles',
    ],
  },

  delegated_organizer: {
    id: 'delegated_organizer',
    name: 'Organisateur Délégué',
    displayName: 'Organisateur Délégué',
    price: 0,
    color: '#2E8B57',
    icon: '📋',
    quotas: {
      appointments: -1,
      eventRegistrations: -1,
      mediaUploads: 100,
      teamMembers: 15,
      standsAllowed: 2,
      promotionalEmails: -1,
      showcaseProducts: 50,
      analyticsAccess: true,
      leadExports: -1,
    },
    features: [
      'Gestion déléguée d\'une partie du salon',
      'Logo sur les supports de sa zone',
      'Accès VIP',
      'Stands dédiés',
    ],
    exclusivePerks: [
      'Responsabilité d\'organisation déléguée',
      'Visibilité sur sa zone d\'activité',
    ],
  },

  partner: {
    id: 'partner',
    name: 'Nos Partenaires',
    displayName: 'Nos Partenaires',
    price: 0,
    color: '#6A5ACD',
    icon: '🌐',
    quotas: {
      appointments: 30,
      eventRegistrations: 10,
      mediaUploads: 20,
      teamMembers: 5,
      standsAllowed: 1,
      promotionalEmails: 5,
      showcaseProducts: 15,
      analyticsAccess: false,
      leadExports: 10,
    },
    features: [
      'Logo sur le site officiel',
      'Listing dans le catalogue partenaires',
      'Stand exposition',
      'Accès aux conférences',
      'Présence dans la newsletter',
    ],
    exclusivePerks: [
      'Badge "Partenaire SIB"',
      'Logo sur les supports imprimés',
      'Networking professionnel',
    ],
  },

  press_partner: {
    id: 'press_partner',
    name: 'Nos Partenaires Presse',
    displayName: 'Nos Partenaires Presse',
    price: 0,
    color: '#DC143C',
    icon: '📰',
    quotas: {
      appointments: 10,
      eventRegistrations: 10,
      mediaUploads: 50,
      teamMembers: 5,
      standsAllowed: 0,
      promotionalEmails: 10,
      showcaseProducts: 0,
      analyticsAccess: false,
      leadExports: 5,
    },
    features: [
      'Logo sur le site officiel',
      'Accréditation presse officielle',
      'Accès à toutes les conférences et débats',
      'Espace presse dédié',
      'Diffusion des communiqués de presse SIB',
    ],
    exclusivePerks: [
      'Badge "Partenaire Presse SIB"',
      'Accès aux interviews exclusives',
      'Contenu éditorial SIB en avant-première',
    ],
  },
};

/**
 * Récupère la configuration d'un niveau partenaire

  strategic: {
    id: 'strategic' as PartnerTier,
    name: 'Stratégique',
    displayName: 'Partenaire Stratégique',
    price: 120000,
    color: '#16213e',
    icon: '🎯',
    quotas: {
      appointments: -1,
      eventRegistrations: -1,
      mediaUploads: 200,
      teamMembers: 30,
      standsAllowed: 4,
      promotionalEmails: -1,
      showcaseProducts: 100,
      analyticsAccess: true,
      leadExports: -1,
    },
    features: [
      'Partenaire stratégique officiel',
      'Logo en 1ère ligne',
      'Stand exposition VIP (4 stands)',
      'Rendez-vous B2B illimités',
      'Accès VIP complet',
      'Support prioritaire',
    ],
    exclusivePerks: [
      'Co-branding événementiel',
      'Panel discussion dédié',
      'Networking exclusif',
      'Logo sur communications officielles',
    ]
  },

/**
 * Récupère la configuration d'un type partenaire
 */
export function getPartnerTierConfig(tier: PartnerTier | string): PartnerTierConfig {
  return PARTNER_TIERS[tier as PartnerTier] || PARTNER_TIERS.partner;
}

/**
 * Récupère le quota pour un type spécifique
 * -1 signifie illimité, retourne un grand nombre pour l'UI
 */
export function getPartnerQuota(tier: PartnerTier | string, quotaType: keyof PartnerTierConfig['quotas']): number {
  const config = getPartnerTierConfig(tier);
  const quota = config.quotas[quotaType];

  if (typeof quota === 'boolean') {return quota ? 999999 : 0;}
  return quota === -1 ? 999999 : quota;
}

/**
 * Vérifie si un partenaire a accès à une fonctionnalité
 */
export function hasPartnerAccess(tier: PartnerTier | string, quotaType: keyof PartnerTierConfig['quotas']): boolean {
  const config = getPartnerTierConfig(tier);
  const quota = config.quotas[quotaType];

  if (typeof quota === 'boolean') {return quota;}
  return quota !== 0;
}

/**
 * Calcule le quota restant pour un partenaire
 */
export function calculatePartnerRemainingQuota(
  tier: PartnerTier | string,
  quotaType: keyof PartnerTierConfig['quotas'],
  currentUsage: number
): number {
  const quota = getPartnerQuota(tier, quotaType);
  if (quota === 999999) {return 999999;}
  return Math.max(0, quota - currentUsage);
}

/**
 * Retourne la liste des types partenaires dans l'ordre d'affichage
 */
export function getPartnerTiersSorted(): PartnerTierConfig[] {
  const order: PartnerTier[] = [
    'organizer',
    'co_organizer',
    'official_sponsor',
    'delegated_organizer',
    'partner',
    'press_partner',
  ];
  return order.map((t) => PARTNER_TIERS[t]);
}

/**
 * Vérifie si le quota est atteint
 */
export function isQuotaReached(
  tier: PartnerTier | string,
  quotaType: keyof PartnerTierConfig['quotas'],
  currentUsage: number
): boolean {
  return calculatePartnerRemainingQuota(tier, quotaType, currentUsage) === 0;
}

/**
 * Mapping des couleurs pour les badges
 */
export const PARTNER_TIER_COLORS: Record<PartnerTier, string> = {
  organizer:           '#C8A951',
  co_organizer:        '#B8860B',
  official_sponsor:    '#1B6CA8',
  delegated_organizer: '#2E8B57',
  partner:             '#6A5ACD',
  press_partner:       '#DC143C',
};

/**
 * Ordre d'affichage des types
 */
export const PARTNER_TIER_ORDER: PartnerTier[] = [
  'organizer',
  'co_organizer',
  'official_sponsor',
  'delegated_organizer',
  'partner',
  'press_partner',
];

/**
 * Retourne l'index du type (pour comparaisons)
 */
export function getPartnerTierIndex(tier: PartnerTier | string): number {
  return PARTNER_TIER_ORDER.indexOf(tier as PartnerTier);
}

/**
 * Compare deux niveaux partenaires
 */
export function canUpgradeTo(currentTier: PartnerTier | string, targetTier: PartnerTier): boolean {
  const current = PARTNER_TIERS[currentTier as PartnerTier];
  const target = PARTNER_TIERS[targetTier];
  if (!current || !target) {return false;}
  return target.price > current.price;
}

/**
 * Calcule le prix d'upgrade (différence entre les deux niveaux)
 */
export function calculateUpgradePrice(currentTier: PartnerTier | string, targetTier: PartnerTier): number {
  const current = PARTNER_TIERS[currentTier as PartnerTier];
  const target = PARTNER_TIERS[targetTier];
  if (!current || !target) {return 0;}
  return Math.max(0, target.price - current.price);
}
