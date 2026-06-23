import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../AppIcon';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppUser } from '../../types';
import { colors, fonts, radius, shadows, spacing } from '../../theme';

type Props = {
  user: AppUser | null;
};

/** Action principale unique — modèle mental clair (Nielsen #2, #4). */
export function HomePrimaryCta({ user }: Props) {
  const { t } = useI18n();

  const config = !user
    ? {
        title: t('home.cta.guestTitle'),
        body: t('home.cta.guestBody'),
        button: t('home.registerCta'),
        icon: 'ticket-outline' as const,
        variant: 'gold' as const,
        onPress: () => router.push('/(auth)/register'),
      }
    : user.status === 'pending_payment'
      ? {
          title: t('home.cta.pendingTitle'),
          body: t('home.cta.pendingBody'),
          button: t('payment.title'),
          icon: 'card-outline' as const,
          variant: 'gold' as const,
          onPress: () => router.push('/(visitor)/(tabs)/profile'),
        }
      : {
          title: t('home.cta.badgeTitle'),
          body: t('home.cta.badgeBody'),
          button: t('home.badgeCta'),
          icon: 'qr-code-outline' as const,
          variant: 'primary' as const,
          onPress: () => router.push('/(visitor)/(tabs)/badge'),
        };

  const isGold = config.variant === 'gold';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={config.onPress}
      accessibilityRole="button"
      accessibilityLabel={config.button}
    >
      <View style={[styles.iconWrap, isGold && styles.iconWrapGold]}>
        <AppIcon name={config.icon} size={28} color={isGold ? colors.primaryDark : '#fff'} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.body}>{config.body}</Text>
        <View style={[styles.btn, isGold ? styles.btnGold : styles.btnPrimary]}>
          <Text style={[styles.btnText, isGold && styles.btnTextGold]}>{config.button}</Text>
          <AppIcon name="arrow-forward" size={16} color={isGold ? colors.primaryDark : '#fff'} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.md,
    marginBottom: spacing.lg,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapGold: { backgroundColor: colors.gold },
  content: { flex: 1 },
  title: { fontSize: 16, fontFamily: fonts.bodyBold, color: colors.text, lineHeight: 21 },
  body: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnGold: { backgroundColor: colors.gold },
  btnText: { fontSize: 12, fontFamily: fonts.bodyBold, color: '#fff', letterSpacing: 0.2 },
  btnTextGold: { color: colors.primary },
});
