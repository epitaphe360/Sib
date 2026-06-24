import * as ExpoLinking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useSalon } from '../../src/context/SalonContext';
import { normalizeAuthDeepLink } from '../../src/lib/authDeepLink';
import {
  markAuthCallbackDone,
  releaseAuthCallback,
  tryBeginAuthCallback,
} from '../../src/lib/authCallbackState';
import { peekPendingAuthDeepLink, consumePendingAuthDeepLink } from '../../src/lib/pendingAuthDeepLink';
import { applyPendingSalonAfterAuth } from '../../src/lib/applyPendingSalonAfterAuth';
import {
  buildAuthCallbackUrlFromParams,
  completeAuthSessionFromUrl,
  recoverMagicLinkSession,
} from '../../src/lib/completeAuthSession';
import { dismissAuthStackIfNeeded, navigateAfterAuth } from '../../src/lib/navigateAfterAuth';
import { resolveVipPaymentRedirectId } from '../../src/services/payment';
import type { AppUser } from '../../src/types';
import { colors, spacing } from '../../src/theme';
import { useI18n } from '../../src/i18n/I18nProvider';

const CALLBACK_TIMEOUT_MS = 30_000;
const POLL_MS = 400;
const POLL_ATTEMPTS = 25;

async function redirectAfterMagicLinkAuth(
  appUser: AppUser,
  paymentRequestId: string | undefined,
  refreshUser: () => Promise<void>,
  salons: Parameters<typeof applyPendingSalonAfterAuth>[0]['salons'],
  setActiveSalon: Parameters<typeof applyPendingSalonAfterAuth>[0]['setActiveSalon'],
): Promise<void> {
  consumePendingAuthDeepLink();
  await refreshUser();
  let paymentId = paymentRequestId;
  if (!paymentId && appUser.status === 'pending_payment') {
    paymentId = await resolveVipPaymentRedirectId(appUser.id);
  }
  if (paymentId) {
    dismissAuthStackIfNeeded();
    router.replace(`/payment/${paymentId}` as never);
    return;
  }
  const enteredSalon = await applyPendingSalonAfterAuth({
    salons,
    setActiveSalon,
    userId: appUser.id,
  });
  if (!enteredSalon) navigateAfterAuth(appUser.type);
}

export default function AuthCallbackScreen() {
  const { t } = useI18n();
  const { refreshUser } = useAuth();
  const { salons, setActiveSalon } = useSalon();
  const params = useLocalSearchParams<{
    token_hash?: string;
    type?: string;
    code?: string;
    access_token?: string;
    refresh_token?: string;
  }>();
  const incomingUrl = ExpoLinking.useURL();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  const resolveAuthUrl = useCallback((): string | null => {
    return (
      buildAuthCallbackUrlFromParams(params) ??
      peekPendingAuthDeepLink() ??
      normalizeAuthDeepLink(incomingUrl)
    );
  }, [incomingUrl, params]);

  const handle = useCallback(
    async (url: string) => {
      if (handledRef.current) return;
      if (!tryBeginAuthCallback()) return;
      handledRef.current = true;
      try {
        const normalized = normalizeAuthDeepLink(url) ?? url;
        const { appUser, paymentRequestId } = await completeAuthSessionFromUrl(normalized);
        markAuthCallbackDone();
        await redirectAfterMagicLinkAuth(
          appUser,
          paymentRequestId,
          refreshUser,
          salons,
          setActiveSalon,
        );
      } catch (e) {
        const recovered = await recoverMagicLinkSession();
        if (recovered) {
          markAuthCallbackDone();
          await redirectAfterMagicLinkAuth(
            recovered.appUser,
            recovered.paymentRequestId,
            refreshUser,
            salons,
            setActiveSalon,
          );
          return;
        }

        releaseAuthCallback();
        const raw = e instanceof Error ? e.message : t('auth.magic.callbackError');
        const lower = raw.toLowerCase();
        if (lower.includes('invalid') || lower.includes('expired') || lower.includes('expir')) {
          setError(
            'Ce lien a déjà été utilisé ou a expiré. Demandez un nouveau lien (un seul clic), puis ouvrez-le dans Chrome si Gmail bloque l’app.',
          );
        } else {
          setError(raw);
        }
      }
    },
    [refreshUser, salons, setActiveSalon, t],
  );

  const tryStart = useCallback(
    (url: string | null) => {
      const normalized = url ? normalizeAuthDeepLink(url) : resolveAuthUrl();
      if (!normalized) return false;
      void handle(normalized);
      return true;
    },
    [handle, resolveAuthUrl],
  );

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const finish = (message: string) => {
      if (!cancelled && !handledRef.current) setError(message);
    };

    if (tryStart(resolveAuthUrl())) {
      return () => {
        cancelled = true;
      };
    }

    let attempts = 0;
    pollTimer = setInterval(() => {
      if (cancelled || handledRef.current) return;
      attempts += 1;
      void ExpoLinking.getInitialURL().then((url) => {
        if (tryStart(url ?? incomingUrl)) {
          if (pollTimer) clearInterval(pollTimer);
          if (timeout) clearTimeout(timeout);
        } else if (attempts >= POLL_ATTEMPTS) {
          if (pollTimer) clearInterval(pollTimer);
        }
      });
    }, POLL_MS);

    timeout = setTimeout(() => {
      if (pollTimer) clearInterval(pollTimer);
      finish(t('auth.magic.callbackTimeout'));
    }, CALLBACK_TIMEOUT_MS);

    const sub = ExpoLinking.addEventListener('url', ({ url }) => {
      if (tryStart(url)) {
        if (pollTimer) clearInterval(pollTimer);
        if (timeout) clearTimeout(timeout);
      }
    });

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (timeout) clearTimeout(timeout);
      sub.remove();
    };
  }, [incomingUrl, resolveAuthUrl, tryStart, t]);

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
