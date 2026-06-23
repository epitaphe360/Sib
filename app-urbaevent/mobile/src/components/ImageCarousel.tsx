import { useRef, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { APP_IMAGES, type ImageKey } from '../data/images';
import { colors, spacing } from '../theme';

const WIDTH = Dimensions.get('window').width - spacing.md * 2;

type Slide = { imageKey: ImageKey; title: string; subtitle?: string };

export function ImageCarousel({ slides, height = 220 }: { slides: Slide[]; height?: number }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / WIDTH);
    if (i !== index) setIndex(i);
  };

  if (!slides.length) return null;

  return (
    <View style={[styles.wrap, { height }]}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {slides.map((slide) => (
          <ImageBackground
            key={slide.imageKey + slide.title}
            source={APP_IMAGES[slide.imageKey]}
            style={[styles.slide, { width: WIDTH, height }]}
            imageStyle={styles.slideImg}
          >
            <View style={styles.overlay} />
            <View style={styles.textBlock}>
              <Text style={styles.title}>{slide.title}</Text>
              {slide.subtitle ? <Text style={styles.subtitle}>{slide.subtitle}</Text> : null}
            </View>
          </ImageBackground>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md, borderRadius: 16, overflow: 'hidden' },
  slide: { justifyContent: 'flex-end' },
  slideImg: { borderRadius: 16 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(27, 54, 93, 0.5)' },
  textBlock: { padding: spacing.md, zIndex: 1 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.92)', fontSize: 14, marginTop: 6, lineHeight: 20 },
  dots: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
});
