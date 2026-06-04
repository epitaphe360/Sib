import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { HeroBanner } from '../../../src/components/HeroBanner';
import { ExhibitorRow } from '../../../src/components/ExhibitorRow';
import { EmptyState, Screen } from '../../../src/components/ui';
import { fetchExhibitors } from '../../../src/services/exhibitors';
import type { Exhibitor } from '../../../src/types';
import { colors, spacing } from '../../../src/theme';
import { router } from 'expo-router';

export default function ExhibitorsScreen() {
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
      <HeroBanner imageKey="expo" title="Annuaire exposants" subtitle="Stand · Hall · Secteur" compact />
      <TextInput
        style={styles.search}
        placeholder="Rechercher un exposant..."
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
            <Text style={[styles.chipText, !sector && styles.chipTextActive]}>Tous</Text>
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
      {fromCache ? <Text style={styles.cacheHint}>Mode hors ligne — données en cache</Text> : null}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : error ? (
        <EmptyState message={error} />
      ) : (
        <FlatList
          data={exhibitors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExhibitorRow exhibitor={item} onPress={() => router.push(`/exhibitor/${item.id}`)} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(search, sector); }} tintColor={colors.primary} />
          }
          ListEmptyComponent={<EmptyState message="Aucun exposant trouvé" />}
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
    borderRadius: 10,
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
  chipText: { fontSize: 12, color: colors.text, fontWeight: '600', maxWidth: 120 },
  chipTextActive: { color: '#fff' },
  cacheHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm, fontStyle: 'italic' },
});
