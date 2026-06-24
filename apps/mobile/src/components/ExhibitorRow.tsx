import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import type { Exhibitor } from '../types';

function ExhibitorLogo({ exhibitor }: { exhibitor: Exhibitor }) {
  const [failed, setFailed] = useState(false);
  const uri = exhibitor.logoUrl?.trim();

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={styles.logo}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    );
  }

  const words = exhibitor.companyName.trim().split(/\s+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
      : (words[0]?.charAt(0) ?? '?').toUpperCase();

  return (
    <View style={[styles.logo, styles.logoPlaceholder]}>
      <Text style={styles.logoLetter}>{initials}</Text>
    </View>
  );
}

export function ExhibitorRow({
  exhibitor,
  onPress,
}: {
  exhibitor: Exhibitor;
  onPress?: () => void;
}) {
  return (
    <PressableScale style={styles.row} onPress={onPress}>
      <ExhibitorLogo exhibitor={exhibitor} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{exhibitor.companyName}</Text>
        <Text style={styles.sector} numberOfLines={1}>{exhibitor.sector}</Text>
        <View style={styles.metaRow}>
          {exhibitor.standNumber ? (
            <Text style={styles.meta}>Stand {exhibitor.standNumber}</Text>
          ) : null}
          {exhibitor.hallNumber ? (
            <Text style={styles.meta}>Hall {exhibitor.hallNumber}</Text>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.sm,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  logoPlaceholder: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontFamily: fonts.bodySemiBold, color: colors.text },
  sector: { fontSize: 13, fontFamily: fonts.body, color: colors.primaryLight, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  meta: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
});

/** Priorise les exposants avec logo pour l'affichage catalogue. */
export function sortExhibitorsForDisplay(items: Exhibitor[]): Exhibitor[] {
  return [...items].sort((a, b) => {
    const aScore = (a.featured ? 4 : 0) + (a.logoUrl ? 2 : 0);
    const bScore = (b.featured ? 4 : 0) + (b.logoUrl ? 2 : 0);
    return bScore - aScore || a.companyName.localeCompare(b.companyName, 'fr');
  });
}
