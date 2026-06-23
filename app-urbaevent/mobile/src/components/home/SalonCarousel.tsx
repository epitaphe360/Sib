import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { fetchSalons } from '../../services/salons';
import { useI18n } from '../../i18n/I18nProvider';
import type { Salon } from '../../types';
import { colors, fonts, radius, shadows, spacing } from '../../theme';
import { AppIcon } from '../AppIcon';

type Props = {
  onViewAll?: () => void;
};

export function SalonCarousel({ onViewAll }: Props) {
  const { t } = useI18n();
  const [salons, setSalons] = useState<Salon[]>([]);

  useEffect(() => {
    fetchSalons().then(setSalons);
  }, []);

  const handleSalon = (salon: Salon) => {
    router.push(`/(visitor)/salon/${salon.slug ?? salon.id}` as never);
  };

  return (
    <FlatList
      horizontal
      data={salons}
      keyExtractor={(s) => s.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.pressed, item.active && styles.cardActive]}
          onPress={() => handleSalon(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.name} — ${item.dates}`}
        >
          <View style={[styles.code, item.active && styles.codeActive]}>
            <Text style={styles.codeText}>{item.code}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.dates}>{item.dates}</Text>
          {item.active ? (
            <View style={styles.live}>
              <AppIcon name="pulse-outline" size={10} color={colors.gold} />
              <Text style={styles.liveText}>{t('home.salonActive')}</Text>
            </View>
          ) : (
            <Text style={styles.soon}>{t('home.salonSoon')}</Text>
          )}
        </Pressable>
      )}
      ListFooterComponent={
        onViewAll ? (
          <Pressable style={styles.viewAll} onPress={onViewAll} accessibilityRole="button">
            <AppIcon name="grid-outline" size={22} color={colors.primary} />
            <Text style={styles.viewAllText}>{t('home.salonsViewAll')}</Text>
          </Pressable>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm, paddingRight: spacing.md },
  card: {
    width: 148,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  cardActive: { borderColor: colors.goldMuted, borderWidth: 2 },
  pressed: { opacity: 0.9 },
  code: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  codeActive: { backgroundColor: colors.gold },
  codeText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primaryDark },
  name: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  dates: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 4 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  liveText: { fontSize: 10, fontFamily: fonts.bodyBold, color: colors.gold },
  soon: { fontSize: 10, fontFamily: fonts.body, color: colors.textMuted, marginTop: 8, fontStyle: 'italic' },
  viewAll: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.sm,
  },
  viewAllText: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.primary, marginTop: 6, textAlign: 'center' },
});
