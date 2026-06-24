import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchExhibitorMetrics, type RoleMetrics } from '../../src/api/analytics';
import { AppIcon, type AppIconName } from '../../src/components/AppIcon';
import { Card, Screen } from '../../src/components/ui';
import { SkeletonList } from '../../src/components/Skeleton';
import { WorkspaceHeader } from '../../src/components/workspace/WorkspaceUI';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, fonts, radius, shadows, spacing } from '../../src/theme';

const METRICS: { key: keyof RoleMetrics; labelKey: string; icon: AppIconName; accent: string }[] = [
  { key: 'appointments', labelKey: 'exhibitor.analytics.rdv', icon: 'calendar-outline', accent: '#4598D1' },
  { key: 'messages', labelKey: 'exhibitor.analytics.messages', icon: 'chatbubbles-outline', accent: '#10B981' },
  { key: 'connections', labelKey: 'exhibitor.analytics.network', icon: 'people-outline', accent: '#F39200' },
  { key: 'profileViews', labelKey: 'exhibitor.analytics.views', icon: 'eye-outline', accent: '#7C5CFC' },
  { key: 'scans', labelKey: 'exhibitor.analytics.scans', icon: 'scan-outline', accent: '#0891B2' },
];

export default function ExhibitorAnalyticsScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [metrics, setMetrics] = useState<RoleMetrics>({ appointments: 0, messages: 0, connections: 0, profileViews: 0, scans: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setMetrics(await fetchExhibitorMetrics(user.id));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <Screen>
        <WorkspaceHeader eyebrow={t('exhibitor.analytics.title')} title={t('exhibitor.analytics.title')} tone="exhibitor" icon="bar-chart-outline" />
        <View style={styles.body}><SkeletonList rows={3} /></View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <WorkspaceHeader
          eyebrow={t('exhibitor.analytics.title')}
          title={t('exhibitor.analytics.title')}
          subtitle={t('exhibitor.analytics.subtitle')}
          tone="exhibitor"
          icon="bar-chart-outline"
        />
        <View style={styles.body}>
          <View style={styles.grid}>
            {METRICS.map((item) => (
              <MetricCard
                key={item.key}
                label={t(item.labelKey)}
                value={metrics[item.key] ?? 0}
                icon={item.icon}
                accent={item.accent}
              />
            ))}
          </View>
          <Card elevated style={styles.hintCard}>
            <Text style={styles.hint}>{t('exhibitor.analytics.hint')}</Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

function MetricCard({ label, value, icon, accent }: { label: string; value: number; icon: AppIconName; accent: string }) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricAccent, { backgroundColor: accent }]} />
      <View style={[styles.metricIcon, { backgroundColor: `${accent}18` }]}>
        <AppIcon name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingHorizontal: spacing.md, marginTop: -spacing.sm, paddingBottom: spacing.xl, gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metric: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.sm,
  },
  metricAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  metricIcon: { width: 34, height: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  metricValue: { fontSize: 26, fontFamily: fonts.display, color: colors.primaryDark },
  metricLabel: { fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  hintCard: { padding: spacing.md },
  hint: { color: colors.textMuted, lineHeight: 20, fontSize: 14, fontFamily: fonts.body },
});
