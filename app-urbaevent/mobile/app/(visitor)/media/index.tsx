import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { fetchPublishedMedia, getMediaTypeLabel, type MediaItem } from '../../../src/api/media';
import { Chip, EmptyState, Screen, ScreenTitle } from '../../../src/components/ui';
import { SkeletonList } from '../../../src/components/Skeleton';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../../src/theme';

const TYPES = ['', 'webinar', 'podcast', 'capsule_inside', 'live_studio', 'best_moments', 'testimonial'];

export default function MediaLibraryScreen() {
  const { t } = useI18n();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setItems(await fetchPublishedMedia(debouncedSearch, type));
    } catch { /* silently ignore */ } finally {
      setLoading(false);
    }
  }, [debouncedSearch, type]);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('media.title')} subtitle={t('media.subtitle')} />
      <TextInput
        style={styles.search}
        placeholder={t('media.search')}
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.chips}>
        {TYPES.map((tp) => (
          <Chip
            key={tp || 'all'}
            label={tp ? getMediaTypeLabel(tp, t) : t('map.allHalls')}
            active={type === tp}
            onPress={() => setType(tp)}
          />
        ))}
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={loading ? <SkeletonList rows={4} /> : <EmptyState message={t('media.empty')} />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/(visitor)/media/${item.id}` as never)}>
            {item.thumbnailUrl ? <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} /> : null}
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.type}>{getMediaTypeLabel(item.type, t)} · {item.viewsCount} vues</Text>
            </View>
          </Pressable>
        )}
      />
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
    padding: spacing.md,
    marginBottom: spacing.sm,
    fontFamily: fonts.body,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  thumb: { width: 72, height: 48, borderRadius: radius.sm },
  info: { flex: 1 },
  title: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 14 },
  type: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
