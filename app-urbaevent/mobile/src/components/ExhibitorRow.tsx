import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import type { Exhibitor } from '../types';

export function ExhibitorRow({
  exhibitor,
  onPress,
}: {
  exhibitor: Exhibitor;
  onPress?: () => void;
}) {
  return (
    <PressableScale style={styles.row} onPress={onPress}>
      {exhibitor.logoUrl ? (
        <Image source={{ uri: exhibitor.logoUrl }} style={styles.logo} resizeMode="contain" />
      ) : (
        <View style={[styles.logo, styles.logoPlaceholder]}>
          <Text style={styles.logoLetter}>{exhibitor.companyName.charAt(0)}</Text>
        </View>
      )}
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
  },
  logoPlaceholder: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 20,
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontFamily: fonts.bodySemiBold, color: colors.text },
  sector: { fontSize: 13, fontFamily: fonts.body, color: colors.primaryLight, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  meta: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
});
