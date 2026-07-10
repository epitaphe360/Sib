import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchExhibitorMetrics } from '../../../src/api/analytics';
import { fetchExhibitorStand, fetchMiniSite } from '../../../src/api/minisite';
import { fetchMiniSiteProducts } from '../../../src/api/minisiteProducts';
import { AppIcon, type AppIconName } from '../../../src/components/AppIcon';
import { LanguageSwitcher } from '../../../src/components/LanguageSwitcher';
import { Card, EmptyState, MenuRow, PrimaryButton, Screen } from '../../../src/components/ui';
import { SkeletonBlock, SkeletonList } from '../../../src/components/Skeleton';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { formatStandHallLine } from '../../../src/lib/formatStandLocation';
import { withRetry } from '../../../src/lib/withRetry';
import { logger } from '../../../src/lib/logger';
import { colors, fonts, radius, shadows, spacing } from '../../../src/theme';

type ToolRow = {
  icon: AppIconName;
  labelKey: string;
  route: string;
  subtitleKey?: string;
};

type ToolGroup = {
  titleKey: string;
  rows: ToolRow[];
};

const TOOL_GROUPS: ToolGroup[] = [
  {
    titleKey: 'exhibitor.dashboard.toolsVisitors',
    rows: [
      { icon: 'people-outline', labelKey: 'exhibitor.contacts.title', route: '/(exhibitor)/(tabs)/contacts' },
      { icon: 'chatbubbles-outline', labelKey: 'tabs.messages', route: '/(exhibitor)/(tabs)/messages' },
      { icon: 'calendar-outline', labelKey: 'tabs.appointments', route: '/(exhibitor)/(tabs)/appointments' },
    ],
  },
  {
    titleKey: 'exhibitor.dashboard.toolsMinisite',
    rows: [
      {
        icon: 'create-outline',
        labelKey: 'exhibitor.dashboard.editMinisite',
        route: '/(exhibitor)/minisite',
        subtitleKey: 'exhibitor.dashboard.editMinisiteHint',
      },
      {
        icon: 'cube-outline',
        labelKey: 'exhibitor.dashboard.products',
        route: '/(exhibitor)/minisite-products',
        subtitleKey: 'exhibitor.dashboard.productsHint',
      },
      {
        icon: 'globe-outline',
        labelKey: 'exhibitor.dashboard.minisite',
        route: '__minisite__',
        subtitleKey: 'exhibitor.dashboard.minisiteHint',
      },
    ],
  },
  {
    titleKey: 'exhibitor.dashboard.toolsStand',
    rows: [
      { icon: 'qr-code-outline', labelKey: 'tabs.badge', route: '/(exhibitor)/(tabs)/badge' },
      { icon: 'person-add-outline', labelKey: 'team.title', route: '/(exhibitor)/team' },
      {
        icon: 'bar-chart-outline',
        labelKey: 'exhibitor.analytics.title',
        route: '/(exhibitor)/analytics',
        subtitleKey: 'exhibitor.dashboard.analyticsHint',
      },
    ],
  },
];

export default function ExhibitorHomeScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stand, setStand] = useState<Awaited<ReturnType<typeof fetchExhibitorStand>>>(null);
  const [metrics, setMetrics] = useState({ appointments: 0, messages: 0, connections: 0 });
  const [miniSite, setMiniSite] = useState<Awaited<ReturnType<typeof fetchMiniSite>>>(null);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef(false);

  const load = useCallback(async () => {
    if (!user) return;
    abortRef.current = false;
    setLoadError(null);
    try {
      const [s, m, ms] = await withRetry(
        () => Promise.all([
          fetchExhibitorStand(user.id),
          fetchExhibitorMetrics(user.id),
          fetchMiniSite(user.id),
        ]),
        { context: 'ExhibitorHome', maxAttempts: 3 },
      );
      if (abortRef.current) return;
      setStand(s);
      setMetrics(m);
      setMiniSite(ms);
      if (s?.id) {
        fetchMiniSiteProducts(s.id)
          .then((products) => {
            if (!abortRef.current) setProductCount(products.length);
          })
          .catch(() => {
            if (!abortRef.current) setProductCount(0);
          });
      } else {
        setProductCount(0);
      }
    } catch (e) {
      logger.warn('ExhibitorHome', 'load error', e);
      if (!abortRef.current) {
        setLoadError(e instanceof Error ? e.message : t('common.error'));
      }
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    load();
    return () => {
      abortRef.current = true;
    };
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openTool = (route: string) => {
    if (route === '__minisite__') {
      if (stand?.id) router.push(`/minisite/${stand.id}?preview=1` as never);
      return;
    }
    router.push(route as never);
  };

  const toolSubtitle = (row: ToolRow) => {
    if (row.route === '/(exhibitor)/minisite-products') {
      return t('exhibitor.dashboard.productsCount', { count: productCount });
    }
    return row.subtitleKey ? t(row.subtitleKey) : undefined;
  };

  if (loading) {
    return (
      <Screen style={styles.flex}>
        <View style={styles.heroSkeleton} />
        <View style={styles.bodyPad}>
          <SkeletonBlock height={120} width="100%" />
          <SkeletonList rows={3} />
        </View>
      </Screen>
    );
  }

  if (loadError) {
    return (
      <Screen style={styles.flex}>
        <EmptyState message={loadError} />
        <PrimaryButton label={t('common.retry')} onPress={() => { setLoading(true); void load(); }} />
      </Screen>
    );
  }

  const companyName = stand?.companyName ?? user?.name ?? t('tabs.stand');
  const locationLine = formatStandHallLine(stand?.standNumber, stand?.hallNumber);
  const isPublished = Boolean(miniSite?.isPublished);

  return (
    <Screen style={styles.flex}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroRow}>
            {stand?.logoUrl ? (
              <Image source={{ uri: stand.logoUrl }} style={styles.logo} resizeMode="contain" />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoLetter}>{companyName.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.heroText}>
              <Text style={styles.heroEyebrow}>{t('exhibitor.dashboard.title')}</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {companyName}
              </Text>
              {stand?.sector ? (
                <Text style={styles.heroSector} numberOfLines={1}>
                  {stand.sector}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.heroFooter}>
            {miniSite ? (
              <View style={[styles.statusPill, isPublished ? styles.statusPublished : styles.statusPending]}>
                <View style={[styles.statusDot, { backgroundColor: isPublished ? colors.success : colors.warning }]} />
                <Text style={[styles.statusText, { color: isPublished ? colors.success : colors.warning }]}>
                  {isPublished ? t('exhibitor.dashboard.published') : t('appointments.status.pending')}
                </Text>
              </View>
            ) : (
              <View style={styles.statusSpacer} />
            )}
            <LanguageSwitcher compact variant="hero" />
          </View>
        </View>

        <View style={styles.bodyPad}>
          <Card elevated style={styles.standCard}>
            <View style={styles.standHeader}>
              <View style={styles.standIconWrap}>
                <AppIcon name="location-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.standMeta}>
                <Text style={styles.standLabel}>{t('tabs.stand')}</Text>
                <Text style={styles.standLocation}>{locationLine}</Text>
              </View>
            </View>
            <Text style={styles.standDesc}>
              {stand?.description ?? t('exhibitor.dashboard.standHint')}
            </Text>
          </Card>

          <View style={styles.statsRow}>
            <StatCard icon="calendar-outline" label={t('exhibitor.analytics.rdv')} value={metrics.appointments} accent="#4598D1" />
            <StatCard icon="chatbubbles-outline" label={t('exhibitor.analytics.messages')} value={metrics.messages} accent="#10B981" />
            <StatCard icon="people-outline" label={t('exhibitor.analytics.network')} value={metrics.connections} accent="#F39200" />
          </View>

          <PrimaryButton
            label={t('exhibitor.dashboard.scanCta')}
            variant="gold"
            onPress={() => router.push('/(exhibitor)/scan')}
          />

          <Text style={styles.sectionTitle}>{t('exhibitor.dashboard.sectionTools')}</Text>
          {TOOL_GROUPS.map((group) => (
            <View key={group.titleKey}>
              <Text style={styles.groupTitle}>{t(group.titleKey)}</Text>
              <Card elevated style={styles.toolsCard}>
                {group.rows.map((row, index) => (
                  <View key={row.route}>
                    <MenuRow
                      icon={row.icon}
                      label={t(row.labelKey)}
                      subtitle={toolSubtitle(row)}
                      onPress={() => openTool(row.route)}
                    />
                    {index < group.rows.length - 1 ? <View style={styles.toolDivider} /> : null}
                  </View>
                ))}
              </Card>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: AppIconName;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <View style={[styles.statIconWrap, { backgroundColor: `${accent}18` }]}>
        <AppIcon name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.platform.bg },
  scroll: { paddingBottom: spacing.xl },
  heroSkeleton: {
    height: 168,
    backgroundColor: colors.primaryDark,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  bodyPad: {
    paddingHorizontal: spacing.md,
    marginTop: -spacing.md,
    gap: spacing.md,
  },
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
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: '#fff',
  },
  logoFallback: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: '#fff',
  },
  heroText: { flex: 1 },
  heroEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: '#fff',
    lineHeight: 30,
  },
  heroSector: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 4,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statusSpacer: { flex: 1 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: 'rgba(243, 146, 0, 0.14)',
    borderColor: 'rgba(243, 146, 0, 0.35)',
  },
  statusPublished: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  standCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  standHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  standIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standMeta: { flex: 1 },
  standLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  standLocation: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
    marginTop: 2,
  },
  standDesc: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    paddingTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
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
  statAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.primaryDark,
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  groupTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  toolsCard: {
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },
  toolDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 56,
  },
});
