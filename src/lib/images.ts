/**
 * SIB 2026 — Bibliothèque d'images
 * Priorité : chemins locaux (sib.ma / mockup) puis repli Unsplash.
 */
import { SIB_PHOTOS } from '../config/homeProductionImages';

const UNSPLASH = 'https://images.unsplash.com';

export type ImageSource = {
  id: string;
  alt: string;
  credit?: string;
  /** Asset local (/sib-ma, /mockup) — prioritaire */
  local?: string;
};

/**
 * Génère une URL Unsplash optimisée.
 * @param src        Objet ImageSource
 * @param width      Largeur souhaitée (px) — 1920 par défaut
 * @param height     Hauteur optionnelle (px) — si omis, ratio conservé
 * @param quality    Qualité 1-100 (80 par défaut)
 */
export function img(
  src: ImageSource,
  width = 1920,
  height?: number,
  quality = 80,
): string {
  if (src.local) return src.local;
  const params = new URLSearchParams({
    auto: 'format',
    fit: 'crop',
    q: String(quality),
    w: String(width),
  });
  if (height) {params.set('h', String(height));}
  return `${UNSPLASH}/${src.id}?${params.toString()}`;
}

/** Génère un srcset responsive pour une image */
export function srcSet(src: ImageSource, widths = [640, 960, 1280, 1920, 2560]): string {
  if (src.local) {
    const u = src.local;
    return `${u} 640w, ${u} 1280w, ${u} 1920w`;
  }
  return widths.map((w) => `${img(src, w)} ${w}w`).join(', ');
}

/* ============================================================
 * Catalogue d'images par thème
 * ============================================================ */

export const IMAGES = {
  /* Hero / bandeaux principaux */
  hero: {
    construction:     { id: 'photo-1541888946425-d81bb19240f5', alt: 'Hall d\'exposition SIB', local: SIB_PHOTOS.croac },
    architecture:     { id: 'photo-1487958449943-2429e8be8625', alt: 'Parc d\'Exposition Mohammed VI', local: SIB_PHOTOS.heroHall },
    interior:         { id: 'photo-1497366216548-37526070297c', alt: 'Grand hall professionnel', local: SIB_PHOTOS.heroHall },
    morocco:          { id: 'photo-1570133435079-6d02a712e33a', alt: 'Parc Mohammed VI, El Jadida', local: SIB_PHOTOS.parc },
    convention:       { id: 'photo-1540575467063-178a50c2df87', alt: 'Salon International du Bâtiment', local: SIB_PHOTOS.visitors },
    construction2:    { id: 'photo-1503387762-592deb58ef4e', alt: 'Stand exposant SIB', local: SIB_PHOTOS.stand },
    blueprints:       { id: 'photo-1503387837-b154d5074bd2', alt: 'Innovation BTP', local: SIB_PHOTOS.demo },
    design:           { id: 'photo-1586023492125-27b2c045efd7', alt: 'Inauguration SIB', local: SIB_PHOTOS.inauguration },
  },

  business: {
    handshake:        { id: 'photo-1556761175-5973dc0f32e7', alt: 'Rencontres B2B SIB', local: SIB_PHOTOS.b2b },
    meeting:          { id: 'photo-1600880292203-757bb62b4baf', alt: 'Conférences SIB', local: SIB_PHOTOS.conferences },
    networking:       { id: 'photo-1515187029135-18ee286d815b', alt: 'Visiteurs SIB', local: SIB_PHOTOS.visitors },
    conference:       { id: 'photo-1475721027785-f74eccf877e2', alt: 'Conférence SIB', local: SIB_PHOTOS.conferences },
    presentation:     { id: 'photo-1552664730-d307ca884978', alt: 'Démonstration stand', local: SIB_PHOTOS.demo },
    team:             { id: 'photo-1522071820081-009f0129c71c', alt: 'Inauguration officielle SIB', local: SIB_PHOTOS.inauguration },
  },

  exhibitors: {
    booth:            { id: 'photo-1505373877841-8d25f7d46678', alt: 'Stand exposant', local: SIB_PHOTOS.stand },
    tradeshow:        { id: 'photo-1531058020387-3be344556be6', alt: 'Salon SIB', local: SIB_PHOTOS.visitors },
    expo:             { id: 'photo-1511795409834-ef04bbd61622', alt: 'Hall d\'exposition', local: SIB_PHOTOS.heroHall },
    modernBooth:      { id: 'photo-1540575467063-178a50c2df87', alt: 'Espace démonstration', local: SIB_PHOTOS.international },
  },

  /* Matériaux & BTP */
  materials: {
    steel:            { id: 'photo-1504307651254-35680f356dfd', alt: 'Structure acier', credit: 'Unsplash' },
    concrete:         { id: 'photo-1517089596392-fb9a9033e05b', alt: 'Béton architectural', credit: 'Unsplash' },
    wood:             { id: 'photo-1540574163026-643ea20ade25', alt: 'Matériaux bois', credit: 'Unsplash' },
    glass:            { id: 'photo-1486325212027-8081e485255e', alt: 'Façade verre', credit: 'Unsplash' },
    tools:            { id: 'photo-1581235720704-06d3acfcb36f', alt: 'Outils professionnels', credit: 'Unsplash' },
    crane:            { id: 'photo-1504307651254-35680f356dfd', alt: 'Grue de chantier', credit: 'Unsplash' },
  },

  /* Maroc / héritage local */
  morocco: {
    zellige:          { id: 'photo-1548018560-c7196548e84d', alt: 'Parc Mohammed VI', local: SIB_PHOTOS.parc },
    riad:             { id: 'photo-1539020140153-e479b8c22e70', alt: 'El Jadida', local: SIB_PHOTOS.parc },
    casablanca:       { id: 'photo-1553178431-04e5a9fa2f8d', alt: 'Salon SIB Maroc', local: SIB_PHOTOS.croac },
    mosque:           { id: 'photo-1548018560-c7196548e84d', alt: 'Architecture', local: SIB_PHOTOS.parc },
    port:             { id: 'photo-1568674749775-96b32edbdba5', alt: 'Exposition', local: SIB_PHOTOS.heroHall },
    eljadida:         { id: 'photo-1539020140153-e479b8c22e70', alt: 'Parc d\'Exposition Mohammed VI, El Jadida', local: SIB_PHOTOS.parc },
  },

  events: {
    stage:            { id: 'photo-1505373877841-8d25f7d46678', alt: 'Conférences SIB', local: SIB_PHOTOS.conferences },
    audience:         { id: 'photo-1540575467063-178a50c2df87', alt: 'Public SIB', local: SIB_PHOTOS.visitors },
    workshop:         { id: 'photo-1552664730-d307ca884978', alt: 'Atelier SIB', local: SIB_PHOTOS.demo },
    keynote:          { id: 'photo-1475721027785-f74eccf877e2', alt: 'Keynote SIB', local: SIB_PHOTOS.conferences },
    conference:       { id: 'photo-1475721027785-f74eccf877e2', alt: 'Conférence SIB', local: SIB_PHOTOS.conferences },
    expo:             { id: 'photo-1511795409834-ef04bbd61622', alt: 'Salon SIB', local: SIB_PHOTOS.heroHall },
  },

  /* Tech / innovation */
  tech: {
    ai:               { id: 'photo-1677442136019-21780ecad995', alt: 'Intelligence artificielle', credit: 'Unsplash' },
    digital:          { id: 'photo-1519389950473-47ba0277781c', alt: 'Outils numériques', credit: 'Unsplash' },
    data:             { id: 'photo-1551288049-bebda4e38f71', alt: 'Données et graphiques', credit: 'Unsplash' },
    bim:              { id: 'photo-1581091226825-a6a2a5aee158', alt: 'Modélisation BIM', credit: 'Unsplash' },
    innovation:       { id: 'photo-1518770660439-4636190af475', alt: 'Innovation technologique', credit: 'Unsplash' },
  },

  /* Abstract / patterns / fonds */
  abstract: {
    geometric:        { id: 'photo-1557683316-973673baf926', alt: 'Motif géométrique', credit: 'Unsplash' },
    gradient:         { id: 'photo-1579546929518-9e396f3cc809', alt: 'Gradient abstrait', credit: 'Unsplash' },
    mesh:             { id: 'photo-1451187580459-43490279c0fa', alt: 'Maillage abstrait', credit: 'Unsplash' },
  },
} as const;

export type ImageCategory = keyof typeof IMAGES;
