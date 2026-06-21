import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { SignOutHeaderButton } from '../components/SignOutHeaderButton';
import type { ColorPalette } from '../theme/palettes';
import { fonts } from '../theme';

/** Options d'en-tête communes : bouton déconnexion visible sur chaque onglet. */
export function authTabHeaderOptions(
  palette: ColorPalette,
  overrides: BottomTabNavigationOptions = {},
): BottomTabNavigationOptions {
  return {
    headerStyle: { backgroundColor: palette.header },
    headerTintColor: palette.textInverse,
    headerTitleStyle: { fontFamily: fonts.bodySemiBold, fontWeight: '600', fontSize: 17 },
    headerShadowVisible: false,
    headerRight: () => <SignOutHeaderButton />,
    ...overrides,
  };
}
