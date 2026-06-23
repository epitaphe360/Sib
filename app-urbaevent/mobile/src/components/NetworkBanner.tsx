import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

export function NetworkBanner({ message }: { message: string }) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.danger,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  text: { color: '#fff', fontSize: 13, textAlign: 'center' },
});
