import { Stack } from 'expo-router';
import { RoleGate } from '../../src/components/guards/RoleGate';

export default function StaffLayout() {
  return (
    <RoleGate allowed="staff">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="scanner"
          options={{ headerShown: true, title: 'Scanner accès', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
        <Stack.Screen
          name="payments"
          options={{ headerShown: true, title: 'Validation paiements', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
        <Stack.Screen
          name="pricing"
          options={{ headerShown: true, title: 'Tarif Pass VIP', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
        <Stack.Screen
          name="alerts"
          options={{ headerShown: true, title: 'Alertes', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
        <Stack.Screen
          name="users"
          options={{ headerShown: true, title: 'Utilisateurs', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
      </Stack>
    </RoleGate>
  );
}
