import { Tabs } from 'expo-router';
import { useAppTheme } from '../../../src/context/ThemeContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { authTabHeaderOptions } from '../../../src/navigation/authTabOptions';
import { createTabIcon, unifiedTabBarOptions } from '../../../src/navigation/tabBarConfig';

export default function ServiceClientTabLayout() {
  const { t } = useI18n();
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        ...authTabHeaderOptions(colors),
        ...unifiedTabBarOptions(colors),
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: createTabIcon('home-outline') }} />
      <Tabs.Screen name="lookup" options={{ title: t('tabs.lookup'), tabBarIcon: createTabIcon('search-outline') }} />
      <Tabs.Screen name="registration" options={{ title: t('tabs.registration'), tabBarIcon: createTabIcon('person-add-outline') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: createTabIcon('person-outline') }} />
    </Tabs>
  );
}
