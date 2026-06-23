import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NewsArticle } from '../../api/news';
import { colors, fonts, radius, shadows, spacing } from '../../theme';
import { Card } from '../ui';

type Props = {
  article: NewsArticle;
  onPress?: () => void;
  compact?: boolean;
};

export function NewsArticleCard({ article, onPress, compact }: Props) {
  const [imgError, setImgError] = useState(false);
  const imageSource =
    article.imageUrl && article.imageUrl.startsWith('http') && !imgError
      ? { uri: article.imageUrl }
      : null;

  const content = (
    <Card elevated>
      {imageSource ? (
        <Image
          source={imageSource}
          style={[styles.image, compact && styles.imageCompact]}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, compact && styles.imageCompact]}>
          <Text style={styles.placeholderLetter}>{article.title.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.body}>
        {article.category ? <Text style={styles.category}>{article.category}</Text> : null}
        <Text style={styles.title} numberOfLines={compact ? 2 : 3}>
          {article.title}
        </Text>
        <Text style={styles.excerpt} numberOfLines={compact ? 2 : 4}>
          {article.excerpt}
        </Text>
        <Text style={styles.meta}>
          {formatDate(article.publishedAt)} · {article.readTime} min
        </Text>
      </View>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.wrap}>
        {content}
      </Pressable>
    );
  }
  return <View style={styles.wrap}>{content}</View>;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  image: { width: '100%', height: 160, backgroundColor: colors.borderLight },
  imageCompact: { height: 120 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentMuted },
  placeholderLetter: { fontSize: 32, fontFamily: fonts.display, color: colors.primary },
  body: { padding: spacing.md },
  category: {
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    color: colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  title: { fontSize: 17, fontFamily: fonts.bodyBold, color: colors.text, marginBottom: 6 },
  excerpt: { fontSize: 14, fontFamily: fonts.body, color: colors.textMuted, lineHeight: 20 },
  meta: { fontSize: 12, fontFamily: fonts.body, color: colors.textLight, marginTop: spacing.sm },
});
