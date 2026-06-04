import { supabase } from '../lib/supabase';

export interface RoleMetrics {
  appointments: number;
  messages: number;
  connections: number;
  profileViews?: number;
  scans?: number;
}

export async function fetchExhibitorMetrics(userId: string): Promise<RoleMetrics> {
  const { data: ex } = await supabase.from('exhibitors').select('id').eq('user_id', userId).maybeSingle();

  const exhibitorFilter = ex?.id
    ? `exhibitor_id.eq.${userId},exhibitor_id.eq.${ex.id}`
    : `exhibitor_id.eq.${userId}`;

  const [appts, msgs, conns, leads] = await Promise.all([
    supabase.from('appointments').select('id', { count: 'exact', head: true }).or(exhibitorFilter),
    supabase.from('messages').select('id', { count: 'exact', head: true }).or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
    supabase.from('connections').select('id', { count: 'exact', head: true }).or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`),
    supabase.from('exhibitor_leads').select('id', { count: 'exact', head: true }).eq('exhibitor_user_id', userId),
  ]);

  return {
    appointments: appts.count ?? 0,
    messages: msgs.count ?? 0,
    connections: conns.count ?? 0,
    profileViews: 0,
    scans: leads.count ?? 0,
  };
}

export async function fetchPartnerMetrics(userId: string): Promise<RoleMetrics> {
  const [appts, msgs] = await Promise.all([
    supabase.from('appointments').select('id', { count: 'exact', head: true }).or(`visitor_id.eq.${userId},exhibitor_id.eq.${userId}`),
    supabase.from('messages').select('id', { count: 'exact', head: true }).or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
  ]);

  return {
    appointments: appts.count ?? 0,
    messages: msgs.count ?? 0,
    connections: 0,
  };
}

export async function fetchAdminLiveMetrics(): Promise<{
  totalUsers: number;
  pendingPayments: number;
  pendingValidations: number;
}> {
  const [users, payments] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('payment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return {
    totalUsers: users.count ?? 0,
    pendingPayments: payments.count ?? 0,
    pendingValidations: payments.count ?? 0,
  };
}
