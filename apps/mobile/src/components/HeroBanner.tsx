import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import type { ImageKey } from '../data/images';
import { APP_IMAGES } from '../data/images';

export function HeroBanner({
  imageKey = 'hero',
  title,
  subtitle,
  compact,
}: {
  imageKey?: ImageKey;
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <ImageBackground
      source={APP_IMAGES[imageKey]}
      style={[styles.wrap, compact && styles.compact]}
      imageStyle={styles.image}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  compact: { height: 140 },
  image: { borderRadius: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 54, 93, 0.55)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
});
