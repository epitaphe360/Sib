import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { StyleSheet, Text } from 'react-native';

export type AppIconName = keyof typeof Ionicons.glyphMap;

/** Symboles de secours si la police Ionicons n'est pas encore chargee (APK release). */
const FALLBACK: Partial<Record<AppIconName, string>> = {
  'home-outline': '⌂',
  'compass-outline': '◎',
  'grid-outline': '▦',
  'calendar-outline': '📅',
  'business-outline': '🏢',
  'qr-code-outline': '▣',
  'person-outline': '👤',
  'star-outline': '★',
  'people-outline': '👥',
  'chatbubbles-outline': '💬',
  'scan-outline': '⎋',
  'card-outline': '💳',
  'pulse-outline': '●',
  'storefront-outline': '🏪',
  'images-outline': '🖼',
  'log-in-outline': '↪',
  'log-out-outline': '↩',
  'shield-outline': '🛡',
  'chevron-forward': '›',
  'arrow-forward': '→',
  'ticket-outline': '🎫',
  'time-outline': '🕐',
  'map-outline': '🗺',
  'newspaper-outline': '📰',
  'settings-outline': '⚙',
  'globe-outline': '🌐',
  'bar-chart-outline': '📊',
  'create-outline': '✎',
  'alert-circle-outline': '!',
  'file-tray-outline': '▤',
  'share-outline': '↗',
  'document-outline': '📄',
  'location-outline': '📍',
  'warning-outline': '⚠',
  'flash-outline': '⚡',
  'checkmark-outline': '✓',
  'checkmark-circle-outline': '✓',
  'close-circle-outline': '✗',
  'lock-closed-outline': '🔒',
  'construct-outline': '🔧',
  'swap-horizontal-outline': '⇄',
  'play-outline': '▶',
  'notifications-outline': '🔔',
  'person-add-outline': '+',
  'logo-instagram': '◎',
  'logo-facebook': 'f',
  'logo-youtube': '▶',
  'logo-linkedin': 'in',
  'logo-twitter': 'x',
};

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
};

export function AppIcon({ name, size = 24, color = '#1B365D' }: Props) {
  if (Font.isLoaded('ionicons')) {
    return <Ionicons name={name} size={size} color={color} />;
  }

  const glyph = FALLBACK[name] ?? '•';
  return (
    <Text style={[styles.fallback, { fontSize: size * 0.78, color, lineHeight: size }]}>
      {glyph}
    </Text>
  );
}

const styles = StyleSheet.create({
  fallback: { textAlign: 'center', includeFontPadding: false },
});
