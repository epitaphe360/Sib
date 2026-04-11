/**
 * Utilitaires pour améliorer la robustesse des appels API
 * - Timeout
 * - Retry logic avec exponential backoff
 * - Gestion d'erreurs
 */

/**
 * Wrapper pour ajouter un timeout à une Promise
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  timeoutError: string = 'Request timeout'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
  );

  return Promise.race([promise, timeout]);
}

/**
 * Options pour retry logic
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

/**
 * Vérifie si une erreur est retryable
 */
function isRetryableError(error: Error | { message?: string }, retryableErrors?: string[]): boolean {
  // Erreurs réseau toujours retryable
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return true;
  }

  // Timeouts retryable
  if (error.message?.includes('timeout')) {
    return true;
  }

  // Status codes 5xx retryable
  if (error.status && error.status >= 500 && error.status < 600) {
    return true;
  }

  // 429 Too Many Requests retryable
  if (error.status === 429) {
    return true;
  }

  // Custom retryable errors
  if (retryableErrors && retryableErrors.some(msg => error.message?.includes(msg))) {
    return true;
  }

  return false;
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry logic avec exponential backoff
 *
 * @param fn - La fonction à exécuter
 * @param options - Options de retry
 * @returns La valeur retournée par fn
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    retryableErrors
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Si c'est le dernier essai, throw
      if (attempt === maxRetries) {
        throw error;
      }

      // Vérifier si l'erreur est retryable
      if (!isRetryableError(error, retryableErrors)) {
        throw error;
      }

      // Calculer le délai avec exponential backoff
      const delayMs = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt),
        maxDelayMs
      );

      console.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delayMs}ms...`, error);
      await delay(delayMs);
    }
  }

  throw lastError;
}

/**
 * Combine timeout + retry
 */
export async function withTimeoutAndRetry<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 10000,
  retryOptions: RetryOptions = {},
  timeoutError: string = 'Request timeout'
): Promise<T> {
  return withRetry(
    () => withTimeout(fn(), timeoutMs, timeoutError),
    retryOptions
  );
}

/**
 * Rate limiter simple (pour éviter trop de requêtes)
 */
class RateLimiter {
  private queue: Array<() => void> = [];
  private running = 0;

  constructor(
    private maxConcurrent: number = 5,
    private minDelayMs: number = 100
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Attendre qu'un slot soit disponible
    while (this.running >= this.maxConcurrent) {
      await new Promise(resolve => this.queue.push(resolve));
    }

    this.running++;

    try {
      const result = await fn();
      await delay(this.minDelayMs); // Délai minimum entre requêtes
      return result;
    } finally {
      this.running--;

      // Libérer un slot
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }
}

// Instance globale du rate limiter
export const globalRateLimiter = new RateLimiter(5, 100);

/**
 * Wrapper pour appels API avec toutes les protections
 */
export async function robustAPICall<T>(
  fn: () => Promise<T>,
  options: {
    timeout?: number;
    retry?: RetryOptions;
    rateLimit?: boolean;
  } = {}
): Promise<T> {
  const {
    timeout = 10000,
    retry = { maxRetries: 3 },
    rateLimit = true
  } = options;

  const call = () => withTimeoutAndRetry(fn, timeout, retry);

  if (rateLimit) {
    return globalRateLimiter.execute(call);
  }

  return call();
}

export default {
  withTimeout,
  withRetry,
  withTimeoutAndRetry,
  robustAPICall,
  globalRateLimiter
};
