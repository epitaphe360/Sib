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
 * Efface les clés de session Supabase du localStorage pour forcer une nouvelle connexion.
 */
function clearInvalidSession() {
  try {
    const prefix = 'sb-sbyizudifmqakzxjlndr-auth-token';
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix) || k === 'sib-auth-storage')
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
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
    useAuthStore.getState().logout();
  }
}

async function restoreUserProfile(email: string) {
  const userProfile = await SupabaseService.getUserByEmail(email);
  if (!userProfile) {
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
      authInitialized = true;
      useAuthStore.setState({ isLoading: false });
      return;
    }

    // ✅ Écouter les événements Supabase — notamment SIGNED_OUT déclenché automatiquement
    // quand le SDK détecte un refresh token invalide (évite l'erreur console non capturée)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // Le SDK a invalidé la session (refresh token expiré/révoqué)
        // Nettoyer le store React sans appeler supabase.auth.signOut() à nouveau
        useAuthStore.setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        clearInvalidSession();
      }
    });

    const { data: { session }, error } = await supabase.auth.getSession();

    // Une fois la session vérifiée, on n'a plus besoin du listener temporaire
    subscription.unsubscribe();

    if (error) {
      const msg = (error as { message?: string }).message ?? '';
      const isTokenError =
        msg.includes('Refresh Token') ||
        msg.includes('refresh_token') ||
        msg.includes('Invalid') ||
        (error as { status?: number }).status === 400;

      if (isTokenError) {
        // Token invalide côté serveur — nettoyer silencieusement
        clearInvalidSession();
        useAuthStore.getState().logout();
      } else {
        console.error('[AUTH] Erreur verification session:', error);
        if (useAuthStore.getState().isAuthenticated) {
          useAuthStore.getState().logout();
        }
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
    clearInvalidSession();
    useAuthStore.getState().logout();
    authInitialized = true;
    useAuthStore.setState({ isLoading: false });
  }
}
