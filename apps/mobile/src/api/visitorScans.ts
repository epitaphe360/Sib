import { supabase } from '../lib/supabase';

export type VisitorScanEntry = {
  id: string;
  kind: 'networking' | 'stand';
  scannedAt: string;
  salonId?: string;
  salonName?: string;
  partnerName: string;
  status?: string;
};

/** Historique unifié des scans visiteur (networking + scans stand), tous salons. */
export async function fetchVisitorScanHistory(userId: string, limit = 100): Promise<VisitorScanEntry[]> {
  const [connsRes, leadsRes] = await Promise.all([
    supabase
      .from('connections')
      .select('id, requester_id, addressee_id, status, created_at, salon_id, salon_name')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('exhibitor_leads')
      .select('id, exhibitor_user_id, scanned_at, salon_id, salon_name')
      .eq('visitor_user_id', userId)
      .order('scanned_at', { ascending: false })
      .limit(limit),
  ]);

  const userIds = new Set<string>();
  for (const c of connsRes.data ?? []) {
    userIds.add(c.requester_id as string);
    userIds.add(c.addressee_id as string);
  }
  for (const l of leadsRes.data ?? []) {
    userIds.add(l.exhibitor_user_id as string);
  }
  userIds.delete(userId);

  let names = new Map<string, string>();
  if (userIds.size) {
    const { data: users } = await supabase.from('users').select('id, name').in('id', [...userIds]);
    names = new Map((users ?? []).map((u) => [u.id as string, (u.name as string) || '']));
  }

  const entries: VisitorScanEntry[] = [];

  for (const c of connsRes.data ?? []) {
    const otherId = c.requester_id === userId ? c.addressee_id : c.requester_id;
    entries.push({
      id: `conn-${c.id}`,
      kind: 'networking',
      scannedAt: c.created_at as string,
      salonId: (c.salon_id as string) ?? undefined,
      salonName: (c.salon_name as string) ?? undefined,
      partnerName: names.get(otherId as string) ?? 'Contact',
      status: c.status as string,
    });
  }

  for (const l of leadsRes.data ?? []) {
    entries.push({
      id: `lead-${l.id}`,
      kind: 'stand',
      scannedAt: l.scanned_at as string,
      salonId: (l.salon_id as string) ?? undefined,
      salonName: (l.salon_name as string) ?? undefined,
      partnerName: names.get(l.exhibitor_user_id as string) ?? 'Exposant',
      status: 'scanned',
    });
  }

  entries.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
  return entries.slice(0, limit);
}

/** Noms des contrôleurs pour l'historique staff (admin). */
export async function fetchScannerNames(ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map();
  const { data } = await supabase.from('users').select('id, name').in('id', ids);
  return new Map((data ?? []).map((u) => [u.id as string, (u.name as string) || u.id as string]));
}
