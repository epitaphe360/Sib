import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSalon } from '../../context/SalonContext';
import { useI18n } from '../../i18n/I18nProvider';
import { getUrbaSalonTheme } from '../../data/urbaCatalog';
import { fonts, radius, spacing } from '../../theme';

export function ActiveSalonBanner() {
  const { activeSalon, clearActiveSalon } = useSalon();
  const { t } = useI18n();

  if (!activeSalon) return null;

  const theme = getUrbaSalonTheme(activeSalon);

  return (
    <View style={[styles.wrap, { borderColor: theme.color }]}>
      <Text style={styles.label}>{t('salon.connectedTo')}</Text>
      <Text style={[styles.name, { color: theme.color }]}>{activeSalon.name}</Text>
      <Pressable
        onPress={() => router.push('/(visitor)/(tabs)/explore' as never)}
        style={[styles.enterBtn, { backgroundColor: theme.color }]}
        accessibilityRole="button"
        accessibilityLabel={t('salon.continueCta')}
      >
        <Text style={styles.enterText}>{t('salon.continueCta')}</Text>
      </Pressable>
      <Pressable
        onPress={async () => {
          await clearActiveSalon();
          router.replace('/(visitor)/(tabs)' as never);
        }}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('salon.changeSalon')}
      >
        <Text style={styles.change}>{t('salon.changeSalon')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: { fontFamily: fonts.body, fontSize: 12, color: '#647483' },
  name: { fontFamily: fonts.bodyBold, fontSize: 18 },
  enterBtn: {
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  enterText: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#fff' },
  change: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: '#647483',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
