import { Stack } from 'expo-router';
import { SignOutHeaderButton } from '../../src/components/SignOutHeaderButton';
import { RoleGate } from '../../src/components/guards/RoleGate';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors } from '../../src/theme';

function StaffStack() {
  const { t } = useI18n();
  const hOpts = {
    headerShown: true as const,
    headerStyle: { backgroundColor: '#1B365D' },
    headerTintColor: '#fff',
    headerRight: () => <SignOutHeaderButton />,
  };
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1, backgroundColor: colors.background } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="scanner" options={{ ...hOpts, title: t('scanner.title') }} />
      <Stack.Screen name="payments" options={{ ...hOpts, title: t('staff.validatePayments') }} />
      <Stack.Screen name="pricing" options={{ ...hOpts, title: t('staff.pricing') }} />
      <Stack.Screen name="alerts" options={{ ...hOpts, title: t('staff.alerts.title') }} />
      <Stack.Screen name="users" options={{ ...hOpts, title: t('admin.users.title') }} />
      <Stack.Screen name="print-station" options={{ ...hOpts, title: t('printStation.title') }} />
      <Stack.Screen name="badge" options={{ ...hOpts, title: t('badge.title') }} />
      <Stack.Screen name="zone-capacity" options={{ ...hOpts, title: t('staff.zoneCapacity') }} />
    </Stack>
  );
}

export default function StaffLayout() {
  return (
    <RoleGate allowed="staff">
      <StaffStack />
    </RoleGate>
  );
}
