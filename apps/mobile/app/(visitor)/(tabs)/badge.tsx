import { Screen } from '../../../src/components/ui';
import { BadgeScreenContent } from '../../../src/components/BadgeScreenContent';
import { SalonGate } from '../../../src/components/guards/SalonGate';
import { StyleSheet } from 'react-native';

export default function BadgeScreen() {
  return (
    <SalonGate>
      <Screen style={styles.flex}>
        <BadgeScreenContent />
      </Screen>
    </SalonGate>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
