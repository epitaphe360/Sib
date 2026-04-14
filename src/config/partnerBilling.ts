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

/**
 * Configuration des types de partenaires SIB Maroc
 * 6 types : Organisateurs, Co-organisateurs, Sponsor Officiel,
 *           Organisateur Délégué, Nos Partenaires, Nos Partenaires Presse
 */

export type PartnerTier =
  | 'organizer'
  | 'co_organizer'
  | 'official_sponsor'
  | 'delegated_organizer'
  | 'partner'
  | 'press_partner';

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
  organizer: {
    tier: 'organizer',
    amount: 0,
    currency: 'USD',
    displayName: 'Organisateurs',
    description: 'Organisateur principal du Salon International du Bâtiment',
    features: ['Gestion complète de l\'événement', 'Visibilité maximale', 'Stands illimités'],
    quotas: { appointments: -1, eventRegistrations: -1, mediaUploads: -1, teamMembers: -1, standsAllowed: -1, promotionalEmails: -1, showcaseProducts: -1, analyticsAccess: true, leadExports: -1 },
    exclusivePerks: ['Logo dominant sur tous les supports', 'Accès complet'],
    color: '#C8A951',
    icon: '🏛️',
  },

  co_organizer: {
    tier: 'co_organizer',
    amount: 0,
    currency: 'USD',
    displayName: 'Co-organisateurs',
    description: 'Co-organisation du Salon International du Bâtiment',
    features: ['Co-branding officiel', 'Visibilité en 1ère ligne', 'Stands multiples'],
    quotas: { appointments: -1, eventRegistrations: -1, mediaUploads: -1, teamMembers: -1, standsAllowed: -1, promotionalEmails: -1, showcaseProducts: -1, analyticsAccess: true, leadExports: -1 },
    exclusivePerks: ['Logo 1ère ligne sur tous les supports', 'Représentation institutionnelle'],
    color: '#B8860B',
    icon: '🤝',
  },

  official_sponsor: {
    tier: 'official_sponsor',
    amount: 0,
    currency: 'USD',
    displayName: 'Sponsor Officiel',
    description: 'Sponsor officiel du Salon International du Bâtiment',
    features: ['Logo 1ère ligne partout', 'Stand premium', 'RDV B2B illimités', 'Supports officiels'],
    quotas: { appointments: -1, eventRegistrations: -1, mediaUploads: 200, teamMembers: 20, standsAllowed: 3, promotionalEmails: -1, showcaseProducts: 100, analyticsAccess: true, leadExports: -1 },
    exclusivePerks: ['Mention "Sponsor Officiel"', 'Espace VIP dédié'],
    color: '#1B6CA8',
    icon: '⭐',
  },

  delegated_organizer: {
    tier: 'delegated_organizer',
    amount: 0,
    currency: 'USD',
    displayName: 'Organisateur Délégué',
    description: 'Organisateur délégué d\'une zone du salon',
    features: ['Logo sur supports de sa zone', 'Accès VIP', 'Stands dédiés'],
    quotas: { appointments: -1, eventRegistrations: -1, mediaUploads: 100, teamMembers: 15, standsAllowed: 2, promotionalEmails: -1, showcaseProducts: 50, analyticsAccess: true, leadExports: -1 },
    exclusivePerks: ['Responsabilité d\'organisation déléguée', 'Visibilité zone dédiée'],
    color: '#2E8B57',
    icon: '📋',
  },

  partner: {
    tier: 'partner',
    amount: 0,
    currency: 'USD',
    displayName: 'Nos Partenaires',
    description: 'Partenaire du Salon International du Bâtiment',
    features: ['Logo sur le site', 'Listing catalogue', 'Stand exposition', 'Accès conférences'],
    quotas: { appointments: 30, eventRegistrations: 10, mediaUploads: 20, teamMembers: 5, standsAllowed: 1, promotionalEmails: 5, showcaseProducts: 15, analyticsAccess: false, leadExports: 10 },
    exclusivePerks: ['Badge "Partenaire SIB"', 'Logo supports imprimés', 'Networking professionnel'],
    color: '#6A5ACD',
    icon: '🌐',
  },

  press_partner: {
    tier: 'press_partner',
    amount: 0,
    currency: 'USD',
    displayName: 'Nos Partenaires Presse',
    description: 'Partenaire presse officiel du Salon International du Bâtiment',
    features: ['Accréditation presse officielle', 'Accès toutes conférences', 'Espace presse', 'Diffusion communiqués SIB'],
    quotas: { appointments: 10, eventRegistrations: 10, mediaUploads: 50, teamMembers: 5, standsAllowed: 0, promotionalEmails: 10, showcaseProducts: 0, analyticsAccess: false, leadExports: 5 },
    exclusivePerks: ['Badge "Partenaire Presse SIB"', 'Interviews exclusives', 'Contenu en avant-première'],
    color: '#DC143C',
    icon: '📰',
  },
};

/**
 * Obtenir la configuration complète d'un type partenaire
 */
export function getPartnerBilling(tier: PartnerTier): PartnerBillingConfig {
  return PARTNER_BILLING[tier];
}

/**
 * Vérifier si un type partenaire existe
 */
export function isValidPartnerTier(tier: string): tier is PartnerTier {
  return tier in PARTNER_BILLING;
}

/**
 * Obtenir tous les types disponibles
 */
export function getAllPartnerTiers(): PartnerTier[] {
  return Object.keys(PARTNER_BILLING) as PartnerTier[];
}

