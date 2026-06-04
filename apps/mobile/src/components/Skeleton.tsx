import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';

export function SkeletonBlock({
  height = 16,
  width = '100%',
  style,
}: {
  height?: number;
  width?: number | `${number}%`;
  style?: object;
}) {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[styles.block, { height, width, opacity: pulse }, style]}
    />
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <SkeletonBlock height={88} />
          <SkeletonBlock height={14} width="70%" style={{ marginTop: spacing.sm }} />
          <SkeletonBlock height={12} width="45%" style={{ marginTop: spacing.xs }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.border, borderRadius: 10 },
  list: { paddingTop: spacing.sm },
  row: { marginBottom: spacing.md },
});
