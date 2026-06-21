/** Tokens couleur — light & dark (design system UrbaEvent) */

export type ColorPalette = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  accentMuted: string;
  gold: string;
  goldLight: string;
  goldMuted: string;
  platform: {
    bg: string;
    heroDark: string;
    heroMid: string;
    accentBlue: string;
  };
  semantic: {
    textSecondary: string;
    successGreen: string;
  };
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceDark: string;
  text: string;
  textMuted: string;
  textLight: string;
  textInverse: string;
  border: string;
  borderLight: string;
  borderFocus: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  warning: string;
  warningBg: string;
  info: string;
  infoBg: string;
  vip: string;
  vipBg: string;
  exhibitor: string;
  exhibitorBg: string;
  partner: string;
  security: string;
  securityBg: string;
  serviceClient: string;
  serviceClientBg: string;
  overlay: string;
  overlayHeavy: string;
  overlayLight: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarInactive: string;
  header: string;
  cardBorder: string;
};

export const lightPalette: ColorPalette = {
  primary: '#1B365D',
  primaryDark: '#0F2138',
  primaryLight: '#2E5984',
  accent: '#F39200',
  accentLight: '#2E5984',
  accentMuted: '#DCE8F3',
  gold: '#F39200',
  goldLight: '#2E5984',
  goldMuted: '#DCE8F3',
  platform: {
    bg: '#F9F9FF',
    heroDark: '#0D2137',
    heroMid: '#1B4F72',
    accentBlue: '#4598D1',
  },
  semantic: { textSecondary: '#647483', successGreen: '#4CAF50' },
  background: '#F8F7F4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceDark: '#1B365D',
  text: '#1A1A17',
  textMuted: '#5C5C55',
  textLight: '#8A8A82',
  textInverse: '#FFFFFF',
  border: '#E8E8E0',
  borderLight: '#F0F0EA',
  borderFocus: '#1B365D',
  success: '#15803D',
  successBg: '#DCFCE7',
  danger: '#B91C1C',
  dangerBg: '#FEE2E2',
  warning: '#B45309',
  warningBg: '#FEF3C7',
  info: '#0369A1',
  infoBg: '#E0F2FE',
  vip: '#7C3AED',
  vipBg: '#EDE9FE',
  exhibitor: '#15803D',
  exhibitorBg: '#DCFCE7',
  partner: '#7C3AED',
  security: '#B45309',
  securityBg: '#FEF3C7',
  serviceClient: '#0E7490',
  serviceClientBg: '#CFFAFE',
  overlay: 'rgba(15, 33, 56, 0.65)',
  overlayHeavy: 'rgba(15, 33, 56, 0.84)',
  overlayLight: 'rgba(15, 33, 56, 0.35)',
  tabBar: '#1B365D',
  tabBarBorder: 'transparent',
  tabBarInactive: 'rgba(255,255,255,0.55)',
  header: '#1B365D',
  cardBorder: '#E8E8E0',
};

export const darkPalette: ColorPalette = {
  primary: '#4598D1',
  primaryDark: '#0D2137',
  primaryLight: '#6BB3E0',
  accent: '#F39200',
  accentLight: '#4598D1',
  accentMuted: '#1E3A52',
  gold: '#F39200',
  goldLight: '#4598D1',
  goldMuted: '#2A3F55',
  platform: {
    bg: '#0A1628',
    heroDark: '#060E18',
    heroMid: '#0D2137',
    accentBlue: '#4598D1',
  },
  semantic: { textSecondary: '#94A3B8', successGreen: '#4ADE80' },
  background: '#0A1628',
  surface: '#111D2E',
  surfaceElevated: '#162236',
  surfaceDark: '#0D2137',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textLight: '#64748B',
  textInverse: '#0A1628',
  border: '#1E3050',
  borderLight: '#162236',
  borderFocus: '#4598D1',
  success: '#4ADE80',
  successBg: '#14532D',
  danger: '#F87171',
  dangerBg: '#450A0A',
  warning: '#FBBF24',
  warningBg: '#451A03',
  info: '#38BDF8',
  infoBg: '#0C4A6E',
  vip: '#A78BFA',
  vipBg: '#3B0764',
  exhibitor: '#4ADE80',
  exhibitorBg: '#14532D',
  partner: '#A78BFA',
  security: '#FBBF24',
  securityBg: '#451A03',
  serviceClient: '#22D3EE',
  serviceClientBg: '#164E63',
  overlay: 'rgba(0, 0, 0, 0.72)',
  overlayHeavy: 'rgba(0, 0, 0, 0.88)',
  overlayLight: 'rgba(0, 0, 0, 0.45)',
  tabBar: '#0D2137',
  tabBarBorder: '#1E3050',
  tabBarInactive: 'rgba(255,255,255,0.45)',
  header: '#0D2137',
  cardBorder: '#1E3050',
};
