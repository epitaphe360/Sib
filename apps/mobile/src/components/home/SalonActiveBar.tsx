import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSalon } from '../../context/SalonContext';
import { useAppTheme } from '../../context/ThemeContext';
import { getUrbaSalonTheme } from '../../data/urbaCatalog';
import { useI18n } from '../../i18n/I18nProvider';
import { fonts, radius, spacing } from '../../theme';
import { AppIcon } from '../AppIcon';

/** Bandeau contexte salon — visible uniquement dans l'espace salon (pas sur le hub). */
export function SalonActiveBar() {
  const { activeSalon, clearActiveSalon } = useSalon();
  const { t } = useI18n();
  const { colors } = useAppTheme();

  if (!activeSalon) return null;

  const theme = getUrbaSalonTheme(activeSalon);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: theme.color }]}>
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: theme.color }]} />
        <View style={styles.texts}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('salon.connectedTo')}</Text>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {activeSalon.name}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={async () => {
          await clearActiveSalon();
          router.replace('/(visitor)/(tabs)' as never);
        }}
        style={[styles.leaveBtn, { borderColor: colors.border }]}
        accessibilityRole="button"
        accessibilityLabel={t('salon.leaveCta')}
      >
        <AppIcon name="home-outline" size={14} color={colors.primary} />
        <Text style={[styles.leaveText, { color: colors.primary }]}>{t('salon.leaveCta')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  texts: { flex: 1, minWidth: 0 },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  leaveText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
});
