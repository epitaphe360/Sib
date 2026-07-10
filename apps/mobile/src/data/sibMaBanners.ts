import type { ImageSourcePropType } from 'react-native';
import { APP_IMAGES } from './images';

const CDN = 'https://sib.ma/backend/uploads';

/**
 * Bannières officielles sib.ma — URLs CDN (les assets statiques www.sib.ma/assets/images/bg/*
 * renvoient du HTML pour hero/banner/section_01).
 */
export const SIB_MA_BANNER_URLS = {
  cmsBannerDefault: `${CDN}/parc_exposition_eljadida_f4a9052968.png`,
  cmsBannerDefaultLarge: `${CDN}/large_parc_exposition_eljadida_f4a9052968.png`,
  staticHero: `${CDN}/parc_exposition_eljadida_f4a9052968.png`,
  staticBanner: `${CDN}/ALW_4646_e80870e56f_86f40519c5.jpg`,
  staticSection01: `${CDN}/7_7474f5a087.png`,
  staticSection02: 'https://www.sib.ma/assets/images/bg/section_02.jpg',
} as const;

/** Bannière promo accueil mobile — image locale copiée depuis sib.ma (pas Supabase UrbaEvent) */
export function getHomePromoBannerSource(): ImageSourcePropType {
  return APP_IMAGES.banner;
}
