import { router } from 'expo-router';

import { useCallback, useEffect, useRef, useState } from 'react';

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

import { InteractiveFloorPlan } from '../../src/components/InteractiveFloorPlan';

import { HallExhibitorsPanel } from '../../src/components/map/HallExhibitorsPanel';

import { fetchExhibitors } from '../../src/services/exhibitors';

import { fetchVenueMapInfo, type VenueMapInfo } from '../../src/services/salonVenue';

import { Chip, PrimaryButton, Screen, ScreenTitle, SecondaryButton } from '../../src/components/ui';

import { useSalon } from '../../src/context/SalonContext';

import { useI18n } from '../../src/i18n/I18nProvider';

import type { Exhibitor } from '../../src/types';

import { colors, fonts, radius, spacing } from '../../src/theme';



export default function VenueMapScreen() {

  const { t } = useI18n();

  const { activeSalon } = useSalon();

  const salonId = activeSalon?.id ?? '';

  const scrollRef = useRef<ScrollView>(null);

  const [standsY, setStandsY] = useState(0);

  const [venue, setVenue] = useState<VenueMapInfo | null>(null);

  const [allExhibitors, setAllExhibitors] = useState<Exhibitor[]>([]);

  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);

  const [hall, setHall] = useState('');

  const [selectedStandId, setSelectedStandId] = useState('');

  const [showAllStands, setShowAllStands] = useState(false);

  const [loading, setLoading] = useState(true);



  const load = useCallback(async () => {

    const [v, allEx, filtered] = await Promise.all([

      fetchVenueMapInfo(salonId),

      fetchExhibitors('', '', '', salonId).catch(() => ({ items: [] as Exhibitor[], fromCache: false, sectors: [], halls: [] })),

      fetchExhibitors('', '', hall, salonId).catch(() => ({ items: [] as Exhibitor[], fromCache: false, sectors: [], halls: [] })),

    ]);

    setVenue(v);

    setAllExhibitors(allEx.items);

    setExhibitors(filtered.items);

  }, [hall, salonId]);



  useEffect(() => {

    setLoading(true);

    load().finally(() => setLoading(false));

  }, [load]);



  const selectHall = useCallback((h: string) => {

    setHall(h);

    setSelectedStandId('');

    if (h) {

      setTimeout(() => {

        scrollRef.current?.scrollTo({ y: Math.max(0, standsY - spacing.md), animated: true });

      }, 280);

    }

  }, [standsY]);



  const openStand = useCallback((exhibitorId: string) => {

    setSelectedStandId(exhibitorId);

    router.push(`/minisite/${exhibitorId}` as never);

  }, []);



  const halls = venue?.halls ?? [];



  return (

    <SalonGate>

    <Screen>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>

        <ScreenTitle title={t('map.title')} subtitle={venue?.venueName ?? t('map.subtitle')} />



        {loading ? (

          <ActivityIndicator color={colors.gold} size="large" />

        ) : (

          <>

            <InteractiveFloorPlan

              remoteUrl={venue?.floorPlanUrl}

              exhibitors={allExhibitors}

              standPinOverrides={venue?.standPinOverrides}

              selectedHall={hall || undefined}

              selectedStandId={selectedStandId || undefined}

              showAllStands={showAllStands}

              onHallSelect={selectHall}

              onStandPress={openStand}

            />



            <SecondaryButton

              label={showAllStands ? t('map.hideAllStands') : t('map.showAllStands')}

              icon="location-outline"

              onPress={() => setShowAllStands((v) => !v)}

            />



            {hall ? (

              <HallExhibitorsPanel hall={hall} exhibitors={exhibitors} onClear={() => selectHall('')} />

            ) : null}



            <Text style={styles.section}>{t('map.halls')}</Text>

            <View style={styles.chips}>

              <Chip label={t('map.allHalls')} active={!hall} onPress={() => selectHall('')} />

              {halls.map((h) => (

                <Chip key={h} label={`Hall ${h}`} active={hall === h} onPress={() => selectHall(h)} />

              ))}

            </View>



            <View onLayout={(e) => setStandsY(e.nativeEvent.layout.y)}>

              <Text style={styles.section}>{t('map.stands')}</Text>

            </View>

            {exhibitors.length === 0 ? (

              <Text style={styles.emptyStands}>{t('map.noExhibitorsInHall')}</Text>

            ) : (

              exhibitors.slice(0, 40).map((ex) => (

                <Pressable

                  key={ex.id}

                  style={[styles.standRow, selectedStandId === ex.id && styles.standRowActive]}

                  onPress={() => openStand(ex.id)}

                >

                  <Text style={styles.standName}>{ex.companyName}</Text>

                  <Text style={styles.standMeta}>

                    {ex.standNumber ? `Stand ${ex.standNumber}` : '—'}

                    {ex.hallNumber ? ` · ${ex.hallNumber}` : ''}

                  </Text>

                </Pressable>

              ))

            )}



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

  standRowActive: {

    borderColor: colors.gold,

    backgroundColor: colors.goldMuted,

  },

  standName: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.text },

  standMeta: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginTop: 2 },

  emptyStands: {

    fontFamily: fonts.body,

    fontSize: 14,

    color: colors.textMuted,

    textAlign: 'center',

    paddingVertical: spacing.lg,

  },

});


