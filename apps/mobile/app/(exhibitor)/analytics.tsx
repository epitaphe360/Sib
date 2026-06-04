import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchExhibitorMetrics, type RoleMetrics } from '../../src/api/analytics';
import { Card, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, spacing } from '../../src/theme';

export default function ExhibitorAnalyticsScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [metrics, setMetrics] = useState<RoleMetrics>({ appointments: 0, messages: 0, connections: 0, profileViews: 0, scans: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setMetrics(await fetchExhibitorMetrics(user.id));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen style={styles.flex}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
        <ScreenTitle title={t('exhibitor.analytics.title')} subtitle={t('exhibitor.analytics.subtitle')} />
        <View style={styles.grid}>
          <MetricCard label={t('exhibitor.analytics.rdv')} value={metrics.appointments} />
          <MetricCard label={t('exhibitor.analytics.messages')} value={metrics.messages} />
          <MetricCard label={t('exhibitor.analytics.network')} value={metrics.connections} />
          <MetricCard label={t('exhibitor.analytics.views')} value={metrics.profileViews ?? 0} />
          <MetricCard label={t('exhibitor.analytics.scans')} value={metrics.scans ?? 0} />
        </View>
        <Card>
          <Text style={styles.hint}>{t('exhibitor.analytics.hint')}</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  metric: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricValue: { fontSize: 26, fontWeight: '800', color: colors.primary },
  metricLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  hint: { color: colors.textMuted, lineHeight: 20, fontSize: 14 },
});
