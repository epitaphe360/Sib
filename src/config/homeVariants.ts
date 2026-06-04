import type { LucideIcon } from 'lucide-react';

import { LayoutGrid, Maximize2, Grid3x3, PanelLeft, Minus, Sparkles, Crown, Image } from 'lucide-react';

import { ROUTES } from '../lib/routes';



export type HomePageVariantId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;



export interface HomePageVariantDef {

  id: HomePageVariantId;

  route: string;

  icon: LucideIcon;

  titleKey: string;

  descKey: string;

  label: string;

  inspiration: string;

}



export const HOME_PAGE_VARIANTS: HomePageVariantDef[] = [

  {

    id: 8,

    route: ROUTES.HOME_P8,

    icon: Image,

    titleKey: 'nav.home_page.p8_title',

    descKey: 'nav.home_page.p8_desc',

    label: 'P8 — Page officielle SIB 2026',

    inspiration: 'Design client',

  },

  {

    id: 9,

    route: ROUTES.HOME_P9,

    icon: Image,

    titleKey: 'nav.home_page.p9_title',

    descKey: 'nav.home_page.p9_desc',

    label: 'P9 — Optimisée (Fusion P7+P8)',

    inspiration: 'Fusion P7+P8',

  },

  {

    id: 1,

    route: ROUTES.HOME_P1,

    icon: LayoutGrid,

    titleKey: 'nav.home_page.p1_title',

    descKey: 'nav.home_page.p1_desc',

    label: 'P1 — Batimat Classic',

    inspiration: 'BATIMAT',

  },

  {

    id: 2,

    route: ROUTES.HOME_P2,

    icon: Maximize2,

    titleKey: 'nav.home_page.p2_title',

    descKey: 'nav.home_page.p2_desc',

    label: 'P2 — BIG5 Mega',

    inspiration: 'BIG5',

  },

  {

    id: 3,

    route: ROUTES.HOME_P3,

    icon: Grid3x3,

    titleKey: 'nav.home_page.p3_title',

    descKey: 'nav.home_page.p3_desc',

    label: 'P3 — Construmat Grid',

    inspiration: 'CONSTRUMAT',

  },

  {

    id: 4,

    route: ROUTES.HOME_P4,

    icon: PanelLeft,

    titleKey: 'nav.home_page.p4_title',

    descKey: 'nav.home_page.p4_desc',

    label: 'P4 — Split Navy',

    inspiration: 'BIG5 / BATIMAT',

  },

  {

    id: 5,

    route: ROUTES.HOME_P5,

    icon: Minus,

    titleKey: 'nav.home_page.p5_title',

    descKey: 'nav.home_page.p5_desc',

    label: 'P5 — Minimal Line',

    inspiration: 'BATIMAT épuré',

  },

  {

    id: 6,

    route: ROUTES.HOME_P6,

    icon: Sparkles,

    titleKey: 'nav.home_page.p6_title',

    descKey: 'nav.home_page.p6_desc',

    label: 'P6 — Glass Light',

    inspiration: 'Moderne salon',

  },

  {

    id: 7,

    route: ROUTES.HOME_P7,

    icon: Crown,

    titleKey: 'nav.home_page.p7_title',

    descKey: 'nav.home_page.p7_desc',

    label: 'P7 — World Class',

    inspiration: 'BIG5 · Batimat · Construmat',

  },

];



export function getDefaultHomePageVariant(): HomePageVariantId {

  const raw = import.meta.env.VITE_HOME_PAGE_VARIANT;

  const n = Number(raw);

  if (n >= 1 && n <= 9) return n as HomePageVariantId;

  return 9;

}



export function getHomeRouteForVariant(id: HomePageVariantId): string {

  return HOME_PAGE_VARIANTS.find((v) => v.id === id)?.route ?? ROUTES.HOME_P8;

}



/** Variante courante depuis l’URL (/accueil/1 … /accueil/8). */
export function getHomePageVariantFromPath(pathname: string): HomePageVariantId | null {
  const match = pathname.match(/^\/accueil\/([1-8])$/);
  if (!match) return null;
  return Number(match[1]) as HomePageVariantId;
}

