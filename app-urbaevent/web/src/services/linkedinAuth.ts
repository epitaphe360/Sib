// src/services/linkedinAuth.ts

import { User } from '../types';
import { supabase } from '../lib/supabase';

// BUGFIX: LinkedIn OAuth using Supabase instead of mock implementation
// This now uses proper Supabase OAuth for LinkedIn

const LinkedInAuthService = {
  signInWithLinkedIn: async (): Promise<User> => {

    try {
      // Use Supabase OAuth for LinkedIn
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: 'r_liteprofile r_emailaddress'
        }
      });

      if (error) {
        throw error;
      }


      // The OAuth flow will redirect the user, so we return a placeholder
      // The actual user data will be retrieved after OAuth callback
      throw new Error('OAUTH_REDIRECT');

    } catch (error: Error | unknown) {
      console.error('LinkedIn authentication error:', error);

      // If it's the expected redirect, re-throw it
      if (error instanceof Error && error.message === 'OAUTH_REDIRECT') {
        throw error;
      }

      // For other errors, throw with a user-friendly message
      throw new Error(`LinkedIn authentication failed: ${error.message}`);
    }
  },

  // Get LinkedIn user data after OAuth callback
  getUserFromSession: async (): Promise<User | null> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return null;
      }

      // Get user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, name, type, status, profile, visitor_level, created_at, updated_at')
        .eq('id', session.user.id)
        .single();

      if (profileError || !userProfile) {
        return null;
      }

      return {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        type: userProfile.type || 'visitor',
        status: userProfile.status || 'active',
        profile: userProfile.profile || {},
        createdAt: new Date(userProfile.created_at),
        updatedAt: new Date(userProfile.updated_at)
      };
    } catch (error) {
      console.error('Error getting user from session:', error);
      return null;
    }
  }
};

export default LinkedInAuthService;
