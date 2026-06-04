import { Stack } from 'expo-router';

export default function AppointmentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1B365D' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mes rendez-vous' }} />
      <Stack.Screen name="new" options={{ title: 'Réserver un RDV' }} />
    </Stack>
  );
}
