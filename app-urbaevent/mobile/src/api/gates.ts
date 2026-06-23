import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { Gate, ZoneCapacity } from '../types';

const GATE_PREF_KEY = '@sib/selected_gate';

// Portails par défaut (fallback si Supabase indisponible)
const DEFAULT_GATES: Gate[] = [
  { id: 'gate_main', name: 'Entrée principale', zone: 'public', location: 'Hall A — Accueil', active: true },
  { id: 'gate_north', name: 'Entrée Nord', zone: 'public', location: 'Hall B — Côté nord', active: true },
  { id: 'gate_south', name: 'Entrée Sud', zone: 'public', location: 'Hall C — Côté sud', active: true },
  { id: 'gate_vip', name: 'Entrée VIP', zone: 'vip_lounge', location: 'Hall D — Zone VIP', active: true },
  { id: 'gate_exhibit', name: 'Accès exposants', zone: 'exhibition_hall', location: 'Hall E — Zone expo', active: true },
  { id: 'gate_backstage', name: 'Backstage', zone: 'backstage', location: 'Accès réservé staff', active: true },
];

/** Récupère la liste des portails/gates depuis Supabase */
export async function fetchGates(salonId?: string): Promise<Gate[]> {
  try {
    let query = supabase
      .from('gates')
      .select('id, name, zone, location, active')
      .eq('active', true)
      .order('name');

    if (salonId) {
      query = query.eq('salon_id', salonId);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data?.length) return DEFAULT_GATES;

    return data.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      zone: row.zone as string,
      location: row.location as string | undefined,
      active: (row.active as boolean) ?? true,
    }));
  } catch {
    return DEFAULT_GATES;
  }
}

/** Persiste le portail sélectionné par l'agent */
export async function saveSelectedGate(gate: Gate): Promise<void> {
  await AsyncStorage.setItem(GATE_PREF_KEY, JSON.stringify(gate));
}

/** Récupère le portail sélectionné par l'agent */
export async function getSelectedGate(): Promise<Gate | null> {
  try {
    const raw = await AsyncStorage.getItem(GATE_PREF_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Gate;
  } catch {
    return null;
  }
}

// ─── Capacité zones ────────────────────────────────────────────────────────

const ZONE_LABELS: Record<string, string> = {
  public: 'Entrée publique',
  exhibition_hall: 'Hall exposants',
  vip_lounge: 'Salon VIP',
  networking_area: 'Zone networking',
  backstage: 'Backstage',
};

const ZONE_MAX: Record<string, number> = {
  public: 5000,
  exhibition_hall: 3000,
  vip_lounge: 500,
  networking_area: 800,
  backstage: 200,
};

/** Récupère la capacité actuelle de chaque zone à partir des access_logs */
export async function fetchZoneCapacities(): Promise<ZoneCapacity[]> {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('access_logs')
      .select('zone, status')
      .gte('accessed_at', `${today}T00:00:00.000Z`)
      .lte('accessed_at', `${today}T23:59:59.999Z`);

    if (error) throw error;

    // Compter uniquement les accès accordés par zone
    const counts: Record<string, number> = {};
    for (const log of data ?? []) {
      if ((log.status as string) === 'granted') {
        const z = (log.zone as string) ?? 'public';
        counts[z] = (counts[z] ?? 0) + 1;
      }
    }

    return Object.keys(ZONE_LABELS).map((zone) => ({
      zone,
      label: ZONE_LABELS[zone] ?? zone,
      current: counts[zone] ?? 0,
      max: ZONE_MAX[zone] ?? 9999,
      lastUpdated: new Date().toISOString(),
    }));
  } catch {
    return Object.keys(ZONE_LABELS).map((zone) => ({
      zone,
      label: ZONE_LABELS[zone] ?? zone,
      current: 0,
      max: ZONE_MAX[zone] ?? 9999,
      lastUpdated: new Date().toISOString(),
    }));
  }
}

/** Subscribe en temps réel aux changements des access_logs */
export function subscribeZoneCapacity(onUpdate: () => void): () => void {
  const channel = supabase
    .channel('zone_capacity')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'access_logs' }, () => {
      onUpdate();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
