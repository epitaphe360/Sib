import { Image, StyleSheet, Text, View } from 'react-native';
import { APP_IMAGES } from '../data/images';
import { colors, spacing } from '../theme';

export function SibBrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <View style={styles.row}>
      <Image source={APP_IMAGES.logoSib} style={styles.logo} resizeMode="contain" />
      <View style={styles.text}>
        <Text style={styles.title}>Salon International du Bâtiment</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  logo: { width: 56, height: 56 },
  text: { flex: 1 },
  title: { fontSize: 15, fontWeight: '800', color: colors.primary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
