import type { ImageSourcePropType } from 'react-native';
import { APP_IMAGES } from './images';

/**
 * Bannières officielles sib.ma (CMS Strapi + assets statiques du site).
 * @see public/sib-ma/content.json → banner (banner_default)
 * @see https://www.sib.ma/assets/images/bg/
 */
export const SIB_MA_BANNER_URLS = {
  /** Champ Strapi `banner_default` — même visuel que le bloc lieu sur sib.ma */
  cmsBannerDefault:
    'https://sib.ma/backend/uploads/parc_exposition_eljadida_f4a9052968.png',
  cmsBannerDefaultLarge:
    'https://sib.ma/backend/uploads/large_parc_exposition_eljadida_f4a9052968.png',
  staticHero: 'https://www.sib.ma/assets/images/bg/hero.jpg',
  staticBanner: 'https://www.sib.ma/assets/images/bg/banner.jpg',
  staticSection01: 'https://www.sib.ma/assets/images/bg/section_01.jpg',
  staticSection02: 'https://www.sib.ma/assets/images/bg/section_02.jpg',
} as const;

/** Bannière promo accueil mobile — image locale copiée depuis sib.ma (pas Supabase UrbaEvent) */
export function getHomePromoBannerSource(): ImageSourcePropType {
  return APP_IMAGES.banner;
}
