/**
 * Registre des pages d'accueil — 9 pages SIB + 8 nouvelles (Manus / propositions étendues).
 */
import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  Maximize2,
  Grid3x3,
  PanelLeft,
  Minus,
  Sparkles,
  Crown,
  Image,
  Layers,
  Zap,
  Target,
  Users,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { ROUTES } from '../lib/routes';

export type HomePageVariantId =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

/** Composant page à charger (lazy) */
export type HomePageComponentKey =
  | 'variant1'
  | 'variant2'
  | 'variant3'
  | 'variant4'
  | 'variant5'
  | 'variant6'
  | 'variant7'
  | 'sib2026'
  | 'optimized';

export interface HomePageEntry {
  id: HomePageVariantId;
  route: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  label: string;
  component: HomePageComponentKey;
  /** Série affichée dans le menu ACCUEIL */
  series: 'classic' | 'new';
}

const ROUTES_BY_ID: Record<HomePageVariantId, string> = {
  1: ROUTES.HOME_P1,
  2: ROUTES.HOME_P2,
  3: ROUTES.HOME_P3,
  4: ROUTES.HOME_P4,
  5: ROUTES.HOME_P5,
  6: ROUTES.HOME_P6,
  7: ROUTES.HOME_P7,
  8: ROUTES.HOME_P8,
  9: ROUTES.HOME_P9,
  10: ROUTES.HOME_P10,
  11: ROUTES.HOME_P11,
  12: ROUTES.HOME_P12,
  13: ROUTES.HOME_P13,
  14: ROUTES.HOME_P14,
  15: ROUTES.HOME_P15,
  16: ROUTES.HOME_P16,
  17: ROUTES.HOME_P17,
};

/** Série actuelle — 9 pages (P8, P9, P1–P7) */
export const HOME_PAGES_CLASSIC: HomePageEntry[] = [
  {
    id: 8,
    route: ROUTES.HOME_P8,
    icon: Image,
    titleKey: 'nav.home_page.p8_title',
    descKey: 'nav.home_page.p8_desc',
    label: 'P8 — Page officielle SIB 2026',
    component: 'sib2026',
    series: 'classic',
  },
  {
    id: 9,
    route: ROUTES.HOME_P9,
    icon: Zap,
    titleKey: 'nav.home_page.p9_title',
    descKey: 'nav.home_page.p9_desc',
    label: 'P9 — Optimisée (Fusion P7+P8)',
    component: 'optimized',
    series: 'classic',
  },
  {
    id: 1,
    route: ROUTES.HOME_P1,
    icon: LayoutGrid,
    titleKey: 'nav.home_page.p1_title',
    descKey: 'nav.home_page.p1_desc',
    label: 'P1 — Batimat Classic',
    component: 'variant1',
    series: 'classic',
  },
  {
    id: 2,
    route: ROUTES.HOME_P2,
    icon: Maximize2,
    titleKey: 'nav.home_page.p2_title',
    descKey: 'nav.home_page.p2_desc',
    label: 'P2 — BIG5 Mega',
    component: 'variant2',
    series: 'classic',
  },
  {
    id: 3,
    route: ROUTES.HOME_P3,
    icon: Grid3x3,
    titleKey: 'nav.home_page.p3_title',
    descKey: 'nav.home_page.p3_desc',
    label: 'P3 — Construmat Grid',
    component: 'variant3',
    series: 'classic',
  },
  {
    id: 4,
    route: ROUTES.HOME_P4,
    icon: PanelLeft,
    titleKey: 'nav.home_page.p4_title',
    descKey: 'nav.home_page.p4_desc',
    label: 'P4 — Split Navy',
    component: 'variant4',
    series: 'classic',
  },
  {
    id: 5,
    route: ROUTES.HOME_P5,
    icon: Minus,
    titleKey: 'nav.home_page.p5_title',
    descKey: 'nav.home_page.p5_desc',
    label: 'P5 — Minimal Line',
    component: 'variant5',
    series: 'classic',
  },
  {
    id: 6,
    route: ROUTES.HOME_P6,
    icon: Sparkles,
    titleKey: 'nav.home_page.p6_title',
    descKey: 'nav.home_page.p6_desc',
    label: 'P6 — Glass Light',
    component: 'variant6',
    series: 'classic',
  },
  {
    id: 7,
    route: ROUTES.HOME_P7,
    icon: Crown,
    titleKey: 'nav.home_page.p7_title',
    descKey: 'nav.home_page.p7_desc',
    label: 'P7 — World Class',
    component: 'variant7',
    series: 'classic',
  },
];

/** 8 nouvelles pages — routes dédiées (contenu Manus / déclinaisons) */
export const HOME_PAGES_NEW: HomePageEntry[] = [
  {
    id: 10,
    route: ROUTES.HOME_P10,
    icon: Image,
    titleKey: 'nav.home_page.p10_title',
    descKey: 'nav.home_page.p10_desc',
    label: 'P10 — Figma Manus (officielle+)',
    component: 'sib2026',
    series: 'new',
  },
  {
    id: 11,
    route: ROUTES.HOME_P11,
    icon: Target,
    titleKey: 'nav.home_page.p11_title',
    descKey: 'nav.home_page.p11_desc',
    label: 'P11 — Lead Magnet & témoignages',
    component: 'variant1',
    series: 'new',
  },
  {
    id: 12,
    route: ROUTES.HOME_P12,
    icon: TrendingUp,
    titleKey: 'nav.home_page.p12_title',
    descKey: 'nav.home_page.p12_desc',
    label: 'P12 — Urgence & FOMO',
    component: 'variant7',
    series: 'new',
  },
  {
    id: 13,
    route: ROUTES.HOME_P13,
    icon: Users,
    titleKey: 'nav.home_page.p13_title',
    descKey: 'nav.home_page.p13_desc',
    label: 'P13 — Engagement multi-profils',
    component: 'optimized',
    series: 'new',
  },
  {
    id: 14,
    route: ROUTES.HOME_P14,
    icon: Maximize2,
    titleKey: 'nav.home_page.p14_title',
    descKey: 'nav.home_page.p14_desc',
    label: 'P14 — BIG5 immersive',
    component: 'variant2',
    series: 'new',
  },
  {
    id: 15,
    route: ROUTES.HOME_P15,
    icon: Grid3x3,
    titleKey: 'nav.home_page.p15_title',
    descKey: 'nav.home_page.p15_desc',
    label: 'P15 — Grille modulaire',
    component: 'variant3',
    series: 'new',
  },
  {
    id: 16,
    route: ROUTES.HOME_P16,
    icon: Layers,
    titleKey: 'nav.home_page.p16_title',
    descKey: 'nav.home_page.p16_desc',
    label: 'P16 — Glass & dégradés',
    component: 'variant6',
    series: 'new',
  },
  {
    id: 17,
    route: ROUTES.HOME_P17,
    icon: Building2,
    titleKey: 'nav.home_page.p17_title',
    descKey: 'nav.home_page.p17_desc',
    label: 'P17 — Split & conversion',
    component: 'variant4',
    series: 'new',
  },
];

export const ALL_HOME_PAGES: HomePageEntry[] = [...HOME_PAGES_CLASSIC, ...HOME_PAGES_NEW];

export function getHomePageEntry(id: HomePageVariantId): HomePageEntry | undefined {
  return ALL_HOME_PAGES.find((p) => p.id === id);
}

export function getHomeRouteForPageId(id: HomePageVariantId): string {
  return ROUTES_BY_ID[id] ?? ROUTES.HOME_P9;
}

export function getHomePageVariantFromPath(pathname: string): HomePageVariantId | null {
  const match = pathname.match(/^\/accueil\/(\d{1,2})$/);
  if (!match) return null;
  const n = Number(match[1]);
  if (n >= 1 && n <= 17) return n as HomePageVariantId;
  return null;
}

export function getDefaultHomePageVariant(): HomePageVariantId {
  const raw = import.meta.env.VITE_HOME_PAGE_VARIANT;
  const n = Number(raw);
  if (n >= 1 && n <= 17) return n as HomePageVariantId;
  return 9;
}

/** @deprecated Utiliser ALL_HOME_PAGES — compat design / anciens imports */
export const HOME_PAGE_VARIANTS = ALL_HOME_PAGES.map((p) => ({
  id: p.id,
  route: p.route,
  icon: p.icon,
  titleKey: p.titleKey,
  descKey: p.descKey,
  label: p.label,
  inspiration: p.label,
}));
