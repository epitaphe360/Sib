import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { isRegisteredForSalon, registerForSalon } from '../../../src/api/salonRegistration';
import { SalonMiniHomeSection } from '../../../src/components/home/SalonMiniHomeSection';
import { useAuth } from '../../../src/context/AuthContext';
import { useSalon } from '../../../src/context/SalonContext';
import { fetchSalonBySlug } from '../../../src/services/salons';
import { savePendingSalonEntry } from '../../../src/lib/pendingSalon';
import { IllustratedEmpty, PrimaryButton, Screen } from '../../../src/components/ui';
import { useI18n } from '../../../src/i18n/I18nProvider';
import type { Salon } from '../../../src/types';
import { colors, fonts, spacing } from '../../../src/theme';

export default function SalonHubScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const { activeSalon, setActiveSalon } = useSalon();
  const { t } = useI18n();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      const s = await fetchSalonBySlug(slug);
      setSalon(s);
      if (s && user) setRegistered(await isRegisteredForSalon(user.id, s.id));
    } catch { /* affiche écran "non trouvé" via salon === null */ }
  }, [slug, user]);

  const enterSalon = async () => {
    if (!salon) return;
    if (user) {
      try {
        await registerForSalon(user.id, salon.id);
        setRegistered(true);
      } catch { /* inscription optionnelle */ }
    }
    await setActiveSalon(salon);
    router.replace('/(visitor)/(tabs)' as never);
  };

  const requestSalonBadge = async () => {
    if (!salon) return;
    if (!user) {
      await savePendingSalonEntry(salon.id, true);
      router.push('/(auth)/login' as never);
      return;
    }
    setRegistering(true);
    try {
      if (!registered) {
        await registerForSalon(user.id, salon.id);
        setRegistered(true);
      }
      await setActiveSalon(salon);
      router.push('/(visitor)/(tabs)/badge' as never);
    } finally {
      setRegistering(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (!salon || !activeSalon || activeSalon.id !== salon.id) return;
    router.replace('/(visitor)/(tabs)' as never);
  }, [salon, activeSalon?.id]);

  if (!loading && !salon) {
    return (
      <Screen>
        <IllustratedEmpty icon="grid-outline" title={t('salon.notFound')} message={t('salon.notFoundHint')} />
      </Screen>
    );
  }

  if (!salon) return null;

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SalonMiniHomeSection salon={salon} />

        <View style={styles.actions}>
          {registered ? (
            <Text style={styles.registered}>{t('salon.registered')}</Text>
          ) : null}

          <PrimaryButton
            label={t('salon.enterCta')}
            variant="gold"
            onPress={enterSalon}
          />

          <PrimaryButton
            label={user ? t('salon.badgeRequest') : t('salon.badgeLogin')}
            variant="outline"
            loading={registering}
            onPress={requestSalonBadge}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  scroll: { paddingBottom: spacing.xl },
  actions: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  registered: {
    fontFamily: fonts.bodyBold,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});
