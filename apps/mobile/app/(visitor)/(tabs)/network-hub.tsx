import { router } from 'expo-router';

import { useMemo, useState } from 'react';

import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SalonHeroBanner } from '../../../src/components/SalonHeroBanner';

import { EmptyState, PrimaryButton, Screen, SegmentControl } from '../../../src/components/ui';

import { useNetworkingPermissions } from '../../../src/hooks/useNetworkingPermissions';

import { useSalon } from '../../../src/context/SalonContext';

import { useI18n } from '../../../src/i18n/I18nProvider';

import VisitorAppointmentsScreen from '../appointments/index';

import VisitorMessagesScreen from '../messages/index';

import VisitorNetworkingScreen from '../networking';

import { colors, fonts, spacing } from '../../../src/theme';



type HubTab = 'appointments' | 'messages' | 'networking';



export default function NetworkHubScreen() {

  const { t } = useI18n();

  const { activeSalon } = useSalon();

  const { permissions } = useNetworkingPermissions();

  const [tab, setTab] = useState<HubTab>(() =>

    permissions.canAccessNetworking && !activeSalon ? 'networking' : 'appointments',

  );

  const [networkRefreshKey, setNetworkRefreshKey] = useState(0);

  const [networkRefreshing, setNetworkRefreshing] = useState(false);



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



  const showVipUpsell = tab === 'messages' && !permissions.canSendMessages;



  return (

    <Screen style={styles.flex}>

      {activeSalon ? (

        <SalonHeroBanner imageKey="networking" title={t('networkHub.title')} subtitle={t('networkHub.subtitle')} compact />

      ) : (

        <View style={styles.hubHeader}>

          <Text style={styles.hubTitle}>{t('networkHub.title')}</Text>

          <Text style={styles.hubSubtitle}>{t('networkHub.subtitle')}</Text>

        </View>

      )}

      <SegmentControl

        options={tabOptions}

        value={tab}

        onChange={(id) => setTab(id as HubTab)}

      />

      {showVipUpsell && (

        <View style={styles.vipUpsell}>

          <EmptyState message={t('networking.blocked')} />

          <PrimaryButton label={t('vip.upgrade')} onPress={() => router.push('/(auth)/register-vip')} variant="gold" />

        </View>

      )}

      <View style={styles.content}>

        {tab === 'appointments' && (

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

            <VisitorAppointmentsScreen embedded />

          </ScrollView>

        )}

        {tab === 'messages' && permissions.canSendMessages && (

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

            <VisitorMessagesScreen embedded />

          </ScrollView>

        )}

        {tab === 'networking' && permissions.canAccessNetworking && (

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={networkRefreshing}
                onRefresh={() => {
                  setNetworkRefreshing(true);
                  setNetworkRefreshKey((k) => k + 1);
                }}
              />
            }
          >

            <VisitorNetworkingScreen
              embedded
              refreshKey={networkRefreshKey}
              onRefreshComplete={() => setNetworkRefreshing(false)}
            />

          </ScrollView>

        )}

      </View>

    </Screen>

  );

}



const styles = StyleSheet.create({

  flex: { flex: 1, paddingBottom: 0 },

  hubHeader: {

    paddingHorizontal: spacing.md,

    paddingTop: spacing.sm,

    paddingBottom: spacing.xs,

  },

  hubTitle: {

    fontFamily: fonts.bodyBold,

    fontSize: 20,

    color: colors.text,

  },

  hubSubtitle: {

    fontFamily: fonts.body,

    fontSize: 13,

    color: colors.textMuted,

    marginTop: 2,

  },

  vipUpsell: { marginBottom: spacing.sm, paddingHorizontal: spacing.md },

  content: { flex: 1 },

  scroll: { flex: 1 },

  scrollContent: { paddingBottom: spacing.xl },

});


