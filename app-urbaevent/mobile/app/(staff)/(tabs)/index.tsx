import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchAdminLiveMetrics } from '../../../src/api/analytics';
import { Card, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, spacing } from '../../../src/theme';

export default function StaffLiveScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [metrics, setMetrics] = useState({ totalUsers: 0, pendingPayments: 0, pendingValidations: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (user?.type === 'admin') {
      try {
        setMetrics(await fetchAdminLiveMetrics());
      } catch (e) {
        Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
      }
    }
  }, [user, t]);

  useEffect(() => { load(); }, [load]);

  const isSecurity = user?.type === 'security';

  return (
    <Screen style={styles.flex}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
        <ScreenTitle
          title={isSecurity ? t('staff.securityTitle') : t('staff.orgTitle')}
          subtitle={isSecurity ? t('staff.securitySubtitle') : t('staff.orgSubtitle')}
        />
        {isSecurity ? (
          <>
            <Text style={styles.text}>{t('staff.securityHint')}</Text>
            <PrimaryButton label={t('staff.openScanner')} onPress={() => router.push('/(staff)/(tabs)/scanner' as never)} />
            <View style={styles.gap} />
            <PrimaryButton label={t('staff.printStation')} onPress={() => router.push('/(staff)/print-station' as never)} />
            <View style={styles.gap} />
            <PrimaryButton label={t('staff.zoneCapacity')} onPress={() => router.push('/(staff)/zone-capacity' as never)} variant="outline" />
          </>
        ) : (
          <>
            <View style={styles.statsRow}>
              <Stat label={t('staff.users')} value={String(metrics.totalUsers)} />
              <Stat label={t('staff.payments')} value={String(metrics.pendingPayments)} />
            </View>
            <Card>
              <Text style={styles.text}>{t('staff.orgHint')}</Text>
            </Card>
            <PrimaryButton label={t('staff.validatePayments')} onPress={() => router.push('/(staff)/payments')} />
            <View style={styles.gap} />
            <PrimaryButton label={t('staff.printStation')} onPress={() => router.push('/(staff)/print-station' as never)} />
            <View style={styles.gap} />
            <PrimaryButton label={t('staff.zoneCapacity')} onPress={() => router.push('/(staff)/zone-capacity' as never)} />
            <View style={styles.gap} />
            <PrimaryButton label={t('staff.pricing')} onPress={() => router.push('/(staff)/pricing')} />
            <View style={styles.gap} />
            <PrimaryButton label={t('staff.alertsBtn')} onPress={() => router.push('/(staff)/alerts')} />
            <View style={styles.gap} />
            <PrimaryButton label={t('staff.usersBtn')} onPress={() => router.push('/(staff)/users')} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { height: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  text: { color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
});
