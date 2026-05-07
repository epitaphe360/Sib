/**
 * useSessionCheckin
 * Hook pour la page de contrôle d'accès aux sessions (staff/admin).
 * Vérifie qu'un participant est bien inscrit à une session et enregistre le checkin.
 */
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

/* ─── Types ─────────────────────────────────────────────────── */
export type CheckinStatus = 'idle' | 'loading' | 'allowed' | 'denied' | 'already_checked' | 'error';

export interface QRPayload {
  type: 'session_access';
  userId: string;
  sessionId: string;
  v: number;
}

export interface CheckinResult {
  status: CheckinStatus;
  user?: {
    id: string;
    name: string;
    email: string;
    type: string;
    company?: string;
  };
  alreadyAt?: string;
  errorMessage?: string;
}

export interface SessionAttendee {
  userId: string;
  name: string;
  email: string;
  type: string;
  company?: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

/* ─── Hook ─────────────────────────────────────────────────── */
export function useSessionCheckin() {
  const { user: staffUser } = useAuthStore();
  const [status, setStatus] = useState<CheckinStatus>('idle');
  const [lastResult, setLastResult] = useState<CheckinResult | null>(null);
  const [attendees, setAttendees] = useState<SessionAttendee[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);

  /**
   * Vérifie le QR scanné et enregistre le checkin si valide.
   */
  const verifyAndCheckin = useCallback(async (rawQR: string): Promise<CheckinResult> => {
    if (!supabase) {
      const result: CheckinResult = { status: 'error', errorMessage: 'Service non disponible' };
      setLastResult(result);
      return result;
    }
    setStatus('loading');

    let payload: QRPayload;
    try {
      payload = JSON.parse(rawQR) as QRPayload;
      if (payload.type !== 'session_access' || !payload.userId || !payload.sessionId) {
        throw new Error('QR invalide');
      }
    } catch {
      const result: CheckinResult = { status: 'denied', errorMessage: 'QR non reconnu ou invalide' };
      setStatus('denied');
      setLastResult(result);
      return result;
    }

    const { userId, sessionId } = payload;

    // 1. Vérifier l'inscription
    const { data: registration } = await supabase
      .from('programme_registrations')
      .select('id, registered_at')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (!registration) {
      const result: CheckinResult = { status: 'denied', errorMessage: 'Aucune inscription trouvée pour cette session' };
      setStatus('denied');
      setLastResult(result);
      return result;
    }

    // 2. Récupérer les infos utilisateur
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, email, type, profile')
      .eq('id', userId)
      .maybeSingle();

    const userInfo = userData ? {
      id: userData.id as string,
      name: userData.name as string,
      email: userData.email as string,
      type: userData.type as string,
      company: (userData.profile as { company?: string } | null)?.company,
    } : undefined;

    // 3. Vérifier déjà checkin
    const { data: existingCheckin } = await supabase
      .from('session_checkins')
      .select('checked_in_at')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingCheckin) {
      const result: CheckinResult = {
        status: 'already_checked',
        user: userInfo,
        alreadyAt: existingCheckin.checked_in_at as string,
      };
      setStatus('already_checked');
      setLastResult(result);
      return result;
    }

    // 4. Enregistrer le checkin
    const { error: insertError } = await supabase.from('session_checkins').insert({
      session_id: sessionId,
      user_id: userId,
      checked_in_by: staffUser?.id ?? null,
    });

    if (insertError) {
      const result: CheckinResult = { status: 'error', errorMessage: 'Erreur lors de l\'enregistrement' };
      setStatus('error');
      setLastResult(result);
      return result;
    }

    const result: CheckinResult = { status: 'allowed', user: userInfo };
    setStatus('allowed');
    setLastResult(result);
    return result;
  }, [staffUser]);

  /**
   * Charge la liste des inscrits à une session avec leur statut de checkin.
   */
  const loadAttendees = useCallback(async (sessionId: string) => {
    if (!supabase || !sessionId) { return; }
    setIsLoadingAttendees(true);

    const { data: registrations } = await supabase
      .from('programme_registrations')
      .select('user_id, registered_at')
      .eq('session_id', sessionId)
      .eq('status', 'confirmed')
      .order('registered_at', { ascending: true });

    if (!registrations || registrations.length === 0) {
      setAttendees([]);
      setIsLoadingAttendees(false);
      return;
    }

    const userIds = registrations.map((r: { user_id: string }) => r.user_id);

    const [{ data: usersData }, { data: checkinsData }] = await Promise.all([
      supabase.from('users').select('id, name, email, type, profile').in('id', userIds),
      supabase.from('session_checkins').select('user_id, checked_in_at').eq('session_id', sessionId).in('user_id', userIds),
    ]);

    const checkinMap = new Map<string, string>(
      (checkinsData ?? []).map((c: { user_id: string; checked_in_at: string }) => [c.user_id, c.checked_in_at])
    );

    const result: SessionAttendee[] = registrations.map((reg: { user_id: string; registered_at: string }) => {
      const u = (usersData ?? []).find((x: { id: string }) => x.id === reg.user_id);
      const checkedInAt = checkinMap.get(reg.user_id);
      return {
        userId: reg.user_id,
        name: (u?.name as string) ?? 'Inconnu',
        email: (u?.email as string) ?? '',
        type: (u?.type as string) ?? 'visitor',
        company: (u?.profile as { company?: string } | null)?.company,
        registeredAt: reg.registered_at,
        checkedIn: !!checkedInAt,
        checkedInAt,
      };
    });

    setAttendees(result);
    setIsLoadingAttendees(false);
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setLastResult(null);
  }, []);

  return { status, lastResult, attendees, isLoadingAttendees, verifyAndCheckin, loadAttendees, reset };
}
