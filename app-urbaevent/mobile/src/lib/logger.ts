/**
 * Logger utilitaire — no-op en production, actif en développement.
 * Remplace tous les console.warn/log directs pour éviter de logguer
 * des données sensibles dans les builds de release.
 */
const DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function log(level: LogLevel, context: string, ...args: unknown[]): void {
  if (!DEV) return;
  const prefix = `[${context}]`;
  switch (level) {
    case 'debug': console.debug(prefix, ...args); break;
    case 'info':  console.info(prefix, ...args);  break;
    case 'warn':  console.warn(prefix, ...args);  break;
    case 'error': console.error(prefix, ...args); break;
  }
}

export const logger = {
  debug: (ctx: string, ...args: unknown[]) => log('debug', ctx, ...args),
  info:  (ctx: string, ...args: unknown[]) => log('info',  ctx, ...args),
  warn:  (ctx: string, ...args: unknown[]) => log('warn',  ctx, ...args),
  error: (ctx: string, ...args: unknown[]) => log('error', ctx, ...args),
};
