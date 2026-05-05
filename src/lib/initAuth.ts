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
async function verifyAdminProfile(userProfile: Awaited<ReturnType<typeof SupabaseService.getUserByEmail>>) {
  if (userProfile?.type !== 'admin') { return true; }
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('type, email')
    .eq('id', userProfile.id)
    .single();
  if (dbError || !dbUser || (dbUser as any).type !== 'admin') {
    console.error('[AUTH] Tentative de connexion admin non autorisee!');
    return false;
  }
  return true;
}

function cleanupCorruptedStorage() {
  const storedAuth = localStorage.getItem('sib-auth-storage');
  if (!storedAuth) { return; }
  try {
    JSON.parse(storedAuth);
  } catch {
    console.error('[AUTH] localStorage corrompu, nettoyage...');
    localStorage.removeItem('sib-auth-storage');
  }
}

function handleNoActiveSession() {
  const storedUser = useAuthStore.getState().user;
  const createdAtDate = storedUser?.createdAt ? new Date(storedUser.createdAt) : null;
  const createdAt = createdAtDate && !Number.isNaN(createdAtDate.getTime()) ? createdAtDate.getTime() : 0;
  const wasJustCreated = (Date.now() - createdAt) < 5000;
  if (useAuthStore.getState().isAuthenticated && !wasJustCreated) {
    console.warn('[AUTH] Session invalide ou expiree detectee au demarrage, nettoyage du store...');
    useAuthStore.getState().logout();
  }
}

async function restoreUserProfile(email: string) {
  const userProfile = await SupabaseService.getUserByEmail(email);
  if (!userProfile) {
    console.warn('[AUTH] Profil utilisateur introuvable, deconnexion...');
    useAuthStore.getState().logout();
    return;
  }
  const adminOk = await verifyAdminProfile(userProfile);
  if (!adminOk) {
    useAuthStore.getState().logout();
    return;
  }
  useAuthStore.setState({
    user: userProfile,
    token: userProfile.id,
    isAuthenticated: true,
    isLoading: false
  });
}

export async function initializeAuth() {
  try {
    useAuthStore.setState({ isLoading: true });
    cleanupCorruptedStorage();

    if (!supabase) {
      console.warn('[AUTH] Supabase non configure');
      authInitialized = true;
      useAuthStore.setState({ isLoading: false });
      return;
    }

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[AUTH] Erreur verification session:', error);
      if (useAuthStore.getState().isAuthenticated) {
        console.warn('[AUTH] Erreur session Supabase, nettoyage du store...');
        useAuthStore.getState().logout();
      }
      authInitialized = true;
      useAuthStore.setState({ isLoading: false });
      return;
    }

    if (!session?.user?.email) {
      handleNoActiveSession();
      authInitialized = true;
      useAuthStore.setState({ isLoading: false });
      return;
    }

    await restoreUserProfile(session.user.email);
    authInitialized = true;
  } catch (error) {
    console.error('[AUTH] Erreur initialisation auth:', error);
    useAuthStore.getState().logout();
    authInitialized = true;
    useAuthStore.setState({ isLoading: false });
  }
}
