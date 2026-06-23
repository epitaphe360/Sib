import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { PendingSignup, SignupIntent } from './pendingSignup';

export async function saveRegistrationPending(pending: Omit<PendingSignup, 'createdAt'>): Promise<void> {
  const email = pending.email.toLowerCase().trim();
  await supabase.from('registration_requests').insert([
    {
      user_type: 'visitor',
      email,
      first_name: pending.firstName,
      last_name: pending.lastName,
      phone: pending.phone ?? '—',
      company_name: pending.company ?? null,
      position: pending.position ?? null,
      profile_data: {
        country: pending.country,
        sector: pending.sector,
        intent: pending.intent,
      },
      status: 'pending',
    },
  ]);
}

export async function loadRegistrationPending(email: string): Promise<PendingSignup | null> {
  const normalized = email.toLowerCase().trim();
  const { data, error } = await supabase
    .from('registration_requests')
    .select('first_name, last_name, phone, company_name, position, profile_data, created_at')
    .eq('email', normalized)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const pd = (data.profile_data ?? {}) as Record<string, unknown>;
  const intent = (pd.intent === 'vip' ? 'vip' : 'free') as SignupIntent;

  return {
    intent,
    email: normalized,
    firstName: data.first_name,
    lastName: data.last_name,
    country: String(pd.country ?? 'MA'),
    sector: String(pd.sector ?? 'Autre'),
    phone: data.phone ?? undefined,
    company: data.company_name ?? undefined,
    position: data.position ?? undefined,
    createdAt: data.created_at ?? new Date().toISOString(),
  };
}

export async function markRegistrationCompleted(email: string, userId: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  await supabase
    .from('registration_requests')
    .update({ status: 'approved', user_id: userId, reviewed_at: new Date().toISOString() })
    .eq('email', normalized)
    .eq('status', 'pending');
}

export function pendingFromAuthMetadata(authUser: User): PendingSignup | null {
  const meta = authUser.user_metadata ?? {};
  const email = authUser.email?.toLowerCase().trim();
  if (!email) return null;

  const fullName = String(meta.name ?? meta.full_name ?? '').trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  const intent = meta.signup_intent === 'vip' || meta.visitor_level === 'premium' ? 'vip' : 'free';

  if (!parts.length && !meta.first_name) return null;

  return {
    intent,
    email,
    firstName: String(meta.first_name ?? parts[0] ?? ''),
    lastName: String(meta.last_name ?? parts.slice(1).join(' ') ?? ''),
    country: String(meta.country ?? 'MA'),
    sector: String(meta.sector ?? meta.businessSector ?? 'Autre'),
    phone: meta.phone ? String(meta.phone) : undefined,
    company: meta.company ? String(meta.company) : undefined,
    position: meta.position ? String(meta.position) : undefined,
    createdAt: new Date().toISOString(),
  };
}
