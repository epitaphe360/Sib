import { router } from 'expo-router';
import { Alert, InteractionManager } from 'react-native';
import type { AppUser } from '../types';

/** Navigation cross-stack sans page blanche Android (dismiss + push/replace). */
export function navigateSafe(path: string, method: 'push' | 'replace' = 'push'): void {
  const go = () => {
    if (method === 'replace') router.replace(path as never);
    else router.push(path as never);
  };

  try {
    if (typeof router.canDismiss === 'function' && router.canDismiss()) {
      router.dismissAll();
      InteractionManager.runAfterInteractions(go);
      return;
    }
  } catch {
    // dismissAll indisponible sur certaines versions
  }
  go();
}

/** Redirige vers login si non connecté ; retourne false pour stopper l'action. */
export function requireAuth(user: AppUser | null, t: (key: string) => string): user is AppUser {
  if (user) return true;
  Alert.alert(t('login.title'), t('auth.emailRequired'), [
    { text: t('login.submit'), onPress: () => router.push('/(auth)/login') },
    { text: t('common.cancel'), style: 'cancel' },
  ]);
  return false;
}

/** Exécute une fonction async avec Alert en cas d'erreur. */
export async function withErrorAlert(
  fn: () => Promise<void>,
  t: (key: string) => string,
  fallbackKey = 'common.error'
): Promise<void> {
  try {
    await fn();
  } catch (e) {
    Alert.alert(t('common.error'), e instanceof Error ? e.message : t(fallbackKey));
  }
}
