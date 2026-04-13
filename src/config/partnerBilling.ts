/**
 * âœ… SINGLE SOURCE OF TRUTH pour les montants et configurations partenaires
 *
 * Ce fichier est la SEULE source de vÃ©ritÃ© pour tous les montants partenaires.
 * Tous les autres fichiers DOIVENT importer depuis ici.
 *
 * âš ï¸ NE PAS dupliquer les montants ailleurs - toujours importer depuis ce fichier
 *
 * FIX P0-3: Correction du dÃ©faut de conception "pas de single source of truth"
 */

/**
 * Configuration des types de partenaires SIB Maroc
 * 6 types : Organisateurs, Co-organisateurs, Sponsor Officiel,
 *           Organisateur DÃ©lÃ©guÃ©, Nos Partenaires, Nos Partenaires Presse
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
  amount: number;              // Montant en MAD
  currency: 'MAD';
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
 * âœ… SOURCE UNIQUE DE VÃ‰RITÃ‰ - Configuration complÃ¨te des tiers partenaires
 *
 * Tous les montants, quotas et fonctionnalitÃ©s sont dÃ©finis ici
 */
export const PARTNER_BILLING: Record<PartnerTier, PartnerBillingConfig> = {
  organizer: {
    tier: 'organizer',
    amount: 0,
    currency: 'MAD',
    displayName: 'Organisateurs',
    description: 'Organisateur principal du Salon International du BÃ¢timent',
    features: ['Gestion complÃ¨te de l\'Ã©vÃ©nement', 'VisibilitÃ© maximale', 'Stands illimitÃ©s'],
    quotas: { appointments: -1, eventRegistrations: -1, mediaUploads: -1, teamMembers: -1, standsAllowed: -1, promotionalEmails: -1, showcaseProducts: -1, analyticsAccess: true, leadExports: -1 },
    exclusivePerks: ['Logo dominant sur tous les supports', 'AccÃ¨s complet'],
    color: '#C8A951',
    icon: 'ðŸ›ï¸',
  },

  co_organizer: {
    tier: 'co_organizer',
    amount: 0,
    currency: 'MAD',
    displayName: 'Co-organisateurs',
    description: 'Co-organisation du Salon International du BÃ¢timent',
    features: ['Co-branding officiel', 'VisibilitÃ© en 1Ã¨re ligne', 'Stands multiples'],
    quotas: { appointments: -1, eventRegistrations: -1, mediaUploads: -1, teamMembers: -1, standsAllowed: -1, promotionalEmails: -1, showcaseProducts: -1, analyticsAccess: true, leadExports: -1 },
    exclusivePerks: ['Logo 1Ã¨re ligne sur tous les supports', 'ReprÃ©sentation institutionnelle'],
    color: '#B8860B',
    icon: 'ðŸ¤',
  },

  official_sponsor: {
    tier: 'official_sponsor',
    amount: 0,
    currency: 'MAD',
    displayName: 'Sponsor Officiel',
    description: 'Sponsor officiel du Salon International du BÃ¢timent',
    features: ['Logo 1Ã¨re ligne partout', 'Stand premium', 'RDV B2B illimitÃ©s', 'Supports officiels'],
    quotas: { appointments: -1, eventRegistrations: -1, mediaUploads: 200, teamMembers: 20, standsAllowed: 3, promotionalEmails: -1, showcaseProducts: 100, analyticsAccess: true, leadExports: -1 },
    exclusivePerks: ['Mention "Sponsor Officiel"', 'Espace VIP dÃ©diÃ©'],
    color: '#1B6CA8',
    icon: 'â­',
  },

  delegated_organizer: {
    tier: 'delegated_organizer',
    amount: 0,
    currency: 'MAD',
    displayName: 'Organisateur DÃ©lÃ©guÃ©',
    description: 'Organisateur dÃ©lÃ©guÃ© d\'une zone du salon',
    features: ['Logo sur supports de sa zone', 'AccÃ¨s VIP', 'Stands dÃ©diÃ©s'],
    quotas: { appointments: -1, eventRegistrations: -1, mediaUploads: 100, teamMembers: 15, standsAllowed: 2, promotionalEmails: -1, showcaseProducts: 50, analyticsAccess: true, leadExports: -1 },
    exclusivePerks: ['ResponsabilitÃ© d\'organisation dÃ©lÃ©guÃ©e', 'VisibilitÃ© zone dÃ©diÃ©e'],
    color: '#2E8B57',
    icon: 'ðŸ“‹',
  },

  partner: {
    tier: 'partner',
    amount: 0,
    currency: 'MAD',
    displayName: 'Nos Partenaires',
    description: 'Partenaire du Salon International du BÃ¢timent',
    features: ['Logo sur le site', 'Listing catalogue', 'Stand exposition', 'AccÃ¨s confÃ©rences'],
    quotas: { appointments: 30, eventRegistrations: 10, mediaUploads: 20, teamMembers: 5, standsAllowed: 1, promotionalEmails: 5, showcaseProducts: 15, analyticsAccess: false, leadExports: 10 },
    exclusivePerks: ['Badge "Partenaire SIB"', 'Logo supports imprimÃ©s', 'Networking professionnel'],
    color: '#6A5ACD',
    icon: 'ðŸŒ',
  },

  press_partner: {
    tier: 'press_partner',
    amount: 0,
    currency: 'MAD',
    displayName: 'Nos Partenaires Presse',
    description: 'Partenaire presse officiel du Salon International du BÃ¢timent',
    features: ['AccrÃ©ditation presse officielle', 'AccÃ¨s toutes confÃ©rences', 'Espace presse', 'Diffusion communiquÃ©s SIB'],
    quotas: { appointments: 10, eventRegistrations: 10, mediaUploads: 50, teamMembers: 5, standsAllowed: 0, promotionalEmails: 10, showcaseProducts: 0, analyticsAccess: false, leadExports: 5 },
    exclusivePerks: ['Badge "Partenaire Presse SIB"', 'Interviews exclusives', 'Contenu en avant-premiÃ¨re'],
    color: '#DC143C',
    icon: 'ðŸ“°',
  },
};

/**
 * Obtenir la configuration complÃ¨te d'un type partenaire
 */
export function getPartnerBilling(tier: PartnerTier): PartnerBillingConfig {
  return PARTNER_BILLING[tier];
}

/**
 * VÃ©rifier si un type partenaire existe
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
