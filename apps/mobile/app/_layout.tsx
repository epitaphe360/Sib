import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { I18nProvider } from '../src/i18n/I18nProvider';

export default function RootLayout() {
  return (
    <ErrorBoundary>
    <I18nProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(visitor)" />
          <Stack.Screen name="(exhibitor)" />
          <Stack.Screen name="(partner)" />
          <Stack.Screen name="(staff)" />
          <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="payment/[id]"
            options={{
              headerShown: true,
              title: 'Paiement VIP',
              headerStyle: { backgroundColor: '#1B365D' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="exhibitor/[id]"
            options={{
              headerShown: true,
              title: 'Exposant',
              headerStyle: { backgroundColor: '#1B365D' },
              headerTintColor: '#fff',
            }}
          />
        </Stack>
      </AuthProvider>
    </I18nProvider>
    </ErrorBoundary>
  );
}
