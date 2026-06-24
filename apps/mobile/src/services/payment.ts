import { supabase } from '../lib/supabase';
import { fetchVipPassPricing } from './visitorLevel';

export interface PaymentRequest {
  id: string;
  userId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export async function createVipPaymentRequest(userId: string): Promise<PaymentRequest> {
  const vipPricing = await fetchVipPassPricing();
  const { data, error } = await supabase
    .from('payment_requests')
    .insert([
      {
        user_id: userId,
        amount: vipPricing.price,
        currency: vipPricing.currency,
        status: 'pending',
        payment_method: 'bank_transfer',
        requested_level: 'premium',
      },
    ])
    .select('id, user_id, amount, status, payment_method, created_at')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    amount: data.amount,
    status: data.status,
    paymentMethod: data.payment_method,
    createdAt: data.created_at,
  };
}

export async function resolveVipPaymentRedirectId(userId: string): Promise<string | undefined> {
  const latest = await getLatestPaymentRequest(userId);
  if (latest?.status === 'pending') return latest.id;

  try {
    const created = await createVipPaymentRequest(userId);
    return created.id;
  } catch {
    return latest?.id;
  }
}

export async function getLatestPaymentRequest(userId: string): Promise<PaymentRequest | null> {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('id, user_id, amount, status, payment_method, created_at')
    .eq('user_id', userId)
    .eq('payment_method', 'bank_transfer')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    amount: data.amount,
    status: data.status,
    paymentMethod: data.payment_method,
    createdAt: data.created_at,
  };
}

export async function getPaymentRequest(requestId: string): Promise<PaymentRequest | null> {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('id, user_id, amount, status, payment_method, created_at')
    .eq('id', requestId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    amount: data.amount,
    status: data.status,
    paymentMethod: data.payment_method,
    createdAt: data.created_at,
  };
}
