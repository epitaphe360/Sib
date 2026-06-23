import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchExhibitorMetrics } from '../../../src/api/analytics';
import { fetchExhibitorStand, fetchMiniSite } from '../../../src/api/minisite';
import { LanguageSwitcher } from '../../../src/components/LanguageSwitcher';
import { Card, MenuRow, PrimaryButton, Screen, StatusBadge } from '../../../src/components/ui';
import { SkeletonBlock, SkeletonList } from '../../../src/components/Skeleton';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { withRetry } from '../../../src/lib/withRetry';
import { logger } from '../../../src/lib/logger';
import { colors, fonts, radius, shadows, spacing } from '../../../src/theme';

export default function ExhibitorHomeScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stand, setStand] = useState<Awaited<ReturnType<typeof fetchExhibitorStand>>>(null);
  const [metrics, setMetrics] = useState({ appointments: 0, messages: 0, connections: 0 });
  const [miniSite, setMiniSite] = useState<Awaited<ReturnType<typeof fetchMiniSite>>>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef(false);

  const load = useCallback(async () => {
    if (!user) return;
    abortRef.current = false;
    try {
      const [s, m, ms] = await withRetry(
        () => Promise.all([
          fetchExhibitorStand(user.id),
          fetchExhibitorMetrics(user.id),
          fetchMiniSite(user.id),
        ]),
        { context: 'ExhibitorHome', maxAttempts: 3 }
      );
      if (abortRef.current) return;
      setStand(s);
      setMetrics(m);
      setMiniSite(ms);
    } catch (e) {
      logger.warn('ExhibitorHome', 'load error', e);
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
    return () => { abortRef.current = true; };
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Screen style={styles.flex}>
        <View style={styles.header}>
          <SkeletonBlock height={32} width="60%" />
          <SkeletonBlock height={16} width="40%" style={{ marginTop: 8 }} />
        </View>
        <SkeletonList rows={3} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('exhibitor.dashboard.title')}</Text>
          <Text style={styles.subtitle}>{stand?.companyName ?? user?.name ?? t('tabs.stand')}</Text>
          {miniSite && (
            <StatusBadge status={miniSite.isPublished ? 'confirmed' : 'pending'} />
          )}
        </View>
        <LanguageSwitcher compact />

        <Card elevated>
          <Text style={styles.label}>{t('tabs.stand')}</Text>
          <Text style={styles.value}>
            {stand?.standNumber ?? '—'} · Hall {stand?.hallNumber ?? '—'}
          </Text>
          <Text style={styles.desc}>
            {stand?.description ?? t('exhibitor.dashboard.standHint')}
          </Text>
        </Card>

        <View style={styles.statsRow}>
          <Stat label={t('exhibitor.analytics.rdv')} value={String(metrics.appointments)} />
          <Stat label={t('exhibitor.analytics.messages')} value={String(metrics.messages)} />
          <Stat label={t('exhibitor.analytics.network')} value={String(metrics.connections)} />
        </View>

        <PrimaryButton
          label={t('exhibitor.dashboard.scanCta')}
          variant="gold"
          onPress={() => router.push('/(exhibitor)/scan')}
        />

        <Text style={styles.section}>{t('exhibitor.dashboard.sectionTools')}</Text>
        <MenuRow icon="people-outline" label={t('exhibitor.contacts.title')} onPress={() => router.push('/(exhibitor)/(tabs)/contacts' as never)} />
        <MenuRow icon="qr-code-outline" label={t('tabs.badge')} onPress={() => router.push('/(exhibitor)/(tabs)/badge' as never)} />
        <MenuRow icon="chatbubbles-outline" label={t('tabs.messages')} onPress={() => router.push('/(exhibitor)/(tabs)/messages' as never)} />
        <MenuRow icon="person-add-outline" label={t('team.title')} onPress={() => router.push('/(exhibitor)/team' as never)} />
        <MenuRow icon="calendar-outline" label={t('tabs.appointments')} onPress={() => router.push('/(exhibitor)/(tabs)/appointments' as never)} />
        <MenuRow
          icon="globe-outline"
          label={t('exhibitor.dashboard.minisite')}
          onPress={() => stand?.id && router.push(`/minisite/${stand.id}?preview=1` as never)}
        />
        <MenuRow icon="create-outline" label={t('exhibitor.dashboard.editMinisite')} onPress={() => router.push('/(exhibitor)/minisite')} />
        <MenuRow icon="bar-chart-outline" label={t('exhibitor.analytics.title')} onPress={() => router.push('/(exhibitor)/analytics')} />
        <MenuRow icon="person-outline" label={t('exhibitor.profile.title')} onPress={() => router.push('/(exhibitor)/(tabs)/profile')} />
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
  header: { marginBottom: spacing.lg, paddingTop: spacing.sm },
  title: { fontSize: 28, fontFamily: fonts.display, color: colors.primaryDark },
  subtitle: { fontSize: 15, fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  label: { fontSize: 12, fontFamily: fonts.bodyBold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 20, fontFamily: fonts.bodyBold, color: colors.text, marginTop: 4 },
  desc: { fontSize: 14, fontFamily: fonts.body, color: colors.textMuted, marginTop: 8, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  statValue: { fontSize: 26, fontFamily: fonts.display, color: colors.primary },
  statLabel: { fontSize: 11, fontFamily: fonts.bodyMedium, color: colors.textMuted, marginTop: 4 },
  section: {
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});
