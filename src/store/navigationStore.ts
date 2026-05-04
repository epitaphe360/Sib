import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface NavigationState {
  // État
  activeSection: string | null;
  isMobileMenuOpen: boolean;
  currentPath: string;

  // Actions
  setActiveSection: (sectionId: string | null) => void;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  setCurrentPath: (path: string) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  closeAllMenus: () => void;
}

/**
 * Store de navigation - Gestion centralisée de l'état de navigation
 *
 * Utilise Zustand pour une gestion d'état légère et performante
 * Persist middleware pour sauvegarder l'état dans localStorage
 */
export const useNavigationStore = create<NavigationState>()(
  devtools(
    persist(
      (set) => ({
        // État initial
        activeSection: null,
        isMobileMenuOpen: false,
        currentPath: '/',

        // Actions
        setActiveSection: (sectionId) =>
          set({ activeSection: sectionId }, false, 'setActiveSection'),

        setIsMobileMenuOpen: (isOpen) =>
          set({ isMobileMenuOpen: isOpen }, false, 'setIsMobileMenuOpen'),

        setCurrentPath: (path) =>
          set({ currentPath: path }, false, 'setCurrentPath'),

        toggleMobileMenu: () =>
          set(
            (state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }),
            false,
            'toggleMobileMenu'
          ),

        closeMobileMenu: () =>
          set({ isMobileMenuOpen: false }, false, 'closeMobileMenu'),

        closeAllMenus: () =>
          set(
            { activeSection: null, isMobileMenuOpen: false },
            false,
            'closeAllMenus'
          ),
      }),
      {
        name: 'navigation-store',
        version: 1,
      }
    ),
    {
      name: 'NavigationStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
