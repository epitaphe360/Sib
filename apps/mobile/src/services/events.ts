import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { SalonEvent } from '../types';

const CACHE_KEY = '@urbaevent/events';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export interface EventRow {
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
}

export function mapEvent(row: EventRow): SalonEvent {
  const start = row.start_date ?? new Date().toISOString();
  const end = row.end_date ?? start;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    type: row.event_type ?? 'conference',
    startDate: new Date(start),
    endDate: new Date(end),
    location: row.location,
    capacity: row.capacity,
    registered: row.registered ?? 0,
    featured: row.is_featured ?? false,
    speakerName: row.speaker_name,
    speakerTitle: row.speaker_title,
    salonId: row.salon_id,
  };
}

async function readCache(): Promise<SalonEvent[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw) as { ts: number; data: SalonEvent[] };
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data.map((e) => ({
      ...e,
      startDate: new Date(e.startDate),
      endDate: new Date(e.endDate),
    }));
  } catch {
    return null;
  }
}

async function writeCache(events: SalonEvent[]): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: events }));
}

export async function fetchEvents(salonId?: string): Promise<SalonEvent[]> {
  try {
    let query = supabase
      .from('events')
      .select('id, title, description, event_type, start_date, end_date, location, capacity, registered, is_featured, speaker_name, speaker_title, salon_id')
      .order('start_date', { ascending: true })
      .limit(100);

    if (salonId) {
      query = query.or(`salon_id.eq.${salonId},salon_id.is.null`);
    }

    const { data, error } = await query;

    if (error) throw error;
    const events = (data ?? []).map((row) => mapEvent(row as EventRow));
    await writeCache(events);
    return events;
  } catch {
    const cached = await readCache();
    if (cached?.length) return cached;
    throw new Error('Programme indisponible hors ligne');
  }
}
