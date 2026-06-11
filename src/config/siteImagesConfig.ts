/**
 * Définitions de toutes les images configurables du site.
 * Chaque entrée donne la clé unique, le label admin, la catégorie et l'URL CDN par défaut.
 */
import { SIB_PHOTOS } from './homeProductionImages';
import { SIB40_IMAGES } from './sib40HomeAssets';

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
  | 'builders_portrait_3';

export interface SiteImageDef {
  key: SiteImageKey;
  label: string;
  category: 'home' | 'sib40' | 'builders';
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
];

const DEFAULTS: Record<SiteImageKey, string> = Object.fromEntries(
  SITE_IMAGE_DEFINITIONS.map(d => [d.key, d.defaultUrl])
) as Record<SiteImageKey, string>;

export function getSiteImageDefault(key: SiteImageKey): string {
  return DEFAULTS[key] ?? '';
}
