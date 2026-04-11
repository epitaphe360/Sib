/**
 * Google Auth Service — via Supabase OAuth (Firebase supprimé)
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class GoogleAuthService {
  /**
   * Connexion avec Google via Supabase OAuth
   */
  static async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) throw new Error(error.message);
  }

  /**
   * Déconnexion
   */
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  /**
   * Écouter les changements d'état (compatibilité)
   */
  static onAuthStateChanged(callback: (user: unknown) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }
}

export default GoogleAuthService;



export class GoogleAuthService {
  
  /**
   * Connexion avec Google
   */
  static async signInWithGoogle(): Promise<User> {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw new Error('Firebase n\'est pas configuré. Veuillez configurer vos clés Firebase dans le fichier .env');
    }
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Récupérer les informations utilisateur depuis Google
      const googleUser = await this.mapFirebaseUserToSIBUser(firebaseUser);
      
      // Vérifier si l'utilisateur existe déjà dans notre base
      const existingUser = await this.checkExistingUser(googleUser.email);
      
      if (existingUser) {
        // Utilisateur existant - mise à jour des infos Google
        return await this.updateUserWithGoogleInfo(existingUser, firebaseUser);
      } else {
        // Nouvel utilisateur - création automatique
        return await this.createUserFromGoogle(firebaseUser);
      }
      
    } catch (error) {
      console.error('Erreur connexion Google:', error);
      
      // Gestion des erreurs spécifiques
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        throw new Error('Connexion annulée par l\'utilisateur');
      } else if (firebaseError.code === 'auth/popup-blocked') {
        throw new Error('Popup bloquée par le navigateur. Veuillez autoriser les popups.');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        throw new Error('Erreur réseau. Vérifiez votre connexion internet.');
      } else {
        throw new Error('Erreur lors de la connexion Google. Veuillez réessayer.');
      }
    }
  }

  /**
   * Déconnexion
   */
  static async signOut(): Promise<void> {
    if (!auth) {
      throw new Error('Firebase n\'est pas configuré');
    }
    
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  /**
   * Écouter les changements d'état d'authentification
   */
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    if (!auth) {
      callback(null);
      return () => {};
    }
    
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Mapper un utilisateur Firebase vers un utilisateur SIB
   */
  private static async mapFirebaseUserToSIBUser(firebaseUser: FirebaseUser): Promise<User> {
    const displayName = firebaseUser.displayName || '';
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: displayName,
      type: 'visitor', // Par défaut, les nouveaux utilisateurs Google sont des visiteurs
      status: 'active',
      profile: {
        firstName,
        lastName,
        avatar: firebaseUser.photoURL || undefined,
        company: '', // À remplir par l'utilisateur
        position: '', // À remplir par l'utilisateur
        country: '', // À déterminer via géolocalisation ou à remplir
        phone: firebaseUser.phoneNumber || undefined,
        linkedin: undefined,
        website: undefined,
        bio: '',
        interests: [],
        objectives: [],
        sectors: [],
        products: [],
        videos: [],
        images: [],
        participationObjectives: [],
        thematicInterests: [],
        companySize: '',
        geographicLocation: '',
        collaborationTypes: [],
        expertise: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Vérifier si un utilisateur existe déjà
   */
  private static async checkExistingUser(email: string): Promise<User | null> {
    try {
      // Simulation d'appel API pour vérifier l'utilisateur existant
      // En production, remplacez par un vrai appel API
      const response = await fetch(`/api/users/check?email=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const userData = await response.json();
        return userData.user || null;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur vérification utilisateur:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un utilisateur existant avec les infos Google
   */
  private static async updateUserWithGoogleInfo(existingUser: User, firebaseUser: FirebaseUser): Promise<User> {
    const updatedUser: User = {
      ...existingUser,
      profile: {
        ...existingUser.profile,
        avatar: firebaseUser.photoURL || existingUser.profile.avatar,
        // Mettre à jour le nom si pas encore renseigné
        firstName: existingUser.profile.firstName || firebaseUser.displayName?.split(' ')[0] || '',
        lastName: existingUser.profile.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || ''
      },
      updatedAt: new Date()
    };

    // Simulation de sauvegarde en base
    // En production, remplacez par un vrai appel API
    try {
      await fetch(`/api/users/${existingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
    }

    return updatedUser;
  }

  /**
   * Créer un nouvel utilisateur depuis Google
   */
  private static async createUserFromGoogle(firebaseUser: FirebaseUser): Promise<User> {
    const newUser = await this.mapFirebaseUserToSIBUser(firebaseUser);

    // Simulation de création en base
    // En production, remplacez par un vrai appel API
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const createdUser = await response.json();
        return createdUser.user;
      }
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
    }

    return newUser;
  }

  /**
   * Obtenir l'utilisateur actuellement connecté
   */
  static getCurrentUser(): FirebaseUser | null {
    if (!auth) return null;
    return auth.currentUser;
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  static isAuthenticated(): boolean {
    if (!auth) return false;
    return !!auth.currentUser;
  }

  /**
   * Obtenir le token d'authentification
   */
  static async getAuthToken(): Promise<string | null> {
    if (!auth) return null;
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  /**
   * Rafraîchir le token d'authentification
   */
  static async refreshToken(): Promise<string | null> {
    if (!auth) return null;
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken(true);
    }
    return null;
  }
}

export default GoogleAuthService;