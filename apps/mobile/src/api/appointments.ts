import { supabase } from '../lib/supabase';
import { fetchNetworkingContactProfiles } from './contactProfiles';

export interface MobileTimeSlot {
  id: string;
  exhibitorId: string;
  exhibitorUserId?: string;
  companyName?: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  available: boolean;
  maxBookings: number;
  currentBookings: number;
}

export interface MobileAppointment {
  id: string;
  visitorId: string;
  exhibitorId: string;
  exhibitorUserId?: string;
  timeSlotId?: string;
  status: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  message?: string;
  visitorName?: string;
  exhibitorName?: string;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>, extras?: Partial<MobileAppointment>): MobileAppointment {
  return {
    id: row.id as string,
    visitorId: row.visitor_id as string,
    exhibitorId: row.exhibitor_id as string,
    timeSlotId: row.time_slot_id as string | undefined,
    status: (row.status as string) ?? 'pending',
    startTime: row.start_time as string | undefined,
    endTime: row.end_time as string | undefined,
    location: row.location as string | undefined,
    message: (row.message as string | undefined) ?? (row.notes as string | undefined),
    createdAt: row.created_at as string,
    ...extras,
  };
}

export async function fetchAvailableTimeSlots(exhibitorUserId?: string): Promise<MobileTimeSlot[]> {
  let query = supabase
    .from('time_slots')
    .select(`
      id,
      exhibitor_id,
      slot_date,
      start_time,
      end_time,
      location,
      max_bookings,
      current_bookings,
      exhibitor:exhibitors!exhibitor_id(id, user_id, company_name)
    `)
    .order('slot_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (exhibitorUserId) {
    const { data: ex } = await supabase.from('exhibitors').select('id').eq('user_id', exhibitorUserId).maybeSingle();
    if (ex?.id) {
      query = query.eq('exhibitor_id', ex.id);
    } else {
      query = query.eq('exhibitor_id', exhibitorUserId);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (data ?? [])
    .map((row) => {
      const ex = row.exhibitor as { id?: string; user_id?: string; company_name?: string } | null;
      const max = Number(row.max_bookings ?? 1);
      const current = Number(row.current_bookings ?? 0);
      return {
        id: row.id as string,
        exhibitorId: row.exhibitor_id as string,
        exhibitorUserId: ex?.user_id,
        companyName: ex?.company_name,
        date: row.slot_date as string,
        startTime: row.start_time as string,
        endTime: row.end_time as string | undefined,
        location: row.location as string | undefined,
        maxBookings: max,
        currentBookings: current,
        available: current < max,
      };
    })
    .filter((s) => s.available && new Date(s.date) >= today);
}

export async function fetchAppointmentsForUser(userId: string, userType: string): Promise<MobileAppointment[]> {
  let query = supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(50);

  if (userType === 'visitor') {
    query = query.eq('visitor_id', userId);
  } else if (userType === 'exhibitor') {
    const { data: exRow } = await supabase.from('exhibitors').select('id').eq('user_id', userId).maybeSingle();
    if (exRow?.id) {
      query = query.or(`exhibitor_id.eq.${userId},exhibitor_id.eq.${exRow.id}`);
    } else {
      query = query.eq('exhibitor_id', userId);
    }
  } else if (userType === 'partner') {
    query = query.or(`visitor_id.eq.${userId},exhibitor_id.eq.${userId}`);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return [];

  const visitorIds = [...new Set(data.map((a) => a.visitor_id))];
  const visitorProfiles = await fetchNetworkingContactProfiles(visitorIds);

  const exhibitorIds = [...new Set(data.map((a) => a.exhibitor_id))];
  const { data: exhibitors } = await supabase.from('exhibitors').select('id, user_id, company_name').in('id', exhibitorIds);
  const exById = new Map(exhibitors?.map((e) => [e.id, e]) ?? []);

  return data.map((row) => {
    const ex = exById.get(row.exhibitor_id);
    return mapRow(row as Record<string, unknown>, {
      visitorName: visitorProfiles.get(row.visitor_id)?.name ?? 'Visiteur',
      exhibitorName: ex?.company_name ?? 'Exposant',
    });
  });
}

export async function updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', appointmentId);
  if (error) throw error;
}

export async function bookAppointment(params: {
  visitorId: string;
  exhibitorId: string;
  timeSlotId: string;
  message?: string;
}): Promise<void> {
  const { data, error } = await supabase.rpc('book_appointment_atomic', {
    p_time_slot_id: params.timeSlotId,
    p_visitor_id: params.visitorId,
    p_exhibitor_id: params.exhibitorId,
    p_notes: params.message ?? null,
    p_meeting_type: 'in-person',
  });

  if (error) throw error;

  const result = data as { success?: boolean; error?: string; error_message?: string } | null;
  if (!result?.success) {
    throw new Error(result?.error ?? result?.error_message ?? 'Réservation impossible');
  }
}
