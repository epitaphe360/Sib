import '../src/lib/cryptoPolyfill';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { BootScreen } from '../src/components/BootScreen';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { I18nProvider, useI18n } from '../src/i18n/I18nProvider';
import { useAppFonts } from '../src/hooks/useAppFonts';
import { prefetchBadgeConfig } from '../src/hooks/useBadgeConfig';
import { initSentry } from '../src/lib/sentry';
import { AppQueryProvider } from '../src/providers/QueryProvider';
import { ThemeProvider } from '../src/context/ThemeContext';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
initSentry();

const SPLASH_MAX_MS = 2500;

function RootStack() {
  const { t } = useI18n();

  return (
    <View style={styles.root}>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1, backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(visitor)" />
        <Stack.Screen name="(exhibitor)" />
        <Stack.Screen name="(staff)" />
        <Stack.Screen name="(service-client)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen
          name="payment/[id]"
          options={{
            headerShown: true,
            title: t('payment.vipTitle'),
            headerStyle: { backgroundColor: colors.primaryDark },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="exhibitor/[id]"
          options={{
            headerShown: true,
            title: t('exhibitor.title'),
            headerStyle: { backgroundColor: colors.primaryDark },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="minisite/[exhibitorId]"
          options={{
            headerShown: true,
            title: t('exhibitor.minisite'),
            headerStyle: { backgroundColor: colors.primaryDark },
            headerTintColor: '#fff',
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const fontsReady = useAppFonts();

  useEffect(() => {
    prefetchBadgeConfig().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => undefined);
      return;
    }
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => undefined);
    }, SPLASH_MAX_MS);
    return () => clearTimeout(timer);
  }, [fontsReady]);

  if (!fontsReady) {
    return (
      <SafeAreaProvider style={styles.root}>
        <BootScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.root}>
      <ErrorBoundary>
        <AppQueryProvider>
          <ThemeProvider>
            <I18nProvider>
              <AuthProvider>
                <StatusBar style="auto" />
                <RootStack />
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </AppQueryProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
