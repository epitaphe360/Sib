import { supabase } from '../lib/supabase';
import { clearPendingSignup } from '../lib/pendingSignup';
import type { AppUser } from '../types';
import { fetchVipPassPricing } from './visitorLevel';

function mapUser(row: Record<string, unknown>): AppUser {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    type: row.type as AppUser['type'],
    visitorLevel: row.visitor_level as AppUser['visitorLevel'],
    partnerTier: (row.partner_tier as string) ?? undefined,
    status: row.status as string,
    profile: (row.profile as Record<string, unknown>) ?? {},
  };
}

export async function fetchAppUser(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, type, visitor_level, partner_tier, status, profile')
    .eq('id', userId)
    .maybeSingle();

  if (!error && data) return mapUser(data);

  // Fallback RPC si RLS récursif (42P17) ou profil bloqué
  const code = (error as { code?: string } | null)?.code;
  if (code === '42P17' || code === '42501' || !data) {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_profile');
    if (!rpcError && rpcData && typeof rpcData === 'object') {
      const row = rpcData as Record<string, unknown>;
      if (row.id === userId || !userId) return mapUser(row);
    }
  }

  if (error) throw error;
  return null;
}

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'Identifiants incorrects — vérifiez email et mot de passe';
  }
  if (m.includes('email not confirmed')) {
    return 'Email non confirmé — vérifiez votre boîte mail';
  }
  return message;
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  // Changement de compte : vider la session locale avant la nouvelle connexion
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
  await clearPendingSignup();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });
  if (error) throw new Error(mapAuthError(error.message));
  if (!data.user) throw new Error('Connexion impossible');

  const appUser = await fetchAppUser(data.user.id);
  if (!appUser) throw new Error('Profil utilisateur introuvable — vérifiez que le compte existe en base.');
  if (appUser.status && !['active', 'pending_payment'].includes(appUser.status)) {
    throw new Error('Compte non actif');
  }
  return appUser;
}

export async function signUpVisitorFree(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  sector: string;
  phone?: string;
}): Promise<AppUser> {
  const fullName = `${params.firstName} ${params.lastName}`.trim();
  const email = params.email.toLowerCase().trim();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: params.password,
    options: {
      data: { name: fullName, type: 'visitor', visitor_level: 'free' },
    },
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Inscription impossible');

  const { error: userError } = await supabase.from('users').insert([
    {
      id: authData.user.id,
      email,
      name: fullName,
      type: 'visitor',
      visitor_level: 'free',
      status: 'active',
      profile: {
        firstName: params.firstName,
        lastName: params.lastName,
        phone: params.phone ?? '',
        country: params.country,
        businessSector: params.sector,
      },
    },
  ]);
  if (userError) throw userError;

  const { data: badgeData, error: badgeError } = await supabase.functions.invoke('generate-visitor-badge', {
    body: {
      userId: authData.user.id,
      email,
      name: fullName,
      level: 'free',
      includePhoto: false,
    },
  });
  if (badgeError || badgeData?.error) {
    throw new Error('Profil créé mais badge non généré — ouvrez l\'onglet Badge pour réessayer');
  }

  const appUser = await fetchAppUser(authData.user.id);
  if (!appUser) throw new Error('Profil créé mais introuvable');
  return appUser;
}

export async function signUpVisitorVip(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  sector: string;
  phone?: string;
  company?: string;
  position?: string;
}): Promise<{ user: AppUser; paymentRequestId: string }> {
  const fullName = `${params.firstName} ${params.lastName}`.trim();
  const email = params.email.toLowerCase().trim();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: params.password,
    options: {
      data: { name: fullName, type: 'visitor', visitor_level: 'premium' },
    },
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Inscription impossible');

  const userId = authData.user.id;

  const { error: userError } = await supabase.from('users').insert([
    {
      id: userId,
      email,
      name: fullName,
      type: 'visitor',
      visitor_level: 'premium',
      status: 'pending_payment',
      profile: {
        firstName: params.firstName,
        lastName: params.lastName,
        phone: params.phone ?? '',
        country: params.country,
        businessSector: params.sector,
        company: params.company ?? '',
        position: params.position ?? '',
        hasPassword: true,
      },
    },
  ]);
  if (userError) throw userError;

  const vipPricing = await fetchVipPassPricing();
  const { data: prData, error: paymentError } = await supabase
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
    .select('id')
    .single();

  if (paymentError) throw paymentError;
  if (!prData?.id) throw new Error('Demande de paiement introuvable');

  const appUser = await fetchAppUser(userId);
  if (!appUser) throw new Error('Profil créé mais introuvable');

  return { user: appUser, paymentRequestId: prData.id };
}

export async function signOut(): Promise<void> {
  await clearPendingSignup().catch(() => undefined);
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
