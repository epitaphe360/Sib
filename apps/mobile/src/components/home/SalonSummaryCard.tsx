import { Image, StyleSheet, Text, View } from 'react-native';
import { SALON_INFO } from '../../data/salons';
import { cleanSalonName, getSalonBrandLogo } from '../../lib/salonDisplay';
import { useI18n } from '../../i18n/I18nProvider';
import type { Salon } from '../../types';
import { colors, fonts, radius, shadows, spacing } from '../../theme';

type Props = {
  salon: Salon;
};

export function SalonSummaryCard({ salon }: Props) {
  const { t } = useI18n();
  const logo = getSalonBrandLogo(salon);
  const title = cleanSalonName(salon.name);
  const dates = salon.dates?.trim() || SALON_INFO.dates;
  const venue = salon.location?.trim()
    ? `${t('salon.summary.venuePrefix')} ${salon.location}`
    : `${SALON_INFO.venue} — ${SALON_INFO.city}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        {logo ? (
          <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel={title} />
        ) : (
          <View style={styles.logoFallback}>
            <Text style={styles.logoFallbackText}>{title.slice(0, 3).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.dates}>{dates}</Text>
          <Text style={styles.venue} numberOfLines={2}>
            {venue}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    zIndex: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    ...shadows.md,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
  },
  logoFallback: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.primary,
  },
  body: { flex: 1 },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.text,
    marginBottom: 2,
  },
  dates: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  venue: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
