import { router } from 'expo-router';
import { PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';

export default function StaffScannerTab() {
  return (
    <Screen>
      <ScreenTitle title="Scanner" subtitle="Contrôle des accès" />
      <PrimaryButton label="Scanner un badge" onPress={() => router.push('/(staff)/scanner')} />
    </Screen>
  );
}
