import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type Action = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  accent?: string;
};

const ACTIONS: Action[] = [
  { id: 'badge', label: 'Mon badge', icon: 'qr-code-outline', route: '/(visitor)/(tabs)/badge' },
  { id: 'vip', label: 'Pass VIP', icon: 'star-outline', route: '/(auth)/register-vip', accent: colors.vip },
  { id: 'program', label: 'Programme', icon: 'calendar-outline', route: '/(visitor)/(tabs)/program' },
  { id: 'exhibitors', label: 'Exposants', icon: 'business-outline', route: '/(visitor)/(tabs)/exhibitors' },
  { id: 'salons', label: 'Salons', icon: 'grid-outline', route: '/(visitor)/(tabs)/salons' },
  { id: 'login', label: 'Connexion', icon: 'person-outline', route: '/(auth)/login' },
];

export function QuickActionGrid({ hideLogin }: { hideLogin?: boolean }) {
  const items = hideLogin ? ACTIONS.filter((a) => a.id !== 'login') : ACTIONS;

  return (
    <View style={styles.grid}>
      {items.map((action) => (
        <Pressable
          key={action.id}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          onPress={() => router.push(action.route as never)}
        >
          <View style={[styles.iconWrap, action.accent ? { backgroundColor: action.accent } : null]}>
            <Ionicons name={action.icon} size={24} color={action.accent ? '#fff' : colors.primary} />
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tile: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 96,
  },
  pressed: { opacity: 0.85 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
