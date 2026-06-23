import { router } from 'expo-router';
import { InteractionManager } from 'react-native';
import type { UserType } from '../types';
import { getHomePath } from '../navigation/roleConfig';

/**
 * Redirige vers l'écran d'accueil du rôle après connexion.
 * Réinitialise la pile pour éviter les erreurs lors d'un changement de compte (Admin → Visiteur, etc.).
 */
export function navigateAfterAuth(userType?: UserType | string | null): void {
  const path = getHomePath(userType);
  dismissAuthStackIfNeeded();

  InteractionManager.runAfterInteractions(() => {
    try {
      if (typeof router.canDismiss === 'function' && router.canDismiss()) {
        router.dismissAll();
      }
    } catch {
      // dismissAll indisponible sur certaines versions
    }
    router.replace(path as never);
  });
}

/** Ferme la pile auth/modal avant une navigation post-connexion. */
export function dismissAuthStackIfNeeded(): void {
  try {
    if (typeof router.canDismiss === 'function' && router.canDismiss()) {
      router.dismissAll();
    }
  } catch {
    // dismissAll indisponible sur certaines versions
  }
}
