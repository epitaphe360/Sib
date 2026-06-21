import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchSalons } from '../../services/salons';
import type { Salon } from '../../types';
import { fonts, spacing } from '../../theme';
import { SalonSelectionCard } from './SalonSelectionCard';

export function SalonSelectionGrid() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [salons, setSalons] = useState<Salon[]>([]);

  useEffect(() => {
    fetchSalons().then(setSalons);
  }, []);

  const handleSalon = (salon: Salon) => {
    if (!salon.active) return;
    router.push(`/(visitor)/salon/${salon.slug ?? salon.id}` as never);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('home.urba.chooseSalon')}</Text>
      <Text style={styles.subtitle}>
        {t('home.urba.chooseSalonHint')}
      </Text>

      <View style={styles.grid}>
        {salons.map((salon) => (
          <SalonSelectionCard key={salon.id} salon={salon} onPress={() => handleSalon(salon)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: '#1B365D',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#647483',
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  grid: {
    gap: spacing.sm,
  },
});
