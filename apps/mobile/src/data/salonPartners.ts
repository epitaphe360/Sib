import type { ImageSourcePropType } from 'react-native';
import { BADGE_LOGO_LOCAL, BRAND_LOGO_LOCAL } from '../config/brandAssets';
import type { Salon } from '../types';
import { resolveSalonThemeKey } from './urbaCatalog';

export type SalonPartnerRole =
  | 'organisateur'
  | 'co-organisateur'
  | 'sponsor-officiel'
  | 'organisateur-delegue';

export type SalonPartner = {
  id: string;
  name: string;
  acronym: string;
  logo?: ImageSourcePropType;
};

export type SalonPartnerGroup = {
  role: SalonPartnerRole;
  labelKey: string;
  partners: SalonPartner[];
};

export type SalonMiniHomeConfig = {
  aboutKey?: string;
  /** Bannière officielle sponsors & organisateurs (ex. visuel sib.ma) */
  partnersBanner?: ImageSourcePropType;
  groups: SalonPartnerGroup[];
};

const PARTNER_LOGOS = {
  ministere: BADGE_LOGO_LOCAL['logo-ministere'],
  urbacom: BRAND_LOGO_LOCAL,
} as const;

const SIB_PARTNERS_BANNER = require('../../assets/images/sib-partners-banner.png') as ImageSourcePropType;

const SIB_PARTNERS: SalonMiniHomeConfig = {
  aboutKey: 'salon.miniHome.about.sib',
  partnersBanner: SIB_PARTNERS_BANNER,
  groups: [
    {
      role: 'organisateur',
      labelKey: 'salon.partners.organizers',
      partners: [
        {
          id: 'ministere',
          name: "Ministère de l'Aménagement du Territoire National",
          acronym: 'MUAT',
          logo: PARTNER_LOGOS.ministere,
        },
        {
          id: 'amdie',
          name: 'Agence Marocaine de Développement des Investissements et des Exportations',
          acronym: 'AMDIE',
        },
      ],
    },
    {
      role: 'co-organisateur',
      labelKey: 'salon.partners.coOrganizers',
      partners: [
        {
          id: 'fmc',
          name: 'Fédération des Industries des Matériaux de Construction',
          acronym: 'FMC',
        },
        {
          id: 'fnbtp',
          name: 'Fédération Nationale du Bâtiment et des Travaux Publics',
          acronym: 'FNBTP',
        },
      ],
    },
    {
      role: 'sponsor-officiel',
      labelKey: 'salon.partners.officialSponsor',
      partners: [
        {
          id: 'lap',
          name: 'LAP — La qualité de l\'appareillage',
          acronym: 'LAP',
        },
      ],
    },
    {
      role: 'organisateur-delegue',
      labelKey: 'salon.partners.delegatedOrganizer',
      partners: [
        {
          id: 'urbacom',
          name: 'URBACOM Communication & Événementiel',
          acronym: 'URBACOM',
          logo: PARTNER_LOGOS.urbacom,
        },
      ],
    },
  ],
};

const DEFAULT_DELEGATE: SalonMiniHomeConfig = {
  groups: [
    {
      role: 'organisateur-delegue',
      labelKey: 'salon.partners.delegatedOrganizer',
      partners: [
        {
          id: 'urbacom',
          name: 'URBACOM Communication & Événementiel',
          acronym: 'URBACOM',
          logo: PARTNER_LOGOS.urbacom,
        },
      ],
    },
  ],
};

const SALON_MINI_HOME: Record<string, SalonMiniHomeConfig> = {
  sib: SIB_PARTNERS,
  sir: DEFAULT_DELEGATE,
  sip: DEFAULT_DELEGATE,
  btp: DEFAULT_DELEGATE,
  sie: DEFAULT_DELEGATE,
};

export function getSalonMiniHome(salon: Pick<Salon, 'id' | 'slug' | 'code'>): SalonMiniHomeConfig {
  const key = resolveSalonThemeKey(salon);
  return SALON_MINI_HOME[key] ?? DEFAULT_DELEGATE;
}
