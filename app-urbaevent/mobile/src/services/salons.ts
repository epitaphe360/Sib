import AsyncStorage from '@react-native-async-storage/async-storage';
import { SALONS as STATIC_SALONS } from '../data/salons';
import { supabase } from '../lib/supabase';
import type { Salon } from '../types';

const CACHE_KEY = '@urbaevent/salons';
const LEGACY_CACHE_KEY = '@sib/salons';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function mapRow(row: Record<string, unknown>): Salon {
  const slug = (row.slug as string) ?? String(row.id);
  const dateDebut = row.date_debut as string | null;
  const dateFin = row.date_fin as string | null;
  let dates = 'Prochainement';
  if (dateDebut && dateFin) {
    const d1 = new Date(dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const d2 = new Date(dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    dates = `${d1} – ${d2}`;
  } else if (dateDebut) {
    dates = new Date(dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return {
    id: row.id as string,
    slug,
    code: ((row.code as string) ?? slug).toUpperCase().slice(0, 4),
    name: (row.name as string) ?? slug,
    description: (row.description as string) ?? (row.location as string) ?? '',
    dates,
    active: Boolean(row.is_active ?? row.is_default),
    location: (row.location as string) ?? undefined,
  };
}

export async function fetchSalons(): Promise<Salon[]> {
  try {
    const { data, error } = await supabase
      .from('salons')
      // Tous les salons, actifs ET prochainement (pas de filtre is_active)
      .select('id, name, slug, description, location, date_debut, date_fin, is_active, is_default, sort_order')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    if (data?.length) {
      const dbItems = data.map((row) => mapRow(row as Record<string, unknown>));
      // Les salons statiques garantissent la présence de SIR/SIP/BTP/SIE même si la DB n'a qu'eux en préparation
      const merged: Salon[] = STATIC_SALONS.map(
        (s) =>
          dbItems.find((d) => d.id === s.id || d.slug === s.id || d.code.toLowerCase() === s.code.toLowerCase()) ?? s,
      );
      // Salons en DB non couverts par la liste statique (futurs ajouts)
      const extra = dbItems.filter(
        (d) => !STATIC_SALONS.some((s) => s.id === d.id || s.code.toLowerCase() === d.code.toLowerCase()),
      );
      const items = [...merged, ...extra];
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
      await AsyncStorage.removeItem(LEGACY_CACHE_KEY);
      return items;
    }
  } catch {
    // fallback
  }

  try {
    let raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) raw = await AsyncStorage.getItem(LEGACY_CACHE_KEY);
    if (raw) {
      const { ts, items } = JSON.parse(raw) as { ts: number; items: Salon[] };
      if (Date.now() - ts < CACHE_TTL_MS && items.length) return items;
    }
  } catch {
    // ignore
  }

  return STATIC_SALONS;
}

export async function fetchSalonBySlug(slug: string): Promise<Salon | null> {
  const salons = await fetchSalons();
  const normalized = slug.toLowerCase();
  return (
    salons.find(
      (s) =>
        s.id === normalized ||
        s.slug?.toLowerCase() === normalized ||
        s.code.toLowerCase() === normalized ||
        s.id.toLowerCase() === normalized
    ) ??
    STATIC_SALONS.find((s) => s.id === normalized || s.code.toLowerCase() === normalized) ??
    null
  );
}
