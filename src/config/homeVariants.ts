/**
 * Compat — réexporte le registre unifié (17 pages d'accueil).
 * @see homePagesRegistry.ts
 */
export type { HomePageVariantId, HomePageEntry } from './homePagesRegistry';
export {
  ALL_HOME_PAGES,
  HOME_PAGES_CLASSIC,
  HOME_PAGES_NEW,
  HOME_PAGE_VARIANTS,
  getHomePageEntry,
  getHomeRouteForPageId,
  getHomeRouteForPageId as getHomeRouteForVariant,
  getHomePageVariantFromPath,
  getDefaultHomePageVariant,
} from './homePagesRegistry';
