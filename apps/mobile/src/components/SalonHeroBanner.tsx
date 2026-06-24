import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useSalon } from '../context/SalonContext';
import { useSalonTheme } from '../hooks/useSalonTheme';
import { useI18n } from '../i18n/I18nProvider';
import type { ImageKey } from '../data/images';
import { APP_IMAGES } from '../data/images';
import { cleanSalonName, getSalonBrandLogo, getSalonEditionLabel } from '../lib/salonDisplay';
import type { Salon } from '../types';
import { colors, fonts, radius, spacing } from '../theme';

export function SalonHeroBanner({
  imageKey = 'hero',
  title,
  subtitle,
  compact,
  label,
  salon,
  showBrandLogo,
}: {
  imageKey?: ImageKey;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  label?: string;
  salon?: Salon | null;
  showBrandLogo?: boolean;
}) {
  const { activeSalon } = useSalon();
  const theme = useSalonTheme();
  const { t } = useI18n();
  const accentColor = theme?.color ?? colors.accent;
  const resolvedSalon = salon ?? activeSalon;
  const brandLogo = showBrandLogo && resolvedSalon ? getSalonBrandLogo(resolvedSalon) : null;
  const editionLabel = resolvedSalon ? getSalonEditionLabel(resolvedSalon) : undefined;
  const pillLabel = label ?? editionLabel ?? (resolvedSalon ? cleanSalonName(resolvedSalon.name) : t('app.name'));

  return (
    <ImageBackground
      source={APP_IMAGES[imageKey]}
      style={[styles.wrap, compact && styles.compact, showBrandLogo && styles.wrapBrand]}
      imageStyle={styles.image}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      {editionLabel || label ? (
        <View style={styles.labelPill}>
          <Text style={styles.labelText}>{pillLabel}</Text>
        </View>
      ) : null}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={[styles.content, showBrandLogo && styles.contentBrand]}>
        {brandLogo ? (
          <Image
            source={brandLogo}
            style={styles.brandLogo}
            resizeMode="contain"
            accessibilityLabel={cleanSalonName(resolvedSalon?.name ?? 'SIB')}
          />
        ) : title ? (
          <Text style={styles.title}>{title}</Text>
        ) : null}
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
  wrapBrand: {
    height: 168,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  compact: { height: 148 },
  image: { borderRadius: radius.xl },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 35, 65, 0.72)',
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
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  labelText: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  contentBrand: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  brandLogo: {
    width: '88%',
    maxWidth: 300,
    height: 110,
    marginBottom: spacing.xs,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: fonts.display,
    letterSpacing: 0.2,
    lineHeight: 28,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    marginTop: 6,
    lineHeight: 19,
    textAlign: 'center',
    alignSelf: 'center',
  },
});
