import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { BootScreen } from '../../../src/components/BootScreen';
import { IllustratedEmpty, Screen } from '../../../src/components/ui';
import { useSalon } from '../../../src/context/SalonContext';
import { fetchSalonBySlug } from '../../../src/services/salons';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors } from '../../../src/theme';

/** Deep link salon → entre directement dans l'espace salon (pas de fiche intermédiaire). */
export default function SalonDeepLinkScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { setActiveSalon } = useSalon();
  const { t } = useI18n();
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!slug) {
        setError(true);
        return;
      }
      try {
        const salon = await fetchSalonBySlug(slug);
        if (cancelled) return;
        if (!salon) {
          setError(true);
          return;
        }
        if (!salon.active) {
          router.replace('/(visitor)/(tabs)' as never);
          return;
        }
        await setActiveSalon(salon);
        router.replace('/(visitor)/(tabs)/explore' as never);
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, setActiveSalon]);

  if (error) {
    return (
      <Screen>
        <IllustratedEmpty icon="grid-outline" title={t('salon.notFound')} message={t('salon.notFoundHint')} />
      </Screen>
    );
  }

  return (
    <View style={styles.center}>
      <BootScreen label={t('common.loading')} />
      <ActivityIndicator style={styles.hidden} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  hidden: { display: 'none' },
});
