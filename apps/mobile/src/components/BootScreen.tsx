import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

/** Écran de chargement au démarrage — jamais d'écran bleu vide. */
export function BootScreen({ label }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.logoMark}>
        <Text style={styles.logoText}>U</Text>
      </View>
      <Text style={styles.brand}>UrbaEvent</Text>
      <ActivityIndicator size="small" color={colors.gold} style={styles.spinner} />
      <Text style={styles.label}>{label ?? 'Ouverture de votre espace…'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    shadowColor: '#0F2138',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
  logoText: {
    color: colors.gold,
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 46,
  },
  brand: {
    marginTop: 18,
    color: colors.primaryDark,
    fontFamily: fonts.display,
    fontSize: 30,
  },
  spinner: {
    marginTop: 18,
  },
  label: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
