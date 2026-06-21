import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Initial Y offset to slide from. Default 24. */
  fromY?: number;
  /** Animation duration in ms. Default 380. */
  duration?: number;
  /** Delay before animation starts in ms. Default 0. */
  delay?: number;
};

/**
 * Wraps content in a fade + slide-up entrance animation that plays on mount.
 * Ideal for screen-level content containers.
 */
export function FadeSlideIn({ children, style, fromY = 24, duration = 380, delay = 0 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        speed: 14,
        bounciness: 3,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
