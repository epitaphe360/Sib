import { router } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../AppIcon';
import { PressableScale } from '../PressableScale';
import { useSalon } from '../../context/SalonContext';
import { getUrbaSalonTheme } from '../../data/urbaCatalog';
import { useI18n } from '../../i18n/I18nProvider';
import { fonts, radius, shadows, spacing } from '../../theme';
import { FadeSlideIn } from '../FadeSlideIn';

export function ActiveSalonBanner() {
  const { activeSalon, clearActiveSalon } = useSalon();
  const { t } = useI18n();

  if (!activeSalon) return null;

  const theme = getUrbaSalonTheme(activeSalon);

  return (
    <FadeSlideIn style={styles.fadeWrap}>
      <View style={[styles.wrap, shadows.md]}>
        {theme.image ? (
          <ImageBackground source={theme.image} style={styles.bg} imageStyle={styles.bgImage}>
            <View style={styles.overlay} />
          </ImageBackground>
        ) : (
          <View style={[styles.bg, { backgroundColor: theme.color }]} />
        )}

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{t('home.salonActive')}</Text>
            </View>
            <Pressable
              onPress={async () => {
                await clearActiveSalon();
                router.replace('/(visitor)/(tabs)' as never);
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t('salon.changeSalon')}
            >
              <Text style={styles.change}>{t('salon.changeSalon')}</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>{t('salon.connectedTo')}</Text>
          <Text style={styles.name}>{activeSalon.name}</Text>
          <Text style={styles.dates}>{activeSalon.dates}</Text>

          <PressableScale
            style={[styles.enterBtn, { backgroundColor: theme.color }]}
            onPress={() => router.push('/(visitor)/(tabs)/explore' as never)}
            accessibilityRole="button"
            accessibilityLabel={t('salon.continueCta')}
          >
            <Text style={styles.enterText}>{t('salon.continueCta')}</Text>
            <AppIcon name="arrow-forward" size={16} color="#fff" />
          </PressableScale>
        </View>

        <View style={[styles.accentEdge, { backgroundColor: theme.color }]} />
      </View>
    </FadeSlideIn>
  );
}

const styles = StyleSheet.create({
  fadeWrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  wrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 168,
    backgroundColor: '#0D2137',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  bgImage: {},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,33,55,0.72)',
  },
  content: {
    padding: spacing.md,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  liveText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  change: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    textDecorationLine: 'underline',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  name: {
    fontFamily: fonts.displayMedium,
    fontSize: 22,
    color: '#fff',
    lineHeight: 28,
  },
  dates: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: spacing.sm,
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.lg,
    paddingVertical: 13,
    marginTop: spacing.xs,
  },
  enterText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#fff',
  },
  accentEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
});
