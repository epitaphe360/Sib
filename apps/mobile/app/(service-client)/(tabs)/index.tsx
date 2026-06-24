import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchDeskStats } from '../../../src/api/serviceClient';
import { AppIcon, type AppIconName } from '../../../src/components/AppIcon';
import { Card, MenuRow, Screen } from '../../../src/components/ui';
import { WorkspaceHeader } from '../../../src/components/workspace/WorkspaceUI';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { SALON_INFO } from '../../../src/data/salons';
import { colors, fonts, radius, shadows, spacing } from '../../../src/theme';

export default function ServiceClientDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState({ registrationsToday: 0, badgesIssuedToday: 0, replacementsToday: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const s = await fetchDeskStats(user.id);
      setStats(s);
    } catch (e) {
      console.warn('[ServiceClientDashboard] fetchDeskStats', e);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('greeting.morning');
    if (h < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  const firstName = (user?.profile as Record<string, unknown> | null)?.firstName as string | undefined
    ?? user?.name?.split(' ')[0]
    ?? t('serviceClient.agent');

  return (
    <Screen style={styles.flex}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <WorkspaceHeader
          eyebrow={t('serviceClient.title')}
          title={`${greeting()}, ${firstName}`}
          subtitle={`${t('serviceClient.subtitle')} · ${SALON_INFO.name}`}
          tone="service"
          icon="headset-outline"
        />

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>{t('serviceClient.today')}</Text>
          <View style={styles.statsRow}>
            <StatCard label={t('serviceClient.statRegistrations')} value={stats.registrationsToday} icon="person-add-outline" color="#0891B2" />
            <StatCard label={t('serviceClient.statBadges')} value={stats.badgesIssuedToday} icon="qr-code-outline" color="#15803D" />
            <StatCard label={t('serviceClient.statReplacements')} value={stats.replacementsToday} icon="swap-horizontal-outline" color="#B45309" />
          </View>

          <Text style={styles.sectionTitle}>{t('serviceClient.quickActions')}</Text>
          <Card elevated style={styles.menuCard}>
            <MenuRow icon="search-outline" label={t('serviceClient.lookup')} subtitle={t('serviceClient.lookupHint')} onPress={() => router.push('/(service-client)/(tabs)/lookup' as never)} />
            <View style={styles.divider} />
            <MenuRow icon="person-add-outline" label={t('serviceClient.register')} subtitle={t('serviceClient.registerHint')} onPress={() => router.push('/(service-client)/on-site-registration' as never)} />
            <View style={styles.divider} />
            <MenuRow icon="swap-horizontal-outline" label={t('serviceClient.replace')} subtitle={t('serviceClient.replaceHint')} onPress={() => router.push('/(service-client)/badge-replacement' as never)} />
            <View style={styles.divider} />
            <MenuRow icon="print-outline" label={t('serviceClient.print')} subtitle={t('serviceClient.printHint')} onPress={() => router.push('/(service-client)/print-station' as never)} />
            <View style={styles.divider} />
            <MenuRow icon="map-outline" label={t('staff.zoneCapacity')} subtitle={t('serviceClient.capacityHint')} onPress={() => router.push('/(service-client)/zone-capacity' as never)} />
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: AppIconName; color: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <View style={[styles.statIconWrap, { backgroundColor: `${color}18` }]}>
        <AppIcon name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.platform.bg },
  scroll: { paddingBottom: spacing.xl },
  body: { paddingHorizontal: spacing.md, marginTop: -spacing.sm, gap: spacing.md },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderTopWidth: 3,
    ...shadows.sm,
  },
  statIconWrap: { width: 34, height: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statValue: { fontFamily: fonts.display, fontSize: 24 },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  menuCard: { paddingVertical: spacing.xs, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 56 },
});
