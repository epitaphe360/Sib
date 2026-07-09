import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchAdminLiveMetrics } from '../../../src/api/analytics';
import { fetchAdminScanStats, formatScanStatNumber, type AdminScanStats } from '../../../src/api/scanStats';
import { AppIcon, type AppIconName } from '../../../src/components/AppIcon';
import { Card, MenuRow, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, fonts, radius, shadows, spacing } from '../../../src/theme';

export default function StaffLiveScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [metrics, setMetrics] = useState({ totalUsers: 0, pendingPayments: 0, pendingValidations: 0 });
  const [scanStats, setScanStats] = useState<AdminScanStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (user?.type === 'admin') {
      try {
        const [live, scans] = await Promise.all([
          fetchAdminLiveMetrics(),
          fetchAdminScanStats(),
        ]);
        setMetrics(live);
        setScanStats(scans);
      } catch (e) {
        Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
      }
    }
  }, [user, t]);

  useEffect(() => { load(); }, [load]);

  const isSecurity = user?.type === 'security';

  return (
    <Screen style={styles.flex}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroEyebrow}>{isSecurity ? t('staff.securityTitle') : t('staff.orgTitle')}</Text>
          <Text style={styles.heroTitle}>{user?.name ?? t('staff.profile.title')}</Text>
          <Text style={styles.heroSubtitle}>{isSecurity ? t('staff.securitySubtitle') : t('staff.orgSubtitle')}</Text>
        </View>

        <View style={styles.body}>
          {isSecurity ? (
            <>
              <Text style={styles.hint}>{t('staff.securityHint')}</Text>
              <Card elevated style={styles.menuCard}>
                <MenuRow icon="scan-outline" label={t('staff.openScanner')} onPress={() => router.push('/(staff)/(tabs)/scanner' as never)} accent={colors.primary} />
                <View style={styles.divider} />
                <MenuRow icon="print-outline" label={t('staff.printStation')} onPress={() => router.push('/(staff)/print-station' as never)} />
                <View style={styles.divider} />
                <MenuRow icon="map-outline" label={t('staff.zoneCapacity')} onPress={() => router.push('/(staff)/zone-capacity' as never)} />
              </Card>
            </>
          ) : (
            <>
              <View style={styles.statsRow}>
                <StatCard icon="people-outline" label={t('staff.users')} value={metrics.totalUsers} accent="#4598D1" />
                <StatCard icon="card-outline" label={t('staff.payments')} value={metrics.pendingPayments} accent="#F39200" />
                <StatCard icon="time-outline" label={t('staff.validations')} value={metrics.pendingValidations} accent="#10B981" />
              </View>
              {scanStats ? (
                <Pressable onPress={() => router.push('/(staff)/scan-stats' as never)}>
                  <Card elevated style={styles.scanPreview}>
                    <Text style={styles.scanPreviewTitle}>{t('adminScanStats.menu')}</Text>
                    <View style={styles.scanPreviewRow}>
                      <ScanPill label={t('adminScanStats.portal.controller')} value={scanStats.controllerScans} />
                      <ScanPill label={t('adminScanStats.portal.entry')} value={scanStats.uniqueEntrants} />
                      <ScanPill label={t('adminScanStats.portal.networking')} value={scanStats.networkingScans} />
                      <ScanPill label={t('adminScanStats.portal.stand')} value={scanStats.standScans} />
                    </View>
                  </Card>
                </Pressable>
              ) : null}
              <Card elevated style={styles.hintCard}>
                <Text style={styles.hint}>{t('staff.orgHint')}</Text>
              </Card>
              <Text style={styles.section}>{t('exhibitor.dashboard.sectionTools')}</Text>
              <Card elevated style={styles.menuCard}>
                <MenuRow icon="card-outline" label={t('staff.validatePayments')} onPress={() => router.push('/(staff)/payments')} accent={colors.gold} />
                <View style={styles.divider} />
                <MenuRow icon="print-outline" label={t('staff.printStation')} onPress={() => router.push('/(staff)/print-station' as never)} />
                <View style={styles.divider} />
                <MenuRow icon="map-outline" label={t('staff.zoneCapacity')} onPress={() => router.push('/(staff)/zone-capacity' as never)} />
                <View style={styles.divider} />
                <MenuRow icon="pricetag-outline" label={t('staff.pricing')} onPress={() => router.push('/(staff)/pricing')} />
                <View style={styles.divider} />
                <MenuRow icon="notifications-outline" label={t('staff.alertsBtn')} onPress={() => router.push('/(staff)/alerts')} />
                <View style={styles.divider} />
                <MenuRow icon="people-outline" label={t('staff.usersBtn')} onPress={() => router.push('/(staff)/users')} />
                <View style={styles.divider} />
                <MenuRow icon="bar-chart-outline" label={t('adminScanStats.menu')} onPress={() => router.push('/(staff)/scan-stats' as never)} accent={colors.primary} />
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function ScanPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.scanPill}>
      <Text style={styles.scanPillValue}>{formatScanStatNumber(value)}</Text>
      <Text style={styles.scanPillLabel} numberOfLines={2}>{label}</Text>
    </View>
  );
}

function StatCard({ icon, label, value, accent }: { icon: AppIconName; label: string; value: number; accent: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <View style={[styles.statIconWrap, { backgroundColor: `${accent}18` }]}>
        <AppIcon name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.platform.bg },
  scroll: { paddingBottom: spacing.xl },
  hero: {
    backgroundColor: colors.primaryDark,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg + spacing.sm,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(243, 146, 0, 0.12)',
  },
  heroEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  heroTitle: { fontFamily: fonts.display, fontSize: 24, color: '#fff', lineHeight: 30 },
  heroSubtitle: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 6, lineHeight: 20 },
  body: { paddingHorizontal: spacing.md, marginTop: -spacing.sm, gap: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.sm,
  },
  statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  statIconWrap: { width: 34, height: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 4, marginBottom: 6 },
  statValue: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryDark },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  hintCard: { padding: spacing.md },
  hint: { color: colors.textMuted, lineHeight: 20, fontFamily: fonts.body, fontSize: 14 },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuCard: { paddingVertical: spacing.xs, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 56 },
  scanPreview: { padding: spacing.md, gap: spacing.sm },
  scanPreviewTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primaryDark },
  scanPreviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  scanPill: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  scanPillValue: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryDark },
  scanPillLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
});
