import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { fetchNewsArticles, type NewsArticle } from '../../../src/api/news';
import { NewsArticleCard } from '../../../src/components/news/NewsArticleCard';
import { EmptyState, Screen, ScreenTitle } from '../../../src/components/ui';
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
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <ScreenTitle title={t('news.title')} subtitle={t('news.subtitle')} />

        {error ? <EmptyState message={error} /> : null}

        {!error && articles.length === 0 ? (
          <EmptyState message={t('news.empty')} />
        ) : null}

        {articles.map((article) => (
          <NewsArticleCard
            key={article.id}
            article={article}
            onPress={() => router.push(`/(visitor)/news/${article.id}` as never)}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
