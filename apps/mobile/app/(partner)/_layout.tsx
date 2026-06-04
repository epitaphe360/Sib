import { Stack } from 'expo-router';
import { RoleGate } from '../../src/components/guards/RoleGate';

export default function PartnerLayout() {
  return (
    <RoleGate allowed="partner">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="messages/[id]"
          options={{ headerShown: true, title: 'Conversation', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
      </Stack>
    </RoleGate>
  );
}
