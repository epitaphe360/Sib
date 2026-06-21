import { Platform } from 'react-native';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { type AppIconName } from '../components/AppIcon';
import { TabBarIcon } from '../components/TabBarIcon';
import type { ColorPalette } from '../theme/palettes';
import { fonts } from '../theme';

/** Icône tab bar — style identique pour tous les rôles (visiteur, exposant, staff, service client). */
export function createTabIcon(name: AppIconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <TabBarIcon name={name} color={color} size={size} />
  );
}

/** Tab bar UrbaEvent unique — navy, labels blancs, même rendu partout. */
export function unifiedTabBarOptions(palette: ColorPalette): BottomTabNavigationOptions {
  const height = Platform.OS === 'ios' ? 82 : 64;

  return {
    tabBarActiveTintColor: palette.textInverse,
    tabBarInactiveTintColor: palette.tabBarInactive,
    tabBarStyle: {
      backgroundColor: palette.tabBar,
      borderTopWidth: 0,
      height,
      paddingBottom: Platform.OS === 'ios' ? 24 : 8,
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontFamily: fonts.bodyMedium,
      fontSize: 10,
      letterSpacing: 0.3,
    },
    headerTitleStyle: { fontFamily: fonts.bodySemiBold, fontWeight: '600', fontSize: 17 },
    headerShadowVisible: false,
  };
}
