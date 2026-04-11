import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SupabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import OAuthService from '../services/oauthService';
import { User, UserProfile } from '../types';
import { resetAllStores } from './resetStores';
import { secureStorage } from '../lib/secureStorage';
import { loginRateLimiter, passwordResetRateLimiter } from '../utils/rateLimiter';
import logger from '../utils/logger';

/**
 * Interface pour les données d'inscription
 */
interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType?: 'admin' | 'exhibitor' | 'partner' | 'visitor' | 'security';
  companyName?: string;
  position?: string;
  country?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  description?: string;
  objectives?: string[];
  [key: string]: unknown; // Pour les champs additionnels
}

interface SignUpPayload {
  name: string;
  type: User['type'];
  profile: Partial<UserProfile>;
  visitor_level?: 'free' | 'premium' | 'vip';
}

interface OAuthError extends Error {
  message: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGoogleLoading: boolean;
  isLinkedInLoading: boolean;

  // Actions
  login: (email: string, password: string, options?: { rememberMe?: boolean }) => Promise<void>;
  signUp: (credentials: { email: string, password: string }, profileData: Partial<UserProfile>) => Promise<{ error: Error | null; user?: User | null }>;
  register: (userData: RegistrationData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithLinkedIn: () => Promise<void>;
  handleOAuthCallback: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;

  // SECURITY: Session timeout management
  checkSessionTimeout: () => boolean;
  updateActivity: () => void;
}

// Helper: profile minimal par défaut pour satisfaire l'interface UserProfile
const minimalUserProfile = (overrides: Partial<User['profile']> = {}): User['profile'] => ({
  firstName: overrides.firstName ?? '',
  lastName: overrides.lastName ?? '',
  avatar: overrides.avatar,
  company: overrides.company ?? '',
  position: overrides.position ?? '',
  country: overrides.country ?? '',
  phone: overrides.phone,
  linkedin: overrides.linkedin,
  website: overrides.website,
  bio: overrides.bio ?? '',
  standArea: overrides.standArea ?? 9, // Défaut à 9m² pour les nouveaux exposants
  interests: overrides.interests ?? [],
  objectives: overrides.objectives ?? [],
  companyDescription: overrides.companyDescription,
  sectors: overrides.sectors ?? [],
  products: overrides.products ?? [],
  videos: overrides.videos ?? [],
  images: overrides.images ?? [],
  participationObjectives: overrides.participationObjectives ?? [],
  thematicInterests: overrides.thematicInterests ?? [],
  companySize: overrides.companySize,
  geographicLocation: overrides.geographicLocation,
  collaborationTypes: overrides.collaborationTypes ?? [],
  expertise: overrides.expertise ?? [],
  visitObjectives: overrides.visitObjectives ?? [],
  competencies: overrides.competencies ?? []
});

// Production authentication only via Supabase

// SECURITY: Session timeout configuration
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
let sessionTimeoutId: ReturnType<typeof setTimeout> | null = null;

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // ✅ CRITICAL: Commence à true pour initialiser l'auth
  isGoogleLoading: false,
  isLinkedInLoading: false,
  
  login: async (email: string, password: string, options?: { rememberMe?: boolean }) => {
    set({ isLoading: true });

    try {
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }

      // 🔐 SÉCURITÉ: Vérifier le rate limiting
      const rateLimitCheck = await loginRateLimiter.isAllowed(email);
      if (!rateLimitCheck.allowed) {
        const retryMinutes = Math.ceil((rateLimitCheck.retryAfter || 0) / 60);
        logger.warn('Rate limit atteint pour:', email);
        throw new Error(
          `Trop de tentatives de connexion. Veuillez réessayer dans ${retryMinutes} minute(s).`
        );
      }

      // ✅ Passer l'option rememberMe à signIn
      const user = await SupabaseService.signIn(email, password, options);

      if (!user) {
        // 🔐 Enregistrer l'échec de connexion
        loginRateLimiter.recordFailure(email);
        throw new Error('Email ou mot de passe incorrect');
      }

      // ✅ Permettre la connexion avec pending_payment (accès limité au dashboard)
      // Bloquer uniquement les status: 'pending', 'rejected', 'suspended'
      if (user.status && !['active', 'pending_payment'].includes(user.status)) {
        throw new Error('Votre compte est en attente de validation');
      }

      // 🔐 Connexion réussie - reset le rate limiter
      loginRateLimiter.recordSuccess(email);
      logger.success('Connexion réussie', { userId: user.id, type: user.type });

      set({
        user,
        token: user.id,
        isAuthenticated: true,
        isLoading: false
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      logger.error('Erreur de connexion', error);
      set({ isLoading: false });
      throw new Error(errorMessage);
    }
  },

  signUp: async (credentials, profileData) => {
    try {

      // Valider les données
      if (!credentials.email || !credentials.password) {
        throw new Error('Email et mot de passe requis');
      }

      if (credentials.password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      // Créer l'utilisateur via SupabaseService
      const newUser = await SupabaseService.signUp(
        credentials.email,
        credentials.password,
        {
          name: profileData.firstName && profileData.lastName
            ? `${profileData.firstName} ${profileData.lastName}`.trim()
            : profileData.name || '',
          type: profileData.role || 'visitor',
          // ✅ Status selon le type: partner/exhibitor → pending_payment, visitor → active
          status: (profileData.role === 'partner' || profileData.role === 'exhibitor') 
            ? 'pending_payment' 
            : profileData.status || 'active',
          profile: {
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            company: profileData.company || '',
            position: profileData.position || '',
            phone: profileData.phone || '',
            ...profileData
          }
        }
      );

      if (!newUser) {
        throw new Error('Échec de la création de l\'utilisateur');
      }


      // Créer demande d'inscription pour exposants et partenaires
      if (profileData.role === 'exhibitor' || profileData.role === 'partner') {

        // ✅ Ne pas bloquer l'inscription si la création de demande échoue (erreur RLS possible)
        try {
          await SupabaseService.createRegistrationRequest({
            userType: profileData.role,
            email: credentials.email,
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            companyName: profileData.companyName || profileData.company || '',
            phone: profileData.phone || '',
            profileData: profileData
          });
        } catch (regRequestError) {
          console.warn('⚠️ Erreur création demande inscription (non bloquante):', regRequestError);
          // Ne pas bloquer l'inscription - le compte est déjà créé
        }

        // Envoyer email de notification
        try {
          await SupabaseService.sendRegistrationEmail({
            to: credentials.email,
            name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
            userType: profileData.role
          });
        } catch (emailError) {
          console.warn('⚠️ Erreur envoi email:', emailError);
          // Ne pas bloquer l'inscription si l'email échoue
        }
      }

      return { error: null, user: newUser };
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      return { error: error as Error, user: null };
    }
  },

  register: async (userData: RegistrationData) => {
    set({ isLoading: true });

    try {
      // Validation des données requises
      if (!userData.email || !userData.firstName || !userData.lastName || !userData.password) {
        throw new Error('Email, prénom, nom et mot de passe sont requis');
      }


      const userType = (['admin','exhibitor','partner','visitor','security'].includes(userData.accountType ?? '') ? userData.accountType! : 'visitor') as User['type'];

      // Préparer les données utilisateur avec le niveau visiteur par défaut (FREE)
      const signUpData: SignUpPayload = {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        type: userType,
        profile: minimalUserProfile({
          firstName: userData.firstName,
          lastName: userData.lastName,
          company: userData.companyName ?? '',
          position: userData.position ?? '',
          country: userData.country ?? '',
          phone: userData.phone,
          linkedin: userData.linkedin,
          website: userData.website,
          bio: userData.description ?? '',
          objectives: userData.objectives ?? []
        })
      };

      // ✅ Ajouter le niveau visiteur (par défaut 'free' pour les nouveaux visiteurs)
      if (userType === 'visitor') {
        signUpData.visitor_level = 'free';
      }

      // Appeler la fonction signUp de SupabaseService qui gère Auth + profil
      const newUser = await SupabaseService.signUp(
        userData.email,
        userData.password,
        signUpData
      );

      if (!newUser) {
        throw new Error('Échec de la création de l\'utilisateur');
      }

      // ✅ Mettre à jour l'utilisateur dans le store pour les visiteurs (auto-login)
      if (userType === 'visitor') {
        set({ 
          user: newUser, 
          isAuthenticated: true,
          isLoading: false 
        });
      }

      // Créer une demande d'inscription pour exposants et partenaires
      if (userType === 'exhibitor' || userType === 'partner') {
        await SupabaseService.createRegistrationRequest({
          userType: userType,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          companyName: userData.companyName ?? '',
          position: userData.position ?? '',
          phone: userData.phone ?? '',
          profileData: userData
        });

        // Envoyer l'email de confirmation (ne pas bloquer si échec)
        try {
          await SupabaseService.sendRegistrationEmail({
            userType: userType as 'exhibitor' | 'partner',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            companyName: userData.companyName ?? ''
          });
          console.log('✅ Email de confirmation envoyé');
        } catch (emailError) {
          // L'email a échoué mais l'inscription est valide
          console.warn('⚠️ Impossible d\'envoyer l\'email de confirmation:', emailError);
          // Ne pas bloquer l'inscription
        }

      }

      set({ isLoading: false });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      console.error('❌ Erreur lors de l\'inscription:', error);
      set({ isLoading: false });
      throw new Error(errorMessage);
    }
  },

  loginWithGoogle: async () => {
    set({ isGoogleLoading: true });

    try {

      // Initiate OAuth flow - this will redirect the user
      await OAuthService.signInWithGoogle();

      // Note: The OAuth flow redirects, so code after this may not execute
      // The actual login completion happens after OAuth callback

    } catch (error: unknown) {
      const oauthError = error as OAuthError;
      console.error('❌ Google OAuth error:', error);
      set({ isGoogleLoading: false });
      throw new Error(oauthError.message || 'Erreur lors de la connexion avec Google');
    }
  },

  loginWithLinkedIn: async () => {
    set({ isLinkedInLoading: true });

    try {

      // Initiate OAuth flow - this will redirect the user
      await OAuthService.signInWithLinkedIn();

      // Note: The OAuth flow redirects, so code after this may not execute
      // The actual login completion happens after OAuth callback

    } catch (error: unknown) {
      const oauthError = error as OAuthError;
      console.error('❌ LinkedIn OAuth error:', error);
      set({ isLinkedInLoading: false });
      throw new Error(oauthError.message || 'Erreur lors de la connexion avec LinkedIn');
    }
  },

  handleOAuthCallback: async () => {
    set({ isLoading: true });

    try {

      // Get user from OAuth session
      const user = await OAuthService.handleOAuthCallback();

      if (!user) {
        throw new Error('Impossible de récupérer les informations utilisateur après OAuth');
      }

      // Get session for token
      const session = await OAuthService.getCurrentSession();

      if (!session) {
        throw new Error('Impossible de récupérer la session OAuth');
      }


      set({
        user,
        token: session.access_token,
        isAuthenticated: true,
        isLoading: false,
        isGoogleLoading: false,
        isLinkedInLoading: false
      });

    } catch (error: unknown) {
      console.error('❌ Error handling OAuth callback:', error);
      set({
        isLoading: false,
        isGoogleLoading: false,
        isLinkedInLoading: false
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      console.log('✅ Déconnexion Supabase réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion Supabase:', error);
    }

    // CRITIQUE: Nettoyer TOUS les stores avant de déconnecter
    // Empêche les fuites de données sur ordinateurs partagés
    resetAllStores();
    
    // CRITICAL: Nettoyage complet du localStorage et sessionStorage
    try {
      localStorage.removeItem('sib-auth-storage');
      localStorage.removeItem('sb-sbyizudifmqakzxjlndr-auth-token');
      sessionStorage.clear();
      console.log('✅ LocalStorage et sessionStorage nettoyés');
    } catch (error) {
      console.error('❌ Erreur nettoyage storage:', error);
    }

    // Ensuite, réinitialiser authStore
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isGoogleLoading: false,
      isLinkedInLoading: false
    });
  },
  
  setUser: (user) => set({ 
    user,
    isAuthenticated: !!user, // ✅ CRITICAL: Also update isAuthenticated when setting user
    token: user ? 'local-session' : null // ✅ Set a token to mark authenticated state
  }),

  updateProfile: async (profileData: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) throw new Error('Utilisateur non connecté');

    set({ isLoading: true });

    try {
      console.log('🔄 Début mise à jour profil pour:', user.id);
      console.log('📊 Données à fusionner:', Object.keys(profileData));
      
      // ✅ Fusionner les données de manière robuste
      const mergedProfile = {
        ...user.profile,
        ...profileData
      };

      console.log('✅ Profil fusionné, envoi vers Supabase...');

      // ✅ Envoyer la mise à jour vers Supabase
      const updatedUser = await SupabaseService.updateUser(user.id, {
        ...user,
        profile: mergedProfile
      });

      if (!updatedUser) {
        throw new Error('Impossible de mettre à jour le profil - réponse vide du serveur');
      }

      // ✅ Mettre à jour le store avec les données mises à jour
      set({ user: updatedUser, isLoading: false });

      // ✅ Vérifier que les données sont bien sauvegardées
      console.log('✅ Profil mis à jour avec succès:', {
        userId: user.id,
        sectors: updatedUser.profile.sectors?.length || 0,
        interests: updatedUser.profile.interests?.length || 0,
        objectives: updatedUser.profile.objectives?.length || 0,
        bio: updatedUser.profile.bio?.substring(0, 50) || 'vide'
      });
    } catch (error: unknown) {
      set({ isLoading: false });
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Erreur mise à jour profil pour', user.id, ':', errorMsg);
      
      // ✅ Ajouter des détails sur l'erreur
      if (errorMsg.includes('RLS') || errorMsg.includes('PGRST116')) {
        console.error('🔒 PROBLÈME RLS DÉTECTÉ - Vérifiez les politiques de sécurité en base de données');
      }

      throw error instanceof Error ? error : new Error('Erreur lors de la mise à jour du profil');
    }
  },

  // SECURITY: Check if session has timed out due to inactivity
  checkSessionTimeout: () => {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > SESSION_TIMEOUT_MS) {
        console.log('[Auth] Session timeout - logging out due to inactivity');
        get().logout();
        return false;
      }
    }
    return true;
  },

  // SECURITY: Update last activity timestamp and reset timeout timer
  updateActivity: () => {
    const state = get();

    // Only track activity if user is authenticated
    if (!state.isAuthenticated) {
      return;
    }

    // Update last activity timestamp
    localStorage.setItem('lastActivity', Date.now().toString());

    // Clear existing timeout
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
    }

    // Set new timeout
    sessionTimeoutId = setTimeout(() => {
      console.log('[Auth] Session expired due to inactivity');
      get().logout();
    }, SESSION_TIMEOUT_MS);
  }
}),
    {
      name: 'sib-auth-storage', // Storage key (localStorage or IndexedDB)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
        // Ne PAS persister les états de loading
      }),
      // ✅ CUSTOM STORAGE: Use secureStorage with localStorage + IndexedDB fallback
      storage: {
        getItem: async (name) => {
          const stored = await secureStorage.getItem(name);
          return stored ? JSON.parse(stored) : null;
        },
        setItem: async (name, value) => {
          await secureStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await secureStorage.removeItem(name);
        }
      },
      // CRITICAL FIX: Validation au chargement du store depuis localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.user?.type === 'admin' && state?.isAuthenticated) {
          // SECURITY: Si un admin est détecté dans storage, on marque pour vérification
          // La vérification complète sera faite par initAuth.ts avec Supabase
          // CRITICAL: Ne pas faire confiance au storage pour les admins
          // Forcer une vérification Supabase via initAuth
          // On ne déconnecte pas immédiatement car initAuth le fera si invalide
        }

        // ✅ CRITICAL FIX: Ne PAS mettre isLoading à false ici!
        // Laisser initAuth.ts gérer la fin du chargement
        // Cela garantit que le Header affichera un loader pendant l'initialisation
        // au lieu d'afficher "Se connecter" prématurément
      }
    }
  )
);

// SECURITY: Nettoyage préventif du localStorage si détection de données corrompues
(function cleanupCorruptedAuth() {
  try {
    const stored = localStorage.getItem('sib-auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Si isAuthenticated est true mais pas d'user, c'est corrompu
      if (parsed?.state?.isAuthenticated && !parsed?.state?.user?.id) {
        console.error('❌ Données auth corrompues détectées, nettoyage...');
        localStorage.removeItem('sib-auth-storage');
      }
      // Si user.type est admin mais pas de token valide
      if (parsed?.state?.user?.type === 'admin' && !parsed?.state?.token) {
        console.error('❌ Session admin sans token détectée, nettoyage...');
        localStorage.removeItem('sib-auth-storage');
      }
    }
  } catch (e) {
    // Ignore les erreurs de parsing
  }
})();

export { useAuthStore };
export default useAuthStore;