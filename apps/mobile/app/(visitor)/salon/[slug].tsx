import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { isRegisteredForSalon, registerForSalon } from '../../../src/api/salonRegistration';
import { useAuth } from '../../../src/context/AuthContext';
import { useSalon } from '../../../src/context/SalonContext';
import { fetchSalonBySlug } from '../../../src/services/salons';
import { fetchEvents } from '../../../src/services/events';
import { fetchExhibitors } from '../../../src/services/exhibitors';
import { Card, IllustratedEmpty, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useI18n } from '../../../src/i18n/I18nProvider';
import type { Salon, SalonEvent, Exhibitor } from '../../../src/types';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function SalonHubScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const { activeSalon, setActiveSalon } = useSalon();
  const { t } = useI18n();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [events, setEvents] = useState<SalonEvent[]>([]);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      const s = await fetchSalonBySlug(slug);
      setSalon(s);
      if (s && user) setRegistered(await isRegisteredForSalon(user.id, s.id));
      if (s) {
        const [ev, ex] = await Promise.all([
          fetchEvents(s.id).catch(() => []),
          fetchExhibitors('', '', '', s.id).catch(() => ({ items: [] as Exhibitor[], fromCache: false, sectors: [], halls: [] })),
        ]);
        setEvents(ev.slice(0, 5));
        setExhibitors(ex.items.slice(0, 8));
      }
    } catch { /* affiche écran "non trouvé" via salon === null */ }
  }, [slug, user]);

  const enterSalon = async () => {
    if (!salon) return;
    await setActiveSalon(salon);
    router.replace('/(visitor)/(tabs)/explore' as never);
  };

  const isCurrentSalon = activeSalon?.id === salon?.id;

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  if (!loading && !salon) {
    return (
      <Screen>
        <IllustratedEmpty icon="grid-outline" title={t('salon.notFound')} message={t('salon.notFoundHint')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTitle title={salon?.name ?? t('home.salonsTitle')} subtitle={salon?.dates} />
        {salon?.description ? <Text style={styles.desc}>{salon.description}</Text> : null}

        <Card elevated>
          <Text style={styles.section}>{t('tabs.program')}</Text>
          {events.length ? events.map((ev) => (
            <Text key={ev.id} style={styles.line}>• {ev.title}</Text>
          )) : <Text style={styles.muted}>{t('explore.emptyProgramMessage')}</Text>}
        </Card>

        <Card elevated>
          <Text style={styles.section}>{t('tabs.exhibitors')}</Text>
          {exhibitors.length ? exhibitors.map((ex) => (
            <Text key={ex.id} style={styles.line}>• {ex.companyName}</Text>
          )) : <Text style={styles.muted}>{t('explore.emptyExhibitorsMessage')}</Text>}
        </Card>

        {user && !registered ? (
          <PrimaryButton
            label={t('salon.register')}
            variant="gold"
            loading={registering}
            onPress={async () => {
              if (!user || !salon) return;
              setRegistering(true);
              try {
                await registerForSalon(user.id, salon.id);
                setRegistered(true);
              } finally {
                setRegistering(false);
              }
            }}
          />
        ) : registered ? (
          <Text style={styles.registered}>{t('salon.registered')}</Text>
        ) : null}

        <PrimaryButton
          label={isCurrentSalon ? t('salon.continueCta') : t('salon.enterCta')}
          variant="gold"
          onPress={enterSalon}
        />

        {isCurrentSalon ? (
          <>
            <PrimaryButton label={t('salon.exploreCta')} variant="outline" onPress={() => router.push('/(visitor)/(tabs)/explore' as never)} />
            <PrimaryButton label={t('map.title')} variant="outline" onPress={() => router.push('/(visitor)/map' as never)} />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl, gap: spacing.md },
  desc: { fontFamily: fonts.body, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 },
  section: { fontFamily: fonts.bodyBold, color: colors.text, marginBottom: spacing.sm, fontSize: 15 },
  line: { fontFamily: fonts.body, color: colors.text, marginBottom: 4, fontSize: 14 },
  muted: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13 },
  registered: { fontFamily: fonts.bodyBold, color: colors.success, textAlign: 'center', marginBottom: spacing.sm },
});
