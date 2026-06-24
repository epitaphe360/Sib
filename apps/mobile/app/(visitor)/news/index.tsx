import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { fetchNewsArticles, type NewsArticle } from '../../../src/api/news';
import { NewsArticleCard } from '../../../src/components/news/NewsArticleCard';
import { IllustratedEmpty, Screen } from '../../../src/components/ui';
import { SkeletonList } from '../../../src/components/Skeleton';
import { WorkspaceHeader } from '../../../src/components/workspace/WorkspaceUI';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, spacing } from '../../../src/theme';

export default function NewsScreen() {
  const { t } = useI18n();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const items = await fetchNewsArticles(30);
      setArticles(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
      setArticles([]);
    }
  }, [t]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Screen>
        <WorkspaceHeader eyebrow={t('news.title')} title={t('news.title')} tone="salon" icon="newspaper-outline" />
        <View style={styles.body}><SkeletonList rows={4} /></View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <WorkspaceHeader eyebrow={t('news.title')} title={t('news.title')} subtitle={t('news.subtitle')} tone="salon" icon="newspaper-outline" />

        <View style={styles.body}>
          {error ? (
            <IllustratedEmpty icon="alert-circle-outline" title={t('common.error')} message={error} />
          ) : null}

          {!error && articles.length === 0 ? (
            <IllustratedEmpty icon="newspaper-outline" title={t('news.title')} message={t('news.empty')} />
          ) : null}

          {articles.map((article) => (
            <NewsArticleCard
              key={article.id}
              article={article}
              onPress={() => router.push(`/(visitor)/news/${article.id}` as never)}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  body: { paddingHorizontal: spacing.md, marginTop: -spacing.sm, gap: spacing.sm },
});
