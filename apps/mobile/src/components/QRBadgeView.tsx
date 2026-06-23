import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useBadgeConfig } from '../hooks/useBadgeConfig';
import { useSalon } from '../context/SalonContext';
import { useSalonTheme } from '../hooks/useSalonTheme';
import { useI18n } from '../i18n/I18nProvider';
import { APP_IMAGES } from '../data/images';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import type { UserBadge } from '../types';
import { badgeLevelLabel } from '../services/badge';

export function QRBadgeView({ badge, qrValue, fullScreen }: { badge: UserBadge; qrValue: string; fullScreen?: boolean }) {
  const { activeSalon } = useSalon();
  const { config } = useBadgeConfig();
  const theme = useSalonTheme();
  const { t } = useI18n();
  const isVip =
    badge.accessLevel?.toLowerCase().includes('premium') ||
    badge.accessLevel?.toLowerCase().includes('vip');

  const eventTitle = theme?.fullName ?? activeSalon?.name ?? config.event_name;
  const eventMeta = `${activeSalon?.dates ?? config.event_dates_display} · ${theme?.location ?? config.event_location}`;

  const qrSize = fullScreen ? 200 : 190;
  const validLabel = t('badge.validUntil').replace(
    '{{date}}',
    badge.validUntil.toLocaleDateString('fr-FR')
  );

  return (
    <View style={[styles.wrap, fullScreen && styles.wrapFull]}>
      <View style={[styles.pass, shadows.lg]}>
        <ImageBackground source={APP_IMAGES.hall} style={styles.header} imageStyle={styles.headerImg}>
          <View style={styles.headerOverlay} />
          <View style={styles.goldStripeTop} />
          <View style={styles.headerContent}>
            <View style={styles.headerTextCol}>
              <Text style={styles.brand} numberOfLines={1}>
                {eventTitle.toUpperCase()}
              </Text>
              <Text style={styles.event} numberOfLines={2}>
                {eventMeta}
              </Text>
            </View>
            <View style={[styles.passTypePill, isVip && styles.passTypePillVip]}>
              <Text style={[styles.passTypeText, isVip && styles.passTypeTextVip]}>
                {badgeLevelLabel(badge.accessLevel)}
              </Text>
            </View>
          </View>
          <View style={styles.goldStripeBottom} />
        </ImageBackground>

        <View style={[styles.body, fullScreen && styles.bodyFull]}>
          <View style={[styles.qrCard, isVip && styles.qrCardVip]}>
            <QRCode
              value={qrValue}
              size={qrSize}
              backgroundColor="#fff"
              color={colors.primary}
            />
          </View>

          <Text style={styles.name} numberOfLines={2}>
            {badge.fullName}
          </Text>
          {badge.companyName ? (
            <Text style={styles.company} numberOfLines={2}>
              {badge.companyName}
            </Text>
          ) : null}

          <Text style={styles.code}>{badge.badgeCode}</Text>
          <Text style={styles.valid} numberOfLines={2}>
            {validLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.md },
  wrapFull: { paddingVertical: spacing.sm },
  pass: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.4)',
  },
  header: { height: 118, justifyContent: 'flex-end' },
  headerImg: { opacity: 0.7 },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlayHeavy },
  goldStripeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.gold,
    zIndex: 2,
  },
  goldStripeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(212,175,55,0.5)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 1,
    gap: spacing.sm,
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
  },
  brand: {
    color: colors.gold,
    fontSize: 9,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  event: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    marginTop: 3,
  },
  passTypePill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    flexShrink: 0,
    marginTop: 2,
  },
  passTypePillVip: {
    backgroundColor: 'rgba(212,175,55,0.25)',
    borderColor: colors.gold,
  },
  passTypeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.5,
  },
  passTypeTextVip: { color: colors.gold },
  body: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  bodyFull: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + spacing.sm,
  },
  qrCard: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: 0,
    ...shadows.md,
  },
  qrCardVip: { borderColor: colors.gold, borderWidth: 3 },
  name: {
    marginTop: spacing.md,
    fontSize: 21,
    fontFamily: fonts.display,
    color: colors.text,
    textAlign: 'center',
  },
  company: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  code: {
    marginTop: spacing.sm,
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.textLight,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  valid: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
});
