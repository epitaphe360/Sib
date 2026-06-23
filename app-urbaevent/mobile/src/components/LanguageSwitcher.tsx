import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from './PressableScale';
import { AppIcon } from './AppIcon';
import { useI18n } from '../i18n/I18nProvider';
import { colors, fonts, radius, shadows, spacing } from '../theme';

export type AppLocale = 'fr' | 'en' | 'ar';

const LANGUAGES: { id: AppLocale; label: string; short: string; flag: string }[] = [
  { id: 'fr', label: 'Français', short: 'FR', flag: '🇫🇷' },
  { id: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
  { id: 'ar', label: 'العربية', short: 'AR', flag: '🇲🇦' },
];

type Props = {
  compact?: boolean;
  showTitle?: boolean;
  variant?: 'default' | 'hero';
};

export function LanguageSwitcher({ compact = false, showTitle = true, variant = 'default' }: Props) {
  const { locale, setLocale, t } = useI18n();
  const onHero = variant === 'hero';

  if (compact) {
    return (
      <View style={[styles.compactWrap, onHero && styles.compactWrapHero]}>
        <AppIcon name="globe-outline" size={16} color={onHero ? 'rgba(255,255,255,0.8)' : colors.textMuted} />
        <View style={styles.compactRow}>
          {LANGUAGES.map((lang) => {
            const active = locale === lang.id;
            return (
              <PressableScale
                key={lang.id}
                style={[
                  styles.compactChip,
                  onHero && styles.compactChipHero,
                  active && (onHero ? styles.compactChipHeroActive : styles.compactChipActive),
                ]}
                onPress={() => setLocale(lang.id)}
              >
                <Text
                  style={[
                    styles.compactText,
                    onHero && styles.compactTextHero,
                    active && (onHero ? styles.compactTextHeroActive : styles.compactTextActive),
                  ]}
                >
                  {lang.short}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View>
      {showTitle ? (
        <View style={styles.cardHeader}>
          <AppIcon name="globe-outline" size={18} color={colors.primary} />
          <Text style={styles.cardTitle}>{t('settings.language')}</Text>
        </View>
      ) : null}
      <View style={styles.langGrid}>
        {LANGUAGES.map((lang) => {
          const active = locale === lang.id;
          return (
            <PressableScale
              key={lang.id}
              style={[styles.langTile, active ? styles.langTileActive : undefined]}
              onPress={() => setLocale(lang.id)}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <Text style={[styles.langLabel, active ? styles.langLabelActive : undefined]}>{lang.label}</Text>
              {active && (
                <View style={styles.langCheck}>
                  <AppIcon name="checkmark-outline" size={12} color="#fff" />
                </View>
              )}
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 2,
  },
  compactWrapHero: {
    marginBottom: 0,
  },
  compactRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flex: 1,
  },
  compactChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  compactChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },
  compactChipHero: {
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    minWidth: 42,
    flex: 0,
    paddingHorizontal: 10,
  },
  compactChipHeroActive: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  compactText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  compactTextHero: {
    color: 'rgba(255,255,255,0.75)',
  },
  compactTextActive: {
    color: colors.primary,
  },
  compactTextHeroActive: {
    color: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  langGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  langTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    position: 'relative',
  },
  langTileActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
    ...shadows.sm,
  },
  langFlag: { fontSize: 24, marginBottom: 6 },
  langLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  langLabelActive: { color: colors.primary },
  langCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
