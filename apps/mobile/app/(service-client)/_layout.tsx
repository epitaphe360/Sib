import { Stack } from 'expo-router';
import { SignOutHeaderButton } from '../../src/components/SignOutHeaderButton';
import { RoleGate } from '../../src/components/guards/RoleGate';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors } from '../../src/theme';

function ServiceClientStack() {
  const { t } = useI18n();
  const hOpts = {
    headerShown: true as const,
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: '#fff',
    headerRight: () => <SignOutHeaderButton />,
  };
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1, backgroundColor: colors.background } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="badge-replacement" options={{ ...hOpts, title: t('serviceClient.replace') }} />
      <Stack.Screen name="on-site-registration" options={{ ...hOpts, title: t('serviceClient.register') }} />
      <Stack.Screen name="print-station" options={{ ...hOpts, title: t('printStation.title') }} />
      <Stack.Screen name="zone-capacity" options={{ ...hOpts, title: t('staff.zoneCapacity') }} />
    </Stack>
  );
}

export default function ServiceClientLayout() {
  return (
    <RoleGate allowed="service_client" requireAuth>
      <ServiceClientStack />
    </RoleGate>
  );
}
