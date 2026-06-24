import { ScrollView, StyleSheet } from 'react-native';
import { NetworkBanner } from '../NetworkBanner';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useI18n } from '../../i18n/I18nProvider';
import { spacing, colors } from '../../theme';
import { SalonSelectionGrid } from './SalonSelectionGrid';
import { UrbacomSocialSection } from './UrbacomSocialSection';
import { UrbaEventHomeHero } from './UrbaEventHomeHero';

export function UrbaEventHomeContent() {
  const online = useOnlineStatus();
  const { t } = useI18n();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {!online ? <NetworkBanner message={t('common.offline')} /> : null}

      <UrbaEventHomeHero />

      <SalonSelectionGrid />

      <UrbacomSocialSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl,
    backgroundColor: colors.platform.bg,
  },
});
