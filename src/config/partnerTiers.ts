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

  if (typeof quota === 'boolean') return quota ? 999999 : 0;
  return quota === -1 ? 999999 : quota;
}

/**
 * Vérifie si un partenaire a accès à une fonctionnalité
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


    quotas: {
      appointments: 50,
      eventRegistrations: 10,
      mediaUploads: 30,
      teamMembers: 5,
      standsAllowed: 1,
      promotionalEmails: 5,
      showcaseProducts: 15,
      analyticsAccess: true,
      leadExports: 10,
    },

    features: [
      'Logo en 3ème ligne',
      'Mini-site dédié',
      'Bannière rotative',
      'Section "Top Innovations"',
      'Présence newsletters',
      'Capsules vidéo sponsorisées',
      'Podcast SIB Talks',
      'Interview Live Studio',
      'Testimonial vidéo (1 min)',
      'Stand exposition premium',
      '50 rendez-vous B2B',
      '10 inscriptions événements',
      '30 fichiers média',
      '5 membres d\'équipe',
      'Présentation de 15 produits',
      'Analytics avancées',
      '10 exports leads/mois',
      '5 emails promotionnels/mois',
      'Badge Silver premium',
      'Listing prioritaire annuaire'
    ],

    exclusivePerks: [
      'Logo visible en 3ème ligne prioritaire',
      'Présence dans toutes les newsletters',
      'Mini-site avec actualités complètes',
      'Capsules vidéo "Inside SIB"',
      'Interview audio dans le Podcast',
      'Interview Live Studio "Meet The Leaders"',
      'Vidéo testimonial diffusée',
      '50 rendez-vous mensuels',
      'Emplacement stand prioritaire',
      'Logo sur support communication',
      'Accès VIP conférences',
      'Networking avancé',
      'Session pitch 10 min'
    ]
  },

  gold: {
    id: 'gold',
    name: 'Gold',
    displayName: 'Sponsor Gold',
    price: PARTNER_BILLING.gold.amount,
    color: '#FFD700',
    icon: '🥇',

    quotas: {
      appointments: 100,
      eventRegistrations: 20,
      mediaUploads: 75,
      teamMembers: 10,
      standsAllowed: 2,
      promotionalEmails: 10,
      showcaseProducts: 30,
      analyticsAccess: true,
      leadExports: 50,
    },

    features: [
      'Logo en 2ème ligne',
      'Mini-site premium',
      'Bannière Web rotative',
      'Section "Top Innovations"',
      'Newsletter en 2ème ligne',
      'Capsules vidéo sponsorisées',
      'Podcast SIB Talks',
      'Interview Live Studio',
      'Testimonial vidéo (2 min)',
      'Support prioritaire',
      'Stand exposition VIP (2 stands)',
      '100 rendez-vous B2B',
      '20 inscriptions événements',
      '75 fichiers média',
      '10 membres d\'équipe',
      'Présentation de 30 produits',
      'Analytics premium',
      '50 exports leads/mois',
      '10 emails promotionnels/mois',
      'Badge Gold VIP',
      'Top listing annuaire',
      'Page partenaire personnalisée'
    ],

    exclusivePerks: [
      'Logo visible en 2ème ligne prioritaire',
      'Tous les canaux web & email',
      'Mini-site "SIB Premium Exposure"',
      'Capsules vidéo & brand awareness',
      'Interview audio Podcast',
      'Interview Live Studio prioritaire',
      'Vidéo testimonial 2 min diffusée',
      '100 rendez-vous mensuels',
      'Support technique prioritaire',
      'Emplacement stand premium',
      'Logo grand format communication',
      'Accès VIP tous événements',
      'Networking illimité',
      'Session pitch 20 min',
      'Article blog dédié',
      'Post réseaux sociaux',
      'Invitation soirée gala'
    ]
  },

  platinum: {
    id: 'platinum',
    name: 'Platinum',
    displayName: 'Sponsor Platinum',
    price: PARTNER_BILLING.platinum.amount,
    color: '#E5E4E2',
    icon: '💎',

    quotas: {
      appointments: -1, // illimité
      eventRegistrations: -1, // illimité
      mediaUploads: 200,
      teamMembers: 20,
      standsAllowed: 3,
      promotionalEmails: -1, // illimité
      showcaseProducts: 100,
      analyticsAccess: true,
      leadExports: -1, // illimité
    },

    features: [
      'Logo en 1ère ligne partout',
      'Mini-site premium',
      'Bannière Web rotative',
      'Section "Top Innovations"',
      'Newsletters en 1ère ligne',
      'Webinaires sponsorisés',
      'Capsules vidéo "Inside SIB"',
      'Podcast SIB Talks',
      'Interview Live Studio prioritaire',
      'Testimonial vidéo (3 min)',
      'Support VIP 24/7',
      'Stand exposition Platinum (3 stands)',
      'Rendez-vous B2B illimités',
      'Inscriptions événements illimitées',
      '200 fichiers média',
      '20 membres d\'équipe',
      'Présentation de 100 produits',
      'Analytics intelligence artificielle',
      'Exports leads illimités',
      'Emails promotionnels illimités',
      'Badge Platinum Executive',
      'Featured listing annuaire',
      'Mini-site partenaire personnalisé',
      'Dashboard analytics avancé'
    ],

    exclusivePerks: [
      'Logo en 1ère ligne sur tous les canaux',
      'Mini-site "Premium Exposure" complet',
      'Webinaires sponsorisés avec replay',
      'Capsules vidéo exclusives marquées',
      'Inclusion podcast prioritaire',
      'Interview Live Studio "Meet The Leaders"',
      'Vidéo testimonial 3 min premium',
      'Rendez-vous illimités',
      'Support VIP dédié',
      'Priorité© algorithmique maximale',
      'Emplacement stand premium exclusif',
      'Logo sponsor principal',
      'Accès VIP Executive',
      'Networking illimité premium',
      'Keynote speech 30 min',
      'Série d\'articles blog',
      'Campagne réseaux sociaux dédiée',
      'Invitation soirée gala + tables VIP',
      'Mention sponsors page d\'accueil',
      'Video testimonial',
      'Interview presse',
      'Concierge service dédié'
    ]
  },

  support: {
    id: 'support' as PartnerTier,
    name: 'Support',
    displayName: 'Partenaire de Support',
    price: 15000,
    color: '#2d6a4f',
    icon: '🤝',
    quotas: {
      appointments: 15,
      eventRegistrations: 5,
      mediaUploads: 10,
      teamMembers: 3,
      standsAllowed: 1,
      promotionalEmails: 2,
      showcaseProducts: 5,
      analyticsAccess: false,
      leadExports: 2,
    },
    features: [
      'Logo sur le site',
      'Listing dans catalogue',
      'Stand exposition',
      '15 rendez-vous B2B',
      'Accès conférences',
    ],
    exclusivePerks: [
      'Visibilité partenaire support',
      'Logo sur supports imprimés',
      'Networking événementiel',
    ]
  },

  cultural: {
    id: 'cultural' as PartnerTier,
    name: 'Culturel',
    displayName: 'Partenaire Culturel',
    price: 10000,
    color: '#9b2226',
    icon: '🎭',
    quotas: {
      appointments: 10,
      eventRegistrations: 5,
      mediaUploads: 10,
      teamMembers: 3,
      standsAllowed: 1,
      promotionalEmails: 2,
      showcaseProducts: 5,
      analyticsAccess: false,
      leadExports: 2,
    },
    features: [
      'Logo sur le site',
      'Espace culturel dédié',
      'Listing dans catalogue',
      '10 rendez-vous B2B',
      'Accès conférences',
    ],
    exclusivePerks: [
      'Zone exposition culturelle',
      'Animation culturelle',
      'Logo sur supports imprimés',
    ]
  },

  academic: {
    id: 'academic' as PartnerTier,
    name: 'Académique',
    displayName: 'Partenaire Académique',
    price: 10000,
    color: '#023e8a',
    icon: '🎓',
    quotas: {
      appointments: 10,
      eventRegistrations: 10,
      mediaUploads: 10,
      teamMembers: 5,
      standsAllowed: 1,
      promotionalEmails: 2,
      showcaseProducts: 5,
      analyticsAccess: false,
      leadExports: 2,
    },
    features: [
      'Logo sur le site',
      'Listing dans catalogue',
      'Espace académique',
      '10 rendez-vous B2B',
      '10 inscriptions événements',
      'Présentation recherches',
    ],
    exclusivePerks: [
      'Zone académique dédiée',
      'Présentation académique',
      'Sessions workshops',
      'Networking académique',
    ]
  },

  museum: {
    id: 'museum',
    name: 'Museum',
    displayName: 'Partenaire Musée',
    price: PARTNER_BILLING.museum.amount,
    color: '#8B4513',
    icon: '🏛️',
    quotas: {
      appointments: 20,
      eventRegistrations: 5,
      mediaUploads: 10,
      teamMembers: 3,
      standsAllowed: 1,
      promotionalEmails: 2,
      showcaseProducts: 5,
      analyticsAccess: false,
      leadExports: 2,
    },
    features: [
      'Logo sur le site',
      'Mini-site dédié',
      'Stand exposition standard',
      '20 rendez-vous B2B',
      'Accès conférences',
    ],
    exclusivePerks: [
      'Présence dans la zone Musée',
      'Logo sur supports imprimés',
      'Networking de base',
    ]
  }
};

/**
 * Récupère la configuration d'un niveau partenaire
 */
export function getPartnerTierConfig(tier: PartnerTier | string): PartnerTierConfig {
  return PARTNER_TIERS[tier as PartnerTier] || PARTNER_TIERS.support;
}

/**
 * Récupère le quota pour un type spécifique
 * -1 signifie illimité, retourne un grand nombre pour l'UI
 */
export function getPartnerQuota(tier: PartnerTier | string, quotaType: keyof PartnerTierConfig['quotas']): number {
  const config = getPartnerTierConfig(tier);
  const quota = config.quotas[quotaType];

  if (typeof quota === 'boolean') return quota ? 999999 : 0;
  return quota === -1 ? 999999 : quota;
}

/**
 * Vérifie si un partenaire a accès à une fonctionnalité
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
  if (quota === 999999) return 999999; // illimité
  return Math.max(0, quota - currentUsage);
}

/**
 * Retourne la liste des niveaux partenaires triés par prix
 */
export function getPartnerTiersSorted(): PartnerTierConfig[] {
  return Object.values(PARTNER_TIERS).sort((a, b) => a.price - b.price);
}

/**
 * Vérifie si un upgrade est possible
 */
export function canUpgradeTo(currentTier: PartnerTier | string, targetTier: PartnerTier): boolean {
  const current = getPartnerTierConfig(currentTier);
  const target = getPartnerTierConfig(targetTier);
  return target.price > current.price;
}

/**
 * Calcule le prix d'upgrade (différence entre les deux niveaux)
 */
export function calculateUpgradePrice(currentTier: PartnerTier | string, targetTier: PartnerTier): number {
  const current = getPartnerTierConfig(currentTier);
  const target = getPartnerTierConfig(targetTier);
  return Math.max(0, target.price - current.price);
}

/**
 * Vérifie si le quota est atteint
 */
export function isQuotaReached(
  tier: PartnerTier | string,
  quotaType: keyof PartnerTierConfig['quotas'],
  currentUsage: number
): boolean {
  const remaining = calculatePartnerRemainingQuota(tier, quotaType, currentUsage);
  return remaining === 0;
}

/**
 * Mapping des couleurs pour les badges
 */
export const PARTNER_TIER_COLORS: Record<PartnerTier, string> = {
  press_partner: '#DC143C',
  partner: '#6A5ACD',
  delegated_organizer: '#2E8B57',
  official_sponsor: '#1B6CA8',
  co_organizer: '#B8860B',
  organizer: '#C8A951'
};

/**
 * Ordre des niveaux (pour comparaisons)
 */
export const PARTNER_TIER_ORDER: PartnerTier[] = ['press_partner', 'partner', 'delegated_organizer', 'official_sponsor', 'co_organizer', 'organizer'];

/**
 * Retourne l'index du niveau (pour comparaisons)
 */
export function getPartnerTierIndex(tier: PartnerTier | string): number {
  return PARTNER_TIER_ORDER.indexOf(tier as PartnerTier);
}

/**
 * Compare deux niveaux partenaires
 * Retourne: -1 si tier1 < tier2, 0 si égal, 1 si tier1 > tier2
 */
export function comparePartnerTiers(tier1: PartnerTier | string, tier2: PartnerTier | string): number {
  const index1 = getPartnerTierIndex(tier1);
  const index2 = getPartnerTierIndex(tier2);

  if (index1 < index2) return -1;
  if (index1 > index2) return 1;
  return 0;
}
