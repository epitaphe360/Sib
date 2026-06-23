/**
 * Hook de timeout de session.
 * Déconnecte l'utilisateur après `timeoutMs` d'inactivité (défaut 30 min).
 * Réinitialise le minuteur à chaque interaction AppState "active".
 */
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function useSessionTimeout(timeoutMs = DEFAULT_TIMEOUT_MS): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  const reset = () => {
    lastActiveRef.current = Date.now();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      logger.warn('SessionTimeout', 'Session expirée après inactivité, déconnexion.');
      await supabase.auth.signOut();
    }, timeoutMs);
  };

  useEffect(() => {
    reset();

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed >= timeoutMs) {
          logger.warn('SessionTimeout', 'Retour app après timeout — déconnexion.');
          supabase.auth.signOut();
        } else {
          reset();
        }
      }
    });

    return () => {
      sub.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeoutMs]);
}
