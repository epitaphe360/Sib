import { Tabs } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { useAppTheme } from '../../../src/context/ThemeContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { authTabHeaderOptions } from '../../../src/navigation/authTabOptions';
import { createTabIcon, unifiedTabBarOptions } from '../../../src/navigation/tabBarConfig';

export default function StaffTabLayout() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { colors } = useAppTheme();
  const isSecurity = user?.type === 'security';

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
          title: isSecurity ? t('tabs.access') : t('tabs.live'),
          tabBarIcon: createTabIcon(isSecurity ? 'shield-outline' : 'pulse-outline'),
          href: isSecurity ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: t('tabs.scanner'),
          tabBarIcon: createTabIcon('scan-outline'),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: t('tabs.payments'),
          tabBarIcon: createTabIcon('card-outline'),
          href: isSecurity ? null : undefined,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: createTabIcon('person-outline') }} />
    </Tabs>
  );
}
