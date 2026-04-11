import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';

/**
 * Hook qui enregistre chaque visite de page dans la table `page_views`.
 * - unique_view = true si c'est la première fois que ce chemin est visité dans la session
 * - Se déclenche à chaque changement de route
 */
export function usePageTracking() {
  const location = useLocation();
  const { user } = useAuthStore();
  const visitedPaths = useRef<Set<string>>(new Set());

  useEffect(() => {
    const path = location.pathname;
    const isUniqueView = !visitedPaths.current.has(path);

    if (isUniqueView) {
      visitedPaths.current.add(path);
    }

    // Insertion asynchrone non bloquante
    const record = async () => {
      const { error } = await (supabase as any)
        ?.from('page_views')
        .insert({
          path,
          unique_view: isUniqueView,
          user_id: user?.id ?? null,
          user_type: user?.type ?? null,
        }) ?? {};

      if (error) {
        // Log visible en dev pour diagnostiquer les problèmes RLS/table
        console.warn('[PageTracking] Échec insertion page_views:', error.message, '| code:', error.code);
      }
    };

    record();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps
}
