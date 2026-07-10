import { supabase } from '../lib/supabase';
import type { EventRegistration, EventRegistrationStatus, SalonEvent } from '../types';
import { mapEvent } from '../services/events';

type EventRow = {
  id: string;
  title: string;
  description?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  capacity?: number;
  registered?: number;
  is_featured?: boolean;
  speaker_name?: string;
  speaker_title?: string;
  salon_id?: string;
};

function mapReg(row: Record<string, unknown>, event?: SalonEvent): EventRegistration {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    eventId: row.event_id as string,
    status: (row.status as EventRegistrationStatus) ?? 'pending',
    createdAt: row.created_at as string,
    event,
  };
}

/** Récupère les inscriptions aux conférences d'un utilisateur */
export async function fetchUserEventRegistrations(userId: string): Promise<EventRegistration[]> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*, event:events(id, title, description, event_type, start_date, end_date, location, capacity, registered, is_featured, speaker_name, speaker_title, salon_id)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const evRow = row.event as EventRow | null;
    const ev = evRow ? mapEvent(evRow) : undefined;
    return mapReg(row as Record<string, unknown>, ev);
  });
}

/** S'inscrire à une conférence */
export async function registerForEvent(params: {
  userId: string;
  eventId: string;
}): Promise<EventRegistration> {
  // Vérifier si déjà inscrit
  const { data: existing } = await supabase
    .from('event_registrations')
    .select('id, status')
    .eq('user_id', params.userId)
    .eq('event_id', params.eventId)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'cancelled') {
      // Réactiver l'inscription annulée
      const { data, error } = await supabase
        .from('event_registrations')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return mapReg(data as Record<string, unknown>);
    }
    throw new Error('Déjà inscrit à cette conférence');
  }

  // Vérifier la capacité
  const { data: evData } = await supabase
    .from('events')
    .select('capacity, registered')
    .eq('id', params.eventId)
    .single();

  if (evData?.capacity && (evData.registered ?? 0) >= evData.capacity) {
    throw new Error('Conférence complète');
  }

  const { data, error } = await supabase
    .from('event_registrations')
    .insert([{
      user_id: params.userId,
      event_id: params.eventId,
      status: 'pending',
    }])
    .select()
    .single();

  if (error) throw error;

  const { error: incError } = await supabase.rpc('increment_event_registered', { p_event_id: params.eventId });
  if (incError) {
    console.warn('[eventRegistration] increment_event_registered:', incError.message);
  }

  return mapReg(data as Record<string, unknown>);
}

/** Annuler une inscription */
export async function cancelEventRegistration(registrationId: string): Promise<void> {
  const { data: reg } = await supabase
    .from('event_registrations')
    .select('event_id')
    .eq('id', registrationId)
    .single();

  const { error } = await supabase
    .from('event_registrations')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', registrationId);

  if (error) throw error;

  if (reg?.event_id) {
    const { error: decError } = await supabase.rpc('decrement_event_registered', { p_event_id: reg.event_id });
    if (decError) {
      console.warn('[eventRegistration] decrement_event_registered:', decError.message);
    }
  }
}

/** Récupère le statut d'inscription d'un utilisateur pour une conférence */
export async function getEventRegistrationStatus(
  userId: string,
  eventId: string
): Promise<EventRegistrationStatus | null> {
  const { data } = await supabase
    .from('event_registrations')
    .select('status')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();

  return (data?.status as EventRegistrationStatus) ?? null;
}
