/**
 * Définitions de toutes les images configurables du site.
 * Chaque entrée donne la clé unique, le label admin, la catégorie et l'URL CDN par défaut.
 */
import { SIB_PHOTOS } from './homeProductionImages';
import { SIB40_IMAGES } from './sib40HomeAssets';
import { sibMaUpload } from './sibMaRemoteUrls';
import { HOME_V4_DEFAULT_URLS } from './homeV4CmsConfig';

export type SiteImageKey =
  | 'home_hero_hall'
  | 'home_parc'
  | 'home_stand'
  | 'home_visitors'
  | 'home_conferences'
  | 'home_b2b'
  | 'home_inauguration'
  | 'home_international'
  | 'home_world_map'
  | 'sib40_hero'
  | 'sib40_portrait_0'
  | 'sib40_portrait_1'
  | 'sib40_portrait_2'
  | 'sib40_portrait_3'
  | 'sib40_timeline_1986'
  | 'sib40_timeline_2000'
  | 'sib40_timeline_2012'
  | 'sib40_timeline_2022'
  | 'sib40_timeline_2026'
  | 'builders_portrait_0'
  | 'builders_portrait_1'
  | 'builders_portrait_2'
  | 'builders_portrait_3'
  | 'home_v4_hero'
  | 'home_v4_history_strip'
  | 'home_v4_ecosystem_globe'
  | 'home_v4_legacy_people'
  | 'home_v4_universes_strip'
  | 'home_v4_talks_stage'
  | 'home_v4_quicklink_plan'
  | 'home_v4_quicklink_exposer'
  | 'home_v4_quicklink_visiter'
  | 'sib2026_hero'
  | 'sib2026_timeline_1'
  | 'sib2026_timeline_2'
  | 'sib2026_timeline_3'
  | 'sib2026_timeline_4'
  | 'sib2026_timeline_5'
  | 'sib2026_reserve'
  | 'sib2026_salon_exposer'
  | 'sib2026_salon_visiter'
  | 'sib2026_salon_sib_talks'
  | 'sib2026_salon_b2b'
  | 'sib2026_salon_diner'
  | 'sib2026_salon_international';

export interface SiteImageDef {
  key: SiteImageKey;
  label: string;
  category: 'home' | 'sib40' | 'builders' | 'sib2026' | 'sib2026_legacy';
  defaultUrl: string;
  previewAspect?: string;
}

export const SITE_IMAGE_DEFINITIONS: SiteImageDef[] = [
  // ── Pages Accueil ──────────────────────────────────────────
  { key: 'home_hero_hall',     label: 'Hero principal — Hall',        category: 'home',     defaultUrl: SIB_PHOTOS.heroHall,      previewAspect: 'aspect-video' },
  { key: 'home_parc',          label: "Parc d'exposition",            category: 'home',     defaultUrl: SIB_PHOTOS.parc,          previewAspect: 'aspect-video' },
  { key: 'home_stand',         label: 'Stand exposant',               category: 'home',     defaultUrl: SIB_PHOTOS.stand,         previewAspect: 'aspect-video' },
  { key: 'home_visitors',      label: 'Visiteurs professionnels',     category: 'home',     defaultUrl: SIB_PHOTOS.visitors,      previewAspect: 'aspect-video' },
  { key: 'home_conferences',   label: 'Conférences & panels',         category: 'home',     defaultUrl: SIB_PHOTOS.conferences,   previewAspect: 'aspect-video' },
  { key: 'home_b2b',           label: 'Réunions B2B',                 category: 'home',     defaultUrl: SIB_PHOTOS.b2b,           previewAspect: 'aspect-video' },
  { key: 'home_inauguration',  label: "Cérémonie d'inauguration",    category: 'home',     defaultUrl: SIB_PHOTOS.inauguration,  previewAspect: 'aspect-video' },
  { key: 'home_international', label: 'Dimension internationale',     category: 'home',     defaultUrl: SIB_PHOTOS.international, previewAspect: 'aspect-video' },
  { key: 'home_world_map',     label: 'Carte du monde',               category: 'home',     defaultUrl: SIB_PHOTOS.worldMap,      previewAspect: 'aspect-[3/1]' },
  // ── Page 40 ans ────────────────────────────────────────────
  { key: 'sib40_hero',         label: 'Hero — SIB 40 ans',           category: 'sib40',    defaultUrl: SIB40_IMAGES.hero,        previewAspect: 'aspect-video' },
  { key: 'sib40_portrait_0',   label: 'Portrait 1',                   category: 'sib40',    defaultUrl: SIB40_IMAGES.portraits[0], previewAspect: 'aspect-square' },
  { key: 'sib40_portrait_1',   label: 'Portrait 2',                   category: 'sib40',    defaultUrl: SIB40_IMAGES.portraits[1], previewAspect: 'aspect-square' },
  { key: 'sib40_portrait_2',   label: 'Portrait 3',                   category: 'sib40',    defaultUrl: SIB40_IMAGES.portraits[2], previewAspect: 'aspect-square' },
  { key: 'sib40_portrait_3',   label: 'Portrait 4',                   category: 'sib40',    defaultUrl: SIB40_IMAGES.portraits[3], previewAspect: 'aspect-square' },
  { key: 'sib40_timeline_1986',label: 'Timeline — 1986',              category: 'sib40',    defaultUrl: SIB40_IMAGES.timeline.y1986, previewAspect: 'aspect-video' },
  { key: 'sib40_timeline_2000',label: 'Timeline — 2000',              category: 'sib40',    defaultUrl: SIB40_IMAGES.timeline.y2000, previewAspect: 'aspect-video' },
  { key: 'sib40_timeline_2012',label: 'Timeline — 2012',              category: 'sib40',    defaultUrl: SIB40_IMAGES.timeline.y2012, previewAspect: 'aspect-video' },
  { key: 'sib40_timeline_2022',label: 'Timeline — 2022',              category: 'sib40',    defaultUrl: SIB40_IMAGES.timeline.y2022, previewAspect: 'aspect-video' },
  { key: 'sib40_timeline_2026',label: 'Timeline — 2026',              category: 'sib40',    defaultUrl: SIB40_IMAGES.timeline.y2026, previewAspect: 'aspect-video' },
  // ── Page Femmes & Hommes ───────────────────────────────────
  { key: 'builders_portrait_0',label: 'Portrait — Architecte',        category: 'builders', defaultUrl: SIB40_IMAGES.portraits[0], previewAspect: 'aspect-square' },
  { key: 'builders_portrait_1',label: 'Portrait — Ingénieur BTP',     category: 'builders', defaultUrl: SIB40_IMAGES.portraits[1], previewAspect: 'aspect-square' },
  { key: 'builders_portrait_2',label: "Portrait — Designer d'int.",   category: 'builders', defaultUrl: SIB40_IMAGES.portraits[2], previewAspect: 'aspect-square' },
  { key: 'builders_portrait_3',label: 'Portrait — Chef de chantier',  category: 'builders', defaultUrl: SIB40_IMAGES.portraits[3], previewAspect: 'aspect-square' },
  // ── Accueil SIB 2026 — maquette home v4 (iframe) ───────────
  { key: 'home_v4_hero',              label: 'Hero principal — photo d’accueil',           category: 'sib2026', defaultUrl: HOME_V4_DEFAULT_URLS.home_v4_hero,              previewAspect: 'aspect-video' },
  { key: 'home_v4_history_strip',      label: 'Timeline 40 ans — bande photos (5 dates)',   category: 'sib2026', defaultUrl: HOME_V4_DEFAULT_URLS.home_v4_history_strip,      previewAspect: 'aspect-[5/1]' },
  { key: 'home_v4_ecosystem_globe',    label: 'Écosystème BTP — globe central',             category: 'sib2026', defaultUrl: HOME_V4_DEFAULT_URLS.home_v4_ecosystem_globe,    previewAspect: 'aspect-square' },
  { key: 'home_v4_legacy_people',      label: 'Bannière « 40 ans d’héritage »',            category: 'sib2026', defaultUrl: HOME_V4_DEFAULT_URLS.home_v4_legacy_people,      previewAspect: 'aspect-video' },
  { key: 'home_v4_universes_strip',    label: '6 univers — bande photos',                 category: 'sib2026', defaultUrl: HOME_V4_DEFAULT_URLS.home_v4_universes_strip,    previewAspect: 'aspect-[6/1]' },
  { key: 'home_v4_talks_stage',        label: 'SIB Talks — scène / conférences',            category: 'sib2026', defaultUrl: HOME_V4_DEFAULT_URLS.home_v4_talks_stage,        previewAspect: 'aspect-video' },
  { key: 'home_v4_quicklink_plan',     label: 'Lien rapide — Plan interactif',            category: 'sib2026', defaultUrl: HOME_V4_DEFAULT_URLS.home_v4_quicklink_plan,     previewAspect: 'aspect-video' },
  { key: 'home_v4_quicklink_exposer',  label: 'Lien rapide — Exposer au SIB',             category: 'sib2026', defaultUrl: HOME_V4_DEFAULT_URLS.home_v4_quicklink_exposer,  previewAspect: 'aspect-video' },
  { key: 'home_v4_quicklink_visiter',  label: 'Lien rapide — Visiter le salon',           category: 'sib2026', defaultUrl: HOME_V4_DEFAULT_URLS.home_v4_quicklink_visiter,  previewAspect: 'aspect-video' },
  // ── Legacy React home (routes /accueil/*) — conservé en base ─
  { key: 'sib2026_hero',               label: '[Legacy] Hero React P1',                     category: 'sib2026_legacy', defaultUrl: sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),        previewAspect: 'aspect-video' },
  { key: 'sib2026_timeline_1',         label: '[Legacy] Timeline 1',                      category: 'sib2026_legacy', defaultUrl: sibMaUpload('MUS_3588_01206249cb_110540f778.jpg'),         previewAspect: 'aspect-video' },
  { key: 'sib2026_timeline_2',         label: '[Legacy] Timeline 2',                      category: 'sib2026_legacy', defaultUrl: sibMaUpload('ALW_3951_bde2fd255e_2bc047ae4c.jpg'),         previewAspect: 'aspect-video' },
  { key: 'sib2026_timeline_3',         label: '[Legacy] Timeline 3',                      category: 'sib2026_legacy', defaultUrl: sibMaUpload('ALW_6459_33285f4622_3856730bca.jpg'),         previewAspect: 'aspect-video' },
  { key: 'sib2026_timeline_4',         label: '[Legacy] Timeline 4',                      category: 'sib2026_legacy', defaultUrl: sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),         previewAspect: 'aspect-video' },
  { key: 'sib2026_timeline_5',         label: '[Legacy] Timeline 5',                      category: 'sib2026_legacy', defaultUrl: sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),    previewAspect: 'aspect-video' },
  { key: 'sib2026_reserve',            label: '[Legacy] Bannière réserver',                 category: 'sib2026_legacy', defaultUrl: sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),    previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_exposer',      label: '[Legacy] Carte exposer',                   category: 'sib2026_legacy', defaultUrl: sibMaUpload('2_1e3351c897.png'),                          previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_visiter',      label: '[Legacy] Carte visiter',                   category: 'sib2026_legacy', defaultUrl: sibMaUpload('7_7474f5a087.png'),                          previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_sib_talks',    label: '[Legacy] Carte SIB Talks',                 category: 'sib2026_legacy', defaultUrl: sibMaUpload('3_c9f5820a94.png'),                          previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_b2b',          label: '[Legacy] Carte B2B',                       category: 'sib2026_legacy', defaultUrl: sibMaUpload('4_9d2cb5a776.png'),                          previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_diner',        label: '[Legacy] Carte dîner',                     category: 'sib2026_legacy', defaultUrl: sibMaUpload('1_a559ea5363.png'),                          previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_international',label: '[Legacy] Carte international',             category: 'sib2026_legacy', defaultUrl: sibMaUpload('5_833920f28a.png'),                          previewAspect: 'aspect-video' },
];

const DEFAULTS: Record<SiteImageKey, string> = Object.fromEntries(
  SITE_IMAGE_DEFINITIONS.map(d => [d.key, d.defaultUrl])
) as Record<SiteImageKey, string>;

export function getSiteImageDefault(key: SiteImageKey): string {
  return DEFAULTS[key] ?? '';
}
