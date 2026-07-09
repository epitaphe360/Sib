/**
 * Contenu salon CMS — mêmes défauts que app-urbaevent/web/src/config/mobileAppDefaultContent.ts
 */

export type SalonCmsFields = {
  tagline: string;
  aboutText: string;
  edition: string;
  visitors: string;
  description: string;
  location: string;
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
  displayMode?: 'banner' | 'list';
};

export const APK_SALON_KEYS = ['sib', 'sir', 'sip', 'btp', 'sie'] as const;

const DEFAULT_SALON_STATS: Record<string, SalonCmsFields> = {
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

const DEFAULT_SALON_PARTNERS: Record<string, SalonPartnersCms> = {
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

const FIELD_KEYS = [
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

export function mergeSalonCmsFields(
  remote?: Record<string, Partial<SalonCmsFields>>,
): Record<string, SalonCmsFields> {
  const merged: Record<string, SalonCmsFields> = {};
  for (const key of APK_SALON_KEYS) {
    const base = DEFAULT_SALON_STATS[key];
    const r = remote?.[key] ?? {};
    merged[key] = { ...base };
    for (const field of FIELD_KEYS) {
      const val = r[field]?.trim();
      if (val) merged[key][field] = val;
    }
  }
  return merged;
}

export function mergeSalonPartnersCms(
  remote?: Record<string, Partial<SalonPartnersCms>>,
): Record<string, SalonPartnersCms> {
  const merged: Record<string, SalonPartnersCms> = {};
  for (const key of APK_SALON_KEYS) {
    const base = DEFAULT_SALON_PARTNERS[key] ?? { groups: [] };
    const groups = remote?.[key]?.groups;
    merged[key] = {
      groups: groups?.length ? groups : base.groups,
      displayMode: remote?.[key]?.displayMode,
    };
  }
  return merged;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resolveSalonCmsKey(salon: Pick<{ id: string; slug?: string; code?: string }, 'id' | 'slug' | 'code'>): string {
  const slug = salon.slug?.trim().toLowerCase();
  if (slug && !UUID_RE.test(slug) && APK_SALON_KEYS.includes(slug as (typeof APK_SALON_KEYS)[number])) {
    return slug;
  }
  const code = salon.code?.trim().toLowerCase();
  if (code && APK_SALON_KEYS.includes(code as (typeof APK_SALON_KEYS)[number])) {
    return code;
  }
  const id = salon.id.trim().toLowerCase();
  if (!UUID_RE.test(id) && APK_SALON_KEYS.includes(id as (typeof APK_SALON_KEYS)[number])) {
    return id;
  }
  return slug && !UUID_RE.test(slug) ? slug : code || 'sib';
}

export function getSalonCmsFields(
  salon: Pick<{ id: string; slug?: string; code?: string }, 'id' | 'slug' | 'code'>,
  salonStats?: Record<string, Partial<SalonCmsFields>>,
): SalonCmsFields {
  const key = resolveSalonCmsKey(salon);
  return mergeSalonCmsFields(salonStats)[key] ?? DEFAULT_SALON_STATS.sib;
}

export function getSalonPartnersCms(
  salon: Pick<{ id: string; slug?: string; code?: string }, 'id' | 'slug' | 'code'>,
  salonPartners?: Record<string, Partial<SalonPartnersCms>>,
): SalonPartnersCms {
  const key = resolveSalonCmsKey(salon);
  return mergeSalonPartnersCms(salonPartners)[key] ?? { groups: [] };
}

export function partnersBannerImageSlot(salonKey: string): string {
  return `${salonKey}_partners_banner`;
}

export function parseSalonFeatures(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export { DEFAULT_SALON_STATS, DEFAULT_SALON_PARTNERS };
