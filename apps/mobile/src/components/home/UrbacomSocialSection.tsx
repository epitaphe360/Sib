import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { URBA_SOCIAL_LINKS } from '../../data/urbaCatalog';
import { useI18n } from '../../i18n/I18nProvider';
import { fonts, radius, spacing } from '../../theme';
import { AppIcon, type AppIconName } from '../AppIcon';

const SOCIAL_ICONS: Record<string, AppIconName> = {
  instagram: 'logo-instagram',
  facebook: 'logo-facebook',
  youtube: 'logo-youtube',
  linkedin: 'logo-linkedin',
  x: 'logo-twitter',
};

export function UrbacomSocialSection() {
  const { t } = useI18n();

  const open = (url: string) => {
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('home.urba.followTitle')}</Text>
      <Text style={styles.subtitle}>{t('home.urba.followSubtitle')}</Text>

      <View style={styles.row}>
        {URBA_SOCIAL_LINKS.map((link) => (
          <Pressable
            key={link.id}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            onPress={() => open(link.url)}
            accessibilityRole="link"
            accessibilityLabel={link.label}
          >
            <View style={[styles.iconBox, { backgroundColor: link.bg }]}>
              <AppIcon name={SOCIAL_ICONS[link.id] ?? 'globe-outline'} size={22} color={link.color} />
            </View>
            <Text style={styles.label}>{link.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#E8ECF4',
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: '#1B365D',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#647483',
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
    fontSize: 10,
    color: '#647483',
    textAlign: 'center',
  },
});
