import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { HeroBanner } from '../../../src/components/HeroBanner';
import { ExhibitorRow, sortExhibitorsForDisplay } from '../../../src/components/ExhibitorRow';
import { AnimatedListItem } from '../../../src/components/AnimatedListItem';
import { Chip, EmptyState, Screen } from '../../../src/components/ui';
import { SkeletonList } from '../../../src/components/Skeleton';
import { fetchExhibitors } from '../../../src/services/exhibitors';
import type { Exhibitor } from '../../../src/types';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../../src/theme';
import { router } from 'expo-router';

export default function ExhibitorsScreen() {
  const { t } = useI18n();
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (term = search, sec = sector) => {
    try {
      setError(null);
      const { items, fromCache: cached, sectors: s } = await fetchExhibitors(term, sec);
      setExhibitors(sortExhibitorsForDisplay(items));
      setFromCache(cached);
      if (s.length) setSectors(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, sector, t]);

  useEffect(() => {
    const timer = setTimeout(() => load(search, sector), 300);
    return () => clearTimeout(timer);
  }, [search, sector, load]);

  const header = (
    <>
      <HeroBanner imageKey="expo" title={t('tabs.exhibitors')} subtitle={t('explore.searchPlaceholder')} compact />
      <TextInput
        style={styles.search}
        placeholder={t('explore.searchPlaceholder')}
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {sectors.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label={t('explore.allSectors')} active={!sector} onPress={() => setSector('')} />
          {sectors.slice(0, 12).map((s) => (
            <Chip key={s} label={s} active={sector === s} onPress={() => setSector(sector === s ? '' : s)} />
          ))}
        </ScrollView>
      ) : null}
      {fromCache ? <Text style={styles.cacheHint}>{t('common.offline')}</Text> : null}
    </>
  );

  return (
    <Screen style={styles.flex}>
      {loading ? (
        <>
          {header}
          <SkeletonList rows={5} />
        </>
      ) : error ? (
        <>
          {header}
          <EmptyState message={error} />
        </>
      ) : (
        <FlatList
          style={styles.flex}
          data={exhibitors}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <ExhibitorRow exhibitor={item} onPress={() => router.push(`/exhibitor/${item.id}`)} />
            </AnimatedListItem>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(search, sector); }}
              tintColor={colors.gold}
            />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState message={t('explore.emptyExhibitorsMessage')} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingBottom: spacing.xl },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chips: { gap: spacing.sm, paddingBottom: spacing.sm },
  cacheHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm, fontStyle: 'italic' },
});
