import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import { AppIcon } from './AppIcon';
import { PrimaryButton } from './ui';

type Props = {
  compact?: boolean;
};

export function BadgeGuestCard({ compact }: Props) {
  const { t } = useI18n();

  return (
    <View style={[styles.card, compact && styles.cardCompact, shadows.md]}>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <AppIcon name="qr-code-outline" size={32} color={colors.primary} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.title}>{t('badge.guest.title')}</Text>
          <Text style={styles.subtitle}>{t('badge.guest.subtitle')}</Text>
        </View>
      </View>

      <View style={styles.perks}>
        {(['free', 'qr', 'salon'] as const).map((key) => (
          <View key={key} style={styles.perkRow}>
            <AppIcon name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.perkText}>{t(`badge.guest.perk.${key}`)}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton
        label={t('badge.guest.registerCta')}
        variant="gold"
        onPress={() => router.push('/(auth)/register' as never)}
      />
      <PrimaryButton
        label={t('badge.guest.loginCta')}
        variant="outline"
        onPress={() => router.push('/(auth)/login' as never)}
      />

      <Pressable
        onPress={() => router.push('/(auth)/register-vip' as never)}
        style={styles.vipLink}
        accessibilityRole="link"
      >
        <AppIcon name="star-outline" size={14} color={colors.gold} />
        <Text style={styles.vipText}>{t('badge.guest.vipLink')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#D6E8F8',
    padding: spacing.md,
    gap: spacing.sm,
    marginHorizontal: spacing.md,
  },
  cardCompact: { marginHorizontal: 14 },
  hero: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1 },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  perks: { gap: 6, marginVertical: spacing.xs },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  perkText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  vipLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  vipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.gold,
  },
});
