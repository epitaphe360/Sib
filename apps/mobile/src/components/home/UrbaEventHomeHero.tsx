import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { URBA_PLATFORM_STATS } from '../../data/urbaCatalog';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nProvider';
import { colors, fonts, spacing } from '../../theme';
import { BrandLogo } from '../brand/BrandLogo';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { SignOutOverlayButton } from '../SignOutOverlayButton';

export function UrbaEventHomeHero() {
  const { t } = useI18n();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrap}>
      <View style={styles.gradientBase} />
      <View style={styles.blobTopLeft} />
      <View style={styles.blobBottomRight} />

      <View style={[styles.content, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.langRow}>
          {user ? <SignOutOverlayButton compact floating={false} /> : <View style={styles.signOutSpacer} />}
          <LanguageSwitcher compact variant="hero" />
        </View>

        <View style={styles.badge}>
          <View style={styles.liveDot} />
          <Text style={styles.badgeText}>URBACOM</Text>
          <Text style={styles.badgeSep}>·</Text>
          <Text style={styles.badgeSub}>{t('home.urba.officialPlatform')}</Text>
        </View>

        <View style={styles.logoCard}>
          <BrandLogo size="lg" showLabel />
          <Text style={styles.logoTagline}>{t('home.urba.followSubtitle')}</Text>
        </View>

        <Text style={styles.title}>
          {'Urba'}
          <Text style={styles.titleAccent}>Event</Text>
        </Text>
        <Text style={styles.subtitle}>{t('home.urba.heroSubtitle')}</Text>

        <View style={styles.statsRow}>
          {URBA_PLATFORM_STATS.map((stat) => (
            <View key={stat.labelKey} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.wave} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: '#1B365D',
  },
  gradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.platform.heroMid,
    opacity: 0.92,
  },
  blobTopLeft: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(69, 152, 209, 0.22)',
  },
  blobBottomRight: {
    position: 'absolute',
    bottom: 30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(46, 125, 184, 0.18)',
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg + 8,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  signOutSpacer: { width: 40 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: spacing.md,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.successGreen,
  },
  badgeText: {
    color: '#fff',
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  badgeSep: { color: 'rgba(255,255,255,0.35)', fontSize: 12 },
  badgeSub: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.body, fontSize: 11 },
  logoCard: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: spacing.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logoTagline: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.semantic.textSecondary,
    letterSpacing: 0.8,
    marginTop: 8,
    textTransform: 'uppercase',
    textAlign: 'center',
    maxWidth: 260,
  },
  title: {
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 34,
    color: '#fff',
    marginBottom: spacing.xs,
  },
  titleAccent: { color: colors.platform.accentBlue },
  subtitle: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(191,219,254,0.95)',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: '#fff',
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: 'rgba(191,219,254,0.9)',
    marginTop: 2,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: colors.platform.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
