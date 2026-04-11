import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import { SupabaseService } from '../services/supabaseService';

// ✅ CRITICAL: Flag pour indiquer si initializeAuth s'est complété
let authInitialized = false;

/**
 * Retourne true si initializeAuth s'est complété
 */
export function isAuthInitialized(): boolean {
  return authInitialized;
}

/**
 * Initialize auth state from Supabase session
 * Call this at app startup to restore user session
 */
export async function initializeAuth() {
  try {
    // ✅ CRITICAL: Set isLoading pendant l'initialisation
    useAuthStore.setState({ isLoading: true });

    // CRITICAL: Verifier et nettoyer le localStorage si donnees invalides
    const storedAuth = localStorage.getItem('sib-auth-storage');
    if (storedAuth) {
      try {
        // Vérifie que le JSON est valide
        JSON.parse(storedAuth);
      } catch (e) {
        console.error('[AUTH] localStorage corrompu, nettoyage...');
        localStorage.removeItem('sib-auth-storage');
      }
    }
    
    if (!supabase) {
      console.warn('[AUTH] Supabase non configure');
      authInitialized = true;
      useAuthStore.setState({ isLoading: false });
      return;
    }

    // Check if there is an active Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[AUTH] Erreur verification session:', error);
      // En cas erreur, nettoyer le store pour eviter les sessions fantomes
      if (useAuthStore.getState().isAuthenticated) {
        console.warn('[AUTH] Erreur session Supabase, nettoyage du store...');
        useAuthStore.getState().logout();
      }
      authInitialized = true;
      useAuthStore.setState({ isLoading: false });
      return;
    }

    if (!session?.user) {
      // No active session
      // CRITICAL FIX: If store thinks we are logged in, but Supabase says no, we must logout
      // This prevents ghost sessions where localStorage has data but the token is invalid
      // EXCEPTION: Don't logout if user was just created (within last 5 seconds)
      const storedUser = useAuthStore.getState().user;
      const createdAtDate = storedUser?.createdAt ? new Date(storedUser.createdAt) : null;
      const createdAt = createdAtDate && !isNaN(createdAtDate.getTime()) ? createdAtDate.getTime() : 0;
      const now = Date.now();
      const wasJustCreated = (now - createdAt) < 5000; // Within 5 seconds
      
      if (useAuthStore.getState().isAuthenticated && !wasJustCreated) {
        console.warn('[AUTH] Session invalide ou expiree detectee au demarrage, nettoyage du store...');
        useAuthStore.getState().logout();
      } else if (wasJustCreated) {
        console.log('[AUTH] Utilisateur récemment créé, pas de déconnexion');
      }
      console.log('[AUTH] Aucune session active');
      authInitialized = true;
      useAuthStore.setState({ isLoading: false });
      return;
    }

    // Get full user profile from database
    if (!session.user.email) {
      console.warn('[AUTH] Session sans email, impossible de récupérer le profil');
      authInitialized = true;
      useAuthStore.setState({ isLoading: false });
      return;
    }
    
    const userProfile = await SupabaseService.getUserByEmail(session.user.email);

    if (userProfile) {
      // CRITICAL: Verification supplementaire pour les admins
      if (userProfile.type === 'admin') {
        // Verifier que utilisateur est reellement admin dans la DB
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('type, email')
          .eq('id', userProfile.id)
          .single();
          
        if (dbError || !dbUser || (dbUser as any).type !== 'admin') {
          console.error('[AUTH] Tentative de connexion admin non autorisee!');
          useAuthStore.getState().logout();
          authInitialized = true;
          useAuthStore.setState({ isLoading: false });
          return;
        }
      }
      
      // Restore auth state in store
      console.log('✅ [AUTH] Utilisateur restauré:', userProfile.name);
      useAuthStore.setState({
        user: userProfile,
        token: userProfile.id,
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      console.warn('[AUTH] Profil utilisateur introuvable, deconnexion...');
      useAuthStore.getState().logout();
    }
    
    authInitialized = true;
  } catch (error) {
    console.error('[AUTH] Erreur initialisation auth:', error);
    // En cas erreur fatale, nettoyer le store
    useAuthStore.getState().logout();
    authInitialized = true;
    useAuthStore.setState({ isLoading: false });
  }
}
