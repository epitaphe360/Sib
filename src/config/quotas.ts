/**
 * Configuration des quotas de rendez-vous B2B par niveau/type.
 * Ces valeurs doivent correspondre à celles appliquées côté serveur
 * (fonction get_user_b2b_quota dans Supabase).
 *
 * RÈGLE MÉTIER : RDV B2B ILLIMITÉS pour les visiteurs VIP/Premium et les
 * exposants (ainsi que partenaires/admin/sécurité). Seul le niveau FREE = 0.
 */

/** Valeur sentinelle représentant un quota illimité (convention partagée avec QuotaWidget et la DB). */
export const UNLIMITED_QUOTA = 999999;

export const VISITOR_QUOTAS: Record<string, number> = {
  free: 0,                     // FREE: Aucun rendez-vous
  vip: UNLIMITED_QUOTA,        // VIP: illimité
  premium: UNLIMITED_QUOTA,    // PREMIUM: illimité (alias de vip)
  exhibitor: UNLIMITED_QUOTA,  // EXPOSANT: illimité
  partner: UNLIMITED_QUOTA,    // PARTENAIRE: illimité
  admin: UNLIMITED_QUOTA,      // ADMIN: illimité
  security: UNLIMITED_QUOTA    // SÉCURITÉ: illimité
};

/**
 * Retourne le quota de rendez-vous B2B pour un niveau/type donné
 * @param level - Le niveau de visiteur (free, vip) OU le type d'utilisateur (exhibitor, partner, admin)
 * @returns Le nombre de RDV autorisés (UNLIMITED_QUOTA = illimité)
 */
export const getVisitorQuota = (level: string | undefined): number => {
  return VISITOR_QUOTAS[level || 'free'] || 0;
};

/** Indique si le niveau/type dispose d'un quota RDV illimité. */
export const isUnlimitedQuota = (level: string | undefined): boolean => {
  return getVisitorQuota(level) >= UNLIMITED_QUOTA;
};

export const calculateRemainingQuota = (
  level: string | undefined,
  confirmedCount: number
): number => {
  const quota = getVisitorQuota(level);
  return Math.max(0, quota - confirmedCount);
};


const PREMIUM_LEVEL_INFO = {
  label: 'Premium VIP Pass',
  color: '#ffd700',
  icon: '👑',
  access: ['Invitation inauguration', 'Rendez-vous B2B illimités', 'Networking illimité', 'Ateliers spécialisés', 'Soirée gala exclusive', 'Conférences', 'Déjeuners networking'],
};

export const VISITOR_LEVELS: Record<string, { label: string, color: string, icon: string, access: string[] }> = {
  free: { label: 'Free Pass', color: '#6c757d', icon: '🟢', access: ['Accès limité', 'Badge uniquement', 'Aucun rendez-vous'] },
  vip: PREMIUM_LEVEL_INFO,
  premium: PREMIUM_LEVEL_INFO,
};

/**
 * Retourne les informations détaillées pour un niveau de visiteur donné.
 * @param level Le niveau du visiteur.
 * @returns Les informations du niveau.
 */
export function getVisitorLevelInfo(level: string) {
  return VISITOR_LEVELS[level] || VISITOR_LEVELS.free;
}

