import { Tabs } from 'expo-router';
import { useAppTheme } from '../../../src/context/ThemeContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { authTabHeaderOptions } from '../../../src/navigation/authTabOptions';
import { createTabIcon, unifiedTabBarOptions } from '../../../src/navigation/tabBarConfig';

export default function ExhibitorTabLayout() {
  const { t } = useI18n();
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        ...authTabHeaderOptions(colors),
        ...unifiedTabBarOptions(colors),
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.stand'), tabBarIcon: createTabIcon('storefront-outline') }} />
      <Tabs.Screen name="scan" options={{ title: t('tabs.scan'), tabBarIcon: createTabIcon('scan-outline') }} />
      <Tabs.Screen name="contacts" options={{ title: t('tabs.contacts'), tabBarIcon: createTabIcon('people-outline') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: createTabIcon('person-outline') }} />
      <Tabs.Screen name="badge" options={{ href: null, title: t('tabs.badge') }} />
      <Tabs.Screen name="messages" options={{ href: null, title: t('tabs.messages') }} />
      <Tabs.Screen name="appointments" options={{ href: null, title: t('appointments.exhibitorTitle') }} />
    </Tabs>
  );
}
