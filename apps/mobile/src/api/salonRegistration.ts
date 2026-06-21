import { supabase } from '../lib/supabase';

async function resolveEventIdForSalon(salonId: string): Promise<string | null> {
  const { data: salonEvent } = await supabase
    .from('events')
    .select('id')
    .eq('salon_id', salonId)
    .order('start_date', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (salonEvent?.id) return salonEvent.id as string;

  const { data: fallback } = await supabase
    .from('events')
    .select('id')
    .is('salon_id', null)
    .order('start_date', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fallback?.id) return fallback.id as string;

  const { data: anyEvent } = await supabase
    .from('events')
    .select('id')
    .order('start_date', { ascending: true })
    .limit(1)
    .maybeSingle();

  return (anyEvent?.id as string) ?? null;
}

export async function registerForSalon(userId: string, salonId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('user_id', userId)
    .eq('salon_id', salonId)
    .maybeSingle();

  if (existing?.id) return;

  const eventId = await resolveEventIdForSalon(salonId);
  if (!eventId) throw new Error('Aucun événement disponible pour ce salon');

  const { error } = await supabase.from('event_registrations').insert({
    user_id: userId,
    event_id: eventId,
    salon_id: salonId,
    registration_type: 'standard',
    status: 'confirmed',
    registered_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === '42P01') return;
    if (error.code === '23505') return;
    throw error;
  }
}

export async function isRegisteredForSalon(userId: string, salonId: string): Promise<boolean> {
  const { data: bySalon } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('user_id', userId)
    .eq('salon_id', salonId)
    .maybeSingle();

  if (bySalon?.id) return true;

  const eventId = await resolveEventIdForSalon(salonId);
  if (!eventId) return false;

  const { data: byEvent } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();

  return Boolean(byEvent?.id);
}
