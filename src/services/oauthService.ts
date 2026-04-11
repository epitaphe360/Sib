// src/services/oauthService.ts
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface OAuthError extends Error {
  message: string;
}

interface OAuthUserMetadata {
  full_name?: string;
  email?: string;
  picture?: string;
  [key: string]: unknown;
}

interface OAuthUser {
  id: string;
  email: string;
  user_metadata?: OAuthUserMetadata;
  email_confirmed_at?: string;
}

/**
 * Unified OAuth Service using Supabase
 * Handles both Google and LinkedIn OAuth authentication
 */
export class OAuthService {
  /**
   * Sign in with Google using Supabase OAuth
   */
  static async signInWithGoogle(): Promise<void> {
    try {

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.error('❌ Google OAuth error:', error);
        throw new Error(`Erreur d'authentification Google: ${error.message}`);
      }


      // The OAuth flow will redirect the user
      // The actual user data will be retrieved after OAuth callback
    } catch (error: unknown) {
      const oauthError = error as OAuthError;

      if (oauthError.message?.includes('popup')) {
        throw new Error('Popup bloquée par le navigateur. Veuillez autoriser les popups pour ce site.');
      } else if (oauthError.message?.includes('network')) {
        throw new Error('Erreur réseau. Vérifiez votre connexion internet.');
      } else {
        throw new Error(oauthError.message || 'Erreur lors de la connexion avec Google. Veuillez réessayer.');
      }
    }
  }

  /**
   * Sign in with LinkedIn using Supabase OAuth
   */
  static async signInWithLinkedIn(): Promise<void> {
    try {

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ LinkedIn OAuth error:', error);
        throw new Error(`Erreur d'authentification LinkedIn: ${error.message}`);
      }


      // The OAuth flow will redirect the user
      // The actual user data will be retrieved after OAuth callback
    } catch (error: unknown) {
      const oauthError = error as OAuthError;

      if (oauthError.message?.includes('popup')) {
        throw new Error('Popup bloquée par le navigateur. Veuillez autoriser les popups pour ce site.');
      } else if (oauthError.message?.includes('network')) {
        throw new Error('Erreur réseau. Vérifiez votre connexion internet.');
      } else {
        throw new Error(oauthError.message || 'Erreur lors de la connexion avec LinkedIn. Veuillez réessayer.');
      }
    }
  }

  /**
   * Get current OAuth session
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Error getting session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('❌ Error getting session:', error);
      return null;
    }
  }

  /**
   * Get user from current session
   */
  static async getUserFromSession(): Promise<User | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('❌ No active session');
        return null;
      }

      // Get user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, name, type, status, profile, visitor_level, created_at, updated_at')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('❌ Error getting user profile:', profileError);

        // If user doesn't exist in database, create a basic profile
        const newUser = await this.createUserFromOAuth(session.user);
        return newUser;
      }

      if (!userProfile) {
        console.error('❌ User profile not found');
        return null;
      }

      // Map database user to app User type
      return {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name || '',
        type: userProfile.type || 'visitor',
        status: userProfile.status || 'active',
        profile: userProfile.profile || {
          firstName: '',
          lastName: '',
          company: '',
          position: '',
          country: '',
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
          expertise: [],
          competencies: []
        },
        createdAt: new Date(userProfile.created_at),
        updatedAt: new Date(userProfile.updated_at)
      };
    } catch (error) {
      console.error('❌ Error getting user from session:', error);
      return null;
    }
  }

  /**
   * Create user profile from OAuth data
   */
  private static async createUserFromOAuth(oauthUser: OAuthUser): Promise<User> {
    try {

      const displayName = oauthUser.user_metadata?.full_name || oauthUser.email || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const newUserData = {
        id: oauthUser.id,
        email: oauthUser.email,
        name: displayName,
        type: 'visitor' as const,
        status: 'active' as const,
        profile: {
          firstName,
          lastName,
          avatar: oauthUser.user_metadata?.avatar_url || oauthUser.user_metadata?.picture,
          company: '',
          position: '',
          country: '',
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
          expertise: [],
          competencies: []
        }
      };

      // Insert user profile into database
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: newUserData.id,
          email: newUserData.email,
          name: newUserData.name,
          type: newUserData.type,
          status: newUserData.status,
          profile: newUserData.profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id, created_at, updated_at')
        .single();

      if (insertError) {
        console.error('❌ Error creating user profile:', insertError);
        // Return the user data even if insert failed (user might already exist)
        return {
          ...newUserData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }


      return {
        ...newUserData,
        createdAt: new Date(insertedUser.created_at),
        updatedAt: new Date(insertedUser.updated_at)
      };
    } catch (error) {
      console.error('❌ Error creating user from OAuth:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback
   * Call this after the user is redirected back from OAuth provider
   */
  static async handleOAuthCallback(): Promise<User | null> {
    try {
      // Check if we have a session after OAuth redirect
      const session = await this.getCurrentSession();

      if (!session) {
        console.error('❌ No session found after OAuth callback');
        return null;
      }


      // Get or create user profile
      const user = await this.getUserFromSession();

      if (!user) {
        throw new Error('Impossible de récupérer les informations utilisateur');
      }

      return user;
    } catch (error) {
      console.error('❌ Error handling OAuth callback:', error);
      throw error;
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Error signing out:', error);
        throw error;
      }

    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  }
}

export default OAuthService;
