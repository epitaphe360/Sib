import { supabase } from '../lib/supabase';

export type AdminScanCategory = 'controller' | 'entry' | 'networking' | 'stand';

export const ADMIN_SCAN_PORTALS: AdminScanCategory[] = ['controller', 'entry', 'networking', 'stand'];

export const ADMIN_SALON_FILTERS = [
  { id: 'sib', code: 'SIB' },
  { id: 'sir', code: 'SIR' },
  { id: 'sip', code: 'SIP' },
  { id: 'btp', code: 'BTP' },
  { id: 'sie', code: 'SIE' },
] as const;

export interface AdminScanStats {
  entryScans: number;
  uniqueEntrants: number;
  deniedScans: number;
  networkingScans: number;
  standScans: number;
  controllerScans: number;
}

export interface AdminScanListItem {
  id: string;
  category: AdminScanCategory;
  scannedAt: string;
  primaryLabel: string;
  secondaryLabel?: string;
  salonName?: string;
  meta?: string;
  valid?: boolean;
}

export async function fetchAdminScanStats(salonId?: string): Promise<AdminScanStats> {
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_scan_statistics', {
    p_salon_id: salonId ?? null,
  });

  if (rpcError) {
    throw new Error(
      rpcError.message.includes('get_admin_scan_statistics')
        ? 'Migration Supabase requise : exécutez 20260628000003_admin_scan_statistics_rpc.sql'
        : rpcError.message,
    );
  }

  if (!rpcData || typeof rpcData !== 'object') {
    throw new Error(
      'Statistiques indisponibles — appliquez la migration get_admin_scan_statistics dans Supabase.',
    );
  }

  const d = rpcData as Record<string, number>;
  return {
    entryScans: Number(d.entry_scans ?? 0),
    uniqueEntrants: Number(d.unique_entrants ?? 0),
    deniedScans: Number(d.denied_scans ?? 0),
    networkingScans: Number(d.networking_scans ?? 0),
    standScans: Number(d.stand_scans ?? 0),
    controllerScans: Number(d.controller_scans ?? 0),
  };
}

export function formatScanStatNumber(value: number): string {
  return value.toLocaleString('fr-FR');
}

function applySalonFilter<T extends { or: (filters: string) => T; eq: (col: string, val: string) => T }>(
  query: T,
  salonId?: string,
): T {
  if (!salonId) return query;
  if (salonId === 'sib') return query.or('salon_id.eq.sib,salon_id.is.null');
  return query.eq('salon_id', salonId);
}

async function fetchScannerNames(ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map();
  const { data } = await supabase.from('users').select('id, name').in('id', ids);
  return new Map((data ?? []).map((u) => [u.id as string, (u.name as string) || '']));
}

export async function fetchAdminScanList(
  category: AdminScanCategory,
  limit = 150,
  salonId?: string,
): Promise<AdminScanListItem[]> {
  switch (category) {
    case 'entry':
      return fetchEntryList(limit, salonId);
    case 'networking':
      return fetchNetworkingList(limit, salonId);
    case 'stand':
      return fetchStandList(limit, salonId);
    case 'controller':
      return fetchControllerList(limit, salonId);
    default:
      return [];
  }
}

async function fetchEntryList(limit: number, salonId?: string): Promise<AdminScanListItem[]> {
  let query = supabase
    .from('access_logs')
    .select('id, user_id, user_name, user_type, zone, accessed_at, salon_name, status')
    .eq('status', 'granted')
    .not('user_id', 'is', null)
    .order('accessed_at', { ascending: false })
    .limit(Math.min(limit * 4, 600));

  query = applySalonFilter(query, salonId);
  const { data, error } = await query;
  if (error) throw error;

  const seen = new Set<string>();
  const items: AdminScanListItem[] = [];
  for (const row of data ?? []) {
    const uid = row.user_id as string;
    if (!uid || seen.has(uid)) continue;
    seen.add(uid);
    items.push({
      id: row.id as string,
      category: 'entry',
      scannedAt: row.accessed_at as string,
      primaryLabel: (row.user_name as string) || 'Visiteur',
      secondaryLabel: row.user_type as string | undefined,
      salonName: (row.salon_name as string) ?? undefined,
      meta: `Zone: ${(row.zone as string) ?? '—'}`,
      valid: true,
    });
    if (items.length >= limit) break;
  }
  return items;
}

async function fetchControllerList(limit: number, salonId?: string): Promise<AdminScanListItem[]> {
  let query = supabase
    .from('access_logs')
    .select('id, user_name, zone, accessed_at, salon_name, status, reason, scanned_by')
    .order('accessed_at', { ascending: false })
    .limit(limit);

  query = applySalonFilter(query, salonId);
  const { data, error } = await query;
  if (error) throw error;

  const scannerIds = [...new Set((data ?? []).map((r) => r.scanned_by).filter(Boolean))] as string[];
  const scannerNames = await fetchScannerNames(scannerIds);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    category: 'controller',
    scannedAt: row.accessed_at as string,
    primaryLabel: (row.user_name as string) || (row.reason as string) || '—',
    secondaryLabel: row.scanned_by
      ? scannerNames.get(row.scanned_by as string)
      : undefined,
    salonName: (row.salon_name as string) ?? undefined,
    meta: `Zone: ${(row.zone as string) ?? '—'}`,
    valid: row.status === 'granted',
  }));
}

async function fetchNetworkingList(limit: number, salonId?: string): Promise<AdminScanListItem[]> {
  let query = supabase
    .from('connections')
    .select('id, requester_id, addressee_id, status, created_at, salon_id, salon_name')
    .order('created_at', { ascending: false })
    .limit(limit);

  query = applySalonFilter(query, salonId);
  const { data, error } = await query;
  if (error) throw error;

  const userIds = new Set<string>();
  for (const c of data ?? []) {
    userIds.add(c.requester_id as string);
    userIds.add(c.addressee_id as string);
  }

  let names = new Map<string, string>();
  if (userIds.size) {
    const { data: users } = await supabase.from('users').select('id, name').in('id', [...userIds]);
    names = new Map((users ?? []).map((u) => [u.id as string, (u.name as string) || '']));
  }

  return (data ?? []).map((row) => {
    const a = names.get(row.requester_id as string) ?? 'Contact A';
    const b = names.get(row.addressee_id as string) ?? 'Contact B';
    return {
      id: row.id as string,
      category: 'networking',
      scannedAt: row.created_at as string,
      primaryLabel: `${a} ↔ ${b}`,
      secondaryLabel: row.status as string,
      salonName: (row.salon_name as string) ?? undefined,
    };
  });
}

async function fetchStandList(limit: number, salonId?: string): Promise<AdminScanListItem[]> {
  let query = supabase
    .from('exhibitor_leads')
    .select('id, exhibitor_user_id, visitor_user_id, badge_code, scanned_at, salon_id, salon_name')
    .order('scanned_at', { ascending: false })
    .limit(limit);

  query = applySalonFilter(query, salonId);
  const { data, error } = await query;
  if (error) throw error;

  const userIds = new Set<string>();
  for (const l of data ?? []) {
    if (l.exhibitor_user_id) userIds.add(l.exhibitor_user_id as string);
    if (l.visitor_user_id) userIds.add(l.visitor_user_id as string);
  }

  let names = new Map<string, string>();
  if (userIds.size) {
    const { data: users } = await supabase.from('users').select('id, name').in('id', [...userIds]);
    names = new Map((users ?? []).map((u) => [u.id as string, (u.name as string) || '']));
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    category: 'stand',
    scannedAt: row.scanned_at as string,
    primaryLabel: names.get(row.visitor_user_id as string) ?? row.badge_code ?? 'Visiteur',
    secondaryLabel: names.get(row.exhibitor_user_id as string) ?? 'Exposant',
    salonName: (row.salon_name as string) ?? undefined,
    meta: row.badge_code ? `Badge: ${row.badge_code}` : undefined,
  }));
}
