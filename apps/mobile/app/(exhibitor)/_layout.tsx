import { Stack } from 'expo-router';
import { SignOutHeaderButton } from '../../src/components/SignOutHeaderButton';
import { RoleGate } from '../../src/components/guards/RoleGate';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors } from '../../src/theme';

function ExhibitorStack() {
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
      <Stack.Screen name="scan" options={{ ...hOpts, title: t('scanner.title') }} />
      <Stack.Screen name="minisite" options={{ ...hOpts, title: t('exhibitor.profile.title') }} />
      <Stack.Screen name="messages/new" options={{ ...hOpts, title: t('messages.newThread') }} />
      <Stack.Screen name="messages/[id]" options={{ ...hOpts, title: t('messages.title') }} />
      <Stack.Screen name="analytics" options={{ ...hOpts, title: t('exhibitor.analytics.title') }} />
      <Stack.Screen name="team" options={{ ...hOpts, title: t('exhibitor.stand') }} />
      <Stack.Screen name="contact/[id]" options={{ ...hOpts, title: t('exhibitor.contact.title') }} />
      <Stack.Screen name="team-print" options={{ ...hOpts, title: t('badge.title') }} />
      <Stack.Screen name="scans" options={{ ...hOpts, title: t('exhibitor.scans.title') }} />
      <Stack.Screen name="lead-appointment" options={{ ...hOpts, title: t('appointments.new.title') }} />
    </Stack>
  );
}

export default function ExhibitorLayout() {
  return (
    <RoleGate allowed="exhibitor">
      <ExhibitorStack />
    </RoleGate>
  );
}
