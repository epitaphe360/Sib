import * as Sentry from '@sentry/react';

export function initializeSentry() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration({
          tracePropagationTargets: ['localhost', /^https:\/\/.*\.vercel\.app/],
        }),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',

      beforeSend(event) {
        if (event.user?.email) {
          event.user.email = event.user.email.replace(/(.{2}).*(@.*)/, '$1***$2');
        }

        event.tags = {
          ...event.tags,
          deployment: 'vercel',
        };

        return event;
      },

      enabled: import.meta.env.PROD,
    });
  }
}

export function setUserContext(user: { id: string; email: string; type: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
    type: user.type,
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function trackError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    contexts: { custom: context },
  });
}

export function trackMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

export const SentryErrorBoundary = Sentry.ErrorBoundary;
