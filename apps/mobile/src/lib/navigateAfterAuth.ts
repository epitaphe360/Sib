import { router } from 'expo-router';
import { InteractionManager } from 'react-native';
import type { AppUser, UserType } from '../types';
import { getHomePath, getHomePathForUser } from '../navigation/roleConfig';

/**
 * Redirige vers l'écran d'accueil du rôle après connexion.
 */
export function navigateAfterAuth(userOrType?: UserType | string | AppUser | null): void {
  const path =
    userOrType && typeof userOrType === 'object' && 'type' in userOrType
      ? getHomePathForUser(userOrType)
      : getHomePath(userOrType as string | null | undefined);
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
