import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NetworkBanner } from '../NetworkBanner';
import { PrimaryButton } from '../ui';
import { SalonPromoHeader } from './SalonPromoHeader';
import { SalonSummaryCard } from './SalonSummaryCard';
import { SalonVisitorMenuGrid } from './SalonVisitorMenuGrid';
import { useAuth } from '../../context/AuthContext';
import { useSalon } from '../../context/SalonContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useI18n } from '../../i18n/I18nProvider';
import { colors, fonts, spacing } from '../../theme';

/** Espace salon visiteur — menu type ancienne APK SIB (Présentation, Programme, Agenda…). */
export function SalonInteriorContent() {
  const { user } = useAuth();
  const { activeSalon, clearActiveSalon } = useSalon();
  const online = useOnlineStatus();
  const { t } = useI18n();

  if (!activeSalon) return null;

  const openBadge = () => {
    if (!user) {
      router.push('/(auth)/register' as never);
      return;
    }
    router.push('/(visitor)/(tabs)/badge' as never);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {!online ? <NetworkBanner message={t('common.offline')} /> : null}

      <SalonPromoHeader salon={activeSalon} />
      <SalonSummaryCard salon={activeSalon} />

      <SalonVisitorMenuGrid />

      <View style={styles.ctaWrap}>
        <PrimaryButton
          label={user ? t('salon.downloadBadge') : t('salon.downloadBadgeGuest')}
          variant="primary"
          onPress={openBadge}
        />
      </View>

      <Pressable
        onPress={async () => {
          await clearActiveSalon();
          router.replace('/(visitor)/(tabs)' as never);
        }}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('salon.changeSalon')}
        style={styles.changeWrap}
      >
        <Text style={styles.change}>{t('salon.changeSalon')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl,
    backgroundColor: colors.platform.bg,
  },
  ctaWrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  changeWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  change: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
