import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SalonGate } from '../../src/components/guards/SalonGate';
import { fetchExhibitors } from '../../src/services/exhibitors';
import { fetchVenueMapInfo, type VenueMapInfo } from '../../src/services/salonVenue';
import { FloorPlanImage } from '../../src/components/FloorPlanImage';
import { VenueFloorPlan } from '../../src/components/VenueFloorPlan';
import { Chip, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useSalon } from '../../src/context/SalonContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import type { Exhibitor } from '../../src/types';
import { colors, fonts, radius, spacing } from '../../src/theme';

export default function VenueMapScreen() {
  const { t } = useI18n();
  const { activeSalon } = useSalon();
  const salonId = activeSalon?.id ?? '';
  const [venue, setVenue] = useState<VenueMapInfo | null>(null);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [hall, setHall] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [v, ex] = await Promise.all([
      fetchVenueMapInfo(salonId),
      fetchExhibitors('', '', hall, salonId).catch(() => ({ items: [] as Exhibitor[], fromCache: false, sectors: [], halls: [] })),
    ]);
    setVenue(v);
    setExhibitors(ex.items);
  }, [hall, salonId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const halls = venue?.halls ?? [];

  return (
    <SalonGate>
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTitle title={t('map.title')} subtitle={venue?.venueName ?? t('map.subtitle')} />

        {loading ? (
          <ActivityIndicator color={colors.gold} size="large" />
        ) : (
          <>
            <VenueFloorPlan selectedHall={hall || undefined} onHallSelect={(h) => setHall(h)} />
            <FloorPlanImage remoteUrl={venue?.floorPlanUrl} />

            <Text style={styles.section}>{t('map.halls')}</Text>
            <View style={styles.chips}>
              <Chip label={t('map.allHalls')} active={!hall} onPress={() => setHall('')} />
              {halls.map((h) => (
                <Chip key={h} label={`Hall ${h}`} active={hall === h} onPress={() => setHall(h)} />
              ))}
            </View>

            <Text style={styles.section}>{t('map.stands')}</Text>
            {exhibitors.slice(0, 30).map((ex) => (
              <Pressable
                key={ex.id}
                style={styles.standRow}
                onPress={() => router.push(`/minisite/${ex.id}` as never)}
              >
                <Text style={styles.standName}>{ex.companyName}</Text>
                <Text style={styles.standMeta}>
                  {ex.standNumber ? `Stand ${ex.standNumber}` : '—'}
                  {ex.hallNumber ? ` · Hall ${ex.hallNumber}` : ''}
                </Text>
              </Pressable>
            ))}

            <PrimaryButton
              label={t('map.openMaps')}
              variant="outline"
              onPress={() => Linking.openURL('https://maps.google.com/?q=Parc+Exposition+Mohammed+VI+El+Jadida')}
            />
          </>
        )}
      </ScrollView>
    </Screen>
    </SalonGate>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  section: {
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  standRow: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  standName: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.text },
  standMeta: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginTop: 2 },
});
