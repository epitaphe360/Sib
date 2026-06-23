/**
 * Compat — réexporte le registre unifié (page d'accueil unique).
 * @see homePagesRegistry.ts
 */
export type { HomePageVariantId, HomePageEntry } from './homePagesRegistry';
export {
  ALL_HOME_PAGES,
  HOME_PAGE_VARIANTS,
  getHomePageEntry,
  getHomeRouteForPageId,
  getHomeRouteForPageId as getHomeRouteForVariant,
  getHomePageVariantFromPath,
  getDefaultHomePageVariant,
} from './homePagesRegistry';
