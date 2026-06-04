export interface SibMaTimelineEntry {
  year: number;
  edition: string;
  slogan: string;
  exposants?: string;
  visiteurs?: string;
  emplacement?: string;
}

export interface SibMaImageSlot {
  local?: string | null;
  caption?: string;
  hash?: string;
  source?: string;
}

export interface SibMaImageSlots {
  hero?: SibMaImageSlot | null;
  mission?: SibMaImageSlot | null;
  reserve?: SibMaImageSlot | null;
  activiteSecteurs?: SibMaImageSlot | null;
  salonCards?: Record<string, SibMaImageSlot | null>;
  timeline?: Record<string, SibMaImageSlot | null>;
  bestOfOrder?: Array<{ position: number; caption: string; local: string }>;
}

export interface SibMaHomeContent {
  source: string;
  syncedAt: string;
  titre: string;
  titrePresentation: string;
  date: string;
  longueDate: string;
  emplacement: string;
  majesteSlogan: string | null;
  descriptionSalon: string;
  descriptionEmplacement: string;
  chiffresDescription: string;
  pourquoiExposer: string;
  pourquoiVisiter: string;
  titreDerniereEdition: string;
  stats: {
    exposants: string;
    pays: string;
    visiteurs: string;
    surface: string;
  };
  statsLabels: {
    exposants: string;
    pays: string;
    visiteurs: string;
    surface: string;
  };
  banner: { url: string; hash: string; local: string | null } | null;
  brochure: { url: string; name: string } | null;
  timeline: SibMaTimelineEntry[];
  imageSlots?: SibMaImageSlots;
  siteUrl: string;
}

let cache: SibMaHomeContent | null = null;
let loadPromise: Promise<SibMaHomeContent | null> | null = null;

export async function loadSibMaHomeContent(): Promise<SibMaHomeContent | null> {
  if (cache) return cache;
  if (!loadPromise) {
    loadPromise = fetch('/sib-ma/content.json', { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SibMaHomeContent | null) => {
        cache = data;
        return data;
      })
      .catch(() => null);
  }
  return loadPromise;
}

export function getSibMaHomeContentSync(): SibMaHomeContent | null {
  return cache;
}
