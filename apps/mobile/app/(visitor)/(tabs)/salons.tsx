import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SalonSelectionGrid } from '../../../src/components/home/SalonSelectionGrid';
import { Screen, ScreenTitle } from '../../../src/components/ui';
import { usePullToRefreshCms } from '../../../src/hooks/useAppContent';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors } from '../../../src/theme';

/** Liste complète des salons — onglet dédié pour visiteurs connectés. */
export default function SalonsTabScreen() {
  const { t } = useI18n();
  const { refreshing, onRefresh: refreshCms } = usePullToRefreshCms();
  const [salonRefresh, setSalonRefresh] = useState(0);

  const onRefresh = async () => {
    await refreshCms();
    setSalonRefresh((k) => k + 1);
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.platform.accentBlue}
            colors={[colors.platform.accentBlue]}
          />
        }
      >
        <ScreenTitle title={t('tabs.salons')} subtitle={t('home.urba.chooseSalonHint')} />
        <SalonSelectionGrid refreshToken={salonRefresh} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 0 },
});
