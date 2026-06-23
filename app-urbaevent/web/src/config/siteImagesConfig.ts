/**
 * Définitions de toutes les images configurables du site.
 * Chaque entrée donne la clé unique, le label admin, la catégorie et l'URL CDN par défaut.
 */
import { SIB_PHOTOS } from './homeProductionImages';
import { SIB40_IMAGES } from './sib40HomeAssets';
import { sibMaUpload } from './sibMaRemoteUrls';

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
  category: 'home' | 'sib40' | 'builders' | 'sib2026';
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
  // ── Pages Accueil SIB 2026 (P1–P8) ────────────────────────
  { key: 'sib2026_hero',               label: 'Hero principal — Hall SIB 2026',      category: 'sib2026', defaultUrl: sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),        previewAspect: 'aspect-video' },
  { key: 'sib2026_timeline_1',         label: 'Photo mission / timeline 1',          category: 'sib2026', defaultUrl: sibMaUpload('MUS_3588_01206249cb_110540f778.jpg'),         previewAspect: 'aspect-video' },
  { key: 'sib2026_timeline_2',         label: 'Photo mission / timeline 2',          category: 'sib2026', defaultUrl: sibMaUpload('ALW_3951_bde2fd255e_2bc047ae4c.jpg'),         previewAspect: 'aspect-video' },
  { key: 'sib2026_timeline_3',         label: 'Photo mission / timeline 3',          category: 'sib2026', defaultUrl: sibMaUpload('ALW_6459_33285f4622_3856730bca.jpg'),         previewAspect: 'aspect-video' },
  { key: 'sib2026_timeline_4',         label: 'Photo mission / timeline 4',          category: 'sib2026', defaultUrl: sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),         previewAspect: 'aspect-video' },
  { key: 'sib2026_timeline_5',         label: 'Photo timeline 5 — 2026',             category: 'sib2026', defaultUrl: sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),    previewAspect: 'aspect-video' },
  { key: 'sib2026_reserve',            label: 'Bannière Réserver — Parc El Jadida',  category: 'sib2026', defaultUrl: sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),    previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_exposer',      label: 'Carte Salon — Exposer',               category: 'sib2026', defaultUrl: sibMaUpload('2_1e3351c897.png'),                          previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_visiter',      label: 'Carte Salon — Visiter',               category: 'sib2026', defaultUrl: sibMaUpload('7_7474f5a087.png'),                          previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_sib_talks',    label: 'Carte Salon — SIB Talks',             category: 'sib2026', defaultUrl: sibMaUpload('3_c9f5820a94.png'),                          previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_b2b',          label: 'Carte Salon — Meetings B2B',          category: 'sib2026', defaultUrl: sibMaUpload('4_9d2cb5a776.png'),                          previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_diner',        label: 'Carte Salon — Dîner Officiel',        category: 'sib2026', defaultUrl: sibMaUpload('1_a559ea5363.png'),                          previewAspect: 'aspect-video' },
  { key: 'sib2026_salon_international',label: 'Carte Salon — International',         category: 'sib2026', defaultUrl: sibMaUpload('5_833920f28a.png'),                          previewAspect: 'aspect-video' },
];

const DEFAULTS: Record<SiteImageKey, string> = Object.fromEntries(
  SITE_IMAGE_DEFINITIONS.map(d => [d.key, d.defaultUrl])
) as Record<SiteImageKey, string>;

export function getSiteImageDefault(key: SiteImageKey): string {
  return DEFAULTS[key] ?? '';
}
