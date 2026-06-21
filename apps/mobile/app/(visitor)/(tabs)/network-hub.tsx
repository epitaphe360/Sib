import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SalonGate } from '../../../src/components/guards/SalonGate';
import { SalonHeroBanner } from '../../../src/components/SalonHeroBanner';
import { EmptyState, PrimaryButton, Screen, SegmentControl } from '../../../src/components/ui';
import { useNetworkingPermissions } from '../../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../../src/i18n/I18nProvider';
import VisitorAppointmentsScreen from '../appointments/index';
import VisitorMessagesScreen from '../messages/index';
import VisitorNetworkingScreen from '../networking';
import { spacing } from '../../../src/theme';

type HubTab = 'appointments' | 'messages' | 'networking';

export default function NetworkHubScreen() {
  const { t } = useI18n();
  const { permissions } = useNetworkingPermissions();
  const [tab, setTab] = useState<HubTab>('appointments');

  const tabOptions = useMemo((): Array<{ id: HubTab; label: string }> => {
    const base: Array<{ id: HubTab; label: string }> = [
      { id: 'appointments', label: t('tabs.appointments') },
    ];
    if (permissions.canSendMessages) {
      base.push({ id: 'messages', label: t('tabs.messages') });
    }
    if (permissions.canAccessNetworking) {
      base.push({ id: 'networking', label: t('tabs.networking') });
    }
    return base;
  }, [permissions.canAccessNetworking, permissions.canSendMessages, t]);

  return (
    <SalonGate>
    <Screen style={styles.flex}>
      <SalonHeroBanner imageKey="networking" title={t('networkHub.title')} subtitle={t('networkHub.subtitle')} compact />
      <SegmentControl
        options={tabOptions}
        value={tab}
        onChange={(id) => setTab(id as HubTab)}
      />
      {!permissions.canSendMessages && (
        <View style={styles.vipUpsell}>
          <EmptyState message={t('networking.blocked')} />
          <PrimaryButton label={t('vip.upgrade')} onPress={() => router.push('/(auth)/register-vip')} variant="gold" />
        </View>
      )}
      <View style={styles.content}>
        {tab === 'appointments' && <VisitorAppointmentsScreen embedded />}
        {tab === 'messages' && permissions.canSendMessages && <VisitorMessagesScreen embedded />}
        {tab === 'networking' && permissions.canAccessNetworking && <VisitorNetworkingScreen embedded />}
      </View>
    </Screen>
    </SalonGate>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingBottom: 0 },
  vipUpsell: { marginBottom: spacing.sm },
  content: { flex: 1, marginHorizontal: -spacing.md },
});
