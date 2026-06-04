import * as ExpoLinking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { completeAuthSessionFromUrl } from '../../src/lib/completeAuthSession';
import { getHomePath } from '../../src/navigation/roleConfig';
import { colors, spacing } from '../../src/theme';
import { useI18n } from '../../src/i18n/I18nProvider';

export default function AuthCallbackScreen() {
  const { t } = useI18n();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = async (url: string | null) => {
      if (!url || !url.includes('access_token')) return;
      try {
        const { appUser, paymentRequestId } = await completeAuthSessionFromUrl(url);
        await refreshUser();
        if (paymentRequestId) {
          router.replace(`/payment/${paymentRequestId}` as never);
          return;
        }
        router.replace(getHomePath(appUser.type) as never);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('auth.magic.callbackError'));
      }
    };

    ExpoLinking.getInitialURL().then(handle);
    const sub = ExpoLinking.addEventListener('url', ({ url }) => handle(url));
    return () => sub.remove();
  }, [refreshUser, t]);

  return (
    <View style={styles.wrap}>
      {error ? (
        <>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.link} onPress={() => router.replace('/(auth)/login')}>
            {t('auth.magic.backLogin')}
          </Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.text}>{t('auth.magic.verifying')}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  text: { marginTop: spacing.md, color: colors.textMuted, textAlign: 'center' },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  link: { color: colors.primary, fontWeight: '600' },
});
