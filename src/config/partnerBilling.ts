/**
 * ✅ SINGLE SOURCE OF TRUTH pour les montants et configurations partenaires
 *
 * Ce fichier est la SEULE source de vérité pour tous les montants partenaires.
 * Tous les autres fichiers DOIVENT importer depuis ici.
 *
 * ⚠️ NE PAS dupliquer les montants ailleurs - toujours importer depuis ce fichier
 *
 * FIX P0-3: Correction du défaut de conception "pas de single source of truth"
 */

export type PartnerTier = 'egide' | 'strategic' | 'platinum' | 'gold' | 'silver' | 'support' | 'cultural' | 'academic' | 'museum';

export interface PartnerBillingConfig {
  tier: PartnerTier;
  amount: number;              // Montant en USD
  currency: 'USD';
  displayName: string;
  description: string;
  features: string[];
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
  exclusivePerks: string[];
  color: string;
  icon: string;
}

/**
 * ✅ SOURCE UNIQUE DE VÉRITÉ - Configuration complète des tiers partenaires
 *
 * Tous les montants, quotas et fonctionnalités sont définis ici
 */
export const PARTNER_BILLING: Record<PartnerTier, PartnerBillingConfig> = {
  egide: {
    tier: 'egide' as PartnerTier,
    amount: 150000,
    currency: 'USD',
    displayName: 'Égide',
    description: 'Partenaire Égide - Patron principal de l\'événement',
    features: ['Naming rights', 'Stands illimités', 'Keynote d\'ouverture', 'Concierge dédié'],
    quotas: { appointments: -1, eventRegistrations: -1, mediaUploads: -1, teamMembers: 50, standsAllowed: 5, promotionalEmails: -1, showcaseProducts: -1, analyticsAccess: true, leadExports: -1 },
    exclusivePerks: ['Naming rights', 'Espace VIP exclusif', 'Concierge dédié'],
    color: '#1a1a2e',
    icon: '🛡️'
  },

  strategic: {
    tier: 'strategic' as PartnerTier,
    amount: 120000,
    currency: 'USD',
    displayName: 'Partenaire Stratégique',
    description: 'Partenaire Stratégique - Co-branding événementiel',
    features: ['Co-branding', '4 stands', 'Panel discussion', 'Accès VIP complet'],
    quotas: { appointments: -1, eventRegistrations: -1, mediaUploads: 200, teamMembers: 30, standsAllowed: 4, promotionalEmails: -1, showcaseProducts: 100, analyticsAccess: true, leadExports: -1 },
    exclusivePerks: ['Co-branding', 'Panel discussion dédié', 'Networking exclusif'],
    color: '#16213e',
    icon: '🎯'
  },

  museum: {
    tier: 'museum',
    amount: 20000,
    currency: 'USD',
    displayName: 'Museum Partner',
    description: 'Partenariat Museum - Visibilité de base',
    features: [
      '1 stand de 9m²',
      '10 rendez-vous B2B',
      '3 membres d\'équipe',
      'Logo sur site web',
      'Listing dans catalogue'
    ],
    quotas: {
      appointments: 20,
      eventRegistrations: 5,
      mediaUploads: 10,
      teamMembers: 3,
      standsAllowed: 1,
      promotionalEmails: 5,
      showcaseProducts: 5,
      analyticsAccess: false,
      leadExports: 50
    },
    exclusivePerks: [
      'Badge "Museum Partner"',
      'Accès zone partenaires',
      'Newsletter mensuelle',
      'Logo dans programme officiel'
    ],
    color: '#8B4513',
    icon: '🏛️'
  },

  silver: {
    tier: 'silver',
    amount: 48000,
    currency: 'USD',
    displayName: 'Silver Partner',
    description: 'Partenariat Silver - Visibilité renforcée',
    features: [
      '2 stands de 18m² total',
      '30 rendez-vous B2B',
      '5 membres d\'équipe',
      'Logo premium sur site',
      'Article de blog dédié',
      'Présence réseaux sociaux'
    ],
    quotas: {
      appointments: 50,
      eventRegistrations: 10,
      mediaUploads: 30,
      teamMembers: 5,
      standsAllowed: 2,
      promotionalEmails: 15,
      showcaseProducts: 15,
      analyticsAccess: true,
      leadExports: 200
    },
    exclusivePerks: [
      'Badge "Silver Partner" premium',
      'Accès VIP salons networking',
      'Newsletter hebdomadaire',
      'Logo page d\'accueil',
      'Mention dans communiqués presse',
      'Invitations événements privés'
    ],
    color: '#C0C0C0',
    icon: '🥈'
  },

  gold: {
    tier: 'gold',
    amount: 68000,
    currency: 'USD',
    displayName: 'Gold Partner',
    description: 'Partenariat Gold - Visibilité maximale',
    features: [
      '3 stands de 27m² total',
      '50 rendez-vous B2B',
      '8 membres d\'équipe',
      'Logo premium + bannière',
      'Conférence dédiée 30min',
      'Campagne email dédiée',
      'Article de presse'
    ],
    quotas: {
      appointments: 100,
      eventRegistrations: 20,
      mediaUploads: 100,
      teamMembers: 8,
      standsAllowed: 3,
      promotionalEmails: 30,
      showcaseProducts: 30,
      analyticsAccess: true,
      leadExports: 500
    },
    exclusivePerks: [
      'Badge "Gold Partner" exclusif',
      'Accès backstage et VIP',
      'Newsletter quotidienne',
      'Logo bannière homepage',
      'Présentation keynote 30min',
      'Campagne marketing dédiée',
      'Article presse sponsorisé',
      'Accès données analytics avancées'
    ],
    color: '#FFD700',
    icon: '🥇'
  },

  platinum: {
    tier: 'platinum',
    amount: 98000,
    currency: 'USD',
    displayName: 'Platinum Partner',
    description: 'Partenariat Platinum - Visibilité VIP exclusive',
    features: [
      '5 stands de 45m² total',
      'Rendez-vous B2B illimités',
      '15 membres d\'équipe',
      'Logo VIP + bannière homepage',
      'Keynote 60min',
      'Campagne marketing complète',
      'Communiqué de presse officiel',
      'Invitations gala VIP'
    ],
    quotas: {
      appointments: -1, // Illimité
      eventRegistrations: 50,
      mediaUploads: 500,
      teamMembers: 15,
      standsAllowed: 5,
      promotionalEmails: 100,
      showcaseProducts: 100,
      analyticsAccess: true,
      leadExports: -1 // Illimité
    },
    exclusivePerks: [
      'Badge "Platinum Partner" VIP',
      'Accès tous espaces premium',
      'Newsletter temps réel',
      'Logo géant homepage + bannières',
      'Keynote principale 60min',
      'Campagne 360° complète',
      'Communiqué de presse co-signé',
      'Invitations exclusives gala',
      'Concierge service dédié',
      'Analytics temps réel illimité',
      'Collaboration éditoriale',
      'Co-branding événement'
    ],
    color: '#E5E4E2',
    icon: '💎'
  },

  support: {
    tier: 'support' as PartnerTier,
    amount: 15000,
    currency: 'USD',
    displayName: 'Partenaire de Support',
    description: 'Partenaire de Support - Soutien logistique et technique',
    features: ['1 stand', '15 RDV B2B', 'Logo sur site', 'Accès conférences'],
    quotas: { appointments: 15, eventRegistrations: 5, mediaUploads: 10, teamMembers: 3, standsAllowed: 1, promotionalEmails: 2, showcaseProducts: 5, analyticsAccess: false, leadExports: 2 },
    exclusivePerks: ['Visibilité partenaire support', 'Logo supports imprimés'],
    color: '#2d6a4f',
    icon: '🤝'
  },

  cultural: {
    tier: 'cultural' as PartnerTier,
    amount: 10000,
    currency: 'USD',
    displayName: 'Partenaire Culturel',
    description: 'Partenaire Culturel - Animation et patrimoine',
    features: ['Espace culturel', '10 RDV B2B', 'Logo sur site', 'Animation culturelle'],
    quotas: { appointments: 10, eventRegistrations: 5, mediaUploads: 10, teamMembers: 3, standsAllowed: 1, promotionalEmails: 2, showcaseProducts: 5, analyticsAccess: false, leadExports: 2 },
    exclusivePerks: ['Zone exposition culturelle', 'Animation culturelle'],
    color: '#9b2226',
    icon: '🎭'
  },

  academic: {
    tier: 'academic' as PartnerTier,
    amount: 10000,
    currency: 'USD',
    displayName: 'Partenaire Académique',
    description: 'Partenaire Académique - Recherche et formation',
    features: ['Espace académique', '10 RDV B2B', 'Présentation recherches', 'Workshops'],
    quotas: { appointments: 10, eventRegistrations: 10, mediaUploads: 10, teamMembers: 5, standsAllowed: 1, promotionalEmails: 2, showcaseProducts: 5, analyticsAccess: false, leadExports: 2 },
    exclusivePerks: ['Zone académique', 'Sessions workshops', 'Networking académique'],
    color: '#023e8a',
    icon: '🎓'
  }
};

/**
 * Obtenir la configuration complète d'un tier
 */
export function getPartnerBilling(tier: PartnerTier): PartnerBillingConfig {
  return PARTNER_BILLING[tier];
}

/**
 * Obtenir le montant d'un tier en USD
 */
export function getPartnerAmount(tier: PartnerTier): number {
  return PARTNER_BILLING[tier].amount;
}

/**
 * Calculer le montant d'upgrade entre deux tiers
 */
export function calculateUpgradeAmount(
  currentTier: PartnerTier,
  targetTier: PartnerTier
): number {
  const currentAmount = getPartnerAmount(currentTier);
  const targetAmount = getPartnerAmount(targetTier);
  return Math.max(0, targetAmount - currentAmount);
}

/**
 * Vérifier si un tier existe
 */
export function isValidPartnerTier(tier: string): tier is PartnerTier {
  return tier in PARTNER_BILLING;
}

/**
 * Obtenir tous les tiers disponibles
 */
export function getAllPartnerTiers(): PartnerTier[] {
  return Object.keys(PARTNER_BILLING) as PartnerTier[];
}
