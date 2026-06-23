import { Screen } from '../../../src/components/ui';
import { BadgeScreenContent } from '../../../src/components/BadgeScreenContent';
import { StyleSheet } from 'react-native';

/** Badge UrbaEvent global — accessible sans salon actif. */
export default function BadgeScreen() {
  return (
    <Screen style={styles.flex}>
      <BadgeScreenContent />
    </Screen>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
