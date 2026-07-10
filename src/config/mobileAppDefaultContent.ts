/**
 * Contenu salon éditable via admin → mobile_app_content_v1.salonStats / salonPartners / images
 * Aligné sur apps/mobile (urbaCatalog, salonPartners, salons.ts)
 */

import { resolveHomeImage } from './sibMaRemoteUrls';

const SIB_CDN = 'https://sib.ma/backend/uploads';

export type SalonCmsFields = {
  tagline: string;
  aboutText: string;
  edition: string;
  visitors: string;
  description: string;
  location: string;
  /** Une fonctionnalité par ligne dans l’admin */
  features: string;
  hours: string;
  venue: string;
  city: string;
  startDayNote: string;
  exhibitorsStat: string;
  countriesStat: string;
  contactEmail: string;
  website: string;
};

export type SalonPartnerCmsEntry = {
  name: string;
  acronym: string;
  logoUrl?: string;
};

export type SalonPartnerCmsGroup = {
  label: string;
  partners: SalonPartnerCmsEntry[];
};

export type SalonPartnersCms = {
  groups: SalonPartnerCmsGroup[];
  /** banner = image (défaut SIB) ; list = tuiles depuis JSON */
  displayMode?: 'banner' | 'list';
};

export const APK_SALON_STAT_KEYS = ['sib', 'sir', 'sip', 'btp', 'sie'] as const;

export const APK_DEFAULT_SALON_STATS: Record<string, SalonCmsFields> = {
  sib: {
    tagline: 'Construction & Architecture',
    aboutText:
      "20e édition au Parc d'Exposition Mohammed VI d'El Jadida. Rendez-vous biennal de référence du secteur du bâtiment au Maroc et en Afrique : 600 exposants, 200 000 visiteurs et 50 pays représentés.",
    edition: '20ème édition',
    visitors: '200 000+',
    description:
      "Le rendez-vous incontournable des professionnels de la construction, de l'architecture et de l'habitat durable au Maroc.",
    location: 'El Jadida, Maroc',
    features: 'Catalogue exposants\nPlan interactif\nConférences\nNetworking B2B',
    hours: '9h00 – 19h00',
    venue: "Parc d'Exposition Mohammed VI",
    city: 'El Jadida, Maroc',
    startDayNote: 'Le 25 novembre est un mercredi',
    exhibitorsStat: '+600',
    countriesStat: '+30',
    contactEmail: 'sib2026@urbacom.net',
    website: 'https://www.sib.ma',
  },
  sir: {
    tagline: 'Résidentiel & Commercial',
    aboutText:
      "La plateforme de référence dédiée à l'immobilier résidentiel, commercial et aux investissements fonciers.",
    edition: '2ème édition',
    visitors: '8 000+',
    description:
      "La plateforme de référence dédiée à l'immobilier résidentiel, commercial et aux investissements fonciers.",
    location: 'Casablanca, Maroc',
    features: 'Catalogue projets\nSimulation prêt\nVisite virtuelle 3D\nRencontres promoteurs',
    hours: '9h00 – 18h00',
    venue: 'Casablanca',
    city: 'Casablanca, Maroc',
    startDayNote: '',
    exhibitorsStat: '200+',
    countriesStat: '15+',
    contactEmail: 'contact@urbacom.ma',
    website: 'https://www.urbaevent.com',
  },
  sip: {
    tagline: 'Promotion & Développement Urbain',
    aboutText:
      "L'espace dédié aux promoteurs immobiliers, aux lotisseurs et aux acteurs du développement urbain.",
    edition: '1ère édition',
    visitors: '5 000+',
    description:
      "L'espace dédié aux promoteurs immobiliers, aux lotisseurs et aux acteurs du développement urbain.",
    location: 'Rabat, Maroc',
    features: "Appels d'offres\nMatching investisseurs\nFoncier & Lotissements\nSmart City",
    hours: '9h00 – 18h00',
    venue: 'Rabat',
    city: 'Rabat, Maroc',
    startDayNote: '',
    exhibitorsStat: '150+',
    countriesStat: '10+',
    contactEmail: 'contact@urbacom.ma',
    website: 'https://www.urbaevent.com',
  },
  btp: {
    tagline: 'Travaux Publics & Infrastructures',
    aboutText:
      'Le carrefour des acteurs du bâtiment et des travaux publics : équipements, matériaux, ingénierie et infrastructures.',
    edition: '3ème édition',
    visitors: '7 000+',
    description:
      'Le carrefour des acteurs du bâtiment et des travaux publics : équipements, matériaux, ingénierie et infrastructures.',
    location: 'Tanger, Maroc',
    features: 'Matériaux & Équipements\nGénie civil\nSous-traitance\nNormes & Certifications',
    hours: '9h00 – 18h00',
    venue: 'Tanger',
    city: 'Tanger, Maroc',
    startDayNote: '',
    exhibitorsStat: '250+',
    countriesStat: '12+',
    contactEmail: 'contact@urbacom.ma',
    website: 'https://www.urbaevent.com',
  },
  sie: {
    tagline: 'Green Tech & Développement Durable',
    aboutText:
      'Le forum des solutions vertes, des énergies renouvelables et du développement durable en milieu urbain.',
    edition: '1ère édition',
    visitors: '4 000+',
    description:
      'Le forum des solutions vertes, des énergies renouvelables et du développement durable en milieu urbain.',
    location: 'Marrakech, Maroc',
    features: 'Énergies renouvelables\nBâtiment passif\nMobilité verte\nLabel HQE',
    hours: '9h00 – 18h00',
    venue: 'Marrakech',
    city: 'Marrakech, Maroc',
    startDayNote: '',
    exhibitorsStat: '120+',
    countriesStat: '10+',
    contactEmail: 'contact@urbacom.ma',
    website: 'https://www.urbaevent.com',
  },
};

export const APK_DEFAULT_SALON_PARTNERS: Record<string, SalonPartnersCms> = {
  sib: {
    groups: [
      {
        label: 'Organisateurs',
        partners: [
          { name: "Ministère de l'Aménagement du Territoire National", acronym: 'MUAT' },
          { name: 'Agence Marocaine de Développement des Investissements et des Exportations', acronym: 'AMDIE' },
        ],
      },
      {
        label: 'Co-organisateurs',
        partners: [
          { name: 'Fédération des Industries des Matériaux de Construction', acronym: 'FMC' },
          { name: 'Fédération Nationale du Bâtiment et des Travaux Publics', acronym: 'FNBTP' },
        ],
      },
      {
        label: 'Sponsor officiel',
        partners: [{ name: "LAP — La qualité de l'appareillage", acronym: 'LAP' }],
      },
      {
        label: 'Organisateur délégué',
        partners: [{ name: 'URBACOM Communication & Événementiel', acronym: 'URBACOM' }],
      },
    ],
  },
};

/** Base publique pour les chemins relatifs (/sib-ma/static/…) hors navigateur. */
export const APK_PREVIEW_ASSET_BASE = 'https://sib2026.vercel.app';

export const APK_DEFAULT_IMAGE_PREVIEWS: Record<string, string> = {
  sib: `${SIB_CDN}/ALW_4646_e80870e56f_86f40519c5.jpg`,
  sir: `${SIB_CDN}/4_9d2cb5a776.png`,
  sip: `${SIB_CDN}/1_a559ea5363.png`,
  /** sib.ma/assets/.../section_01.jpg renvoie du HTML — assets locaux Vercel */
  btp: '/sib-ma/static/section_01.jpg',
  sie: `${SIB_CDN}/3_c9f5820a94.png`,
  hero_bg: `${SIB_CDN}/ALW_4646_e80870e56f_86f40519c5.jpg`,
  /** sib.ma/assets/.../banner.jpg renvoie du HTML — assets locaux Vercel */
  sib_partners_banner: '/sib-ma/static/banner.jpg',
  sir_partners_banner: `${SIB_CDN}/4_9d2cb5a776.png`,
  sip_partners_banner: `${SIB_CDN}/1_a559ea5363.png`,
  btp_partners_banner: '/sib-ma/static/section_02.jpg',
  sie_partners_banner: `${SIB_CDN}/3_c9f5820a94.png`,
};

/** Résout un chemin relatif (/sib-ma/…) ou une URL absolue (y compris sib.ma/bg cassées). */
export function resolveApkImageUrl(raw: string, baseUrl?: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/mockup/') || trimmed.startsWith('/sib-ma/')) {
    return resolveHomeImage(trimmed);
  }
  const base = (
    baseUrl ??
    (typeof window !== 'undefined' ? window.location.origin : APK_PREVIEW_ASSET_BASE)
  ).replace(/\/$/, '');
  return `${base}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

/** URL d’aperçu par slot image APK (admin + web). */
export function getApkDefaultImageUrl(slot: string, baseUrl?: string): string {
  return resolveApkImageUrl(APK_DEFAULT_IMAGE_PREVIEWS[slot] ?? '', baseUrl);
}

export const APK_DEFAULT_PAYMENT = {
  vipPriceEur: 700,
  currency: 'EUR',
  bankName: 'Attijariwafa bank',
  accountHolder: 'URBACOM',
  iban: 'MA64 007 780 000413200000498 25',
  bic: 'BCMAMAMC',
  domiciliation: 'CASA MY IDRISS 1ER',
};

export const SALON_CMS_FIELD_KEYS = [
  'tagline',
  'aboutText',
  'edition',
  'visitors',
  'description',
  'location',
  'features',
  'hours',
  'venue',
  'city',
  'startDayNote',
  'exhibitorsStat',
  'countriesStat',
  'contactEmail',
  'website',
] as const satisfies readonly (keyof SalonCmsFields)[];

export function mergeApkSalonStats(
  remote?: Record<string, Partial<SalonCmsFields>>,
): Record<string, SalonCmsFields> {
  const merged: Record<string, SalonCmsFields> = {};
  for (const key of APK_SALON_STAT_KEYS) {
    const base = APK_DEFAULT_SALON_STATS[key];
    const r = remote?.[key] ?? {};
    merged[key] = { ...base };
    for (const field of SALON_CMS_FIELD_KEYS) {
      const val = r[field]?.trim();
      if (val) merged[key][field] = val;
    }
  }
  return merged;
}

export function mergeApkSalonPartners(
  remote?: Record<string, Partial<SalonPartnersCms>>,
): Record<string, SalonPartnersCms> {
  const merged: Record<string, SalonPartnersCms> = {};
  for (const key of APK_SALON_STAT_KEYS) {
    const base = APK_DEFAULT_SALON_PARTNERS[key] ?? { groups: [] };
    const groups = remote?.[key]?.groups;
    merged[key] = {
      groups: groups?.length ? groups : base.groups,
      displayMode: remote?.[key]?.displayMode,
    };
  }
  return merged;
}

export function partnersBannerSlot(salonKey: string): string {
  return `${salonKey}_partners_banner`;
}

export function parseFeaturesText(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
