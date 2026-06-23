/**
 * Registre simplifié — une seule page d'accueil (SIB 2026 v4).
 */
import { ROUTES } from '../lib/routes';

export type HomePageVariantId = 8;

export interface HomePageEntry {
  id: HomePageVariantId;
  route: string;
  label: string;
}

const HOME_ENTRY: HomePageEntry = {
  id: 8,
  route: ROUTES.HOME,
  label: 'SIB 2026',
};

export const HOME_PAGES_CURATED: HomePageEntry[] = [HOME_ENTRY];
export const HOME_PAGE_VARIANTS = [HOME_ENTRY];
export const ALL_HOME_PAGES: HomePageEntry[] = [HOME_ENTRY];

export function getDefaultHomePageVariant(): HomePageVariantId {
  return 8;
}

export function getHomeRouteForPageId(_id?: HomePageVariantId): string {
  return ROUTES.HOME;
}

export function getHomeRouteForVariant(_id?: HomePageVariantId): string {
  return ROUTES.HOME;
}

export function getHomePageVariantFromPath(pathname: string): HomePageVariantId | null {
  if (
    pathname === ROUTES.HOME ||
    pathname.startsWith('/accueil') ||
    pathname.startsWith('/home')
  ) {
    return 8;
  }
  return null;
}

export function getCanonicalHomePageId(_id?: HomePageVariantId): HomePageVariantId {
  return 8;
}

export function getCanonicalHomeRoute(_id?: HomePageVariantId): string {
  return ROUTES.HOME;
}

export function getHomePageEntry(_id?: HomePageVariantId): HomePageEntry | undefined {
  return HOME_ENTRY;
}

export function isCuratedHomePath(pathname: string): boolean {
  return pathname === ROUTES.HOME;
}
