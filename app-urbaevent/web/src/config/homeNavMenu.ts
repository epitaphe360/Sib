import type { LucideIcon } from 'lucide-react';
import { Store, Users, Mic2, Handshake, UtensilsCrossed, Globe2 } from 'lucide-react';
import { ROUTES } from '../lib/routes';
import { IMAGES, img } from '../lib/images';
import { getDefaultHomePageVariant, getHomeRouteForVariant, HOME_PAGE_VARIANTS } from './homeVariants';

export interface HomeMenuItemDef {
  key: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  href: string;
  imageSrc: string;
}

/** Entrées du sous-menu Accueil — design maquette SIB 2026 */
export const HOME_MENU_ITEMS: HomeMenuItemDef[] = [
  {
    key: 'exposer',
    icon: Store,
    titleKey: 'nav.home_menu.exposer_title',
    descKey: 'nav.home_menu.exposer_desc',
    href: ROUTES.EXHIBITOR_SUBSCRIPTION,
    imageSrc: img(IMAGES.exhibitors.booth, 640, 400),
  },
  {
    key: 'visiter',
    icon: Users,
    titleKey: 'nav.home_menu.visiter_title',
    descKey: 'nav.home_menu.visiter_desc',
    href: `${getHomeRouteForVariant(getDefaultHomePageVariant())}#badges`,
    imageSrc: img(IMAGES.hero.convention, 640, 400),
  },
  {
    key: 'sib_talks',
    icon: Mic2,
    titleKey: 'nav.home_menu.sib_talks_title',
    descKey: 'nav.home_menu.sib_talks_desc',
    href: ROUTES.EVENTS,
    imageSrc: img(IMAGES.business.conference, 640, 400),
  },
  {
    key: 'b2b',
    icon: Handshake,
    titleKey: 'nav.home_menu.b2b_title',
    descKey: 'nav.home_menu.b2b_desc',
    href: ROUTES.NETWORKING,
    imageSrc: img(IMAGES.business.networking, 640, 400),
  },
  {
    key: 'diner',
    icon: UtensilsCrossed,
    titleKey: 'nav.home_menu.diner_title',
    descKey: 'nav.home_menu.diner_desc',
    href: ROUTES.EVENTS,
    imageSrc: img(IMAGES.business.meeting, 640, 400),
  },
  {
    key: 'international',
    icon: Globe2,
    titleKey: 'nav.home_menu.international_title',
    descKey: 'nav.home_menu.international_desc',
    href: ROUTES.PAVILIONS,
    imageSrc: img(IMAGES.hero.morocco, 640, 400),
  },
];

export type HomeMenuVariantId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function getActiveHomeMenuVariant(): HomeMenuVariantId {
  const raw = import.meta.env.VITE_HOME_MENU_VARIANT;
  const n = Number(raw);
  if (n >= 1 && n <= 7) return n as HomeMenuVariantId;
  return 1;
}

export { HOME_PAGE_VARIANTS, getDefaultHomePageVariant, getHomeRouteForVariant } from './homeVariants';
export type { HomePageVariantId } from './homeVariants';

export const HOME_MENU_VARIANT_LABELS: Record<HomeMenuVariantId, string> = {
  1: 'SIB 2026 — Salon pensé pour vous',
  2: 'P2 — BIG5 Mega',
  3: 'P3 — Construmat Grid',
  4: 'P4 — Split Navy',
  5: 'P5 — Minimal Line',
  6: 'P6 — Glass Light',
  7: 'P7 — World Class',
};
