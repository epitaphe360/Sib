import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { SalonEvent } from '../types';

const CACHE_KEY = '@urbaevent/events';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
interface EventRow {
  id: string;
  title: string;
  description?: string;
  event_type?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  capacity?: number;
  registered?: number;
  featured?: boolean;
}

function mapEvent(row: EventRow): SalonEvent {
  const start = row.start_time || row.event_date || new Date().toISOString();
  const end = row.end_time || start;
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
    featured: row.featured ?? false,
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

export async function fetchEvents(): Promise<SalonEvent[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, description, event_type, event_date, start_time, end_time, location, capacity, registered, featured')
      .order('event_date', { ascending: true })
      .limit(100);

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
