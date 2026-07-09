import type { ImageSourcePropType } from 'react-native';
import type { AppIconName } from '../components/AppIcon';
import type { SalonCmsFields } from '../lib/salonCms';
import type { Salon } from '../types';
import { SALON_IMAGES } from './images';

export type UrbaSalonTheme = {
  color: string;
  bgColor: string;
  fullName: string;
  tagline: string;
  description: string;
  edition: string;
  location: string;
  visitors: string;
  features: string[];
  icon: AppIconName;
  image?: ImageSourcePropType;
};

export const URBA_PLATFORM_STATS = [
  { value: '5', labelKey: 'home.urba.statSalons' },
  { value: '500+', labelKey: 'home.urba.statExhibitors' },
  { value: '25K+', labelKey: 'home.urba.statVisitors' },
  { value: '40+', labelKey: 'home.urba.statCountries' },
] as const;

export const URBA_SOCIAL_LINKS = [
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/urbacom', color: '#E1306C', bg: '#FCE4EC' },
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/urbacom', color: '#1877F2', bg: '#E3F2FD' },
  { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@urbacom', color: '#FF0000', bg: '#FFEBEE' },
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/urbacom', color: '#0A66C2', bg: '#E3F2FD' },
  { id: 'x', label: 'X', url: 'https://x.com/urbacom', color: '#111827', bg: '#F3F4F6' },
] as const;

export const URBA_SALON_THEMES: Record<string, UrbaSalonTheme> = {
  sib: {
    color: '#4598D1',
    bgColor: '#EBF5FB',
    fullName: 'Salon International du Bâtiment',
    tagline: 'Construction & Architecture',
    description:
      'Le rendez-vous incontournable des professionnels de la construction, de l\'architecture et de l\'habitat durable au Maroc.',
    edition: '20ème édition',
    location: 'El Jadida, Maroc',
    visitors: '200 000+',
    features: ['Catalogue exposants', 'Plan interactif', 'Conférences', 'Networking B2B'],
    icon: 'business-outline',
    image: SALON_IMAGES.sib,
  },
  sir: {
    color: '#EB9A44',
    bgColor: '#FDF3E7',
    fullName: "Salon International de l'Immobilier",
    tagline: 'Résidentiel & Commercial',
    description:
      'La plateforme de référence dédiée à l\'immobilier résidentiel, commercial et aux investissements fonciers.',
    edition: '2ème édition',
    location: 'Casablanca, Maroc',
    visitors: '8 000+',
    features: ['Catalogue projets', 'Simulation prêt', 'Visite virtuelle 3D', 'Rencontres promoteurs'],
    icon: 'storefront-outline',
    image: SALON_IMAGES.sir,
  },
  sip: {
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    fullName: 'Salon International de la Promotion',
    tagline: 'Promotion & Développement Urbain',
    description:
      'L\'espace dédié aux promoteurs immobiliers, aux lotisseurs et aux acteurs du développement urbain.',
    edition: '1ère édition',
    location: 'Rabat, Maroc',
    visitors: '5 000+',
    features: ['Appels d\'offres', 'Matching investisseurs', 'Foncier & Lotissements', 'Smart City'],
    icon: 'bar-chart-outline',
    image: SALON_IMAGES.sip,
  },
  btp: {
    color: '#D32F2F',
    bgColor: '#FFEBEE',
    fullName: 'Salon International du BTP',
    tagline: 'Travaux Publics & Infrastructures',
    description:
      'Le carrefour des acteurs du bâtiment et des travaux publics : équipements, matériaux, ingénierie et infrastructures.',
    edition: '3ème édition',
    location: 'Tanger, Maroc',
    visitors: '7 000+',
    features: ['Matériaux & Équipements', 'Génie civil', 'Sous-traitance', 'Normes & Certifications'],
    icon: 'construct-outline',
    image: SALON_IMAGES.btp,
  },
  sie: {
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    fullName: "Salon International de l'Environnement",
    tagline: 'Green Tech & Développement Durable',
    description:
      'Le forum des solutions vertes, des énergies renouvelables et du développement durable en milieu urbain.',
    edition: '1ère édition',
    location: 'Marrakech, Maroc',
    visitors: '4 000+',
    features: ['Énergies renouvelables', 'Bâtiment passif', 'Mobilité verte', 'Label HQE'],
    icon: 'globe-outline',
    image: SALON_IMAGES.sie,
  },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Clé thème (sib, sir…) — jamais l'UUID Supabase. */
export function resolveSalonThemeKey(salon: Pick<Salon, 'id' | 'slug' | 'code'>): string {
  const slug = salon.slug?.trim().toLowerCase();
  if (slug && !UUID_RE.test(slug)) {
    if (URBA_SALON_THEMES[slug]) return slug;
  }

  const code = salon.code?.trim().toLowerCase();
  if (code && URBA_SALON_THEMES[code]) return code;

  const id = salon.id.trim().toLowerCase();
  if (!UUID_RE.test(id) && URBA_SALON_THEMES[id]) return id;

  return slug && !UUID_RE.test(slug) ? slug : code || 'sib';
}

export function getUrbaSalonTheme(
  salon: Pick<Salon, 'id' | 'slug' | 'code' | 'name'>,
  salonStats?: Record<string, Partial<SalonCmsFields>>,
): UrbaSalonTheme {
  const key = resolveSalonThemeKey(salon);
  const theme = URBA_SALON_THEMES[key];
  const remote = salonStats?.[key];

  const mergeRemote = (base: UrbaSalonTheme): UrbaSalonTheme => {
    if (!remote) return base;
    return {
      ...base,
      tagline: remote.tagline?.trim() || base.tagline,
      edition: remote.edition?.trim() || base.edition,
      visitors: remote.visitors?.trim() || base.visitors,
      description: remote.description?.trim() || base.description,
      location: remote.location?.trim() || base.location,
      features: remote.features?.trim()
        ? remote.features.split('\n').map((f) => f.trim()).filter(Boolean)
        : base.features,
    };
  };

  if (theme) return mergeRemote(theme);

  return {
    color: '#4598D1',
    bgColor: '#EBF5FB',
    fullName: salon.name || key.toUpperCase(),
    tagline: '',
    description: '',
    edition: '',
    location: 'Maroc',
    visitors: '',
    features: [],
    icon: 'business-outline',
    image: SALON_IMAGES.sib,
  };
}
