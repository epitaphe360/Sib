import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveAppImageSource } from '../../api/appContent';
import { getUrbaSalonTheme, resolveSalonThemeKey } from '../../data/urbaCatalog';
import { useAppContent } from '../../hooks/useAppContent';
import { useI18n } from '../../i18n/I18nProvider';
import type { Salon } from '../../types';
import { fonts, radius, shadows, spacing } from '../../theme';
import { AppIcon } from '../AppIcon';

type Props = {
  salon: Salon;
  onPress: () => void;
  compact?: boolean;
};

export function SalonSelectionCard({ salon, onPress, compact = false }: Props) {
  const { t } = useI18n();
  const { content } = useAppContent();
  const theme = getUrbaSalonTheme(salon, content.salonStats);
  const themeKey = resolveSalonThemeKey(salon);
  const imageSource = theme.image
    ? resolveAppImageSource(themeKey, theme.image, content.images, content.updatedAt)
    : undefined;
  const isActive = Boolean(salon.active);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, compact && styles.cardCompact, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${theme.fullName} — ${salon.dates}`}
    >
      <View style={[styles.topBar, { backgroundColor: theme.color }]} />

      <View style={[styles.media, compact && styles.mediaCompact]}>
        {imageSource ? (
          <ImageBackground source={imageSource} style={styles.image} imageStyle={styles.imageRadius}>
            <View style={[styles.imageOverlay, !isActive && styles.imageOverlayLocked]} />
            {!isActive ? (
              <View style={styles.soonBadge}>
                <AppIcon name="lock-closed-outline" size={12} color="#334155" />
                <Text style={styles.soonText}>{t('home.salonSoon')}</Text>
              </View>
            ) : (
              <View style={styles.openBadge}>
                <View style={styles.openDot} />
                <Text style={styles.openText}>{t('home.salonActive')}</Text>
              </View>
            )}
          </ImageBackground>
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.color }]}>
            <View style={styles.soonBadge}>
              <AppIcon name="lock-closed-outline" size={12} color="#334155" />
              <Text style={styles.soonText}>{t('home.salonSoon')}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={[styles.iconBox, { backgroundColor: theme.color }]}>
            <AppIcon name={theme.icon} size={22} color="#fff" />
          </View>
          <View style={styles.headerMeta}>
            <View style={[styles.codeTag, { backgroundColor: theme.bgColor }]}>
              <Text style={[styles.codeText, { color: theme.color }]}>{salon.code}</Text>
            </View>
            <Text style={[styles.edition, { color: theme.color }]}>{theme.edition}</Text>
          </View>
        </View>

        <Text style={styles.name}>{theme.fullName}</Text>
        {!compact ? (
          <>
            <Text style={[styles.tagline, { color: theme.color }]}>{theme.tagline}</Text>
            <Text style={styles.description} numberOfLines={3}>
              {theme.description}
            </Text>
          </>
        ) : null}

        <View style={styles.pills}>
          <View style={styles.pill}>
            <AppIcon name="calendar-outline" size={12} color="#647483" />
            <Text style={styles.pillText}>{salon.dates}</Text>
          </View>
          {!compact ? (
            <>
              <View style={styles.pill}>
                <AppIcon name="location-outline" size={12} color="#647483" />
                <Text style={styles.pillText} numberOfLines={1}>
                  {salon.location ?? theme.location}
                </Text>
              </View>
              {theme.visitors ? (
                <View style={styles.pill}>
                  <AppIcon name="people-outline" size={12} color="#647483" />
                  <Text style={styles.pillText}>{theme.visitors}</Text>
                </View>
              ) : null}
            </>
          ) : null}
        </View>

        {!compact ? (
          <View style={styles.features}>
            {theme.features.slice(0, 3).map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View style={[styles.featureDot, { backgroundColor: theme.color }]} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.cta, isActive ? { backgroundColor: theme.color } : styles.ctaLocked]}>
          <Text style={[styles.ctaText, !isActive && styles.ctaTextLocked]}>
            {isActive ? t('home.urba.accessCta') : t('home.urba.loginCta')}
          </Text>
          {isActive ? <AppIcon name="arrow-forward" size={14} color="#fff" /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardCompact: {
    marginBottom: 0,
  },
  pressed: { opacity: 0.94 },
  topBar: { height: 4, width: '100%' },
  media: { height: 140 },
  mediaCompact: { height: 88 },
  image: { flex: 1 },
  imageRadius: {},
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  imageOverlayLocked: {
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  soonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: '#334155',
  },
  openBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  openText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: '#2E7D32',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  body: { padding: spacing.md, gap: 6 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: { alignItems: 'flex-end', gap: 4 },
  codeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  codeText: { fontFamily: fonts.bodyBold, fontSize: 11 },
  edition: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: '#1B365D',
    lineHeight: 22,
  },
  tagline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#647483',
    lineHeight: 19,
    marginBottom: 4,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    maxWidth: '100%',
  },
  pillText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#647483',
    flexShrink: 1,
  },
  features: { gap: 4, marginBottom: 4 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  featureText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#647483',
    flex: 1,
  },
  cta: {
    marginTop: spacing.xs,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaLocked: { backgroundColor: '#EEF2F7' },
  ctaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: '#fff',
  },
  ctaTextLocked: { color: '#647483' },
});
