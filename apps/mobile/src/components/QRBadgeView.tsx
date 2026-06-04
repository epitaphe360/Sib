import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { APP_IMAGES } from '../data/images';
import { colors, spacing } from '../theme';
import type { UserBadge } from '../types';
import { badgeLevelLabel } from '../services/badge';

export function QRBadgeView({ badge, qrValue }: { badge: UserBadge; qrValue: string }) {
  const isVip = badge.accessLevel?.toLowerCase().includes('premium') || badge.accessLevel?.toLowerCase().includes('vip');

  return (
    <View style={styles.wrap}>
      <View style={styles.pass}>
        <ImageBackground source={APP_IMAGES.morocco} style={styles.header} imageStyle={styles.headerImg}>
          <View style={styles.headerOverlay} />
          <Text style={styles.brand}>SIB 2026 · UrbaEvent</Text>
          <Text style={styles.passType}>{badgeLevelLabel(badge.accessLevel)}</Text>
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.qrBox}>
            <QRCode value={qrValue} size={200} backgroundColor="#fff" color={colors.primary} />
          </View>
          <Text style={styles.name}>{badge.fullName}</Text>
          {badge.companyName ? <Text style={styles.company}>{badge.companyName}</Text> : null}
          <View style={[styles.levelPill, isVip && styles.levelVip]}>
            <Text style={[styles.levelText, isVip && styles.levelTextVip]}>
              {badgeLevelLabel(badge.accessLevel)}
            </Text>
          </View>
          <Text style={styles.code}>{badge.badgeCode}</Text>
          <Text style={styles.valid}>
            Valide jusqu'au {badge.validUntil.toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.md },
  pass: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  header: { height: 90, justifyContent: 'flex-end', padding: spacing.md },
  headerImg: {},
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(27,54,93,0.75)' },
  brand: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600', zIndex: 1 },
  passType: { color: '#fff', fontSize: 18, fontWeight: '800', zIndex: 1, marginTop: 4 },
  body: { alignItems: 'center', padding: spacing.md, paddingBottom: spacing.lg },
  qrBox: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: -36,
  },
  name: { marginTop: spacing.md, fontSize: 20, fontWeight: '800', color: colors.text },
  company: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  levelPill: {
    marginTop: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  levelVip: { backgroundColor: colors.primary },
  levelText: { fontSize: 12, fontWeight: '700', color: colors.primaryLight, textTransform: 'uppercase' },
  levelTextVip: { color: '#fff' },
  code: { marginTop: spacing.sm, fontSize: 12, color: colors.textMuted, letterSpacing: 1 },
  valid: { marginTop: spacing.xs, fontSize: 12, color: colors.textMuted },
});
