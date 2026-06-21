import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { fetchNewsArticles, type NewsArticle } from '../../api/news';
import { useI18n } from '../../i18n/I18nProvider';
import { colors, fonts, spacing } from '../../theme';
import { NewsArticleCard } from './NewsArticleCard';

export function NewsHomePreview() {
  const { t } = useI18n();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsArticles(3)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (articles.length === 0) {
    return <Text style={styles.empty}>{t('news.empty')}</Text>;
  }

  return (
    <View>
      {articles.slice(0, 2).map((article) => (
        <NewsArticleCard
          key={article.id}
          article={article}
          compact
          onPress={() => router.push(`/(visitor)/news/${article.id}` as never)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { paddingVertical: spacing.lg, alignItems: 'center' },
  empty: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, fontStyle: 'italic' },
});
