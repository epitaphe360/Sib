import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchSalons } from '../../services/salons';
import type { Salon } from '../../types';
import { fonts, spacing } from '../../theme';
import { SalonSelectionCard } from './SalonSelectionCard';

const COMPACT_CARD_WIDTH = 268;

export function SalonSelectionGrid({ compact = false, refreshToken = 0 }: { compact?: boolean; refreshToken?: number }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [salons, setSalons] = useState<Salon[]>([]);

  const reloadSalons = useCallback(() => {
    fetchSalons().then(setSalons).catch(() => setSalons([]));
  }, []);

  useEffect(() => {
    reloadSalons();
  }, [reloadSalons, refreshToken]);

  const handleSalon = (salon: Salon) => {
    if (!salon.active) return;
    router.push(`/(visitor)/salon/${salon.slug ?? salon.id}` as never);
  };

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={[styles.title, compact && styles.titleCompact]}>{t('home.urba.chooseSalon')}</Text>
      {!compact ? (
        <Text style={styles.subtitle}>
          {user ? t('home.urba.chooseSalonConnected') : t('home.urba.chooseSalonHint')}
        </Text>
      ) : null}

      {compact ? (
        <FlatList
          horizontal
          data={salons}
          keyExtractor={(s) => s.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <View style={styles.compactCardWrap}>
              <SalonSelectionCard salon={item} compact onPress={() => handleSalon(item)} />
            </View>
          )}
        />
      ) : (
        <View style={styles.grid}>
          {salons.map((salon) => (
            <SalonSelectionCard key={salon.id} salon={salon} onPress={() => handleSalon(salon)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  wrapCompact: {
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: '#1B365D',
    marginBottom: 4,
  },
  titleCompact: {
    fontSize: 17,
    marginBottom: spacing.sm,
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
  horizontalList: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  compactCardWrap: {
    width: COMPACT_CARD_WIDTH,
  },
});
