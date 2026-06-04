import { Stack } from 'expo-router';
import { RoleGate } from '../../src/components/guards/RoleGate';

export default function ExhibitorLayout() {
  return (
    <RoleGate allowed="exhibitor">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="scan"
          options={{ headerShown: true, title: 'Scanner contacts', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
        <Stack.Screen
          name="minisite"
          options={{ headerShown: true, title: 'Mon mini-site', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
        <Stack.Screen
          name="messages/[id]"
          options={{ headerShown: true, title: 'Conversation', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
        <Stack.Screen
          name="analytics"
          options={{ headerShown: true, title: 'Analytics', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
      </Stack>
    </RoleGate>
  );
}
