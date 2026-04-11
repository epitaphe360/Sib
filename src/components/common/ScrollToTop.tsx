import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Composant utilitaire qui fait défiler la page vers le haut 
 * à chaque changement de navigation (route).
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Faire défiler vers le haut de la page (0,0) avec un comportement immédiat
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior // 'instant' est plus fiable pour la navigation
    });
  }, [pathname]);

  return null;
};
