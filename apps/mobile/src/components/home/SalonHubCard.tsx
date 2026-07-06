import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../AppIcon';
import { PressableScale } from '../PressableScale';
import { getUrbaSalonTheme } from '../../data/urbaCatalog';
import { useAppContent } from '../../hooks/useAppContent';
import { useAppTheme } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/I18nProvider';
import type { Salon } from '../../types';
import { fonts, radius, shadows, spacing } from '../../theme';

type Props = {
  salon: Salon;
  onEnter?: () => void;
};

/** Carte hub UrbaEvent — description, dates, lieu (pas d'exposants / programme ici). */
export function SalonHubCard({ salon, onEnter }: Props) {
  const { t } = useI18n();
  const { colors, isDark } = useAppTheme();
  const { content } = useAppContent();
  const theme = getUrbaSalonTheme(salon, content.salonStats);
  const isActive = Boolean(salon.active);
  const location = salon.location ?? theme.location;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: isActive ? theme.color : colors.cardBorder },
        !isDark && shadows.md,
      ]}
    >
      <View style={styles.media}>
        {theme.image ? (
          <ImageBackground source={theme.image} style={styles.image}>
            <View style={[styles.overlay, !isActive && styles.overlayLocked]} />
            <View style={[styles.statusPill, isActive ? styles.statusOpen : styles.statusSoon]}>
              <Text style={[styles.statusText, isActive ? styles.statusOpenText : styles.statusSoonText]}>
                {isActive ? t('home.salonActive') : t('home.salonSoon')}
              </Text>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.image, styles.placeholder, { backgroundColor: theme.color }]}>
            <AppIcon name={theme.icon} size={32} color="#fff" />
          </View>
        )}
        <View style={[styles.accentBar, { backgroundColor: theme.color }]} />
      </View>

      <View style={styles.body}>
        <View style={styles.codeRow}>
          <View style={[styles.codeTag, { backgroundColor: theme.bgColor }]}>
            <Text style={[styles.codeText, { color: theme.color }]}>{salon.code}</Text>
          </View>
          {theme.edition ? (
            <Text style={[styles.edition, { color: colors.textMuted }]}>{theme.edition}</Text>
          ) : null}
        </View>

        <Text style={[styles.name, { color: colors.text }]}>{theme.fullName}</Text>
        {theme.tagline ? (
          <Text style={[styles.tagline, { color: theme.color }]}>{theme.tagline}</Text>
        ) : null}

        {theme.description ? (
          <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={3}>
            {theme.description}
          </Text>
        ) : null}

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <AppIcon name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.meta, { color: colors.textMuted }]}>{salon.dates}</Text>
          </View>
          <View style={styles.metaRow}>
            <AppIcon name="location-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.meta, { color: colors.textMuted }]}>{location}</Text>
          </View>
        </View>

        {isActive && onEnter ? (
          <PressableScale style={[styles.enterBtn, { backgroundColor: theme.color }]} onPress={onEnter}>
            <Text style={styles.enterText}>{t('salon.enterCta')}</Text>
            <AppIcon name="arrow-forward" size={16} color="#fff" />
          </PressableScale>
        ) : (
          <View style={[styles.soonBtn, { backgroundColor: isDark ? colors.border : '#EEF2F7' }]}>
            <Text style={[styles.soonBtnText, { color: colors.textMuted }]}>{t('home.urba.soonCta')}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  media: { height: 146, position: 'relative' },
  image: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  overlayLocked: {
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  statusPill: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  statusOpen: { backgroundColor: 'rgba(255,255,255,0.95)' },
  statusSoon: { backgroundColor: 'rgba(255,255,255,0.92)' },
  statusText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusOpenText: { color: '#2E7D32' },
  statusSoonText: { color: '#64748B' },
  body: {
    padding: spacing.md + 2,
    gap: 5,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  codeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  codeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  edition: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  name: {
    fontFamily: fonts.displayMedium,
    fontSize: 20,
    lineHeight: 26,
  },
  tagline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  metaBlock: {
    gap: 4,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    flex: 1,
  },
  enterBtn: {
    marginTop: spacing.sm,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  enterText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#fff',
  },
  soonBtn: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  soonBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
});
