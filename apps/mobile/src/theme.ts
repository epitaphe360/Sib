/**
 * Design tokens UrbaEvent — import préféré : useAppTheme() pour couleurs dynamiques (dark mode).
 */
export { lightPalette as colors, darkPalette, type ColorPalette } from './theme/palettes';
export { typeScale } from './theme/typographyScale';

export const typography = {
  titleXl: 34,
  titleLg: 22,
  titleMd: 17,
  body: 15,
  caption: 11,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#0F2138',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F2138',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F2138',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 7,
  },
};

export const fonts = {
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  display: 'PlayfairDisplay_700Bold',
  displayMedium: 'PlayfairDisplay_600SemiBold',
};
