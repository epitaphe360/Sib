import { router } from 'expo-router';
import { useEffect } from 'react';
import { getHomePath } from '../navigation/roleConfig';
import { useAuth } from '../context/AuthContext';

/** Redirige l'utilisateur connecté vers son espace ; sinon visiteur public. */
export function useRoleRedirect(fallback: string = '/(visitor)') {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace(getHomePath(user.type) as never);
    } else {
      router.replace(fallback as never);
    }
  }, [user, isLoading, fallback]);
}
