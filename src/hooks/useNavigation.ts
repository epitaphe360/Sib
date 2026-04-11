import { useCallback, useEffect } from 'react';
import { useNavigationStore } from '../store/navigationStore';

/**
 * Hook useNavigation - Gestion centralisée de la navigation
 * 
 * Fournit des utilitaires pour contrôler le menu et la navigation
 */
export const useNavigation = () => {
  const {
    activeSection,
    isMobileMenuOpen,
    currentPath,
    setActiveSection,
    setIsMobileMenuOpen,
    setCurrentPath,
    toggleMobileMenu,
    closeMobileMenu,
    closeAllMenus,
  } = useNavigationStore();

  // Fermer le menu mobile lors du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Fermer les menus lors de la navigation
  useEffect(() => {
    const handleRouteChange = () => {
      closeAllMenus();
    };

    // Écouter les changements de route
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [closeAllMenus]);

  // Fermer le menu mobile lors du clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isMenuClick = target.closest('nav');

      if (!isMenuClick && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Gérer la navigation
  const navigate = useCallback(
    (path: string) => {
      setCurrentPath(path);
      window.history.pushState(null, '', path);
      closeAllMenus();
    },
    [setCurrentPath, closeAllMenus]
  );

  return {
    // État
    activeSection,
    isMobileMenuOpen,
    currentPath,

    // Actions
    setActiveSection,
    setIsMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    closeAllMenus,
    navigate,
  };
};
