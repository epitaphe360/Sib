import { supabase } from '../lib/supabase';

export interface PaymentRequestRow {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

export async function fetchPendingPaymentRequests(): Promise<PaymentRequestRow[]> {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('id, user_id, amount, currency, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  if (!data?.length) return [];

  const userIds = [...new Set(data.map((r) => r.user_id))];
  const { data: users } = await supabase.from('users').select('id, name, email').in('id', userIds);
  const userMap = new Map(users?.map((u) => [u.id, u]) ?? []);

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount),
    currency: row.currency ?? 'EUR',
    status: row.status,
    createdAt: row.created_at,
    userName: userMap.get(row.user_id)?.name,
    userEmail: userMap.get(row.user_id)?.email,
  }));
}

export async function validatePaymentRequest(requestId: string, approve: boolean, notes?: string): Promise<void> {
  const status = approve ? 'approved' : 'rejected';
  const { data: request, error: fetchErr } = await supabase
    .from('payment_requests')
    .select('user_id, requested_level')
    .eq('id', requestId)
    .single();

  if (fetchErr) throw fetchErr;

  const { error } = await supabase
    .from('payment_requests')
    .update({
      status,
      validation_notes: notes ?? null,
      validated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) throw error;

  if (approve && request?.user_id) {
    await supabase
      .from('users')
      .update({
        visitor_level: request.requested_level ?? 'premium',
        status: 'active',
      })
      .eq('id', request.user_id);
  }
}

export async function updateVipPrice(priceEur: number): Promise<void> {
  for (const level of ['premium', 'vip'] as const) {
    const { error } = await supabase
      .from('visitor_levels')
      .update({ price_annual: priceEur, price_monthly: priceEur, updated_at: new Date().toISOString() })
      .eq('level', level);
    if (error) throw error;
  }
}

export async function fetchVipPrice(): Promise<number> {
  const { data } = await supabase
    .from('visitor_levels')
    .select('price_annual')
    .eq('level', 'premium')
    .maybeSingle();
  return Number(data?.price_annual ?? 0);
}

export interface RegistrationAlertRow {
  id: string;
  email: string;
  name?: string;
  type?: string;
  status: string;
  createdAt: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  type: string;
  visitorLevel?: string;
  status?: string;
  createdAt?: string;
}

export async function fetchUsersForAdmin(search?: string, limit = 40): Promise<AdminUserRow[]> {
  let query = supabase
    .from('users')
    .select('id, name, email, type, visitor_level, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (search?.trim()) {
    const q = `%${search.trim()}%`;
    query = query.or(`name.ilike.${q},email.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name ?? row.email,
    email: row.email,
    type: row.type,
    visitorLevel: row.visitor_level ?? undefined,
    status: row.status ?? undefined,
    createdAt: row.created_at,
  }));
}

export async function updateUserStatusAdmin(userId: string, status: string): Promise<void> {
  const { error } = await supabase.from('users').update({ status }).eq('id', userId);
  if (error) throw error;
}

export async function fetchPendingRegistrationAlerts(): Promise<RegistrationAlertRow[]> {
  const { data, error } = await supabase
    .from('registration_requests')
    .select('id, email, name, type, status, created_at')
    .in('status', ['pending', 'pending_review'])
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name ?? undefined,
    type: row.type ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  }));
}
