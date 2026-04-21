/**
 * SIB 2026 — Bibliothèque d'images 4K
 *
 * Source: Unsplash (licence libre, usage commercial autorisé)
 * Toutes les URLs utilisent les paramètres de transformation Unsplash
 * pour servir des images optimisées (webp, dimensions adaptées).
 *
 * Paramètres utilisés :
 *  - auto=format       : meilleur format selon navigateur (webp/avif)
 *  - fit=crop          : crop intelligent (préserve le sujet)
 *  - q=80              : qualité 80% (bon compromis poids/qualité)
 *  - w=<width>         : largeur cible
 *
 * Utilisation :
 *   import { IMAGES, img } from '@/lib/images';
 *   <img src={img(IMAGES.hero.construction, 1920)} />
 */

const UNSPLASH = 'https://images.unsplash.com';

export type ImageSource = {
  /** Unsplash photo ID */
  id: string;
  /** Texte alternatif (accessibilité) */
  alt: string;
  /** Crédit photographique */
  credit?: string;
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
  const params = new URLSearchParams({
    auto: 'format',
    fit: 'crop',
    q: String(quality),
    w: String(width),
  });
  if (height) params.set('h', String(height));
  return `${UNSPLASH}/${src.id}?${params.toString()}`;
}

/** Génère un srcset responsive pour une image */
export function srcSet(src: ImageSource, widths = [640, 960, 1280, 1920, 2560]): string {
  return widths.map((w) => `${img(src, w)} ${w}w`).join(', ');
}

/* ============================================================
 * Catalogue d'images par thème
 * ============================================================ */

export const IMAGES = {
  /* Hero / bandeaux principaux */
  hero: {
    /** Gratte-ciel en construction, vue moderne */
    construction:     { id: 'photo-1541888946425-d81bb19240f5', alt: 'Chantier de construction moderne', credit: 'Unsplash' },
    /** Architecture contemporaine, lignes épurées */
    architecture:     { id: 'photo-1487958449943-2429e8be8625', alt: 'Architecture contemporaine', credit: 'Unsplash' },
    /** Intérieur industriel, grand volume */
    interior:         { id: 'photo-1497366216548-37526070297c', alt: 'Grand hall professionnel', credit: 'Unsplash' },
    /** Casablanca / Maroc urbain */
    morocco:          { id: 'photo-1570133435079-6d02a712e33a', alt: 'Architecture marocaine moderne', credit: 'Unsplash' },
    /** Salon professionnel / convention */
    convention:       { id: 'photo-1540575467063-178a50c2df87', alt: 'Salon professionnel', credit: 'Unsplash' },
    /** BTP, ouvriers, chantier */
    construction2:    { id: 'photo-1503387762-592deb58ef4e', alt: 'Équipe de chantier BTP', credit: 'Unsplash' },
    /** Plan architectural, blueprints */
    blueprints:       { id: 'photo-1503387837-b154d5074bd2', alt: 'Plans architecturaux', credit: 'Unsplash' },
  },

  /* Networking / business */
  business: {
    handshake:        { id: 'photo-1556761175-5973dc0f32e7', alt: 'Poignée de main professionnelle', credit: 'Unsplash' },
    meeting:          { id: 'photo-1600880292203-757bb62b4baf', alt: 'Réunion business', credit: 'Unsplash' },
    networking:       { id: 'photo-1515187029135-18ee286d815b', alt: 'Networking professionnel', credit: 'Unsplash' },
    conference:       { id: 'photo-1475721027785-f74eccf877e2', alt: 'Conférence professionnelle', credit: 'Unsplash' },
    presentation:     { id: 'photo-1552664730-d307ca884978', alt: 'Présentation business', credit: 'Unsplash' },
    team:             { id: 'photo-1522071820081-009f0129c71c', alt: 'Équipe professionnelle', credit: 'Unsplash' },
  },

  /* Exposants / stands */
  exhibitors: {
    booth:            { id: 'photo-1505373877841-8d25f7d46678', alt: 'Stand d\'exposant', credit: 'Unsplash' },
    tradeshow:        { id: 'photo-1531058020387-3be344556be6', alt: 'Salon professionnel', credit: 'Unsplash' },
    expo:             { id: 'photo-1511795409834-ef04bbd61622', alt: 'Grand hall d\'exposition', credit: 'Unsplash' },
    modernBooth:      { id: 'photo-1540575467063-178a50c2df87', alt: 'Stand moderne', credit: 'Unsplash' },
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
    zellige:          { id: 'photo-1548018560-c7196548e84d', alt: 'Motif zellige traditionnel', credit: 'Unsplash' },
    riad:             { id: 'photo-1539020140153-e479b8c22e70', alt: 'Architecture marocaine', credit: 'Unsplash' },
    casablanca:       { id: 'photo-1553178431-04e5a9fa2f8d', alt: 'Casablanca moderne', credit: 'Unsplash' },
    mosque:           { id: 'photo-1548018560-c7196548e84d', alt: 'Architecture traditionnelle', credit: 'Unsplash' },
    port:             { id: 'photo-1568674749775-96b32edbdba5', alt: 'Port maritime', credit: 'Unsplash' },
  },

  /* Événements / conférences */
  events: {
    stage:            { id: 'photo-1505373877841-8d25f7d46678', alt: 'Scène de conférence', credit: 'Unsplash' },
    audience:         { id: 'photo-1540575467063-178a50c2df87', alt: 'Public d\'une conférence', credit: 'Unsplash' },
    workshop:         { id: 'photo-1552664730-d307ca884978', alt: 'Atelier professionnel', credit: 'Unsplash' },
    keynote:          { id: 'photo-1475721027785-f74eccf877e2', alt: 'Keynote', credit: 'Unsplash' },
  },

  /* Tech / innovation */
  tech: {
    ai:               { id: 'photo-1677442136019-21780ecad995', alt: 'Intelligence artificielle', credit: 'Unsplash' },
    digital:          { id: 'photo-1519389950473-47ba0277781c', alt: 'Outils numériques', credit: 'Unsplash' },
    data:             { id: 'photo-1551288049-bebda4e38f71', alt: 'Données et graphiques', credit: 'Unsplash' },
    bim:              { id: 'photo-1581091226825-a6a2a5aee158', alt: 'Modélisation BIM', credit: 'Unsplash' },
  },

  /* Abstract / patterns / fonds */
  abstract: {
    geometric:        { id: 'photo-1557683316-973673baf926', alt: 'Motif géométrique', credit: 'Unsplash' },
    gradient:         { id: 'photo-1579546929518-9e396f3cc809', alt: 'Gradient abstrait', credit: 'Unsplash' },
    mesh:             { id: 'photo-1451187580459-43490279c0fa', alt: 'Maillage abstrait', credit: 'Unsplash' },
  },
} as const;

export type ImageCategory = keyof typeof IMAGES;
