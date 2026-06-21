/** Sentry optionnel — activer avec EXPO_PUBLIC_SENTRY_DSN */
let initialized = false;

export function initSentry(): void {
  if (initialized || !process.env.EXPO_PUBLIC_SENTRY_DSN) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/react-native');
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.2,
      enableNative: true,
    });
    initialized = true;
  } catch {
    /* @sentry/react-native non installé — ignoré */
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!initialized) return;
  try {
    const Sentry = require('@sentry/react-native');
    Sentry.captureException(error, { extra: context });
  } catch {
    /* noop */
  }
}
