import { ROUTES } from '../../../lib/routes';

/** Design tokens — maquette Figma SIB 2026 */
export const SIB2026 = {
  navy: '#001A3D',
  navyDeep: '#001530',
  orange: '#F39200',
  orangeHover: '#E08500',
  white: '#FFFFFF',
  grayText: 'rgba(255,255,255,0.65)',
  cardBorder: 'rgba(94,143,190,0.35)',
  cardOverlay: 'rgba(0,26,61,0.82)',
  sectionGray: '#ECECE8',
  maxWidth: 1280,
} as const;

export const SIB2026_HOME_ROUTE = ROUTES.HOME;

/** Page d'accueil unique (iframe v4) */
export function isPremiumHomePath(pathname: string): boolean {
  return pathname === ROUTES.HOME;
}

/** @deprecated Alias — même périmètre que isPremiumHomePath */
export function isSib2026HomePath(pathname: string): boolean {
  return isPremiumHomePath(pathname);
}

/** Base URL pour ancres (#visiter) */
export function getPremiumHomeBase(_pathname: string): string {
  return ROUTES.HOME;
}
