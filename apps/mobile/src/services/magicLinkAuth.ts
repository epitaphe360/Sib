import type { User } from '@supabase/supabase-js';
import { getAuthCallbackUrl } from '../lib/authLink';
import { supabaseErrorMessage } from '../lib/supabaseError';
import {
  clearPendingSignup,
  loadPendingSignup,
  savePendingSignup,
  type PendingSignup,
} from '../lib/pendingSignup';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { fetchAppUser } from './auth';
import type { AppUser } from '../types';
import { fetchVipPassPricing } from './visitorLevel';

async function tryGenerateBadge(userId: string, email: string, name: string, level: string) {
  const { data, error } = await supabase.functions.invoke('generate-visitor-badge', {
    body: { userId, email, name, level, includePhoto: false },
  });
  if (error) {
    logger.warn('magicLinkAuth', 'generate-visitor-badge failed', error);
    throw new Error('Profil créé mais badge non généré — ouvrez l\'onglet Badge pour réessayer');
  }
  if (data?.error) {
    throw new Error(String(data.error));
  }
}

async function createUsersRowFromPending(userId: string, pending: Omit<PendingSignup, 'createdAt'>) {
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
  const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;

  if (pending && pending.email.toLowerCase() === email) {
    const extra = await createUsersRowFromPending(authUser.id, pending);
    await clearPendingSignup();
    const appUser = await fetchAppUser(authUser.id);
    if (!appUser) throw new Error('Profil créé mais introuvable');
    return { appUser, paymentRequestId: extra.paymentRequestId };
  }

  // Inscription ouverte sur un autre appareil : reconstituer depuis les métadonnées auth
  if (email && (meta.signup_intent || meta.type === 'visitor')) {
    const fullName = String(meta.name ?? meta.full_name ?? '').trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    const recovered = {
      intent: (meta.signup_intent === 'vip' ? 'vip' : 'free') as 'free' | 'vip',
      email,
      firstName: String(meta.firstName ?? parts[0] ?? 'Visiteur'),
      lastName: String(meta.lastName ?? parts.slice(1).join(' ') ?? ''),
      country: String(meta.country ?? 'MA'),
      sector: String(meta.businessSector ?? meta.sector ?? 'Autre'),
      phone: meta.phone ? String(meta.phone) : undefined,
      company: meta.company ? String(meta.company) : undefined,
      position: meta.position ? String(meta.position) : undefined,
    };
    const extra = await createUsersRowFromPending(authUser.id, recovered);
    await clearPendingSignup();
    const appUser = await fetchAppUser(authUser.id);
    if (!appUser) throw new Error('Profil créé mais introuvable');
    return { appUser, paymentRequestId: extra.paymentRequestId };
  }

  throw new Error(
    'Profil introuvable. Relancez l’inscription badge depuis l’application, puis ouvrez le lien reçu par email.'
  );
}

function mapMagicLinkError(error: unknown, fallback: string): never {
  const raw = supabaseErrorMessage(error, fallback);
  const lower = raw.toLowerCase();
  if (lower.includes('redirect') || lower.includes('url')) {
    throw new Error('Lien magique : redirection non autorisée. Réessayez ou contactez le support UrbaEvent.');
  }
  if (lower.includes('rate') || lower.includes('limit')) {
    throw new Error('Trop de tentatives. Attendez quelques minutes avant de renvoyer un lien.');
  }
  if (lower.includes('signups not allowed') || lower.includes('not allowed for otp')) {
    throw new Error('Inscription par email temporairement indisponible. Contactez le support.');
  }
  if (lower.includes('magic link email') || lower.includes('sending magic link')) {
    throw new Error(
      'Envoi de l’email impossible pour le moment. Vérifiez votre adresse ou réessayez dans quelques minutes.'
    );
  }
  throw new Error(raw);
}

/** Contourne SMTP Auth cassé — envoi via Edge Function Resend */
async function sendMagicLinkViaEdge(params: {
  email: string;
  redirectTo: string;
  shouldCreateUser: boolean;
  linkType: 'signup' | 'magiclink';
}): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('send-magic-link', {
    body: params,
  });
  if (error) return false;
  if (data?.error) return false;
  if (data?.skipped) return false;
  return Boolean(data?.ok);
}

/** Connexion visiteur existant — pas de création de compte auth */
export async function sendMagicLinkLogin(email: string): Promise<void> {
  await clearPendingSignup();
  const normalized = email.toLowerCase().trim();
  const redirectTo = getAuthCallbackUrl();
  const sentViaEdge = await sendMagicLinkViaEdge({
    email: normalized,
    redirectTo,
    shouldCreateUser: false,
    linkType: 'magiclink',
  });
  if (sentViaEdge) return;

  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: false,
    },
  });
  if (error) {
    if (
      error.message.includes('Signups not allowed') ||
      error.message.includes('not found') ||
      error.message.includes('User not found')
    ) {
      throw new Error('Aucun compte pour cet email. Inscrivez-vous d’abord (Pass gratuit ou VIP).');
    }
    mapMagicLinkError(error, 'Impossible d’envoyer le lien de connexion.');
  }
}

/** Inscription visiteur — email validé par lien magique */
export async function sendMagicLinkSignup(pending: Omit<PendingSignup, 'createdAt'>): Promise<void> {
  const normalized = pending.email.toLowerCase().trim();
  await savePendingSignup(pending);
  const fullName = `${pending.firstName} ${pending.lastName}`.trim();

  const redirectTo = getAuthCallbackUrl();
  const sentViaEdge = await sendMagicLinkViaEdge({
    email: normalized,
    redirectTo,
    shouldCreateUser: true,
    linkType: 'signup',
  });
  if (sentViaEdge) return;

  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
      data: {
        name: fullName,
        firstName: pending.firstName,
        lastName: pending.lastName,
        type: 'visitor',
        visitor_level: pending.intent === 'vip' ? 'premium' : 'free',
        signup_intent: pending.intent,
        country: pending.country,
        businessSector: pending.sector,
        company: pending.company ?? '',
        position: pending.position ?? '',
      },
    },
  });

  if (error) {
    await clearPendingSignup();
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      throw new Error('Cet email est déjà inscrit. Utilisez « Connexion » pour recevoir un lien magique.');
    }
    mapMagicLinkError(error, 'Impossible d’envoyer le lien d’inscription badge.');
  }
}
