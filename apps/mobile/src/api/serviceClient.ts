import { sanitizeIlikeTerm } from '../lib/sanitizeIlike';
import { supabase } from '../lib/supabase';
import type { UserBadge } from '../types';

export interface VisitorLookup {
  found: boolean;
  userId?: string;
  name?: string;
  email?: string;
  type?: string;
  visitorLevel?: string;
  status?: string;
  badge?: UserBadge;
  hasBadge: boolean;
  error?: string;
}

/** Recherche un participant par email ou code badge */
export async function lookupParticipant(query: string): Promise<VisitorLookup> {
  const term = query.trim().toLowerCase();
  if (!term) return { found: false, hasBadge: false, error: 'Saisie vide' };

  try {
    const safeTerm = sanitizeIlikeTerm(term);
    // Chercher par code badge d'abord
    const { data: badgeRow } = await supabase
      .from('user_badges')
      .select('*, user:users!user_id(id, name, email, type, visitor_level, status)')
      .ilike('badge_code', `%${safeTerm}%`)
      .maybeSingle();

    if (badgeRow) {
      const u = badgeRow.user as Record<string, unknown> | null;
      return {
        found: true,
        userId: u?.id as string,
        name: u?.name as string,
        email: u?.email as string,
        type: u?.type as string,
        visitorLevel: u?.visitor_level as string,
        status: u?.status as string,
        hasBadge: true,
        badge: {
          id: badgeRow.id,
          userId: badgeRow.user_id,
          badgeCode: badgeRow.badge_code,
          userType: badgeRow.user_type,
          userLevel: badgeRow.user_level,
          fullName: badgeRow.full_name,
          companyName: badgeRow.company_name,
          email: badgeRow.email,
          accessLevel: badgeRow.access_level,
          validFrom: new Date(badgeRow.valid_from),
          validUntil: new Date(badgeRow.valid_until),
          status: badgeRow.status,
        },
      };
    }

    // Chercher par email
    const { data: userRow } = await supabase
      .from('users')
      .select('id, name, email, type, visitor_level, status')
      .ilike('email', term)
      .maybeSingle();

    if (userRow) {
      const { data: badge } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userRow.id)
        .maybeSingle();

      return {
        found: true,
        userId: userRow.id,
        name: userRow.name,
        email: userRow.email,
        type: userRow.type,
        visitorLevel: userRow.visitor_level,
        status: userRow.status,
        hasBadge: !!badge,
        badge: badge ? {
          id: badge.id,
          userId: badge.user_id,
          badgeCode: badge.badge_code,
          userType: badge.user_type,
          userLevel: badge.user_level,
          fullName: badge.full_name,
          companyName: badge.company_name,
          email: badge.email,
          accessLevel: badge.access_level,
          validFrom: new Date(badge.valid_from),
          validUntil: new Date(badge.valid_until),
          status: badge.status,
        } : undefined,
      };
    }

    // Chercher par nom partiel
    const { data: nameRows } = await supabase
      .from('users')
      .select('id, name, email, type, visitor_level, status')
      .ilike('name', `%${term}%`)
      .limit(5);

    if (nameRows?.length) {
      const first = nameRows[0];
      return {
        found: true,
        userId: first.id,
        name: first.name,
        email: first.email,
        type: first.type,
        visitorLevel: first.visitor_level,
        status: first.status,
        hasBadge: false,
      };
    }

    return { found: false, hasBadge: false, error: 'Participant introuvable' };
  } catch (e) {
    return { found: false, hasBadge: false, error: e instanceof Error ? e.message : 'Erreur serveur' };
  }
}

/** Inscription sur place — crée un visiteur gratuit */
export async function onSiteRegistration(params: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  sector?: string;
  operatorId: string;
}): Promise<{ userId: string; badgeCode: string }> {
  const name = `${params.firstName} ${params.lastName}`.trim();
  const email = params.email.toLowerCase().trim();

  const tempChars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const tempBytes = globalThis.crypto.getRandomValues(new Uint8Array(8));
  const tempPassword = Array.from(tempBytes, (b) => tempChars[b % tempChars.length]).join('') + 'SIB!';

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: tempPassword,
    options: { data: { name, type: 'visitor', visitor_level: 'free' } },
  });
  if (authError) {
    const msg = authError.message?.toLowerCase() ?? '';
    // Si déjà inscrit, chercher l'utilisateur
    if (msg.includes('already registered') || msg.includes('user already registered') || msg.includes('already exists')) {
      const existing = await lookupParticipant(email);
      if (existing.found && existing.userId) {
        return { userId: existing.userId, badgeCode: existing.badge?.badgeCode ?? `SIB-${existing.userId.slice(0, 8).toUpperCase()}` };
      }
      throw new Error(`Email déjà utilisé : ${email}`);
    }
    if (msg.includes('email rate limit') || msg.includes('over_email_send_rate')) {
      throw new Error('Trop d\'inscriptions en cours — attendez 1 minute et réessayez');
    }
    throw authError;
  }
  if (!authData.user) throw new Error('Inscription impossible');

  const userId = authData.user.id;

  await supabase.from('users').insert([{
    id: userId,
    email,
    name,
    type: 'visitor',
    visitor_level: 'free',
    status: 'active',
    profile: {
      firstName: params.firstName,
      lastName: params.lastName,
      phone: params.phone ?? '',
      country: params.country ?? '',
      businessSector: params.sector ?? '',
      onSiteRegistration: true,
      registeredBy: params.operatorId,
      registeredAt: new Date().toISOString(),
    },
  }]);

  // Générer le badge via edge function
  const { data: badgeData } = await supabase.functions.invoke('generate-visitor-badge', {
    body: { userId, email, name, level: 'free', includePhoto: false },
  }).catch(() => ({ data: null }));

  const badgeCode = badgeData?.badgeCode ?? `SIB-${userId.slice(0, 8).toUpperCase()}`;

  return { userId, badgeCode };
}

/** Remplace un badge perdu/endommagé */
export async function replaceBadge(params: {
  userId: string;
  reason: string;
  operatorId: string;
}): Promise<{ newBadgeCode: string }> {
  // Invalider l'ancien badge
  await supabase
    .from('user_badges')
    .update({ status: 'revoked' })
    .eq('user_id', params.userId)
    .eq('status', 'active');

  // Créer un log du remplacement
  try {
    await supabase.from('badge_replacements').insert([{
      user_id: params.userId,
      operator_id: params.operatorId,
      reason: params.reason,
      replaced_at: new Date().toISOString(),
    }]);
  } catch { /* table optionnelle */ }

  // Générer un nouveau badge via RPC
  const { data: userRow } = await supabase
    .from('users')
    .select('name, email, type, visitor_level, profile')
    .eq('id', params.userId)
    .single();

  if (!userRow) throw new Error('Utilisateur introuvable');

  const { data: badgeData } = await supabase.functions.invoke('generate-visitor-badge', {
    body: {
      userId: params.userId,
      email: userRow.email,
      name: userRow.name,
      level: userRow.visitor_level ?? 'free',
      includePhoto: false,
      replace: true,
    },
  }).catch(() => ({ data: null }));

  const newBadgeCode = badgeData?.badgeCode ?? `SIB-${params.userId.slice(0, 8).toUpperCase()}-R`;
  return { newBadgeCode };
}

/** Statistiques desk service client */
export async function fetchDeskStats(operatorId: string): Promise<{
  registrationsToday: number;
  badgesIssuedToday: number;
  replacementsToday: number;
}> {
  const today = new Date().toISOString().slice(0, 10);

  const [reg, repl] = await Promise.allSettled([
    supabase
      .from('users')
      .select('id', { count: 'exact' })
      .contains('profile', { onSiteRegistration: true, registeredBy: operatorId })
      .gte('created_at', `${today}T00:00:00.000Z`),
    supabase
      .from('badge_replacements')
      .select('id', { count: 'exact' })
      .eq('operator_id', operatorId)
      .gte('replaced_at', `${today}T00:00:00.000Z`),
  ]);

  const regCount = reg.status === 'fulfilled' && !reg.value.error ? (reg.value.count ?? 0) : 0;
  const replCount = repl.status === 'fulfilled' && !repl.value.error ? (repl.value.count ?? 0) : 0;

  return {
    registrationsToday: regCount,
    badgesIssuedToday: regCount,
    replacementsToday: replCount,
  };
}
