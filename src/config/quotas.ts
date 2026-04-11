/**
 * Configuration des quotas pour les différents niveaux de visiteurs
 * Ces valeurs doivent correspondre à celles de la table visitor_levels dans Supabase
 *
 * ÉDITION 1 (2026) : 50 RDV B2B pour tous les niveaux — liberté maximale.
 */

export const VISITOR_QUOTAS: Record<string, number> = {
  free: 0,           // FREE: Aucun rendez-vous
  vip: 1000,         // VIP: 1000 RDV
  premium: 1000,     // PREMIUM: 1000 RDV
  exhibitor: 1000,   // EXPOSANT: 1000 RDV
  partner: 1000,     // PARTENAIRE: 1000 RDV
  admin: 1000,       // ADMIN: 1000 RDV
  security: 1000     // SÉCURITÉ: 1000 RDV
};

/**
 * Retourne le quota de rendez-vous B2B pour un niveau/type donné
 * @param level - Le niveau de visiteur (free, premium, vip) OU le type d'utilisateur (exhibitor, partner, admin)
 * @returns Le nombre de RDV autorisés (999999 = illimité)
 */
export const getVisitorQuota = (level: string | undefined): number => {
  return VISITOR_QUOTAS[level || 'free'] || 0;
};

export const calculateRemainingQuota = (
  level: string | undefined,
  confirmedCount: number
): number => {
  const quota = getVisitorQuota(level);
  return Math.max(0, quota - confirmedCount);
};


export const VISITOR_LEVELS: Record<string, { label: string, color: string, icon: string, access: string[] }> = {
  free: { label: 'Free Pass', color: '#6c757d', icon: '🟢', access: ['Accès limité', 'Badge uniquement', 'Aucun rendez-vous'] },
  // premium removed - consolidated to vip
  vip: { label: 'Premium VIP Pass', color: '#ffd700', icon: '👑', access: ['Invitation inauguration', '10 demandes de rendez-vous B2B', 'Networking illimité', 'Ateliers spécialisés', 'Soirée gala exclusive', 'Conférences', 'Déjeuners networking'] }
};

/**
 * Retourne les informations détaillées pour un niveau de visiteur donné.
 * @param level Le niveau du visiteur.
 * @returns Les informations du niveau.
 */
export function getVisitorLevelInfo(level: string) {
  return VISITOR_LEVELS[level] || VISITOR_LEVELS.free;
}

