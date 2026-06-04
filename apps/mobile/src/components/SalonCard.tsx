import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SALON_IMAGES } from '../data/images';
import type { Salon } from '../types';
import { colors, spacing } from '../theme';

export function SalonCard({ salon, onPress }: { salon: Salon; onPress?: () => void }) {
  const image = SALON_IMAGES[salon.id] ?? SALON_IMAGES.sib;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <ImageBackground source={image} style={styles.image} imageStyle={styles.imageRadius}>
        <View style={styles.overlay} />
        <View style={styles.row}>
          <View style={[styles.codeBadge, salon.active && styles.codeActive]}>
            <Text style={[styles.code, salon.active && styles.codeTextActive]}>{salon.code}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{salon.name}</Text>
            <Text style={styles.desc}>{salon.description}</Text>
            <Text style={styles.dates}>{salon.dates}</Text>
            {salon.active ? (
              <View style={styles.livePill}>
                <Text style={styles.liveText}>Salon actif · SIB 2026</Text>
              </View>
            ) : (
              <Text style={styles.soon}>Bientôt sur UrbaEvent</Text>
            )}
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm, borderRadius: 16, overflow: 'hidden' },
  pressed: { opacity: 0.92 },
  image: { minHeight: 130, justifyContent: 'flex-end' },
  imageRadius: { borderRadius: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 54, 93, 0.72)',
    borderRadius: 16,
  },
  row: { flexDirection: 'row', padding: spacing.md, gap: spacing.md, zIndex: 1 },
  codeBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeActive: { backgroundColor: colors.primaryLight },
  code: { fontWeight: '800', fontSize: 14, color: '#fff' },
  codeTextActive: { color: '#fff' },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: '#fff' },
  desc: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 18 },
  dates: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6, fontWeight: '600' },
  livePill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  soon: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 8, fontStyle: 'italic' },
});
