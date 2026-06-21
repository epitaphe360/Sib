import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ExhibitorRow } from '../../../src/components/ExhibitorRow';
import { SalonHeroBanner } from '../../../src/components/SalonHeroBanner';
import { SalonGate } from '../../../src/components/guards/SalonGate';
import { Chip, IllustratedEmpty, Screen, SegmentControl } from '../../../src/components/ui';
import { SkeletonList } from '../../../src/components/Skeleton';
import { useSalon } from '../../../src/context/SalonContext';
import { fetchEvents } from '../../../src/services/events';
import { fetchExhibitors } from '../../../src/services/exhibitors';
import type { Exhibitor, SalonEvent } from '../../../src/types';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { localeCode } from '../../../src/lib/locale';
import { colors, fonts, radius, spacing } from '../../../src/theme';

type ExploreTab = 'program' | 'exhibitors';

export default function ExploreScreen() {
  const { t, locale } = useI18n();
  const { activeSalon } = useSalon();
  const salonId = activeSalon?.id ?? '';
  const [tab, setTab] = useState<ExploreTab>('exhibitors');
  const [events, setEvents] = useState<SalonEvent[]>([]);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [halls, setHalls] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [hall, setHall] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const [ev, ex] = await Promise.all([
      fetchEvents(salonId || undefined).catch(() => [] as SalonEvent[]),
      fetchExhibitors(debouncedSearch, '', hall, salonId).catch(() => ({ items: [] as Exhibitor[], fromCache: false, sectors: [], halls: [] })),
    ]);
    setEvents(ev);
    setExhibitors(ex.items);
    if (ex.halls.length) setHalls(ex.halls);
  }, [debouncedSearch, hall, salonId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  return (
    <SalonGate>
    <Screen style={styles.flex}>
      <SalonHeroBanner
        imageKey="expo"
        title={t('explore.title')}
        subtitle={activeSalon ? activeSalon.name : t('explore.subtitle')}
        compact
      />
      <SegmentControl
        options={[
          { id: 'exhibitors', label: t('tabs.exhibitors') },
          { id: 'program', label: t('tabs.program') },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'exhibitors' ? (
        <>
          <TextInput
            style={styles.search}
            placeholder={t('explore.searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {halls.length > 0 ? (
            <View style={styles.hallRow}>
              <Chip label={t('map.allHalls')} active={!hall} onPress={() => setHall('')} />
              {halls.map((h) => (
                <Chip key={h} label={`Hall ${h}`} active={hall === h} onPress={() => setHall(h)} />
              ))}
            </View>
          ) : null}
          <FlatList
            data={exhibitors}
            keyExtractor={(e) => e.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />
            }
            ListEmptyComponent={
              loading ? <SkeletonList rows={5} /> : (
                <IllustratedEmpty
                  icon="business-outline"
                  title={t('explore.emptyExhibitorsTitle')}
                  message={t('explore.emptyExhibitorsMessage')}
                />
              )
            }
            renderItem={({ item }) => (
              <ExhibitorRow exhibitor={item} onPress={() => router.push(`/minisite/${item.id}` as never)} />
            )}
          />
        </>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />
          }
        >
          {loading ? (
            <SkeletonList rows={4} />
          ) : events.length === 0 ? (
            <IllustratedEmpty
              icon="calendar-outline"
              title={t('explore.emptyProgramTitle')}
              message={t('explore.emptyProgramMessage')}
            />
          ) : (
            events.map((ev) => (
              <Pressable
                key={ev.id}
                style={styles.eventCard}
                onPress={() => router.push(`/(visitor)/event/${ev.id}` as never)}
              >
                <View style={[styles.eventType, { backgroundColor: colors.goldMuted }]}>
                  <Text style={styles.eventTypeText}>{ev.type}</Text>
                </View>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <Text style={styles.eventMeta}>
                  {ev.startDate.toLocaleDateString(localeCode(locale))} · {ev.location ?? activeSalon?.name ?? t('explore.subtitle')}
                </Text>
                {ev.description ? <Text style={styles.eventDesc} numberOfLines={2}>{ev.description}</Text> : null}
                <Text style={styles.eventSeeMore}>{t('explore.seeDetails')}</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </Screen>
    </SalonGate>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hallRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.body,
    marginBottom: spacing.md,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  eventType: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  eventTypeText: { fontSize: 11, fontFamily: fonts.bodyBold, color: colors.primaryDark, textTransform: 'uppercase' },
  eventTitle: { fontSize: 17, fontFamily: fonts.bodyBold, color: colors.text },
  eventMeta: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  eventDesc: { fontSize: 14, fontFamily: fonts.body, color: colors.text, marginTop: 8, lineHeight: 20 },
  eventSeeMore: { fontSize: 12, fontFamily: fonts.bodyBold, color: colors.primary, marginTop: 8, textAlign: 'right' },
});
