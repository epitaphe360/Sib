import { router } from 'expo-router';
import { PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';

export default function ExhibitorScanTab() {
  return (
    <Screen>
      <ScreenTitle title="Scan contacts" subtitle="Scannez le badge visiteur au stand" />
      <PrimaryButton label="Ouvrir le scanner" onPress={() => router.push('/(exhibitor)/scan')} />
    </Screen>
  );
}
