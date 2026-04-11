import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ROUTES } from '../lib/routes';

/**
 * Hook pour gérer les redirections post-authentification
 * Redirige automatiquement vers la page demandée après une connexion réussie
 * 
 * @example
 * // Dans LoginPage
 * useAuthRedirect();
 * 
 * // Utilisateur connecté → redirigé vers /appointments?exhibitor=123
 * // Utilisateur non-connecté → redirigé vers /login
 */
export function useAuthRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Lire le paramètre redirect s'il existe
    const redirectUrl = searchParams.get('redirect');
    
    if (isAuthenticated && user && redirectUrl) {
      // Décode et navigue vers l'URL de redirection
      try {
        const decodedUrl = decodeURIComponent(redirectUrl);
        console.log('🔄 Redirection post-connexion vers:', decodedUrl);
        navigate(decodedUrl, { replace: true });
      } catch (e) {
        console.error('Erreur décodage URL de redirection:', e);
        // Redirection par défaut si l'URL est invalide
        const defaultRoute = user.type === 'exhibitor' 
          ? ROUTES.EXHIBITOR_DASHBOARD 
          : user.type === 'partner'
          ? ROUTES.PARTNER_DASHBOARD
          : user.type === 'admin'
          ? ROUTES.ADMIN_DASHBOARD
          : ROUTES.VISITOR_DASHBOARD;
        navigate(defaultRoute, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, searchParams]);
}

/**
 * Fonction utilitaire pour requérir l'authentification avant une action
 * @returns true si authentifié, false sinon
 * 
 * @example
 * if (!requireAuth(navigate)) return; // Redirige vers login si non-authentifié
 * // Continuer l'action
 */
export function requireAuth(navigate: ReturnType<typeof useNavigate>, targetUrl?: string): boolean {
  const { isAuthenticated, user } = useAuthStore.getState();
  
  if (!isAuthenticated || !user) {
    // Rediriger vers login avec URL de redirection
    const redirectParam = targetUrl 
      ? `?redirect=${encodeURIComponent(targetUrl)}`
      : '';
    navigate(`${ROUTES.LOGIN}${redirectParam}`);
    return false;
  }
  
  return true;
}

/**
 * Fonction pour obtenir l'URL de redirection post-connexion
 * @param userType - type d'utilisateur
 * @param targetUrl - URL cible optionnelle
 * @returns L'URL vers laquelle rediriger après connexion
 */
export function getPostLoginRedirectUrl(userType?: string, targetUrl?: string): string {
  if (targetUrl) return targetUrl;
  
  switch (userType) {
    case 'exhibitor':
      return ROUTES.EXHIBITOR_DASHBOARD;
    case 'partner':
      return ROUTES.PARTNER_DASHBOARD;
    case 'admin':
      return ROUTES.ADMIN_DASHBOARD;
    case 'visitor':
    default:
      return ROUTES.VISITOR_DASHBOARD;
  }
}
