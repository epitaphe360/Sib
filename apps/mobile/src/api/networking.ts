import { supabase } from '../lib/supabase';

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: string;
  fromName?: string;
  createdAt: string;
}

export async function fetchConnections(userId: string): Promise<ConnectionRequest[]> {
  const { data, error } = await supabase
    .from('connections')
    .select('id, from_user_id, to_user_id, status, created_at')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function searchUsers(query: string, excludeUserId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, type, visitor_level')
    .neq('id', excludeUserId)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function requestConnection(fromUserId: string, toUserId: string): Promise<void> {
  const { error } = await supabase.from('connections').insert({
    from_user_id: fromUserId,
    to_user_id: toUserId,
    status: 'pending',
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
      .eq('from_user_id', userId)
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
