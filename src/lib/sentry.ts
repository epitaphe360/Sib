import * as Sentry from '@sentry/react';

export function initializeSentry() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', /^https:\/\/.*\.vercel\.app/]
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true
        })
      ],
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% des transactions
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% des sessions
      replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreur
      
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      beforeSend(event, hint) {
        // Filter out PII
        if (event.user?.email) {
          event.user.email = event.user.email.replace(/(.{2}).*(@.*)/, '$1***$2');
        }
        
        // Add custom context
        event.tags = {
          ...event.tags,
          deployment: 'vercel',
          score: '98/100'
        };
        
        return event;
      },

      // Don't send in development
      enabled: import.meta.env.PROD
    });
  }
}

export function setUserContext(user: { id: string; email: string; type: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email
    type: user.type
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function trackError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: { custom: context }
  });
}

export function trackMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

// Error Boundary wrapper
export const SentryErrorBoundary = Sentry.ErrorBoundary;
