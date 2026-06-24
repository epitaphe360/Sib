import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NetworkBanner } from '../NetworkBanner';
import { QuickActionGrid } from '../QuickActionGrid';
import { SalonHeroBanner } from '../SalonHeroBanner';
import { useAuth } from '../../context/AuthContext';
import { useSalon } from '../../context/SalonContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useI18n } from '../../i18n/I18nProvider';
import { colors, fonts, spacing } from '../../theme';
import { HubBadgeSection } from './HubBadgeSection';
import { HomeSection } from './HomeSection';
import { SalonMiniHomeSection } from './SalonMiniHomeSection';

/** Espace salon actif : badge, accès rapide et raccourcis (hors hub UrbaEvent). */
export function SalonInteriorContent() {
  const { user } = useAuth();
  const { activeSalon, clearActiveSalon } = useSalon();
  const online = useOnlineStatus();
  const { t } = useI18n();

  if (!activeSalon) return null;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {!online ? <NetworkBanner message={t('common.offline')} /> : null}

      <SalonHeroBanner
        title={activeSalon.name}
        subtitle={activeSalon.dates ?? activeSalon.location ?? undefined}
        compact
      />

      <SalonMiniHomeSection salon={activeSalon} />

      <HubBadgeSection />

      {user ? (
        <View style={styles.quickSection}>
          <HomeSection title={t('home.quickAccess')} subtitle={t('salon.interior.quickAccessHint')}>
            <QuickActionGrid hideLogin={Boolean(user)} mode="full" />
          </HomeSection>
        </View>
      ) : null}

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
  quickSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
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
