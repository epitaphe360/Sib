import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { Exhibitor } from '../types';

const CACHE_KEY = '@urbaevent/exhibitors';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const SELECT_FIELDS =
  'id, user_id, company_name, sector, description, website, logo_url, verified, featured, stand_number, hall_number, contact_info';

interface ExhibitorRow {
  id: string;
  user_id?: string;
  company_name: string;
  sector?: string;
  description?: string;
  website?: string;
  logo_url?: string;
  featured?: boolean;
  stand_number?: string;
  hall_number?: string;
  contact_info?: { email?: string; phone?: string; country?: string };
}

function mapRow(row: ExhibitorRow): Exhibitor {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    sector: row.sector ?? '',
    description: row.description ?? undefined,
    website: row.website ?? undefined,
    contactEmail: row.contact_info?.email,
    contactPhone: row.contact_info?.phone,
    standNumber: row.stand_number ?? undefined,
    hallNumber: row.hall_number ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    featured: row.featured ?? false,
  };
}

async function readCache(): Promise<Exhibitor[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { savedAt, items } = JSON.parse(raw) as { savedAt: number; items: Exhibitor[] };
    if (Date.now() - savedAt > CACHE_TTL_MS) return null;
    return items;
  } catch {
    return null;
  }
}

async function writeCache(items: Exhibitor[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), items }));
  } catch {
    // Cache optionnel
  }
}

export interface ExhibitorsResult {
  items: Exhibitor[];
  fromCache: boolean;
  sectors: string[];
  halls: string[];
}

export async function fetchExhibitors(search = '', sector = '', hall = '', salonId = ''): Promise<ExhibitorsResult> {
  try {
    let query = supabase
      .from('exhibitors')
      .select(`${SELECT_FIELDS}, salon_id, is_published`)
      .eq('verified', true)
      .eq('is_published', true)
      .order('company_name');

    if (search.trim()) {
      query = query.ilike('company_name', `%${search.trim()}%`);
    }
    if (sector.trim()) {
      query = query.eq('sector', sector.trim());
    }
    if (hall.trim()) {
      query = query.eq('hall_number', hall.trim());
    }
    if (salonId.trim()) {
      query = query.or(`salon_id.eq.${salonId.trim()},salon_id.is.null`);
    }

    const { data, error } = await query.limit(200);
    if (error?.code === '42703' && error.message.includes('is_published')) {
      let fallback = supabase
        .from('exhibitors')
        .select(`${SELECT_FIELDS}, salon_id`)
        .eq('verified', true)
        .order('company_name');
      if (search.trim()) fallback = fallback.ilike('company_name', `%${search.trim()}%`);
      if (sector.trim()) fallback = fallback.eq('sector', sector.trim());
      if (hall.trim()) fallback = fallback.eq('hall_number', hall.trim());
      if (salonId.trim()) fallback = fallback.or(`salon_id.eq.${salonId.trim()},salon_id.is.null`);
      const retry = await fallback.limit(200);
      if (retry.error) throw retry.error;
      const items = (retry.data ?? []).map((row) => mapRow(row as ExhibitorRow));
      const sectors = [...new Set(items.map((e) => e.sector).filter(Boolean))].sort();
      const halls = [...new Set(items.map((e) => e.hallNumber).filter(Boolean))].sort() as string[];
      return { items, fromCache: false, sectors, halls };
    }
    if (error) throw error;

    const items = (data ?? []).map((row) => mapRow(row as ExhibitorRow));
    const sectors = [...new Set(items.map((e) => e.sector).filter(Boolean))].sort();
    const halls = [...new Set(items.map((e) => e.hallNumber).filter(Boolean))].sort() as string[];
    if (!search.trim() && !sector.trim() && !hall.trim()) {
      await writeCache(items);
    }
    return { items, fromCache: false, sectors, halls };
  } catch {
    const cached = await readCache();
    if (cached) {
      const term = search.trim().toLowerCase();
      let filtered = term
        ? cached.filter((e) => e.companyName.toLowerCase().includes(term))
        : cached;
      if (sector.trim()) {
        filtered = filtered.filter((e) => e.sector === sector.trim());
      }
      if (hall.trim()) {
        filtered = filtered.filter((e) => e.hallNumber === hall.trim());
      }
      const sectors = [...new Set(filtered.map((e) => e.sector).filter(Boolean))].sort();
      const halls = [...new Set(filtered.map((e) => e.hallNumber).filter(Boolean))].sort() as string[];
      return { items: filtered, fromCache: true, sectors, halls };
    }
    throw new Error('Impossible de charger les exposants (hors ligne)');
  }
}

export async function fetchExhibitorById(id: string): Promise<Exhibitor | null> {
  const { data, error } = await supabase
    .from('exhibitors')
    .select(SELECT_FIELDS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const cached = await readCache();
    return cached?.find((e) => e.id === id) ?? null;
  }

  return mapRow(data as ExhibitorRow);
}
