import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export type AppIconName = keyof typeof Ionicons.glyphMap;

/** Symbole visible si la police Ionicons n’est pas chargée (release APK) */
const FALLBACK: Partial<Record<AppIconName, string>> = {
  'home-outline': '⌂',
  'grid-outline': '▦',
  'calendar-outline': '📅',
  'business-outline': '🏢',
  'qr-code-outline': '▣',
  'person-outline': '👤',
  'star-outline': '★',
  'people-outline': '👥',
  'chatbubbles-outline': '💬',
  'scan-outline': '◎',
  'card-outline': '💳',
  'pulse-outline': '●',
  'storefront-outline': '🏪',
  'images-outline': '🖼',
  'log-in-outline': '↪',
};

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
};

export function AppIcon({ name, size = 24, color = '#1B365D' }: Props) {
  const glyph = FALLBACK[name] ?? '•';
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Text style={[styles.fallback, { fontSize: size * 0.82, color }]}>{glyph}</Text>
      <View style={styles.iconLayer} pointerEvents="none">
        <Ionicons name={name} size={size} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  fallback: { textAlign: 'center', includeFontPadding: false },
  iconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
