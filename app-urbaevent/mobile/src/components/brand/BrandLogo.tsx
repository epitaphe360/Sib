import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { getBrandLogoSource } from '../../config/brandAssets';
import { useBadgeConfig } from '../../hooks/useBadgeConfig';
import { fonts } from '../../theme';

const SIZES = {
  sm: 40,
  md: 64,
  lg: 96,
  xl: 128,
} as const;

type Size = keyof typeof SIZES;

type Props = {
  size?: Size;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  showLabel?: boolean;
  accessibilityLabel?: string;
};

export function BrandLogo({
  size = 'md',
  style,
  imageStyle,
  showLabel = false,
  accessibilityLabel = 'UrbaEvent',
}: Props) {
  const { config } = useBadgeConfig();
  const dim = SIZES[size];
  const source = getBrandLogoSource(config.app_promo_image_url || undefined);

  return (
    <View style={[styles.wrap, style]} accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <Image
        source={source}
        style={[{ width: dim, height: dim, borderRadius: dim * 0.18 }, imageStyle]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      {showLabel ? <Text style={styles.label}>UrbaEvent</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#1B365D',
    letterSpacing: 0.5,
  },
});
