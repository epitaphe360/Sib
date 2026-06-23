import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NetworkBanner } from '../NetworkBanner';
import { PrimaryButton } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useSalon } from '../../context/SalonContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useI18n } from '../../i18n/I18nProvider';
import { fonts, radius, spacing, colors } from '../../theme';
import { QuickActionGrid } from '../QuickActionGrid';
import { ActiveSalonBanner } from './ActiveSalonBanner';
import { HomeSection } from './HomeSection';
import { SalonSelectionGrid } from './SalonSelectionGrid';
import { UrbacomSocialSection } from './UrbacomSocialSection';
import { HubBadgeSection } from './HubBadgeSection';
import { UrbaEventHomeHero } from './UrbaEventHomeHero';

export function UrbaEventHomeContent() {
  const { user } = useAuth();
  const { activeSalon } = useSalon();
  const online = useOnlineStatus();
  const { t } = useI18n();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {!online ? <NetworkBanner message={t('common.offline')} /> : null}

      <UrbaEventHomeHero />

      <HubBadgeSection />

      <ActiveSalonBanner />

      <SalonSelectionGrid />

      <View style={styles.quickSection}>
        <HomeSection title={t('home.quickAccess')} subtitle={t('home.hubQuickHint')}>
          <QuickActionGrid hideLogin={Boolean(user)} mode={activeSalon ? 'full' : 'hub'} />
        </HomeSection>
      </View>

      <UrbacomSocialSection />

      {!user ? (
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>{t('home.urba.authTitle')}</Text>
          <Text style={styles.authBody}>{t('home.urba.authBody')}</Text>
          <View style={styles.authActions}>
            <PrimaryButton
              label={t('home.quick.login')}
              variant="outline"
              onPress={() => router.push('/(auth)/login' as never)}
            />
            <PrimaryButton
              label={t('home.registerCta')}
              variant="gold"
              onPress={() => router.push('/(auth)/register' as never)}
            />
          </View>
        </View>
      ) : null}
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
  authCard: {
    marginHorizontal: spacing.md,
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#D6E8F8',
    padding: spacing.md,
    gap: spacing.sm,
  },
  authTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: '#1B365D',
  },
  authBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#647483',
    lineHeight: 19,
  },
  authActions: { gap: spacing.sm, marginTop: spacing.xs },
});
