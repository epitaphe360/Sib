import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  fetchAppUser,
  signIn as authSignIn,
  signOut as authSignOut,
} from '../services/auth';
import { sendMagicLinkLogin, sendMagicLinkSignup } from '../services/magicLinkAuth';
import type { PendingSignup } from '../lib/pendingSignup';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useNotificationRouting } from '../hooks/useNotificationRouting';
import { flushOfflineScanQueue } from '../api/scanner';
import { getRoleGroup } from '../navigation/roleConfig';
import { withTimeout } from '../lib/withTimeout';
import { clearCachedAppUser, readCachedAppUser, writeCachedAppUser } from '../lib/userCache';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import type { AppUser } from '../types';

const SESSION_TIMEOUT_MS = 5000;
const AUTH_BOOT_TIMEOUT_MS = 8000;

function PushBootstrap() {
  usePushNotifications();
  useNotificationRouting();
  return null;
}

/** Déconnecte après 30 min d'inactivité — rendu uniquement quand l'utilisateur est connecté. */
function SessionTimeoutGuard() {
  useSessionTimeout();
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
  const authOpRef = useRef(0);

  const isConfigured = Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );

  const loadSession = useCallback(async () => {
    let usedCache = false;
    try {
      const { data: { session } } = await withTimeout(
        supabase.auth.getSession(),
        AUTH_BOOT_TIMEOUT_MS,
        'getSession'
      );
      if (!session?.user) {
        setUser(null);
        return;
      }

      const cached = await readCachedAppUser(session.user.id);
      if (cached) {
        usedCache = true;
        setUser(cached);
        setIsLoading(false);
      }

      try {
        const appUser = await withTimeout(
          fetchAppUser(session.user.id),
          SESSION_TIMEOUT_MS,
          'fetchAppUser'
        );
        if (appUser) {
          setUser(appUser);
          void writeCachedAppUser(appUser);
          if (getRoleGroup(appUser.type) === 'staff') {
            flushOfflineScanQueue().catch(() => undefined);
          }
        } else if (!usedCache) {
          await authSignOut();
          void clearCachedAppUser();
          setUser(null);
        }
      } catch {
        if (!usedCache) setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const forceDone = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, AUTH_BOOT_TIMEOUT_MS + 500);

    loadSession().finally(() => {
      if (!cancelled) clearTimeout(forceDone);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userId = session.user.id;
        try {
          const appUser = await withTimeout(
            fetchAppUser(userId),
            SESSION_TIMEOUT_MS,
            'fetchAppUser'
          );
          const { data: { session: current } } = await supabase.auth.getSession();
          if (current?.user?.id !== userId) return;
          if (appUser) {
            setUser(appUser);
            void writeCachedAppUser(appUser);
          }
        } catch {
          // Timeout ou erreur réseau : on laisse l'état inchangé
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(forceDone);
      subscription.unsubscribe();
    };
  }, [loadSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const op = ++authOpRef.current;
    setIsLoading(true);
    setUser(null);
    try {
      const appUser = await authSignIn(email, password);
      if (authOpRef.current !== op) return appUser;
      setUser(appUser);
      void writeCachedAppUser(appUser);
      return appUser;
    } finally {
      if (authOpRef.current === op) setIsLoading(false);
    }
  }, []);

  const sendMagicLinkLoginFn = useCallback(async (email: string) => {
    await sendMagicLinkLogin(email);
  }, []);

  const requestVisitorSignup = useCallback(async (pending: Omit<PendingSignup, 'createdAt'>) => {
    await sendMagicLinkSignup(pending);
  }, []);

  const signOut = useCallback(async () => {
    ++authOpRef.current;
    setUser(null);
    void clearCachedAppUser();
    try {
      await authSignOut();
    } catch {
      await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const appUser = await fetchAppUser(session.user.id);
      if (appUser) {
        setUser(appUser);
        void writeCachedAppUser(appUser);
      } else setUser(null);
    } else {
      setUser(null);
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
      {user && <SessionTimeoutGuard />}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
