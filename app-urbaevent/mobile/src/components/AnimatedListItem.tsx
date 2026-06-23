import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  /** List index — adds a staggered delay of index * 55ms (capped at 400ms). */
  index?: number;
  style?: ViewStyle | ViewStyle[];
};

/**
 * Wraps list items with a fade + slide-up entrance animation.
 * Use inside FlatList / map renderItem by passing the item index.
 *
 * @example
 * renderItem={({ item, index }) => (
 *   <AnimatedListItem index={index}>
 *     <MyCard item={item} />
 *   </AnimatedListItem>
 * )}
 */
export function AnimatedListItem({ children, index = 0, style }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const delay = Math.min(index * 55, 400);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        speed: 16,
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
