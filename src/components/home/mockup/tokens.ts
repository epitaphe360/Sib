/** Tokens exacts — maquette SIB 2026 officielle */
export const MOCKUP = {
  navy: '#001A3D',
  navyDeep: '#001530',
  orange: '#F39200',
  orangeHover: '#E08500',
  white: '#FFFFFF',
  grayText: 'rgba(255,255,255,0.65)',
  cardBorder: 'rgba(94,143,190,0.35)',
  cardOverlay: 'rgba(0,26,61,0.80)',
} as const;

export const MOCKUP_HOME_ROUTE = '/accueil/8';

export function isMockupHomePath(pathname: string): boolean {
  return pathname === MOCKUP_HOME_ROUTE || pathname === '/';
}
