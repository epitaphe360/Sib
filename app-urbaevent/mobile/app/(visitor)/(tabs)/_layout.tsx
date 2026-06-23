import { Tabs } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { useSalon } from '../../../src/context/SalonContext';
import { useAppTheme } from '../../../src/context/ThemeContext';
import { useNetworkingPermissions } from '../../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { authTabHeaderOptions } from '../../../src/navigation/authTabOptions';
import { createTabIcon, unifiedTabBarOptions } from '../../../src/navigation/tabBarConfig';

export default function TabLayout() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { activeSalon } = useSalon();
  const { colors } = useAppTheme();
  const { permissions } = useNetworkingPermissions();
  const salonTabs = Boolean(activeSalon);
  const showNetwork = salonTabs && Boolean(user) && permissions.canAccessNetworking;

  return (
    <Tabs
      screenOptions={{
        ...authTabHeaderOptions(colors),
        ...unifiedTabBarOptions(colors),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          headerShown: false,
          tabBarIcon: createTabIcon('home-outline'),
        }}
      />
      <Tabs.Screen name="salons" options={{ href: null }} />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.explore'),
          tabBarIcon: createTabIcon('compass-outline'),
          href: salonTabs ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="badge"
        options={{
          title: t('tabs.badge'),
          tabBarIcon: createTabIcon('qr-code-outline'),
        }}
      />
      <Tabs.Screen
        name="network-hub"
        options={{
          title: t('tabs.network'),
          tabBarIcon: createTabIcon('people-outline'),
          href: showNetwork ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarIcon: createTabIcon('person-outline') }}
      />
      <Tabs.Screen name="program" options={{ href: null }} />
      <Tabs.Screen name="exhibitors" options={{ href: null }} />
      <Tabs.Screen name="appointments" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="networking" options={{ href: null }} />
    </Tabs>
  );
}
