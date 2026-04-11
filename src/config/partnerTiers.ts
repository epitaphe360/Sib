/**
 * Configuration des niveaux partenaires et leurs quotas
 * 8 catégories : Égide, Stratégique, Platinum, Gold, Silver, Support, Culturel, Académique
 *
 * ✅ FIX P0-3: Import des montants depuis Single Source of Truth
 */

import { PARTNER_BILLING } from './partnerBilling';

export type PartnerTier = 'egide' | 'strategic' | 'platinum' | 'gold' | 'silver' | 'support' | 'cultural' | 'academic' | 'museum';

export interface PartnerTierConfig {
  id: PartnerTier;
  name: string;
  displayName: string;
  price: number; // en USD
  color: string;
  icon: string;

  // Quotas et limites
  quotas: {
    appointments: number;          // Nombre de RDV B2B
    eventRegistrations: number;    // Inscriptions aux événements
    mediaUploads: number;          // Fichiers média (vidéos, brochures)
    teamMembers: number;           // Nombre de membres d'équipe
    standsAllowed: number;         // Nombre de stands autorisés
    promotionalEmails: number;     // Emails promotionnels par mois
    showcaseProducts: number;      // Produits/services à présenter
    analyticsAccess: boolean;      // Accès aux analytics avancées
    leadExports: number;           // Exports de leads par mois
  };

  // Fonctionnalités incluses
  features: string[];

  // Avantages exclusifs
  exclusivePerks: string[];
}

export const PARTNER_TIERS: Record<PartnerTier, PartnerTierConfig> = {
  egide: {
    id: 'egide' as PartnerTier,
    name: 'Égide',
    displayName: 'Partenaire Égide',
    price: 150000,
    color: '#1a1a2e',
    icon: '🛡️',
    quotas: {
      appointments: -1,
      eventRegistrations: -1,
      mediaUploads: -1,
      teamMembers: 50,
      standsAllowed: 5,
      promotionalEmails: -1,
      showcaseProducts: -1,
      analyticsAccess: true,
      leadExports: -1,
    },
    features: [
      'Partenaire principal de l\'événement',
      'Logo en position dominante partout',
      'Naming rights sur zones clés',
      'Stand exposition premium (5 stands)',
      'Rendez-vous B2B illimités',
      'Accès VIP Executive complet',
      'Support VIP 24/7 dédié',
    ],
    exclusivePerks: [
      'Naming rights "Powered by"',
      'Keynote d\'ouverture',
      'Logo sur tous les supports',
      'Espace VIP exclusif',
      'Concierge dédié',
    ]
  },

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

  silver: {
    id: 'silver' as PartnerTier,
    name: 'Silver',
    displayName: 'Sponsor Silver',
    price: PARTNER_BILLING.silver.amount,
    color: '#C0C0C0',
    icon: '🥈',

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
  egide: '#1a1a2e',
  strategic: '#16213e',
  platinum: '#E5E4E2',
  gold: '#FFD700',
  silver: '#C0C0C0',
  support: '#2d6a4f',
  cultural: '#9b2226',
  academic: '#023e8a',
  museum: '#8B4513'
};

/**
 * Ordre des niveaux (pour comparaisons)
 */
export const PARTNER_TIER_ORDER: PartnerTier[] = ['academic', 'cultural', 'museum', 'support', 'silver', 'gold', 'platinum', 'strategic', 'egide'];

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
