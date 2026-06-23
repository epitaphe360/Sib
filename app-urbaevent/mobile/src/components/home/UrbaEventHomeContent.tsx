import { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { NetworkBanner } from '../NetworkBanner';
import { useSalon } from '../../context/SalonContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useI18n } from '../../i18n/I18nProvider';
import { spacing } from '../../theme';
import { HubBadgeSection } from './HubBadgeSection';
import { HubNewsSection } from './HubNewsSection';
import { SalonSelectionGrid } from './SalonSelectionGrid';
import { UrbacomSocialSection } from './UrbacomSocialSection';
import { UrbaEventHomeHero } from './UrbaEventHomeHero';

/**
 * Hub UrbaEvent — descriptions & dates de tous les salons + actualités plateforme.
 * Aucun exposant / programme ici : réservé à l'espace salon (onglet Explorer).
 */
export function UrbaEventHomeContent() {
  const online = useOnlineStatus();
  const { t } = useI18n();
  const { colors } = useAppTheme();
  const { refreshSalons, loading } = useSalon();
  const scrollRef = useRef<ScrollView>(null);
  const [salonsY, setSalonsY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const scrollToSalons = useCallback(() => {
    scrollRef.current?.scrollTo({ y: Math.max(0, salonsY - spacing.sm), animated: true });
  }, [salonsY]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshSalons();
    } finally {
      setRefreshing(false);
    }
  }, [refreshSalons]);

  return (
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scroll, { backgroundColor: colors.platform.bg }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || loading}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {!online ? <NetworkBanner message={t('common.offline')} /> : null}

      <UrbaEventHomeHero onScrollToSalons={scrollToSalons} />

      <HubBadgeSection />

      <View onLayout={(e) => setSalonsY(e.nativeEvent.layout.y)}>
        <SalonSelectionGrid />
      </View>

      <HubNewsSection />

      <UrbacomSocialSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
  },
});
