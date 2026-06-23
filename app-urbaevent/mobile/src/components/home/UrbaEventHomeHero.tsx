import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { useSalon } from '../../context/SalonContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/I18nProvider';
import { fonts, spacing } from '../../theme';
import { BrandLogo } from '../brand/BrandLogo';
import { FadeSlideIn } from '../FadeSlideIn';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { PrimaryButton } from '../ui';

type Props = {
  onScrollToSalons?: () => void;
};

export function UrbaEventHomeHero({ onScrollToSalons }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { activeSalon } = useSalon();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const firstName = user?.name?.split(/\s+/)[0] ?? '';
  const headline = user
    ? t('home.urba.greeting').replace('{{name}}', firstName)
    : t('home.urba.welcomeGuest');

  const handlePrimary = () => {
    if (onScrollToSalons) {
      onScrollToSalons();
      return;
    }
    router.push('/(visitor)/(tabs)' as never);
  };

  const resumeSalon = () => {
    if (!activeSalon) return;
    router.push('/(visitor)/(tabs)/explore' as never);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.platform.heroDark }]}>
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="heroGrad" x1="0" y1="0" x2="0.3" y2="1">
            <Stop offset="0" stopColor={colors.platform.heroDark} />
            <Stop offset="0.55" stopColor={colors.platform.heroMid} />
            <Stop offset="1" stopColor={colors.primaryDark} />
          </LinearGradient>
        </Defs>
        <Path d="M0,0 L400,0 L400,400 L0,400 Z" fill="url(#heroGrad)" />
      </Svg>

      <View style={[styles.glow, { backgroundColor: colors.platform.accentBlue }]} />

      <FadeSlideIn style={[styles.content, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.topRow}>
          <Text style={styles.official}>{t('home.urba.officialPlatform')}</Text>
          <LanguageSwitcher compact variant="hero" />
        </View>

        <BrandLogo size="lg" showLabel={false} />

        <Text style={styles.displayTitle}>
          {'Urba'}
          <Text style={[styles.displayAccent, { color: colors.platform.accentBlue }]}>Event</Text>
        </Text>

        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.tagline}>{t('home.urba.heroTagline')}</Text>

        <View style={styles.actions}>
          <PrimaryButton
            label={t('home.urba.browseSalonsCta')}
            onPress={handlePrimary}
            variant="gold"
          />

          {activeSalon ? (
            <Pressable
              onPress={resumeSalon}
              accessibilityRole="button"
              hitSlop={12}
              style={styles.resumeRow}
            >
              <Text style={styles.resumeText}>
                {t('home.urba.resumeSalon').replace('{{salon}}', activeSalon.name)}
              </Text>
              <Text style={[styles.resumeLink, { color: colors.gold }]}>→</Text>
            </Pressable>
          ) : null}

          {user ? (
            <Pressable
              style={styles.heroOutlineBtn}
              onPress={() => router.push('/(visitor)/(tabs)/badge' as never)}
              accessibilityRole="button"
              accessibilityLabel={t('home.urba.myBadgeCta')}
            >
              <Text style={styles.heroOutlineText}>{t('home.urba.myBadgeCta')}</Text>
            </Pressable>
          ) : null}

          {!user ? (
            <>
              <Pressable
                style={styles.heroOutlineBtn}
                onPress={() => router.push('/(auth)/register' as never)}
                accessibilityRole="button"
                accessibilityLabel={t('home.urba.registerFree')}
              >
                <Text style={styles.heroOutlineText}>{t('home.urba.registerFree')}</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(auth)/login' as never)}
                accessibilityRole="link"
                hitSlop={12}
                style={styles.loginRow}
              >
                <Text style={styles.loginHint}>{t('home.urba.alreadyAccount')}</Text>
                <Text style={[styles.loginLink, { color: colors.gold }]}>{t('home.quick.login')}</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </FadeSlideIn>

      <Svg viewBox="0 0 400 36" style={styles.wave} preserveAspectRatio="none">
        <Path d="M0,18 C120,36 280,0 400,18 L400,36 L0,36 Z" fill={colors.platform.bg} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    overflow: 'hidden',
    minHeight: 340,
    backgroundColor: '#1B365D',
  },
  glow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.18,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl + 8,
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  official: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingRight: spacing.sm,
  },
  displayTitle: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  displayAccent: {},
  headline: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    marginBottom: spacing.md,
    maxWidth: 300,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  heroOutlineBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  heroOutlineText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.2,
  },
  resumeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  resumeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  resumeLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  loginHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
  },
  loginLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    width: '100%',
  },
});
