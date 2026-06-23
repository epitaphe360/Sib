import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { URBA_SOCIAL_LINKS } from '../../data/urbaCatalog';
import { useAppTheme } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/I18nProvider';
import { fonts, radius, shadows, spacing } from '../../theme';
import { AppIcon, type AppIconName } from '../AppIcon';
import { FadeSlideIn } from '../FadeSlideIn';

const SOCIAL_ICONS: Record<string, AppIconName> = {
  instagram: 'logo-instagram',
  facebook: 'logo-facebook',
  youtube: 'logo-youtube',
  linkedin: 'logo-linkedin',
  x: 'logo-twitter',
};

export function UrbacomSocialSection() {
  const { t } = useI18n();
  const { colors, isDark } = useAppTheme();

  const open = (url: string) => {
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <FadeSlideIn delay={160} style={styles.fadeWrap}>
      <View
        style={[
          styles.wrap,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
          },
          !isDark && shadows.sm,
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>{t('home.urba.followTitle')}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('home.urba.socialHint')}</Text>

        <View style={styles.row}>
          {URBA_SOCIAL_LINKS.map((link) => (
            <Pressable
              key={link.id}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              onPress={() => open(link.url)}
              accessibilityRole="link"
              accessibilityLabel={link.label}
            >
              <View style={[styles.iconBox, { backgroundColor: isDark ? colors.border : link.bg }]}>
                <AppIcon name={SOCIAL_ICONS[link.id] ?? 'globe-outline'} size={22} color={link.color} />
              </View>
              <Text style={[styles.label, { color: colors.textMuted }]}>{link.label}</Text>
            </Pressable>
          ))}
        </View>
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
    padding: spacing.md,
    borderWidth: 1,
  },
  title: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    minWidth: 56,
  },
  pressed: { opacity: 0.85 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    textAlign: 'center',
  },
});
