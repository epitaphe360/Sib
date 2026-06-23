import React, { useRef } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  /** Scale target on press-in. Default 0.96 */
  scaleTo?: number;
};

/**
 * Drop-in replacement for Pressable that adds a spring scale feedback on press.
 * The inner Animated.View receives the style prop.
 */
export function PressableScale({ children, style, scaleTo = 0.96, onPressIn, onPressOut, ...props }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 60,
      bounciness: 4,
    }).start();
    onPressIn?.(e);
  };

  const pressOut = (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable style={style} onPressIn={pressIn} onPressOut={pressOut} {...props}>
      <Animated.View style={{ transform: [{ scale }], width: '100%', alignItems: 'center' }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
