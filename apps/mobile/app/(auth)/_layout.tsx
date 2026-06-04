import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#1B365D' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Connexion' }} />
      <Stack.Screen name="register" options={{ title: 'Inscription' }} />
      <Stack.Screen name="register-vip" options={{ title: 'Pass VIP' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Mot de passe oublié' }} />
      <Stack.Screen name="reset-password" options={{ title: 'Nouveau mot de passe', headerShown: true }} />
      <Stack.Screen name="auth-callback" options={{ title: 'Connexion…', headerShown: false }} />
    </Stack>
  );
}
