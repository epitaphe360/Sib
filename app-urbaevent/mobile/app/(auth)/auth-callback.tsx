import * as ExpoLinking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { completeAuthSessionFromUrl } from '../../src/lib/completeAuthSession';
import { dismissAuthStackIfNeeded, navigateAfterAuth } from '../../src/lib/navigateAfterAuth';
import { colors, spacing } from '../../src/theme';
import { useI18n } from '../../src/i18n/I18nProvider';

const CALLBACK_TIMEOUT_MS = 15_000;

export default function AuthCallbackScreen() {
  const { t } = useI18n();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const finish = (message: string) => {
      if (!cancelled && !handledRef.current) {
        handledRef.current = true;
        setError(message);
      }
    };

    const handle = async (url: string | null) => {
      if (!url || (!url.includes('access_token') && !url.includes('code='))) return;
      if (handledRef.current) return;
      handledRef.current = true;
      try {
        const { appUser, paymentRequestId } = await completeAuthSessionFromUrl(url);
        // On met à jour le contexte Auth avec l'utilisateur fraîchement créé/récupéré.
        // Note: on appelle refreshUser APRÈS finalizeProfileAfterMagicLink pour s'assurer
        // que la ligne users existe déjà en base avant que onAuthStateChange tente de la charger.
        await refreshUser();
        if (!cancelled) {
          if (paymentRequestId) {
            dismissAuthStackIfNeeded();
            router.replace(`/payment/${paymentRequestId}` as never);
          } else {
            navigateAfterAuth(appUser.type);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t('auth.magic.callbackError'));
          handledRef.current = false; // Permet de réessayer si l'URL change
        }
      }
    };

    const timeout = setTimeout(() => {
      finish(t('auth.magic.callbackTimeout'));
    }, CALLBACK_TIMEOUT_MS);

    ExpoLinking.getInitialURL()
      .then((url) => {
        if (url?.includes('access_token') || url?.includes('code=')) {
          clearTimeout(timeout);
          handle(url);
        }
      })
      .catch(() => finish(t('auth.magic.callbackError')));

    const sub = ExpoLinking.addEventListener('url', ({ url }) => {
      clearTimeout(timeout);
      handle(url);
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      sub.remove();
    };
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
