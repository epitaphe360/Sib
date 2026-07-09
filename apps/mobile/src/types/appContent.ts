import type { SalonCmsFields, SalonPartnersCms } from '../lib/salonCms';

export type MobilePlatformStat = { value: string; labelKey: string };

export type { SalonCmsFields, SalonPartnersCms };

export type MobileAppContent = {
  version: number;
  updatedAt: string;
  hero: {
    badgeOrg: string;
    titlePart1: string;
    titlePart2: string;
    subtitleFr: string;
    subtitleEn: string;
    subtitleAr: string;
  };
  platformStats: MobilePlatformStat[];
  images: Record<string, string>;
  payment: {
    iban?: string;
    bic?: string;
    bankName?: string;
    accountHolder?: string;
    domiciliation?: string;
    vipPriceEur?: number;
    currency?: string;
  };
  salonStats?: Record<string, Partial<SalonCmsFields>>;
  salonPartners?: Record<string, Partial<SalonPartnersCms>>;
};

export const DEFAULT_MOBILE_APP_CONTENT: MobileAppContent = {
  version: 1,
  updatedAt: '',
  hero: {
    badgeOrg: 'URBACOM',
    titlePart1: 'Urba',
    titlePart2: 'Event',
    subtitleFr: 'La plateforme officielle des salons UrbaEvent',
    subtitleEn: 'The official UrbaEvent trade shows platform',
    subtitleAr: 'المنصة الرسمية لمعارض UrbaEvent',
  },
  platformStats: [
    { value: '5', labelKey: 'home.urba.statSalons' },
    { value: '500+', labelKey: 'home.urba.statExhibitors' },
    { value: '25K+', labelKey: 'home.urba.statVisitors' },
    { value: '40+', labelKey: 'home.urba.statCountries' },
  ],
  images: {},
  payment: { vipPriceEur: 700, currency: 'EUR', bankName: 'Attijariwafa bank', accountHolder: 'URBACOM' },
  salonStats: {},
  salonPartners: {},
};
