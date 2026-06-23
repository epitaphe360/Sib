import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

const LOGO = require('../../assets/brand/urbaevent-logo-master.png');

/** Écran de chargement au démarrage — évite l'écran bleu vide si AsyncStorage/Auth bloque. */
export function BootScreen({ label }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
      <Text style={styles.brand}>UrbaEvent</Text>
      <ActivityIndicator size="large" color={colors.gold} style={styles.spinner} />
      <Text style={styles.label}>{label ?? 'Chargement…'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 32,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 12,
  },
  brand: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: 28,
  },
  spinner: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});
