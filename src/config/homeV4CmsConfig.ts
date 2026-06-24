import type { SiteImageKey } from './siteImagesConfig';

const V4 = '/sib2026-home-v4/assets';
const V4_OFF = '/sib2026-home-v4/assets/official';

/** Clés CMS branchées sur la maquette home v4 (iframe). */
export const HOME_V4_CMS_KEYS = [
  'home_v4_hero',
  'home_v4_history_strip',
  'home_v4_ecosystem_globe',
  'home_v4_legacy_people',
  'home_v4_universes_strip',
  'home_v4_talks_stage',
  'home_v4_quicklink_plan',
  'home_v4_quicklink_exposer',
  'home_v4_quicklink_visiter',
] as const satisfies readonly SiteImageKey[];

export type HomeV4CmsKey = (typeof HOME_V4_CMS_KEYS)[number];

/** Variable CSS appliquée dans public/sib2026-home-v4/styles.css */
export const HOME_V4_CSS_VARS: Record<HomeV4CmsKey, string> = {
  home_v4_hero: '--v4-hero',
  home_v4_history_strip: '--v4-history',
  home_v4_ecosystem_globe: '--v4-globe',
  home_v4_legacy_people: '--v4-legacy',
  home_v4_universes_strip: '--v4-universes',
  home_v4_talks_stage: '--v4-talks',
  home_v4_quicklink_plan: '--v4-ql-plan',
  home_v4_quicklink_exposer: '--v4-ql-exposer',
  home_v4_quicklink_visiter: '--v4-ql-visiter',
};

export const HOME_V4_DEFAULT_URLS: Record<HomeV4CmsKey, string> = {
  home_v4_hero: `${V4}/sib-hero.webp`,
  home_v4_history_strip: `${V4}/history-strip.webp`,
  home_v4_ecosystem_globe: `${V4}/ecosystem-globe.webp`,
  home_v4_legacy_people: `${V4}/legacy-people.webp`,
  home_v4_universes_strip: `${V4}/universes-strip.webp`,
  home_v4_talks_stage: `${V4}/talks-stage.webp`,
  home_v4_quicklink_plan: `${V4}/plan-interactif-v2.webp`,
  home_v4_quicklink_exposer: `${V4_OFF}/expo-stands.jpg`,
  home_v4_quicklink_visiter: `${V4_OFF}/hall-visiteurs.webp`,
};

export const HOME_V4_CMS_MESSAGE = 'sib-home-v4-images';
export const HOME_V4_LANG_MESSAGE = 'sib-home-v4-lang';
