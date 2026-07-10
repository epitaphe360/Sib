import { supabase } from '../lib/supabase';

export interface RoleMetrics {
  appointments: number;
  messages: number;
  connections: number;
  profileViews?: number;
  scans?: number;
}

async function resolveExhibitorProfileViews(
  userId: string,
  exhibitorId?: string,
): Promise<number> {
  let profileCount = 0;
  const { count: pvCount, error: pvErr } = await supabase
    .from('profile_views')
    .select('id', { count: 'exact', head: true })
    .eq('viewed_user_id', userId);
  if (!pvErr) profileCount = pvCount ?? 0;

  let minisiteCount = 0;
  let columnViews = 0;
  if (exhibitorId) {
    const { count: mvCount, error: mvErr } = await supabase
      .from('minisite_views')
      .select('id', { count: 'exact', head: true })
      .eq('exhibitor_id', exhibitorId);
    if (!mvErr) minisiteCount = mvCount ?? 0;

    const { data: ms, error: msErr } = await supabase
      .from('mini_sites')
      .select('views')
      .eq('exhibitor_id', exhibitorId)
      .maybeSingle();
    if (!msErr && ms) columnViews = Number(ms.views ?? 0);
  }

  return profileCount + Math.max(minisiteCount, columnViews);
}

export async function fetchExhibitorMetrics(userId: string): Promise<RoleMetrics> {
  const { data: ex } = await supabase.from('exhibitors').select('id').eq('user_id', userId).maybeSingle();

  const exhibitorFilter = ex?.id
    ? `exhibitor_id.eq.${userId},exhibitor_id.eq.${ex.id}`
    : `exhibitor_id.eq.${userId}`;

  const [appts, msgs, conns, leads, profileViews] = await Promise.all([
    supabase.from('appointments').select('id', { count: 'exact', head: true }).or(exhibitorFilter),
    supabase.from('messages').select('id', { count: 'exact', head: true }).or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
    supabase.from('connections').select('id', { count: 'exact', head: true }).or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
    supabase.from('exhibitor_leads').select('id', { count: 'exact', head: true }).eq('exhibitor_user_id', userId),
    resolveExhibitorProfileViews(userId, ex?.id),
  ]);

  return {
    appointments: appts.count ?? 0,
    messages: msgs.count ?? 0,
    connections: conns.count ?? 0,
    profileViews,
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
  const [users, payments, registrations] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('payment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return {
    totalUsers: users.count ?? 0,
    pendingPayments: payments.count ?? 0,
    pendingValidations: registrations.count ?? 0,
  };
}
