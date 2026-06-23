/**
 * Retry exponentiel pour les appels réseau instables (Wi-Fi salon).
 * Retente automatiquement jusqu'à `maxAttempts` fois en cas d'erreur réseau.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; baseDelayMs?: number; context?: string } = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 800, context = 'withRetry' } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isNetworkError =
        err instanceof Error &&
        (err.message.includes('network') ||
          err.message.includes('fetch') ||
          err.message.includes('timeout') ||
          err.message.toLowerCase().includes('connexion'));

      if (!isNetworkError || attempt === maxAttempts) throw err;

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn(`[${context}] attempt ${attempt} failed, retrying in ${delay}ms`, err);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
