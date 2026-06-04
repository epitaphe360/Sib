import { Stack } from 'expo-router';
import { RoleGate } from '../../src/components/guards/RoleGate';

export default function VisitorLayout() {
  return (
    <RoleGate allowed="visitor" requireAuth={false}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="appointments" options={{ headerShown: false }} />
        <Stack.Screen
          name="messages/index"
          options={{ headerShown: true, title: 'Messages', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
        <Stack.Screen
          name="messages/[id]"
          options={{ headerShown: true, title: 'Conversation', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
        <Stack.Screen
          name="networking"
          options={{ headerShown: true, title: 'Réseautage', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: true, title: 'Paramètres', headerStyle: { backgroundColor: '#1B365D' }, headerTintColor: '#fff' }}
        />
      </Stack>
    </RoleGate>
  );
}
