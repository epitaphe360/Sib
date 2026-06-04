import { router } from 'expo-router';
import { PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';

export default function StaffPaymentsTab() {
  const { user } = useAuth();
  if (user?.type !== 'admin') {
    return (
      <Screen>
        <ScreenTitle title="Paiements" subtitle="Réservé à l'équipe organisatrice" />
      </Screen>
    );
  }
  return (
    <Screen>
      <ScreenTitle title="Paiements VIP" />
      <PrimaryButton label="Valider les virements" onPress={() => router.push('/(staff)/payments')} />
    </Screen>
  );
}
