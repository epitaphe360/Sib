import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../src/components/AppIcon';
import { BrandLogo } from '../src/components/brand/BrandLogo';
import { APP_IMAGES, type ImageKey } from '../src/data/images';
import { useI18n } from '../src/i18n/I18nProvider';
import { setOnboardingComplete } from '../src/lib/onboarding';
import { colors, fonts, radius, spacing } from '../src/theme';

const { width } = Dimensions.get('window');

const SLIDES: { id: string; imageKey: ImageKey; icon: 'ticket-outline' | 'people-outline' | 'scan-outline' }[] = [
  { id: '1', imageKey: 'hero', icon: 'ticket-outline' },
  { id: '2', imageKey: 'networking', icon: 'people-outline' },
  { id: '3', imageKey: 'expo', icon: 'scan-outline' },
];

export default function OnboardingScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<(typeof SLIDES)[number]>>(null);

  const finish = async () => {
    await setOnboardingComplete();
    router.replace('/(visitor)/(tabs)' as never);
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <FlatList<(typeof SLIDES)[number]>
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        renderItem={({ item, index: i }) => (
          <View style={[styles.slide, { width }]}>
            <ImageBackground source={APP_IMAGES[item.imageKey]} style={styles.hero} imageStyle={styles.heroImg}>
              <View style={styles.overlay} />
              <View style={styles.iconCircle}>
                <AppIcon name={item.icon} size={36} color={colors.gold} />
              </View>
            </ImageBackground>
            <Text style={styles.slideTitle}>{t(`onboarding.slide${i + 1}.title`)}</Text>
            <Text style={styles.slideBody}>{t(`onboarding.slide${i + 1}.body`)}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <BrandLogo size="sm" style={styles.footerLogo} />
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View key={s.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Pressable style={styles.cta} onPress={next}>
          <Text style={styles.ctaText}>
            {index === SLIDES.length - 1 ? t('onboarding.start') : t('onboarding.next')}
          </Text>
          <AppIcon name="arrow-forward" size={20} color={colors.primaryDark} />
        </Pressable>
        {index < SLIDES.length - 1 && (
          <Pressable onPress={finish} style={styles.skip}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  slide: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  hero: {
    width: width - spacing.lg * 2,
    height: 280,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginTop: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImg: { borderRadius: radius.xl },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlayHeavy },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  slideTitle: {
    marginTop: spacing.xl,
    fontSize: 26,
    fontFamily: fonts.display,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  slideBody: {
    marginTop: spacing.md,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  footer: { padding: spacing.lg, alignItems: 'center' },
  footerLogo: { marginBottom: spacing.sm },
  dots: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 24, backgroundColor: colors.gold },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: 16,
    borderRadius: radius.full,
    width: '100%',
    justifyContent: 'center',
  },
  ctaText: { fontSize: 17, fontFamily: fonts.bodyBold, color: colors.primaryDark },
  skip: { marginTop: spacing.md, padding: spacing.sm },
  skipText: { fontFamily: fonts.bodyMedium, color: colors.textMuted, fontSize: 14 },
});
