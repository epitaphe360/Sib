import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  fetchAdminScanList,
  fetchAdminScanStats,
  formatScanStatNumber,
  type AdminScanCategory,
  type AdminScanListItem,
  type AdminScanStats,
} from '../../src/api/scanStats';
import { AppIcon, type AppIconName } from '../../src/components/AppIcon';
import { EmptyState, Screen, ScreenTitle } from '../../src/components/ui';
import { SALONS } from '../../src/data/salons';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../src/theme';

const CATEGORIES: { id: AdminScanCategory; icon: AppIconName; statKey: keyof AdminScanStats; accent: string }[] = [
  { id: 'entry', icon: 'log-in-outline', statKey: 'uniqueEntrants', accent: '#10B981' },
  { id: 'networking', icon: 'people-outline', statKey: 'networkingScans', accent: '#4598D1' },
  { id: 'stand', icon: 'storefront-outline', statKey: 'standScans', accent: '#F39200' },
  { id: 'controller', icon: 'shield-outline', statKey: 'controllerScans', accent: '#6B21A8' },
];

function formatScanTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function AdminScanStatsContent() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState<AdminScanStats | null>(null);
  const [activeCategory, setActiveCategory] = useState<AdminScanCategory>('entry');
  const [items, setItems] = useState<AdminScanListItem[]>([]);
  const [salonFilter, setSalonFilter] = useState<string | undefined>('sib');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const load = useCallback(async () => {
    if (user?.type !== 'admin') return;
    try {
      const [s, list] = await Promise.all([
        fetchAdminScanStats(salonFilter),
        fetchAdminScanList(activeCategory, 150, salonFilter),
      ]);
      setStats(s);
      setItems(list);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoadingList(false);
      setRefreshing(false);
    }
  }, [user?.type, salonFilter, activeCategory, t]);

  useEffect(() => {
    setLoadingList(true);
    void load();
  }, [load]);

  const categoryLabel = (id: AdminScanCategory) => t(`adminScanStats.category.${id}`);

  const statValue = (cat: typeof CATEGORIES[number]) => {
    if (!stats) return '—';
    if (cat.id === 'entry') {
      return formatScanStatNumber(stats.uniqueEntrants);
    }
    return formatScanStatNumber(stats[cat.statKey] ?? 0);
  };

  const statSub = (cat: typeof CATEGORIES[number]) => {
    if (!stats || cat.id !== 'entry') return undefined;
    return t('adminScanStats.entrySub', {
      total: formatScanStatNumber(stats.entryScans),
      denied: formatScanStatNumber(stats.deniedScans),
    });
  };

  if (user?.type !== 'admin') {
    return (
      <Screen>
        <EmptyState title={t('adminScanStats.adminOnly')} message={t('adminScanStats.adminOnlyHint')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenTitle title={t('adminScanStats.title')} subtitle={t('adminScanStats.subtitle')} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.salonRow}>
        <Pressable
          style={[styles.salonChip, !salonFilter && styles.salonChipActive]}
          onPress={() => setSalonFilter(undefined)}
        >
          <Text style={[styles.salonChipText, !salonFilter && styles.salonChipTextActive]}>
            {t('adminScanStats.allSalons')}
          </Text>
        </Pressable>
        {SALONS.map((s) => (
          <Pressable
            key={s.id}
            style={[styles.salonChip, salonFilter === s.id && styles.salonChipActive]}
            onPress={() => setSalonFilter(s.id)}
          >
            <Text style={[styles.salonChipText, salonFilter === s.id && styles.salonChipTextActive]}>
              {s.code}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.statsGrid}>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={[styles.statCard, active && { borderColor: cat.accent, borderWidth: 2 }]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <View style={[styles.statIcon, { backgroundColor: `${cat.accent}18` }]}>
                <AppIcon name={cat.icon} size={20} color={cat.accent} />
              </View>
              <Text style={styles.statValue}>{statValue(cat)}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>
                {categoryLabel(cat.id)}
              </Text>
              {statSub(cat) ? <Text style={styles.statSub}>{statSub(cat)}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.listTitle}>
        {categoryLabel(activeCategory)} — {t('adminScanStats.listDetail')}
      </Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
        contentContainerStyle={items.length ? styles.list : styles.listEmpty}
        ListEmptyComponent={
          !loadingList ? (
            <EmptyState title={t('adminScanStats.empty')} message={t('adminScanStats.emptyHint')} />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowTop}>
              <Text
                style={[
                  styles.primary,
                  item.valid === false && { color: '#dc2626' },
                ]}
                numberOfLines={2}
              >
                {item.valid === false ? '✗ ' : item.valid === true ? '✓ ' : ''}
                {item.primaryLabel}
              </Text>
              <Text style={styles.time}>{formatScanTime(item.scannedAt)}</Text>
            </View>
            {item.secondaryLabel ? (
              <Text style={styles.secondary}>{item.secondaryLabel}</Text>
            ) : null}
            <Text style={styles.meta}>
              {[item.salonName, item.meta].filter(Boolean).join(' · ')}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

export default function AdminScanStatsScreen() {
  return <AdminScanStatsContent />;
}

const styles = StyleSheet.create({
  salonRow: { gap: spacing.sm, paddingBottom: spacing.md, paddingHorizontal: 2 },
  salonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  salonChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  salonChipText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textMuted },
  salonChipTextActive: { color: '#fff' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minWidth: 140,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { fontFamily: fonts.display, fontSize: 26, color: colors.primaryDark },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  statSub: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, marginTop: 4 },
  listTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  list: { paddingBottom: spacing.xl, gap: spacing.sm },
  listEmpty: { flexGrow: 1, paddingBottom: spacing.xl },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, alignItems: 'flex-start' },
  primary: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  time: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  secondary: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.primaryDark, marginTop: 4 },
  meta: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 4 },
});
