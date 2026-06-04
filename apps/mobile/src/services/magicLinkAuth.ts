import type { User } from '@supabase/supabase-js';
import { AUTH_CALLBACK_URL } from '../lib/authLink';
import {
  clearPendingSignup,
  loadPendingSignup,
  savePendingSignup,
  type PendingSignup,
} from '../lib/pendingSignup';
import { supabase } from '../lib/supabase';
import { fetchAppUser } from './auth';
import type { AppUser } from '../types';
import { fetchVipPassPricing } from './visitorLevel';

async function tryGenerateBadge(userId: string, email: string, name: string, level: string) {
  try {
    await supabase.functions.invoke('generate-visitor-badge', {
      body: { userId, email, name, level, includePhoto: false },
    });
  } catch {
    // optionnel
  }
}

async function createUsersRowFromPending(userId: string, pending: PendingSignup) {
  const fullName = `${pending.firstName} ${pending.lastName}`.trim();
  const email = pending.email.toLowerCase().trim();
  const isVip = pending.intent === 'vip';

  const { error: userError } = await supabase.from('users').insert([
    {
      id: userId,
      email,
      name: fullName,
      type: 'visitor',
      visitor_level: isVip ? 'premium' : 'free',
      status: isVip ? 'pending_payment' : 'active',
      profile: {
        firstName: pending.firstName,
        lastName: pending.lastName,
        phone: pending.phone ?? '',
        country: pending.country,
        businessSector: pending.sector,
        company: pending.company ?? '',
        position: pending.position ?? '',
        authMethod: 'magic_link',
      },
    },
  ]);
  if (userError) {
    if (userError.code === '23505') {
      const existing = await fetchAppUser(userId);
      if (existing) return { paymentRequestId: undefined };
    }
    throw userError;
  }

  await tryGenerateBadge(userId, email, fullName, isVip ? 'premium' : 'free');

  if (isVip) {
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
    return { paymentRequestId: prData?.id as string | undefined };
  }

  return { paymentRequestId: undefined };
}

/** Finalise le profil `users` après validation du lien magique */
export async function finalizeProfileAfterMagicLink(
  authUser: User
): Promise<{ appUser: AppUser; paymentRequestId?: string }> {
  const existing = await fetchAppUser(authUser.id);
  if (existing) {
    await clearPendingSignup();
    if (existing.status && !['active', 'pending_payment'].includes(existing.status)) {
      throw new Error('Compte non actif');
    }
    return { appUser: existing };
  }

  const pending = await loadPendingSignup();
  const email = (authUser.email ?? pending?.email ?? '').toLowerCase().trim();

  if (pending && pending.email.toLowerCase() === email) {
    const extra = await createUsersRowFromPending(authUser.id, pending);
    await clearPendingSignup();
    const appUser = await fetchAppUser(authUser.id);
    if (!appUser) throw new Error('Profil créé mais introuvable');
    return { appUser, paymentRequestId: extra.paymentRequestId };
  }

  throw new Error(
    'Profil introuvable. Terminez votre inscription depuis l’application ou contactez le support.'
  );
}

/** Connexion visiteur existant — pas de création de compte auth */
export async function sendMagicLinkLogin(email: string): Promise<void> {
  await clearPendingSignup();
  const normalized = email.toLowerCase().trim();
  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: AUTH_CALLBACK_URL,
      shouldCreateUser: false,
    },
  });
  if (error) {
    if (error.message.includes('Signups not allowed') || error.message.includes('not found')) {
      throw new Error('Aucun compte pour cet email. Inscrivez-vous d’abord (Pass gratuit ou VIP).');
    }
    throw error;
  }
}

/** Inscription visiteur — email validé par lien magique */
export async function sendMagicLinkSignup(pending: Omit<PendingSignup, 'createdAt'>): Promise<void> {
  const normalized = pending.email.toLowerCase().trim();
  await savePendingSignup(pending);
  const fullName = `${pending.firstName} ${pending.lastName}`.trim();

  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: AUTH_CALLBACK_URL,
      shouldCreateUser: true,
      data: {
        name: fullName,
        type: 'visitor',
        visitor_level: pending.intent === 'vip' ? 'premium' : 'free',
        signup_intent: pending.intent,
      },
    },
  });

  if (error) {
    await clearPendingSignup();
    throw error;
  }
}
