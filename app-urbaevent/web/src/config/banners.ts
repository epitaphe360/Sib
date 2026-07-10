import { ROUTES } from '../lib/routes';
import { resolveHomeImage } from './sibMaRemoteUrls';

export type BannerKey = 'urbaevent' | 'ministry_egide';

export interface BannerDefinition {
  key: BannerKey;
  /** Libellé enregistré en base (site_banners.label) */
  label: string;
  labelKey: string;
  descriptionKey: string;
  hintKey?: string;
  defaultSrc: string;
  fallbackSrc?: string;
  linkTo?: string;
  /** Aperçu dans le panneau admin */
  previewObjectFit?: 'cover' | 'contain';
  previewAspectClass?: string;
}

export const BANNER_DEFINITIONS: BannerDefinition[] = [
  {
    key: 'ministry_egide',
    label: "Logo — Sous l'égide du (bandeau accueil)",
    labelKey: 'admin.banner.ministry_label',
    descriptionKey: 'admin.banner.ministry_desc',
    hintKey: 'admin.banner.ministry_hint',
    defaultSrc: '/logo-ministere.png',
    fallbackSrc: '/logo-ministere.svg',
    previewObjectFit: 'contain',
    previewAspectClass: 'aspect-[5/2] max-h-28 bg-white dark:bg-neutral-900',
    linkTo: ROUTES.HOME,
  },
  {
    key: 'urbaevent',
    label: "Bannière promotionnelle (page d'accueil)",
    labelKey: 'admin.banner.urbaevent_label',
    descriptionKey: 'admin.banner.urbaevent_desc',
    defaultSrc: '/mockup/hero-hall.jpg',
    fallbackSrc: '/sib-ma/parc_exposition_eljadida_f4a9052968.png',
    linkTo: ROUTES.EXHIBITOR_SUBSCRIPTION,
    previewObjectFit: 'cover',
    previewAspectClass: 'aspect-[21/9]',
  },
];

export function getBannerDefinition(key: BannerKey): BannerDefinition | undefined {
  return BANNER_DEFINITIONS.find((b) => b.key === key);
}

export function getBannerDefaultSrc(key: BannerKey): string {
  const raw = getBannerDefinition(key)?.defaultSrc ?? '/banners/urbaevent-banner.svg';
  return resolveHomeImage(raw);
}

export function getBannerFallbackSrc(key: BannerKey): string {
  const raw = getBannerDefinition(key)?.fallbackSrc ?? '/banners/urbaevent-banner.jpg';
  return resolveHomeImage(raw);
}
