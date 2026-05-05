/**
 * Configuration des quotas exposants selon la surface du stand
 * 4 niveaux: 9m², 18m², 36m², 54m²+
 */

export type ExhibitorLevel = 'basic_9' | 'standard_18' | 'premium_36' | 'elite_54plus';

export interface ExhibitorQuotaConfig {
  id: ExhibitorLevel;
  name: string;
  displayName: string;
  minArea: number; // m²
  maxArea: number | null; // m² (null = illimité)
  estimatedPrice: number; // USD (estimation, prix réel selon l'emplacement)
  color: string;
  icon: string;

  // Quotas
  quotas: {
    appointments: number;          // Rendez-vous B2B
    teamMembers: number;           // Membres d'équipe avec badge
    demoSessions: number;          // Sessions de démo produit
    mediaUploads: number;          // Fichiers média (vidéos, brochures)
    productShowcase: number;       // Produits présentables
    leadScans: number;             // Scans de badges visiteurs par jour
    meetingRoomHours: number;      // Heures salle de réunion privée
    electricalOutlets: number;     // Prises électriques
    furnitureItems: number;        // Éléments mobilier inclus
    promotionalMaterial: boolean;  // Matériel promo autorisé
    liveStreaming: boolean;        // Diffusion live autorisée
  };

  // Services inclus
  features: string[];

  // Restrictions
  restrictions?: string[];
}

export const EXHIBITOR_QUOTAS: Record<ExhibitorLevel, ExhibitorQuotaConfig> = {
  basic_9: {
    id: 'basic_9',
    name: 'Basic 9m²',
    displayName: 'Stand Basic 9m²',
    minArea: 0,
    maxArea: 9,
    estimatedPrice: 5000, // $5k base
    color: '#94A3B8',
    icon: '🏢',

    quotas: {
      appointments: 15,  // CDC: 15 rendez-vous B2B pour stand basic
      teamMembers: 2,
      demoSessions: 3,
      mediaUploads: 5,
      productShowcase: 3,
      leadScans: 50,
      meetingRoomHours: 0,
      electricalOutlets: 2,
      furnitureItems: 3,
      promotionalMaterial: true,
      liveStreaming: false,
    },

    features: [
      'Stand 9m² (3x3m)',
      '15 rendez-vous B2B inclus',
      '2 badges exposant',
      '3 sessions démo',
      '5 fichiers média',
      '50 scans badges/jour',
      '2 prises électriques',
      'Mobilier de base (table, chaises)',
      'Listing annuaire exposants',
      'WiFi gratuit'
    ],

    restrictions: [
      'Pas de salle de réunion privée',
      'Pas de diffusion live',
      'Mobilier basique uniquement'
    ]
  },

  standard_18: {
    id: 'standard_18',
    name: 'Standard 18m²',
    displayName: 'Stand Standard 18m²',
    minArea: 9.01,
    maxArea: 18,
    estimatedPrice: 12000, // $12k
    color: '#60A5FA',
    icon: '🏪',

    quotas: {
      appointments: 25,  // CDC: 25 créneaux B2B (supérieur au basic 9m²)
      teamMembers: 4,
      demoSessions: 8,
      mediaUploads: 15,
      productShowcase: 8,
      leadScans: 150,
      meetingRoomHours: 4,
      electricalOutlets: 4,
      furnitureItems: 8,
      promotionalMaterial: true,
      liveStreaming: false,
    },

    features: [
      'Stand 18m² (6x3m ou 4.5x4m)',
      '25 rendez-vous B2B max',
      '4 badges exposant',
      '8 sessions démo',
      '15 fichiers média',
      '150 scans badges/jour',
      '4h salle réunion privée',
      '4 prises électriques',
      'Mobilier confort (table, chaises, présentoirs)',
      'Écran TV 42" inclus',
      'Stockage sécurisé',
      'Top listing annuaire',
      'WiFi premium'
    ]
  },

  premium_36: {
    id: 'premium_36',
    name: 'Premium 36m²',
    displayName: 'Stand Premium 36m²',
    minArea: 18.01,
    maxArea: 36,
    estimatedPrice: 25000, // $25k
    color: '#F59E0B',
    icon: '🏬',

    quotas: {
      appointments: 30,  // CDC: 30 créneaux B2B
      teamMembers: 8,
      demoSessions: 20,
      mediaUploads: 999,  // CDC: Médias illimités (999 = pratiquement illimité)
      productShowcase: 20,
      leadScans: 300,
      meetingRoomHours: 12,
      electricalOutlets: 8,
      furnitureItems: 20,
      promotionalMaterial: true,
      liveStreaming: true,
    },

    features: [
      'Stand 36m² (6x6m ou config sur mesure)',
      '30 rendez-vous B2B max',
      '8 badges exposant',
      '20 sessions démo',
      'Médias illimités (photos, vidéos, brochures)',
      '300 scans badges/jour',
      '12h salle réunion premium',
      '8 prises électriques + backup',
      'Mobilier premium personnalisable',
      '2 écrans LED 55"',
      'Zone accueil dédiée',
      'Espace stockage 6m²',
      'Featured listing premium',
      'Live streaming autorisé',
      'WiFi dédié fiber',
      'Service traiteur VIP',
      'Design stand personnalisé',
      'Support technique prioritaire',
      'Accès API Supabase limité',
      'Badge virtuel personnalisé'
    ]
  },

  elite_54plus: {
    id: 'elite_54plus',
    name: 'Elite 54m²+',
    displayName: 'Stand Elite 54m²+',
    minArea: 36.01,
    maxArea: null, // illimité
    estimatedPrice: 45000, // $45k+ selon surface
    color: '#8B5CF6',
    icon: '🏛️',

    quotas: {
      appointments: -1, // CDC: illimité
      teamMembers: 15,
      demoSessions: -1, // illimité
      mediaUploads: -1, // CDC: illimité (stockage médias illimité)
      productShowcase: -1, // CDC: Store produits complet (illimité)
      leadScans: -1, // illimité
      meetingRoomHours: -1, // illimité
      electricalOutlets: 16,
      furnitureItems: 50,
      promotionalMaterial: true,
      liveStreaming: true,
    },

    features: [
      'Stand 54m²+ (config architecturale sur mesure)',
      'Rendez-vous B2B illimités',
      '15 badges exposant',
      'Sessions démo illimitées',
      'Stockage médias illimité',
      'Store produits complet (produits illimités)',
      'Scans badges illimités',
      'Salle réunion privée dédiée',
      '16 prises + infrastructure électrique complète',
      'Mobilier luxe entièrement personnalisé',
      'Mur LED 4K immersif',
      'Zone VIP lounge',
      'Espace démonstration multi-zones',
      'Stockage 15m² sécurisé',
      'Mise en avant permanente et prioritaire',
      'Featured homepage spotlight',
      'Live streaming multi-caméras',
      'WiFi dédié entreprise 1Gbps',
      'Support VIP 24/7 dédié',
      'Service conciergerie 24/7',
      'Design architectural signature',
      'Chef de projet dédié',
      'Installation/démontage premium',
      'Catering VIP illimité',
      'Zone media press',
      'Mini-site Premium avec scripts personnalisés',
      'Accès API Supabase complet',
      'Outils de réseautage illimités',
      'Chat et messagerie illimitée',
      'Personnalisation avancée',
      'Priorité algorithmique',
      'Badge virtuel personnalisé VIP'
    ]
  }
};

/**
 * Détermine le niveau d'exposant selon la surface du stand
 */
export function getExhibitorLevelByArea(area: number): ExhibitorLevel {
  if (area <= 9) {return 'basic_9';}
  if (area <= 18) {return 'standard_18';}
  if (area <= 36) {return 'premium_36';}
  return 'elite_54plus';
}

/**
 * Récupère la configuration d'un niveau exposant
 */
export function getExhibitorQuotaConfig(level: ExhibitorLevel | string): ExhibitorQuotaConfig {
  return EXHIBITOR_QUOTAS[level as ExhibitorLevel] || EXHIBITOR_QUOTAS.basic_9;
}

/**
 * Récupère un quota spécifique
 * -1 signifie illimité, retourne un grand nombre pour l'UI
 */
export function getExhibitorQuota(
  level: ExhibitorLevel | string,
  quotaType: keyof ExhibitorQuotaConfig['quotas']
): number {
  const config = getExhibitorQuotaConfig(level);
  const quota = config.quotas[quotaType];

  if (typeof quota === 'boolean') {return quota ? 999999 : 0;}
  return quota === -1 ? 999999 : quota;
}

/**
 * Calcule le quota restant
 */
export function calculateExhibitorRemainingQuota(
  level: ExhibitorLevel | string,
  quotaType: keyof ExhibitorQuotaConfig['quotas'],
  currentUsage: number
): number {
  const quota = getExhibitorQuota(level, quotaType);
  if (quota === 999999) {return 999999;} // illimité
  return Math.max(0, quota - currentUsage);
}

/**
 * Vérifie si le quota est atteint
 */
export function isExhibitorQuotaReached(
  level: ExhibitorLevel | string,
  quotaType: keyof ExhibitorQuotaConfig['quotas'],
  currentUsage: number
): boolean {
  const remaining = calculateExhibitorRemainingQuota(level, quotaType, currentUsage);
  return remaining === 0;
}

/**
 * Vérifie si l'exposant a accès à une fonctionnalité
 */
export function hasExhibitorAccess(
  level: ExhibitorLevel | string,
  quotaType: keyof ExhibitorQuotaConfig['quotas']
): boolean {
  const config = getExhibitorQuotaConfig(level);
  const quota = config.quotas[quotaType];

  if (typeof quota === 'boolean') {return quota;}
  return quota !== 0;
}

/**
 * Liste des niveaux triés par surface
 */
export const EXHIBITOR_LEVEL_ORDER: ExhibitorLevel[] = [
  'basic_9',
  'standard_18',
  'premium_36',
  'elite_54plus'
];

/**
 * Calcule le prix estimé selon la surface exacte
 */
export function calculateExhibitorPrice(area: number, locationPremium: number = 1): number {
  const level = getExhibitorLevelByArea(area);
  const config = getExhibitorQuotaConfig(level);

  // Prix de base par m²
  const pricePerM2 = config.estimatedPrice / ((config.maxArea || area) / 2);

  // Prix total = (surface × prix/m²) × coefficient emplacement
  return Math.round(area * pricePerM2 * locationPremium);
}

/**
 * Mapping des couleurs pour les badges
 */
export const EXHIBITOR_LEVEL_COLORS: Record<ExhibitorLevel, string> = {
  basic_9: '#94A3B8',
  standard_18: '#60A5FA',
  premium_36: '#F59E0B',
  elite_54plus: '#8B5CF6'
};
