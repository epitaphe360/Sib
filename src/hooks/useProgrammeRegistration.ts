import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface ProgrammeRegistrationState {
  isRegistered: boolean;
  count: number;
  isLoading: boolean;
  register: () => Promise<void>;
  unregister: () => Promise<void>;
}

/**
 * Hook d'inscription aux sessions du programme scientifique.
 * Utilise la table `programme_registrations` (sans FK vers `events`)
 * pour permettre l'inscription à n'importe quel type de session :
 * exposant, partenaire/sponsor, visiteur pro.
 */
export function useProgrammeRegistration(sessionId: string): ProgrammeRegistrationState {
  const { user } = useAuthStore();
  const [isRegistered, setIsRegistered] = useState(false);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!supabase || !sessionId) { return; }

    // Compter le total des inscrits à cette session
    const { count: total } = await supabase
      .from('programme_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('status', 'confirmed');

    setCount(total ?? 0);

    // Vérifier si l'utilisateur courant est inscrit
    if (user) {
      const { data } = await supabase
        .from('programme_registrations')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsRegistered(!!data);
    } else {
      setIsRegistered(false);
    }
  }, [sessionId, user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const register = useCallback(async () => {
    if (!supabase || !user) { return; }
    setIsLoading(true);
    try {
      let regType = 'visitor';
      if (user.type === 'exhibitor') { regType = 'exhibitor'; }
      else if (user.type === 'partner') { regType = 'partner'; }

      const { error } = await supabase.from('programme_registrations').insert({
        session_id: sessionId,
        user_id: user.id,
        registration_type: regType,
        status: 'confirmed',
      });
      if (error) { throw error; }

      setIsRegistered(true);
      setCount(c => c + 1);
      toast.success('Inscription confirmée ! Session ajoutée à votre programme.');
    } catch (err) {
      console.error('Erreur inscription session programme:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, user]);

  const unregister = useCallback(async () => {
    if (!supabase || !user) { return; }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('programme_registrations')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
      if (error) { throw error; }

      setIsRegistered(false);
      setCount(c => Math.max(0, c - 1));
      toast.info('Désinscription effectuée.');
    } catch (err) {
      console.error('Erreur désinscription session programme:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, user]);

  return { isRegistered, count, isLoading, register, unregister };
}
