import { Stack } from 'expo-router';
import { SignOutHeaderButton } from '../../src/components/SignOutHeaderButton';
import { PendingPaymentRedirect } from '../../src/components/PendingPaymentRedirect';
import { RoleGate } from '../../src/components/guards/RoleGate';
import { SalonProvider } from '../../src/context/SalonContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors } from '../../src/theme';

function VisitorStack() {
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
      <Stack.Screen name="appointments" options={{ headerShown: false }} />
      <Stack.Screen name="messages/index" options={{ ...hOpts, title: t('messages.title') }} />
      <Stack.Screen name="messages/new" options={{ ...hOpts, title: t('messages.newThread') }} />
      <Stack.Screen name="messages/[id]" options={{ ...hOpts, title: t('messages.title') }} />
      <Stack.Screen name="networking" options={{ ...hOpts, title: t('networking.title') }} />
      <Stack.Screen name="scan-connect" options={{ ...hOpts, title: t('networking.scanTitle') }} />
      <Stack.Screen name="scan-history" options={{ ...hOpts, title: t('scanHistory.title') }} />
      <Stack.Screen name="scan-contact/[userId]" options={{ ...hOpts, title: t('scanHistory.contactTitle') }} />
      <Stack.Screen name="settings" options={{ ...hOpts, title: t('settings.title') }} />
      <Stack.Screen name="map" options={{ ...hOpts, title: t('map.title') }} />
      <Stack.Screen name="news/index" options={{ ...hOpts, title: t('news.title') }} />
      <Stack.Screen name="news/[id]" options={{ ...hOpts, title: t('news.article') }} />
      <Stack.Screen name="certificate" options={{ ...hOpts, title: t('certificate.title') }} />
      <Stack.Screen name="live-studio" options={{ ...hOpts, title: t('live.title') }} />
      <Stack.Screen name="event/[id]" options={{ ...hOpts, title: t('event.register') }} />
      <Stack.Screen name="payment-gateway" options={{ ...hOpts, title: t('payment.gateway.title') }} />
      <Stack.Screen name="salon/[slug]" options={{ ...hOpts, title: t('salon.activeSalon') }} />
      <Stack.Screen name="visa-letter" options={{ ...hOpts, title: t('visa.title') }} />
      <Stack.Screen name="invoices" options={{ ...hOpts, title: t('invoices.title') }} />
      <Stack.Screen name="media/index" options={{ ...hOpts, title: t('media.title') }} />
      <Stack.Screen name="media/[id]" options={{ ...hOpts, title: t('media.title') }} />
      <Stack.Screen name="speed-networking" options={{ ...hOpts, title: t('networking.title') }} />
    </Stack>
  );
}

export default function VisitorLayout() {
  return (
    <RoleGate allowed="visitor" requireAuth={false}>
      <SalonProvider>
        <PendingPaymentRedirect />
        <VisitorStack />
      </SalonProvider>
    </RoleGate>
  );
}
