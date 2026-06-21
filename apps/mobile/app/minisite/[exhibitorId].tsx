import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { fetchMiniSitePublic, incrementMiniSiteViews } from '../../src/api/minisitePublic';
import { MiniSiteViewer } from '../../src/components/minisite/MiniSiteViewer';
import { EmptyState, PrimaryButton, Screen } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import type { MiniSitePublicData } from '../../src/types/minisite';
import { colors, spacing } from '../../src/theme';

export default function MiniSiteScreen() {
  const { exhibitorId, preview } = useLocalSearchParams<{ exhibitorId: string; preview?: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState<MiniSitePublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!exhibitorId) {
      setError(t('minisite.missingId'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const isPreview = preview === '1' || preview === 'true';
      const isOwner = user?.type === 'exhibitor' && isPreview;
      const result = await fetchMiniSitePublic(exhibitorId, { includeUnpublished: isOwner });
      if (!result) {
        setError(t('minisite.notAvailable'));
        setData(null);
        return;
      }
      setData(result);
      incrementMiniSiteViews(exhibitorId).catch(() => undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [exhibitorId, preview, user?.type, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen style={styles.center}>
        <EmptyState message={error ?? t('minisite.notAvailable')} />
        <View style={styles.actions}>
          <PrimaryButton label={t('minisite.backExhibitors')} variant="outline" onPress={() => router.push('/(visitor)/(tabs)/explore' as never)} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.flex}>
      <MiniSiteViewer data={data} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  actions: { marginTop: spacing.lg, width: '100%' },
});
