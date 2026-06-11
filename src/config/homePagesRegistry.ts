/**
 * Registre des pages d'accueil — 10 propositions distinctes (curated).
 * P10–P17 et P5 redirigent vers une page conservée.
 */
import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  Maximize2,
  Grid3x3,
  PanelLeft,
  Sparkles,
  Crown,
  Image,
  Zap,
  Globe,
  Award,
} from 'lucide-react';
import { ROUTES } from '../lib/routes';

export type HomePageVariantId =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

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
  series: 'classic' | 'new';
}

/** Entrée menu — variante P ou page spéciale (world, 40ans) */
export interface CuratedHomePageEntry {
  slug: string;
  route: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  label: string;
  variantId?: HomePageVariantId;
  badgeKey?: string;
  tagKey?: string;
  accent?: 'orange' | 'emerald' | 'navy';
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

const VARIANT_META: Record<
  HomePageVariantId,
  Omit<HomePageEntry, 'id' | 'route' | 'series'> & { series?: 'classic' | 'new' }
> = {
  1: { icon: LayoutGrid, titleKey: 'nav.home_page.p1_title', descKey: 'nav.home_page.p1_desc', label: 'P1 — Batimat Classic', component: 'variant1' },
  2: { icon: Maximize2, titleKey: 'nav.home_page.p2_title', descKey: 'nav.home_page.p2_desc', label: 'P2 — BIG5 Mega', component: 'variant2' },
  3: { icon: Grid3x3, titleKey: 'nav.home_page.p3_title', descKey: 'nav.home_page.p3_desc', label: 'P3 — Construmat Grid', component: 'variant3' },
  4: { icon: PanelLeft, titleKey: 'nav.home_page.p4_title', descKey: 'nav.home_page.p4_desc', label: 'P4 — Split Navy', component: 'variant4' },
  5: { icon: Sparkles, titleKey: 'nav.home_page.p5_title', descKey: 'nav.home_page.p5_desc', label: 'P5 — Minimal Line', component: 'variant5' },
  6: { icon: Sparkles, titleKey: 'nav.home_page.p6_title', descKey: 'nav.home_page.p6_desc', label: 'P6 — Glass Light', component: 'variant6' },
  7: { icon: Crown, titleKey: 'nav.home_page.p7_title', descKey: 'nav.home_page.p7_desc', label: 'P7 — World Class', component: 'variant7' },
  8: { icon: Image, titleKey: 'nav.home_page.p8_title', descKey: 'nav.home_page.p8_desc', label: 'P8 — Page officielle SIB 2026', component: 'sib2026' },
  9: { icon: Zap, titleKey: 'nav.home_page.p9_title', descKey: 'nav.home_page.p9_desc', label: 'P9 — Optimisée (Fusion P7+P8)', component: 'optimized' },
  10: { icon: Image, titleKey: 'nav.home_page.p10_title', descKey: 'nav.home_page.p10_desc', label: 'P10', component: 'sib2026', series: 'new' },
  11: { icon: LayoutGrid, titleKey: 'nav.home_page.p11_title', descKey: 'nav.home_page.p11_desc', label: 'P11', component: 'variant1', series: 'new' },
  12: { icon: Crown, titleKey: 'nav.home_page.p12_title', descKey: 'nav.home_page.p12_desc', label: 'P12', component: 'variant7', series: 'new' },
  13: { icon: Zap, titleKey: 'nav.home_page.p13_title', descKey: 'nav.home_page.p13_desc', label: 'P13', component: 'optimized', series: 'new' },
  14: { icon: Maximize2, titleKey: 'nav.home_page.p14_title', descKey: 'nav.home_page.p14_desc', label: 'P14', component: 'variant2', series: 'new' },
  15: { icon: Grid3x3, titleKey: 'nav.home_page.p15_title', descKey: 'nav.home_page.p15_desc', label: 'P15', component: 'variant3', series: 'new' },
  16: { icon: Sparkles, titleKey: 'nav.home_page.p16_title', descKey: 'nav.home_page.p16_desc', label: 'P16', component: 'variant6', series: 'new' },
  17: { icon: PanelLeft, titleKey: 'nav.home_page.p17_title', descKey: 'nav.home_page.p17_desc', label: 'P17', component: 'variant4', series: 'new' },
};

function buildEntry(id: HomePageVariantId, series: 'classic' | 'new' = 'classic'): HomePageEntry {
  const m = VARIANT_META[id];
  return {
    id,
    route: ROUTES_BY_ID[id],
    series: m.series ?? series,
    icon: m.icon,
    titleKey: m.titleKey,
    descKey: m.descKey,
    label: m.label,
    component: m.component,
  };
}

/** Les 10 pages conservées — ordre menu (priorité client) */
export const HOME_PAGES_CURATED: CuratedHomePageEntry[] = [
  {
    slug: 'p8',
    route: ROUTES.HOME_P8,
    icon: Image,
    titleKey: 'nav.home_page.p8_title',
    descKey: 'nav.home_page.p8_desc',
    label: 'P8 — Page officielle SIB 2026',
    variantId: 8,
    badgeKey: 'nav.accueil.badge_recommended',
    tagKey: 'nav.accueil.tag_p8',
    accent: 'orange',
  },
  {
    slug: '40ans',
    route: ROUTES.HOME_40ANS,
    icon: Award,
    titleKey: 'nav.accueil.sib40_title',
    descKey: 'nav.accueil.sib40_desc',
    label: 'SIB 40 ans — Manus',
    badgeKey: 'nav.accueil.sib40_badge',
    accent: 'navy',
  },
  {
    slug: 'world',
    route: ROUTES.HOME_WORLD,
    icon: Globe,
    titleKey: 'nav.accueil.premium_title',
    descKey: 'nav.accueil.premium_desc',
    label: 'Proposition premium',
    badgeKey: 'nav.accueil.premium_badge',
    accent: 'emerald',
  },
  {
    slug: 'p9',
    route: ROUTES.HOME_P9,
    icon: Zap,
    titleKey: 'nav.home_page.p9_title',
    descKey: 'nav.home_page.p9_desc',
    label: 'P9 — Optimisée',
    variantId: 9,
    badgeKey: 'nav.accueil.badge_optimized',
    tagKey: 'nav.accueil.tag_p9',
  },
  {
    slug: 'p7',
    route: ROUTES.HOME_P7,
    icon: Crown,
    titleKey: 'nav.home_page.p7_title',
    descKey: 'nav.home_page.p7_desc',
    label: 'P7 — World Class',
    variantId: 7,
    tagKey: 'nav.accueil.tag_p7',
  },
  {
    slug: 'p2',
    route: ROUTES.HOME_P2,
    icon: Maximize2,
    titleKey: 'nav.home_page.p2_title',
    descKey: 'nav.home_page.p2_desc',
    label: 'P2 — BIG5 Mega',
    variantId: 2,
    tagKey: 'nav.accueil.tag_p2',
  },
  {
    slug: 'p4',
    route: ROUTES.HOME_P4,
    icon: PanelLeft,
    titleKey: 'nav.home_page.p4_title',
    descKey: 'nav.home_page.p4_desc',
    label: 'P4 — Split Navy',
    variantId: 4,
    tagKey: 'nav.accueil.tag_p4',
  },
  {
    slug: 'p1',
    route: ROUTES.HOME_P1,
    icon: LayoutGrid,
    titleKey: 'nav.home_page.p1_title',
    descKey: 'nav.home_page.p1_desc',
    label: 'P1 — Batimat Classic',
    variantId: 1,
    tagKey: 'nav.accueil.tag_p1',
  },
  {
    slug: 'p3',
    route: ROUTES.HOME_P3,
    icon: Grid3x3,
    titleKey: 'nav.home_page.p3_title',
    descKey: 'nav.home_page.p3_desc',
    label: 'P3 — Construmat Grid',
    variantId: 3,
    tagKey: 'nav.accueil.tag_p3',
  },
  {
    slug: 'p6',
    route: ROUTES.HOME_P6,
    icon: Sparkles,
    titleKey: 'nav.home_page.p6_title',
    descKey: 'nav.home_page.p6_desc',
    label: 'P6 — Glass Light',
    variantId: 6,
    tagKey: 'nav.accueil.tag_p6',
  },
];

/** @deprecated Alias — utiliser HOME_PAGES_CURATED */
export const HOME_PAGES_MENU: HomePageEntry[] = HOME_PAGES_CURATED.filter((p) => p.variantId != null).map(
  (p) => buildEntry(p.variantId!),
);

export const HOME_PAGES_CLASSIC: HomePageEntry[] = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) =>
  buildEntry(id as HomePageVariantId),
);

export const HOME_PAGES_NEW: HomePageEntry[] = [10, 11, 12, 13, 14, 15, 16, 17].map((id) =>
  buildEntry(id as HomePageVariantId, 'new'),
);

export const ALL_HOME_PAGES: HomePageEntry[] = [...HOME_PAGES_CLASSIC, ...HOME_PAGES_NEW];

/** Pages retirées du menu → route de remplacement */
export const HOME_PAGE_REDIRECTS: Partial<Record<HomePageVariantId, HomePageVariantId>> = {
  5: 8,
  10: 8,
  11: 1,
  12: 7,
  13: 9,
  14: 2,
  15: 3,
  16: 6,
  17: 4,
};

export const HOME_PAGE_DUPLICATE_OF = HOME_PAGE_REDIRECTS;

export function getCanonicalHomePageId(id: HomePageVariantId): HomePageVariantId {
  return HOME_PAGE_REDIRECTS[id] ?? id;
}

export function getCanonicalHomeRoute(id: HomePageVariantId): string {
  return getHomeRouteForPageId(getCanonicalHomePageId(id));
}

export function getHomePageEntry(id: HomePageVariantId): HomePageEntry | undefined {
  return ALL_HOME_PAGES.find((p) => p.id === id);
}

export function getHomeRouteForPageId(id: HomePageVariantId): string {
  const canonical = getCanonicalHomePageId(id);
  return ROUTES_BY_ID[canonical] ?? ROUTES.HOME_P8;
}

export function getHomePageVariantFromPath(pathname: string): HomePageVariantId | null {
  if (pathname === ROUTES.HOME_WORLD) return 9;
  if (pathname === ROUTES.HOME_40ANS) return 8;
  const match = pathname.match(/^\/accueil\/(\d{1,2})$/);
  if (!match) return null;
  const n = Number(match[1]);
  if (n >= 1 && n <= 17) return n as HomePageVariantId;
  return null;
}

export function isCuratedHomePath(pathname: string): boolean {
  return HOME_PAGES_CURATED.some((p) => p.route === pathname);
}

export function getDefaultHomePageVariant(): HomePageVariantId {
  const raw = import.meta.env.VITE_HOME_PAGE_VARIANT;
  const n = Number(raw);
  if (n >= 1 && n <= 17) return getCanonicalHomePageId(n as HomePageVariantId);
  return 8;
}

export const HOME_PAGE_VARIANTS = ALL_HOME_PAGES.map((p) => ({
  id: p.id,
  route: p.route,
  icon: p.icon,
  titleKey: p.titleKey,
  descKey: p.descKey,
  label: p.label,
  inspiration: p.label,
}));
