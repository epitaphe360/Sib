import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  fetchAppUser,
  signIn as authSignIn,
  signOut as authSignOut,
} from '../services/auth';
import { sendMagicLinkLogin, sendMagicLinkSignup } from '../services/magicLinkAuth';
import type { PendingSignup } from '../lib/pendingSignup';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { flushOfflineScanQueue } from '../api/scanner';
import { getRoleGroup } from '../navigation/roleConfig';
import type { AppUser } from '../types';

function PushBootstrap() {
  usePushNotifications();
  return null;
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<AppUser>;
  /** Connexion visiteur par lien magique (recommandé, 200k+ utilisateurs) */
  sendMagicLinkLogin: (email: string) => Promise<void>;
  /** Inscription visiteur — validation par email, sans mot de passe */
  requestVisitorSignup: (pending: Omit<PendingSignup, 'createdAt'>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isConfigured = Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );

  const loadSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const appUser = await fetchAppUser(session.user.id);
        setUser(appUser);
        if (appUser && getRoleGroup(appUser.type) === 'staff') {
          flushOfflineScanQueue().catch(() => undefined);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const appUser = await fetchAppUser(session.user.id);
          setUser(appUser);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [loadSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const appUser = await authSignIn(email, password);
    setUser(appUser);
    return appUser;
  }, []);

  const sendMagicLinkLoginFn = useCallback(async (email: string) => {
    await sendMagicLinkLogin(email);
  }, []);

  const requestVisitorSignup = useCallback(async (pending: Omit<PendingSignup, 'createdAt'>) => {
    await sendMagicLinkSignup(pending);
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const appUser = await fetchAppUser(session.user.id);
      setUser(appUser);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isConfigured,
      signIn,
      sendMagicLinkLogin: sendMagicLinkLoginFn,
      requestVisitorSignup,
      signOut,
      refreshUser,
    }),
    [user, isLoading, isConfigured, signIn, sendMagicLinkLoginFn, requestVisitorSignup, signOut, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      <PushBootstrap />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
