import { router } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSalon } from '../../context/SalonContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/I18nProvider';
import type { Salon } from '../../types';
import { spacing } from '../../theme';
import { FadeSlideIn } from '../FadeSlideIn';
import { IllustratedEmpty } from '../ui';
import { HomeSection } from './HomeSection';
import { SalonHubCard } from './SalonHubCard';

export function SalonSelectionGrid() {
  const { t } = useI18n();
  const { salons, loading, setActiveSalon } = useSalon();
  const { colors } = useAppTheme();

  const enterSalon = useCallback(
    async (salon: Salon) => {
      if (!salon.active) return;
      await setActiveSalon(salon);
      router.push('/(visitor)/(tabs)/explore' as never);
    },
    [setActiveSalon],
  );

  if (loading && salons.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!loading && salons.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <IllustratedEmpty
          icon="calendar-outline"
          title={t('home.salonsTitle')}
          message={t('home.salonsEmpty')}
        />
      </View>
    );
  }

  return (
    <FadeSlideIn delay={80} style={styles.wrap}>
      <HomeSection title={t('home.salonsTitle')} subtitle={t('home.urba.hubSalonsSubtitle')}>
        <View style={styles.list}>
          {salons.map((salon, index) => (
            <FadeSlideIn key={salon.id} delay={60 + index * 35} fromY={10}>
              <SalonHubCard
                salon={salon}
                onEnter={salon.active ? () => enterSalon(salon) : undefined}
              />
            </FadeSlideIn>
          ))}
        </View>
      </HomeSection>
    </FadeSlideIn>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
});
