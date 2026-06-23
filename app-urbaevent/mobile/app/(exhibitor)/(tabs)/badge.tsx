import { Screen } from '../../../src/components/ui';
import { BadgeScreenContent } from '../../../src/components/BadgeScreenContent';
import { StyleSheet } from 'react-native';

export default function ExhibitorBadgeScreen() {
  return (
    <Screen style={styles.flex}>
      <BadgeScreenContent variant="exhibitor" />
    </Screen>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
