import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { HeroBanner } from '../../../src/components/HeroBanner';
import { ExhibitorRow } from '../../../src/components/ExhibitorRow';
import { AnimatedListItem } from '../../../src/components/AnimatedListItem';
import { EmptyState, Screen } from '../../../src/components/ui';
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
      setExhibitors(items);
      setFromCache(cached);
      if (s.length) setSectors(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, sector]);

  useEffect(() => {
    const timer = setTimeout(() => load(search, sector), 300);
    return () => clearTimeout(timer);
  }, [search, sector, load]);

  return (
    <Screen style={styles.flex}>
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
      {sectors.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          <Pressable
            style={[styles.chip, !sector && styles.chipActive]}
            onPress={() => setSector('')}
          >
            <Text style={[styles.chipText, !sector && styles.chipTextActive]}>{t('map.allHalls')}</Text>
          </Pressable>
          {sectors.slice(0, 12).map((s) => (
            <Pressable
              key={s}
              style={[styles.chip, sector === s && styles.chipActive]}
              onPress={() => setSector(sector === s ? '' : s)}
            >
              <Text style={[styles.chipText, sector === s && styles.chipTextActive]} numberOfLines={1}>
                {s}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      {fromCache ? <Text style={styles.cacheHint}>{t('common.offline')}</Text> : null}
      {loading ? (
        <SkeletonList rows={5} />
      ) : error ? (
        <EmptyState message={error} />
      ) : (
        <FlatList
          data={exhibitors}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <ExhibitorRow exhibitor={item} onPress={() => router.push(`/exhibitor/${item.id}`)} />
            </AnimatedListItem>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(search, sector); }} tintColor={colors.gold} />
          }
          ListEmptyComponent={<EmptyState message={t('explore.emptyExhibitorsMessage')} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  chips: { marginBottom: spacing.sm, maxHeight: 40 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: colors.text, maxWidth: 120 },
  chipTextActive: { color: '#fff' },
  cacheHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm, fontStyle: 'italic' },
});
