// Sentry is optional - only import if available
let Sentry: any = null;
try {
  // Dynamic import to avoid build errors if @sentry/react is not installed
  if (import.meta.env.VITE_SENTRY_DSN) {
    import('@sentry/react').then(module => {
      Sentry = module;
    }).catch(() => {
      console.warn('Sentry not available - logging will continue without it');
    });
  }
} catch {
  // Sentry not available, continue without it
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

interface LogContext {
  userId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();

    // Console log in development
    if (this.isDevelopment) {
      const color = {
        debug: '#9CA3AF',
        info: '#3B82F6',
        warn: '#F59E0B',
        error: '#EF4444'
      }[level];

      const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      console.log(`%c${logMessage}`, `color: ${color}`, context || '');
    }

    // Send to Sentry in production (if available)
    if (!this.isDevelopment && Sentry && import.meta.env.VITE_SENTRY_DSN) {
      if (level === LogLevel.ERROR) {
        Sentry.captureException(new Error(message), {
          contexts: { custom: context }
        });
      } else if (level === LogLevel.WARN) {
        Sentry.captureMessage(message, {
          level: 'warning',
          contexts: { custom: context }
        });
      }
    }
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, {
      ...context,
      error: error?.message,
      stack: error?.stack
    });
  }

  // Business actions logging
  logUserAction(action: string, userId: string, metadata?: Record<string, any>) {
    this.info(`User action: ${action}`, {
      userId,
      action,
      metadata
    });
  }

  logApiCall(endpoint: string, method: string, duration: number, status: number) {
    this.info(`API call: ${method} ${endpoint}`, {
      action: 'api_call',
      metadata: { endpoint, method, duration, status }
    });
  }
}

export const logger = new Logger();
