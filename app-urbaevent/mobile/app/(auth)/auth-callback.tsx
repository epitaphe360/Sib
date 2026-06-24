import * as ExpoLinking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useSalon } from '../../src/context/SalonContext';
import { applyPendingSalonAfterAuth } from '../../src/lib/applyPendingSalonAfterAuth';
import {
  buildAuthCallbackUrlFromParams,
  completeAuthSessionFromUrl,
  isAuthCallbackPayload,
} from '../../src/lib/completeAuthSession';
import { dismissAuthStackIfNeeded, navigateAfterAuth } from '../../src/lib/navigateAfterAuth';
import { colors, spacing } from '../../src/theme';
import { useI18n } from '../../src/i18n/I18nProvider';

const CALLBACK_TIMEOUT_MS = 20_000;

export default function AuthCallbackScreen() {
  const { t } = useI18n();
  const { refreshUser } = useAuth();
  const { salons, setActiveSalon } = useSalon();
  const params = useLocalSearchParams<{ token_hash?: string; type?: string; code?: string }>();
  const incomingUrl = ExpoLinking.useURL();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  const handle = useCallback(
    async (url: string) => {
      if (handledRef.current) return;
      handledRef.current = true;
      try {
        const { appUser, paymentRequestId } = await completeAuthSessionFromUrl(url);
        await refreshUser();
        if (paymentRequestId) {
          dismissAuthStackIfNeeded();
          router.replace(`/payment/${paymentRequestId}` as never);
        } else {
          const enteredSalon = await applyPendingSalonAfterAuth({
            salons,
            setActiveSalon,
            userId: appUser.id,
          });
          if (!enteredSalon) navigateAfterAuth(appUser.type);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : t('auth.magic.callbackError'));
        handledRef.current = false;
      }
    },
    [refreshUser, salons, setActiveSalon, t],
  );

  useEffect(() => {
    let cancelled = false;

    const finish = (message: string) => {
      if (!cancelled && !handledRef.current) {
        handledRef.current = true;
        setError(message);
      }
    };

    const tryHandle = (url: string | null) => {
      if (!isAuthCallbackPayload(url, params)) return false;
      const fromParams = buildAuthCallbackUrlFromParams(params);
      void handle(fromParams ?? url!);
      return true;
    };

    const timeout = setTimeout(() => {
      finish(t('auth.magic.callbackTimeout'));
    }, CALLBACK_TIMEOUT_MS);

    const fromParams = buildAuthCallbackUrlFromParams(params);
    if (fromParams) {
      clearTimeout(timeout);
      void handle(fromParams);
      return () => {
        cancelled = true;
        clearTimeout(timeout);
      };
    }

    if (tryHandle(incomingUrl)) {
      clearTimeout(timeout);
      return () => {
        cancelled = true;
        clearTimeout(timeout);
      };
    }

    ExpoLinking.getInitialURL()
      .then((url) => {
        if (tryHandle(url)) clearTimeout(timeout);
      })
      .catch(() => finish(t('auth.magic.callbackError')));

    const sub = ExpoLinking.addEventListener('url', ({ url }) => {
      if (tryHandle(url)) clearTimeout(timeout);
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      sub.remove();
    };
  }, [handle, incomingUrl, params, t]);

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
