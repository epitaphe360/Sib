/**
 * Logger centralisé pour l'application sib v3
 *
 * SÉCURITÉ: En production, les logs sensibles sont désactivés
 * pour éviter les fuites d'informations (IDs utilisateurs, tokens, etc.)
 *
 * Usage:
 * - logger.log() : Logs de debug (uniquement en dev)
 * - logger.warn() : Warnings (uniquement en dev)
 * - logger.error() : Erreurs (toujours, mais sans détails sensibles)
 * - logger.info() : Informations générales (toujours)
 */

const isDevelopment = import.meta.env.DEV;

type LogLevel = 'log' | 'warn' | 'error' | 'info';

interface LogContext {
  userId?: string;
  action?: string;
  component?: string;
  [key: string]: any;
}

class Logger {
  /**
   * Log de debug - uniquement en développement
   */
  log(...args: any[]): void {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Warning - uniquement en développement
   */
  warn(...args: any[]): void {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  /**
   * Erreur - toujours logué mais sans détails sensibles en production
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (isDevelopment) {
      console.error(message, error, context);
    } else {
      // En production, logger seulement le message sans détails
      console.error(message);

      // TODO: Envoyer à un service de monitoring (Sentry, LogRocket, etc.)
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, { extra: context });
      // }
    }
  }

  /**
   * Information générale - toujours loguée
   */
  info(message: string, context?: LogContext): void {
    if (isDevelopment) {
      console.info(message, context);
    } else {
      console.info(message);
    }
  }

  /**
   * Log de succès avec emoji - uniquement en développement
   */
  success(message: string, context?: LogContext): void {
    if (isDevelopment) {
      console.log(`✅ ${message}`, context);
    }
  }

  /**
   * Log de performance - mesure le temps d'exécution
   */
  time(label: string): void {
    if (isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }

  /**
   * Groupe de logs - uniquement en développement
   */
  group(label: string): void {
    if (isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Table - affichage tabulaire en dev
   */
  table(data: any): void {
    if (isDevelopment) {
      console.table(data);
    }
  }
}

// Export singleton
export const logger = new Logger();

// Export par défaut
export default logger;
