import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ROUTES } from '../lib/routes';

interface AuthActionProps {
  /**
   * Fonction à exécuter si l'utilisateur est authentifié
   */
  onAuthenticated: () => void;
  
  /**
   * Fonction à exécuter si l'utilisateur n'est pas authentifié (optionnel)
   */
  onUnauthenticated?: () => void;
  
  /**
   * URL vers laquelle rediriger après authentification (optionnel)
   */
  redirectAfterAuth?: string;
  
  /**
   * Enfants du composant
   */
  children?: React.ReactNode;
}

/**
 * Hook personnalisé pour gérer les actions requérant l'authentification
 * 
 * @example
 * const { requireAuth } = useAuthAction();
 * 
 * const handleBookAppointment = useCallback(() => {
 *   if (!requireAuth(`/appointments?exhibitor=${id}`)) return;
 *   // Continuer avec la réservation
 * }, [requireAuth]);
 */
export function useAuthAction() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  /**
   * Requiert l'authentification avant une action
   * @returns true si authentifié, false et redirige vers login sinon
   */
  const requireAuth = useCallback((redirectUrl?: string): boolean => {
    if (isAuthenticated && user) {
      return true;
    }
    
    // Rediriger vers login avec URL de retour
    const loginUrl = redirectUrl 
      ? `${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectUrl)}`
      : ROUTES.LOGIN;
    navigate(loginUrl);
    return false;
  }, [isAuthenticated, user, navigate]);

  /**
   * Exécute une action si l'utilisateur est authentifié
   */
  const executeIfAuth = useCallback((callback: () => void, redirectUrl?: string): void => {
    if (requireAuth(redirectUrl)) {
      callback();
    }
  }, [requireAuth]);

  return {
    isAuthenticated,
    user,
    requireAuth,
    executeIfAuth,
    navigate
  };
}

/**
 * Composant wrapper pour les actions requérant l'authentification
 * 
 * @example
 * <AuthAction 
 *   onAuthenticated={() => bookAppointment()}
 *   redirectAfterAuth="/appointments"
 * >
 *   <Button>Prendre un RDV</Button>
 * </AuthAction>
 */
export const AuthAction: React.FC<AuthActionProps> = ({
  onAuthenticated,
  onUnauthenticated,
  redirectAfterAuth,
  children
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleClick = useCallback(() => {
    if (!isAuthenticated) {
      if (onUnauthenticated) {
        onUnauthenticated();
      } else {
        // Redirection par défaut vers login
        const loginUrl = redirectAfterAuth
          ? `${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectAfterAuth)}`
          : ROUTES.LOGIN;
        navigate(loginUrl);
      }
    } else {
      onAuthenticated();
    }
  }, [isAuthenticated, onAuthenticated, onUnauthenticated, navigate, redirectAfterAuth]);

  // Si children est un React.ReactElement (ex: Button), cloner avec notre onClick
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick
    } as any);
  }

  // Sinon, retourner un div wrapper
  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
};
