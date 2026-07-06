import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { NetworkBanner } from '../NetworkBanner';
import { useAuth } from '../../context/AuthContext';
import { useAppContent, usePullToRefreshCms } from '../../hooks/useAppContent';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useI18n } from '../../i18n/I18nProvider';
import { spacing, colors } from '../../theme';
import { SalonSelectionGrid } from './SalonSelectionGrid';
import { UrbacomSocialSection } from './UrbacomSocialSection';
import { UrbaEventHomeHero } from './UrbaEventHomeHero';
import { VisitorHubAccess } from './VisitorHubAccess';

export function UrbaEventHomeContent() {
  const online = useOnlineStatus();
  const { user } = useAuth();
  const { t } = useI18n();
  const connected = Boolean(user);
  const { refreshing, onRefresh } = usePullToRefreshCms();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={colors.platform.accentBlue}
          colors={[colors.platform.accentBlue]}
        />
      }
    >
      {!online ? <NetworkBanner message={t('common.offline')} /> : null}

      <UrbaEventHomeHero compact={connected} />

      <SalonSelectionGrid compact={connected} />

      {!connected ? <UrbacomSocialSection /> : null}

      <VisitorHubAccess compact={connected} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl,
    backgroundColor: colors.platform.bg,
  },
});
