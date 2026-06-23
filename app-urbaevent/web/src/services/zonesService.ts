/**
 * Service de gestion des zones de contrôle d'accès
 * Source de vérité : table Supabase `control_zones` (définie par l'administrateur).
 * Fallback lecture seule sur localStorage pour mode hors-ligne.
 */

import { supabase } from '../lib/supabase';

export interface ControlZone {
  id: string;
  name: string;
  icon: string;
  description: string;
  createdAt: string;
}

const STORAGE_KEY = 'sib_control_zones';

export const DEFAULT_ZONES: ControlZone[] = [
  { id: 'public',          name: 'Zone Publique',    icon: '🌐', description: 'Accès libre au grand public',                  createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'exhibition_hall', name: "Hall d'Exposition", icon: '🏛️', description: 'Espace principal des exposants',               createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'vip_lounge',      name: 'Salon VIP',         icon: '⭐', description: 'Espace réservé aux visiteurs VIP',             createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'networking_area', name: 'Zone Networking',   icon: '🤝', description: 'Espace de mise en relation B2B',               createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'backstage',       name: 'Backstage',         icon: '🎭', description: 'Zone technique et organisateurs',              createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'partner_area',    name: 'Zone Sponsors',     icon: '💼', description: 'Espace réservé aux sponsors et partenaires',   createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'exhibitor_area',  name: 'Zone Exposants',    icon: '🏢', description: 'Espace back-office des exposants',             createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'technical_area',  name: 'Zone Technique',    icon: '🔧', description: 'Infrastructure et support technique',          createdAt: '2026-01-01T00:00:00.000Z' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

type DbZoneRow = { id: string; name: string; icon: string; description: string; created_at: string };

function dbRowToZone(row: DbZoneRow): ControlZone {
  return { id: row.id, name: row.name, icon: row.icon, description: row.description, createdAt: row.created_at };
}

function getZonesLocal(): ControlZone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { return DEFAULT_ZONES; }
    const parsed = JSON.parse(raw) as ControlZone[];
    return parsed.length > 0 ? parsed : DEFAULT_ZONES;
  } catch {
    return DEFAULT_ZONES;
  }
}

// ── Async DB functions (à utiliser dans tous les nouveaux composants) ──────

/**
 * Charge les zones depuis Supabase (source de vérité admin).
 * Met à jour le cache localStorage pour usage hors-ligne.
 */
export async function getZonesDB(): Promise<ControlZone[]> {
  try {
    const { data, error } = await supabase
      .from('control_zones')
      .select('id, name, icon, description, created_at')
      .order('created_at', { ascending: true });

    if (error) { throw error; }

    const zones = (data ?? []).map(dbRowToZone);
    // Mise en cache pour mode hors-ligne
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
    return zones.length > 0 ? zones : DEFAULT_ZONES;
  } catch {
    return getZonesLocal();
  }
}

export async function addZoneDB(zone: Omit<ControlZone, 'id' | 'createdAt'>): Promise<ControlZone> {
  const id = `zone_${Date.now()}`;
  const { data, error } = await supabase
    .from('control_zones')
    .insert({ id, name: zone.name, icon: zone.icon, description: zone.description })
    .select('id, name, icon, description, created_at')
    .single();

  if (error) { throw error; }
  return dbRowToZone(data);
}

export async function updateZoneDB(id: string, updates: Partial<Omit<ControlZone, 'id' | 'createdAt'>>): Promise<void> {
  const patch: Partial<{ name: string; icon: string; description: string }> = {};
  if (updates.name !== undefined)        { patch.name = updates.name; }
  if (updates.icon !== undefined)        { patch.icon = updates.icon; }
  if (updates.description !== undefined) { patch.description = updates.description; }

  const { error } = await supabase.from('control_zones').update(patch).eq('id', id);
  if (error) { throw error; }
}

export async function deleteZoneDB(id: string): Promise<void> {
  const { error } = await supabase.from('control_zones').delete().eq('id', id);
  if (error) { throw error; }
}

export async function resetZonesDB(): Promise<ControlZone[]> {
  // Supprimer toutes les zones existantes
  const { error: delError } = await supabase.from('control_zones').delete().neq('id', '');
  if (delError) { throw delError; }

  // Réinsérer les zones par défaut
  const rows = DEFAULT_ZONES.map(z => ({
    id: z.id, name: z.name, icon: z.icon, description: z.description, created_at: z.createdAt,
  }));
  const { error: insertError } = await supabase.from('control_zones').insert(rows);
  if (insertError) { throw insertError; }

  return DEFAULT_ZONES;
}

// ── Legacy sync functions (rétrocompatibilité) ─────────────────────────────

export function getZones(): ControlZone[] {
  return getZonesLocal();
}

export function saveZones(zones: ControlZone[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
}

export function addZone(zone: Omit<ControlZone, 'id' | 'createdAt'>): ControlZone {
  const zones = getZonesLocal();
  const newZone: ControlZone = {
    ...zone,
    id: `zone_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveZones([...zones, newZone]);
  return newZone;
}

export function updateZone(id: string, updates: Partial<Omit<ControlZone, 'id' | 'createdAt'>>): void {
  const zones = getZonesLocal();
  const updated = zones.map(z => z.id === id ? { ...z, ...updates } : z);
  saveZones(updated);
}

export function deleteZone(id: string): void {
  const zones = getZonesLocal();
  saveZones(zones.filter(z => z.id !== id));
}

export function resetZones(): void {
  saveZones(DEFAULT_ZONES);
}
