import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useSalon } from '../context/SalonContext';
import { useSalonTheme } from '../hooks/useSalonTheme';
import { useI18n } from '../i18n/I18nProvider';
import type { ImageKey } from '../data/images';
import { APP_IMAGES } from '../data/images';
import { colors, fonts, radius, spacing } from '../theme';

export function SalonHeroBanner({
  imageKey = 'hero',
  title,
  subtitle,
  compact,
  label,
}: {
  imageKey?: ImageKey;
  title: string;
  subtitle?: string;
  compact?: boolean;
  label?: string;
}) {
  const { activeSalon } = useSalon();
  const theme = useSalonTheme();
  const { t } = useI18n();
  const accentColor = theme?.color ?? colors.accent;
  const salonLabel = label ?? (activeSalon ? activeSalon.name : t('app.name'));

  return (
    <ImageBackground
      source={APP_IMAGES[imageKey]}
      style={[styles.wrap, compact && styles.compact]}
      imageStyle={styles.image}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.labelPill}>
        <Text style={styles.labelText}>{salonLabel}</Text>
      </View>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
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
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  compact: { height: 148 },
  image: { borderRadius: radius.xl },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayHeavy,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  labelPill: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  labelText: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: fonts.display,
    letterSpacing: 0.2,
    lineHeight: 28,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontFamily: fonts.body,
    marginTop: 6,
    lineHeight: 19,
  },
});
