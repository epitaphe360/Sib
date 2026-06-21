import { Stack } from 'expo-router';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors } from '../../src/theme';

export default function AuthLayout() {
  const { t } = useI18n();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#1B365D' },
        headerTintColor: '#fff',
        contentStyle: { flex: 1, backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" options={{ title: t('login.title') }} />
      <Stack.Screen name="register" options={{ title: t('auth.register.title') }} />
      <Stack.Screen name="register-vip" options={{ title: t('auth.vip.title') }} />
      <Stack.Screen name="forgot-password" options={{ title: t('auth.forgot.title') }} />
      <Stack.Screen name="reset-password" options={{ title: t('auth.reset.title'), headerShown: true }} />
      <Stack.Screen name="auth-callback" options={{ title: t('auth.callback.title'), headerShown: false }} />
      <Stack.Screen name="rgpd" options={{ title: t('auth.rgpd.title'), headerShown: true }} />
    </Stack>
  );
}
