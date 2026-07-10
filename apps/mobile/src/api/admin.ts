import { supabase } from '../lib/supabase';
import { sanitizeIlikeTerm } from '../lib/sanitizeIlike';

export interface PaymentRequestRow {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  userName?: string;
  userEmail?: string;
}

export async function fetchPendingPaymentRequests(): Promise<PaymentRequestRow[]> {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('id, user_id, amount, currency, status, created_at, payment_method')
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
    paymentMethod: row.payment_method ?? undefined,
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

  if (fetchErr) {
    if (fetchErr.code === '42P01') throw new Error('Table paiements non disponible — contactez l\'administrateur');
    if (fetchErr.code === '42501' || fetchErr.code === 'PGRST301') {
      throw new Error('Droits insuffisants pour valider ce paiement');
    }
    throw fetchErr;
  }

  const { error: updateErr } = await supabase
    .from('payment_requests')
    .update({
      status,
      validation_notes: notes ?? null,
      validated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateErr) {
    if (updateErr.code === '42501' || updateErr.code === 'PGRST301') {
      throw new Error('Droits insuffisants pour mettre à jour ce paiement — appliquez la migration SQL');
    }
    throw updateErr;
  }

  if (approve && request?.user_id) {
    const { error: userErr } = await supabase
      .from('users')
      .update({
        visitor_level: request.requested_level ?? 'premium',
        status: 'active',
      })
      .eq('id', request.user_id);
    if (userErr) {
      const { error: rpcErr } = await supabase.rpc('admin_update_user_status', {
        target_user_id: request.user_id,
        new_status: 'active',
      });
      if (rpcErr && rpcErr.code !== 'PGRST202') {
        throw new Error('Paiement validé mais impossible d\'activer le compte — vérifiez les droits admin');
      }
    }
  }
}

export async function updateVipPrice(priceEur: number): Promise<void> {
  const { error: rpcError } = await supabase.rpc('admin_update_vip_price', { new_price: priceEur });
  if (!rpcError) return;

  if (rpcError.code !== 'PGRST202' && !rpcError.message.includes('admin_update_vip_price')) {
    throw rpcError;
  }

  for (const level of ['premium', 'vip'] as const) {
    const { data, error } = await supabase
      .from('visitor_levels')
      .update({ price_annual: priceEur, price_monthly: priceEur, updated_at: new Date().toISOString() })
      .eq('level', level)
      .select('level');
    if (error) throw error;
    if (!data?.length) {
      throw new Error('Mise à jour tarif refusée — droits administrateur insuffisants');
    }
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
    const q = `%${sanitizeIlikeTerm(search)}%`;
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

const PROTECTED_USER_TYPES = new Set(['admin']);

export async function updateUserStatusAdmin(userId: string, status: string, userType?: string): Promise<void> {
  if (userType && PROTECTED_USER_TYPES.has(userType)) {
    throw new Error('Impossible de suspendre un administrateur');
  }

  const { error: rpcError } = await supabase.rpc('admin_update_user_status', {
    target_user_id: userId,
    new_status: status,
  });
  if (!rpcError) return;

  if (rpcError.code !== 'PGRST202' && !rpcError.message.includes('admin_update_user_status')) {
    if (rpcError.message.includes('administrateur')) {
      throw new Error('Impossible de suspendre un administrateur');
    }
    throw rpcError;
  }

  if (userType === 'admin') {
    throw new Error('Impossible de suspendre un administrateur');
  }

  const { data: target, error: fetchErr } = await supabase
    .from('users')
    .select('type')
    .eq('id', userId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (target?.type === 'admin') {
    throw new Error('Impossible de suspendre un administrateur');
  }

  const { error } = await supabase.from('users').update({ status }).eq('id', userId);
  if (error) {
    if (error.code === '42501' || error.code === 'PGRST301') {
      throw new Error('Droits insuffisants — appliquez la migration SQL dans votre espace Supabase');
    }
    throw error;
  }
}

export async function reviewRegistrationRequest(requestId: string, approve: boolean): Promise<void> {
  const status = approve ? 'approved' : 'rejected';

  const { data: request, error: fetchErr } = await supabase
    .from('registration_requests')
    .select('user_id, user_type')
    .eq('id', requestId)
    .single();

  if (fetchErr) throw fetchErr;

  const { error } = await supabase
    .from('registration_requests')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) throw error;

  if (request?.user_id) {
    const newUserStatus = approve ? 'active' : 'rejected';
    const { error: userError } = await supabase
      .from('users')
      .update({ status: newUserStatus })
      .eq('id', request.user_id);

    if (userError) throw userError;

    if (request.user_type === 'partner' && approve) {
      await supabase.from('partners').update({ verified: true }).eq('id', request.user_id);
    }
    if (request.user_type === 'exhibitor' && approve) {
      await supabase.from('exhibitors').update({ verified: true }).eq('user_id', request.user_id);
    }
  }
}

export async function fetchPendingRegistrationAlerts(): Promise<RegistrationAlertRow[]> {
  const { data, error } = await supabase
    .from('registration_requests')
    .select('id, email, first_name, last_name, user_type, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    name: row.first_name && row.last_name
      ? `${row.first_name} ${row.last_name}`
      : row.first_name ?? row.last_name ?? undefined,
    type: row.user_type ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  }));
}
