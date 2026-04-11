import { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import GoogleAuthService from '../services/googleAuth';
import useAuthStore from '../store/authStore';

interface UseGoogleAuthReturn {
  isInitialized: boolean;
  currentUser: FirebaseUser | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithGoogle, logout } = useAuthStore();

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = GoogleAuthService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await GoogleAuthService.signOut();
      logout();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la déconnexion';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isInitialized,
    currentUser,
    signInWithGoogle,
    signOut,
    isLoading,
    error
  };
};