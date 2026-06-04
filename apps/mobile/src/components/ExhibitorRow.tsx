import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import type { Exhibitor } from '../types';

export function ExhibitorRow({
  exhibitor,
  onPress,
}: {
  exhibitor: Exhibitor;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  logoPlaceholder: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  sector: { fontSize: 13, color: colors.primaryLight, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  meta: { fontSize: 12, color: colors.textMuted },
});
