import { Stack } from 'expo-router';
import { useI18n } from '../../../src/i18n/I18nProvider';

export default function AppointmentsLayout() {
  const { t } = useI18n();
  const hOpts = {
    headerShown: true as const,
    headerStyle: { backgroundColor: '#1B365D' },
    headerTintColor: '#fff',
  };

  return (
    <Stack screenOptions={{ contentStyle: { flex: 1 } }}>
      <Stack.Screen name="index" options={{ ...hOpts, title: t('appointments.title') }} />
      <Stack.Screen name="new" options={{ ...hOpts, title: t('appointments.new.title') }} />
    </Stack>
  );
}
