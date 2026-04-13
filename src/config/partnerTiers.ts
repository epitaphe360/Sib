/**
 * Configuration des types de partenaires SIB Maroc
 * 6 catÃ©gories : Organisateurs, Co-organisateurs, Sponsor Officiel,
 *                Organisateur DÃ©lÃ©guÃ©, Nos Partenaires, Nos Partenaires Presse
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

  // FonctionnalitÃ©s incluses
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
    icon: 'ðŸ›ï¸',
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
      'AccÃ¨s complet Ã  toutes les zones',
      'Stands illimitÃ©s',
    ],
    exclusivePerks: [
      'Gestion complÃ¨te de l\'Ã©vÃ©nement',
      'VisibilitÃ© maximale sur tous les canaux',
    ],
  },

  co_organizer: {
    id: 'co_organizer',
    name: 'Co-organisateurs',
    displayName: 'Co-organisateurs',
    price: 0,
    color: '#B8860B',
    icon: 'ðŸ¤',
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
      'Logo en 1Ã¨re ligne sur tous les supports',
      'AccÃ¨s VIP complet',
      'Stands multiples',
    ],
    exclusivePerks: [
      'Co-branding officiel de l\'Ã©vÃ©nement',
      'ReprÃ©sentation institutionnelle',
    ],
  },

  official_sponsor: {
    id: 'official_sponsor',
    name: 'Sponsor Officiel',
    displayName: 'Sponsor Officiel',
    price: 0,
    color: '#1B6CA8',
    icon: 'â­',
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
      'Logo en 1Ã¨re ligne partout',
      'Stand exposition premium',
      'Rendez-vous B2B illimitÃ©s',
      'VisibilitÃ© sur tous les supports officiels',
    ],
    exclusivePerks: [
      'Mention "Sponsor Officiel" sur tous les supports',
      'Espace VIP dÃ©diÃ©',
      'PrÃ©sence dans les communications officielles',
    ],
  },

  delegated_organizer: {
    id: 'delegated_organizer',
    name: 'Organisateur DÃ©lÃ©guÃ©',
    displayName: 'Organisateur DÃ©lÃ©guÃ©',
    price: 0,
    color: '#2E8B57',
    icon: 'ðŸ“‹',
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
      'Gestion dÃ©lÃ©guÃ©e d\'une partie du salon',
      'Logo sur les supports de sa zone',
      'AccÃ¨s VIP',
      'Stands dÃ©diÃ©s',
    ],
    exclusivePerks: [
      'ResponsabilitÃ© d\'organisation dÃ©lÃ©guÃ©e',
      'VisibilitÃ© sur sa zone d\'activitÃ©',
    ],
  },

  partner: {
    id: 'partner',
    name: 'Nos Partenaires',
    displayName: 'Nos Partenaires',
    price: 0,
    color: '#6A5ACD',
    icon: 'ðŸŒ',
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
      'AccÃ¨s aux confÃ©rences',
      'PrÃ©sence dans la newsletter',
    ],
    exclusivePerks: [
      'Badge "Partenaire SIB"',
      'Logo sur les supports imprimÃ©s',
      'Networking professionnel',
    ],
  },

  press_partner: {
    id: 'press_partner',
    name: 'Nos Partenaires Presse',
    displayName: 'Nos Partenaires Presse',
    price: 0,
    color: '#DC143C',
    icon: 'ðŸ“°',
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
      'AccrÃ©ditation presse officielle',
      'AccÃ¨s Ã  toutes les confÃ©rences et dÃ©bats',
      'Espace presse dÃ©diÃ©',
      'Diffusion des communiquÃ©s de presse SIB',
    ],
    exclusivePerks: [
      'Badge "Partenaire Presse SIB"',
      'AccÃ¨s aux interviews exclusives',
      'Contenu Ã©ditorial SIB en avant-premiÃ¨re',
    ],
  },
};

/**
 * Récupère la configuration d'un type partenaire
 */
export function getPartnerTierConfig(tier: PartnerTier | string): PartnerTierConfig {
  return PARTNER_TIERS[tier as PartnerTier] || PARTNER_TIERS.partner;
}

/**
 * RÃ©cupÃ¨re le quota pour un type spÃ©cifique
 * -1 signifie illimitÃ©, retourne un grand nombre pour l'UI
 */
export function getPartnerQuota(tier: PartnerTier | string, quotaType: keyof PartnerTierConfig['quotas']): number {
  const config = getPartnerTierConfig(tier);
  const quota = config.quotas[quotaType];

  if (typeof quota === 'boolean') return quota ? 999999 : 0;
  return quota === -1 ? 999999 : quota;
}

/**
 * VÃ©rifie si un partenaire a accÃ¨s Ã  une fonctionnalitÃ©
 */
export function hasPartnerAccess(tier: PartnerTier | string, quotaType: keyof PartnerTierConfig['quotas']): boolean {
  const config = getPartnerTierConfig(tier);
  const quota = config.quotas[quotaType];

  if (typeof quota === 'boolean') return quota;
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
  if (quota === 999999) return 999999;
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
 * VÃ©rifie si le quota est atteint
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
 * VÃ©rifie si un upgrade est possible
 */
export function canUpgradeTo(currentTier: PartnerTier | string, targetTier: PartnerTier): boolean {
  const current = getPartnerTierConfig(currentTier);
  const target = getPartnerTierConfig(targetTier);
  return target.price > current.price;
}

/**
 * Calcule le prix d'upgrade (diffÃ©rence entre les deux niveaux)
 */
export function calculateUpgradePrice(currentTier: PartnerTier | string, targetTier: PartnerTier): number {
  const current = getPartnerTierConfig(currentTier);
  const target = getPartnerTierConfig(targetTier);
  return Math.max(0, target.price - current.price);
}

/**
 * Compare deux niveaux partenaires
 * Retourne: -1 si tier1 < tier2, 0 si Ã©gal, 1 si tier1 > tier2
 */
export function comparePartnerTiers(tier1: PartnerTier | string, tier2: PartnerTier | string): number {
  const index1 = getPartnerTierIndex(tier1);
  const index2 = getPartnerTierIndex(tier2);

  if (index1 < index2) return -1;
  if (index1 > index2) return 1;
  return 0;
}
