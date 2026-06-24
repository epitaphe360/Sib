import { router } from 'expo-router';
import { useEffect } from 'react';
import { navigateAfterAuth } from '../lib/navigateAfterAuth';
import { useAuth } from '../context/AuthContext';

/** Redirige l'utilisateur connecté vers son espace ; sinon visiteur public. */
export function useRoleRedirect(fallback: string = '/(visitor)/(tabs)') {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      navigateAfterAuth(user.type);
    } else {
      router.replace(fallback as never);
    }
  }, [user, isLoading, fallback]);
}
