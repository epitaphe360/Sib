/** Évite un écran de chargement infini si Supabase/réseau ne répond pas (APK terrain). */
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

export const AUTH_BOOT_TIMEOUT_MS = 10_000;
