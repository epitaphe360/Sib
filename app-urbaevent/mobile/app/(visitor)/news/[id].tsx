import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchNewsArticleById, stripHtml, type NewsArticle } from '../../../src/api/news';
import { EmptyState, Screen } from '../../../src/components/ui';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function NewsArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError(t('news.notFound'));
      setLoading(false);
      return;
    }
    try {
      const item = await fetchNewsArticleById(id);
      if (!item) {
        setError(t('news.notFound'));
        setArticle(null);
      } else {
        setArticle(item);
        setError(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

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

  if (error || !article) {
    return (
      <Screen style={styles.center}>
        <EmptyState message={error ?? t('news.notFound')} />
      </Screen>
    );
  }

  const body = stripHtml(article.content);
  const paragraphs = body.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {article.imageUrl ? (
          <Image source={{ uri: article.imageUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <Text style={styles.heroLetter}>{article.title.charAt(0)}</Text>
          </View>
        )}

        <View style={styles.content}>
          {article.category ? <Text style={styles.category}>{article.category}</Text> : null}
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.meta}>
            {formatDate(article.publishedAt)} · {article.author} · {article.readTime} min
          </Text>

          {article.excerpt ? <Text style={styles.excerpt}>{article.excerpt}</Text> : null}

          {paragraphs.map((p) => (
            <Text key={p.slice(0, 40)} style={styles.paragraph}>
              {p}
            </Text>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 0 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  scroll: { paddingBottom: spacing.xl },
  heroImage: { width: '100%', height: 220, backgroundColor: colors.borderLight },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentMuted },
  heroLetter: { fontSize: 48, fontFamily: fonts.display, color: colors.primary },
  content: { padding: spacing.lg },
  category: {
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    color: colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: { fontSize: 24, fontFamily: fonts.display, color: colors.text, lineHeight: 32, marginBottom: 8 },
  meta: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginBottom: spacing.md },
  excerpt: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paragraph: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
});
