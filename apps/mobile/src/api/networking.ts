import { supabase } from '../lib/supabase';
import { sanitizeIlikeTerm } from '../lib/sanitizeIlike';
import { resolveSalonForScan } from '../lib/scanSalon';

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: string;
  fromName?: string;
  toName?: string;
  partnerName?: string;
  salonId?: string;
  salonName?: string;
  createdAt: string;
}

async function attachUserNames(
  rows: Array<{
    id: string;
    requester_id: string;
    addressee_id: string;
    status: string;
    created_at: string;
    salon_id?: string | null;
    salon_name?: string | null;
  }>
): Promise<ConnectionRequest[]> {
  if (!rows.length) return [];

  const ids = [...new Set(rows.flatMap((r) => [r.requester_id, r.addressee_id]))];
  const { data: users, error: namesErr } = await supabase.rpc('get_networking_user_names', { p_ids: ids });
  let names = new Map<string, string>(
    (users ?? []).map((u: { id: string; name: string }) => [u.id, u.name])
  );
  if (namesErr) {
    const fallback = await supabase.from('users').select('id, name').in('id', ids);
    names = new Map((fallback.data ?? []).map((u) => [u.id, u.name as string]));
  }

  return rows.map((row) => ({
    id: row.id,
    fromUserId: row.requester_id,
    toUserId: row.addressee_id,
    status: row.status,
    fromName: names.get(row.requester_id),
    toName: names.get(row.addressee_id),
    salonId: row.salon_id ?? undefined,
    salonName: row.salon_name ?? undefined,
    createdAt: row.created_at,
  }));
}

export async function fetchConnections(userId: string): Promise<ConnectionRequest[]> {
  const { data, error } = await supabase
    .from('connections')
    .select('id, requester_id, addressee_id, status, created_at, salon_id, salon_name')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }

  return attachUserNames(data ?? []);
}

export async function searchUsers(query: string, excludeUserId: string) {
  const term = sanitizeIlikeTerm(query);
  if (term.length < 2) return [];

  const { data, error } = await supabase.rpc('search_networking_users', {
    p_query: term,
    p_exclude: excludeUserId,
  });

  if (!error) return data ?? [];

  const { data: fallback, error: fbErr } = await supabase
    .from('users')
    .select('id, name, email, type, visitor_level')
    .neq('id', excludeUserId)
    .or(`name.ilike.%${term}%,email.ilike.%${term}%`)
    .limit(20);

  if (fbErr) throw fbErr;
  return fallback ?? [];
}

export async function requestConnection(fromUserId: string, toUserId: string): Promise<void> {
  const { salonId, salonName } = await resolveSalonForScan();
  const { error } = await supabase.from('connections').insert({
    requester_id: fromUserId,
    addressee_id: toUserId,
    status: 'pending',
    salon_id: salonId,
    salon_name: salonName,
  });
  if (error) throw error;
}

export async function respondConnection(connectionId: string, status: 'accepted' | 'rejected'): Promise<void> {
  const { error } = await supabase.from('connections').update({ status }).eq('id', connectionId);
  if (error) throw error;
}

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function fetchTodayUsage(userId: string): Promise<{
  connections: number;
  messages: number;
  meetings: number;
}> {
  const since = startOfTodayIso();

  const [conns, msgs, appts] = await Promise.all([
    supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .eq('requester_id', userId)
      .gte('created_at', since),
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', userId)
      .gte('created_at', since),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('visitor_id', userId)
      .gte('created_at', since),
  ]);

  return {
    connections: conns.count ?? 0,
    messages: msgs.count ?? 0,
    meetings: appts.count ?? 0,
  };
}
