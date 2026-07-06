import { sanitizeIlikeTerm } from '../lib/sanitizeIlike';
import { participantNamesMatch } from '../lib/participantNameMatch';
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

export interface ParticipantSearchParams {
  email?: string;
  firstName?: string;
  lastName?: string;
  /** Recherche libre : code badge, email, ou nom */
  query?: string;
}

function mapBadgeRow(badgeRow: Record<string, unknown>, u: Record<string, unknown> | null): VisitorLookup {
  return {
    found: true,
    userId: (u?.id ?? badgeRow.user_id) as string,
    name: (u?.name ?? badgeRow.full_name) as string,
    email: (u?.email ?? badgeRow.email) as string,
    type: u?.type as string,
    visitorLevel: u?.visitor_level as string,
    status: u?.status as string,
    hasBadge: true,
    badge: {
      id: badgeRow.id as string,
      userId: badgeRow.user_id as string,
      badgeCode: badgeRow.badge_code as string,
      userType: badgeRow.user_type as string,
      userLevel: badgeRow.user_level as string | undefined,
      fullName: badgeRow.full_name as string,
      companyName: badgeRow.company_name as string | undefined,
      email: badgeRow.email as string,
      accessLevel: badgeRow.access_level as string,
      validFrom: new Date(badgeRow.valid_from as string),
      validUntil: new Date(badgeRow.valid_until as string),
      status: badgeRow.status as string,
    },
  };
}

/** Recherche plusieurs participants (email entreprise partagé). */
export async function lookupParticipants(params: ParticipantSearchParams): Promise<VisitorLookup[]> {
  const email = params.email?.trim().toLowerCase();
  const hasName = Boolean(params.firstName?.trim() || params.lastName?.trim());

  if (email) {
    const { data: badgeRows, error } = await supabase
      .from('user_badges')
      .select('*, user:users!user_id(id, name, email, type, visitor_level, status)')
      .eq('email', email);

    if (error) throw error;

    let rows = badgeRows ?? [];
    if (hasName) {
      rows = rows.filter((row) =>
        participantNamesMatch(String(row.full_name ?? ''), {
          firstName: params.firstName,
          lastName: params.lastName,
        }),
      );
    }

    if (rows.length > 0) {
      return rows.map((row) => mapBadgeRow(row as Record<string, unknown>, row.user as Record<string, unknown> | null));
    }

    const { data: userRows } = await supabase
      .from('users')
      .select('id, name, email, type, visitor_level, status')
      .eq('email', email);

    let users = userRows ?? [];
    if (hasName) {
      users = users.filter((u) =>
        participantNamesMatch(String(u.name ?? ''), {
          firstName: params.firstName,
          lastName: params.lastName,
        }),
      );
    }

    const results: VisitorLookup[] = [];
    for (const userRow of users) {
      const { data: badge } = await supabase.from('user_badges').select('*').eq('user_id', userRow.id).maybeSingle();
      results.push({
        found: true,
        userId: userRow.id,
        name: userRow.name,
        email: userRow.email,
        type: userRow.type,
        visitorLevel: userRow.visitor_level,
        status: userRow.status,
        hasBadge: !!badge,
        badge: badge ? mapBadgeRow(badge as Record<string, unknown>, userRow as Record<string, unknown>).badge : undefined,
      });
    }
    return results;
  }

  const single = await lookupParticipant(params.query ?? '');
  return single.found ? [single] : [single];
}

/** Recherche un participant par email+nom, code badge ou nom */
export async function lookupParticipant(queryOrParams: string | ParticipantSearchParams): Promise<VisitorLookup> {
  if (typeof queryOrParams !== 'string') {
    const list = await lookupParticipants(queryOrParams);
    const found = list.filter((r) => r.found);
    if (found.length === 1) return found[0];
    if (found.length > 1) {
      return {
        found: false,
        hasBadge: false,
        error: `${found.length} visiteurs trouvés — précisez le prénom et le nom.`,
      };
    }
    return list[0] ?? { found: false, hasBadge: false, error: 'Participant introuvable' };
  }

  const term = queryOrParams.trim().toLowerCase();
  if (!term) return { found: false, hasBadge: false, error: 'Saisie vide' };

  try {
    const safeTerm = sanitizeIlikeTerm(term);
    const { data: badgeRow } = await supabase
      .from('user_badges')
      .select('*, user:users!user_id(id, name, email, type, visitor_level, status)')
      .ilike('badge_code', `%${safeTerm}%`)
      .maybeSingle();

    if (badgeRow) {
      return mapBadgeRow(badgeRow as Record<string, unknown>, badgeRow.user as Record<string, unknown> | null);
    }

    if (term.includes('@')) {
      const list = await lookupParticipants({ email: term });
      const found = list.filter((r) => r.found);
      if (found.length === 1) return found[0];
      if (found.length > 1) {
        return {
          found: false,
          hasBadge: false,
          error: `${found.length} visiteurs avec cet email — ajoutez le prénom et le nom.`,
        };
      }
      return list[0] ?? { found: false, hasBadge: false, error: 'Participant introuvable' };
    }

    const { data: nameRows } = await supabase
      .from('users')
      .select('id, name, email, type, visitor_level, status')
      .ilike('name', `%${term}%`)
      .limit(5);

    if (nameRows?.length) {
      const first = nameRows[0];
      const { data: badge } = await supabase.from('user_badges').select('*').eq('user_id', first.id).maybeSingle();
      return {
        found: true,
        userId: first.id,
        name: first.name,
        email: first.email,
        type: first.type,
        visitorLevel: first.visitor_level,
        status: first.status,
        hasBadge: !!badge,
        badge: badge ? mapBadgeRow(badge as Record<string, unknown>, first as Record<string, unknown>).badge : undefined,
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
      const existing = await lookupParticipants({ email, firstName: params.firstName, lastName: params.lastName });
      const match = existing.find((r) => r.found);
      if (match?.userId) {
        return {
          userId: match.userId,
          badgeCode: match.badge?.badgeCode ?? `SIB-${match.userId.slice(0, 8).toUpperCase()}`,
        };
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
  const { data: badgeData, error: badgeError } = await supabase.functions.invoke('generate-visitor-badge', {
    body: { userId, email, name, level: 'free', includePhoto: false },
  });
  if (badgeError || badgeData?.error || !badgeData?.badgeCode) {
    throw new Error(badgeError?.message ?? badgeData?.error ?? 'Impossible de générer le badge sur place');
  }

  return { userId, badgeCode: badgeData.badgeCode as string };
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

  const { data: badgeData, error: badgeError } = await supabase.functions.invoke('generate-visitor-badge', {
    body: {
      userId: params.userId,
      email: userRow.email,
      name: userRow.name,
      level: userRow.visitor_level ?? 'free',
      includePhoto: false,
      replace: true,
    },
  });
  if (badgeError || badgeData?.error || !badgeData?.badgeCode) {
    throw new Error(badgeError?.message ?? badgeData?.error ?? 'Impossible de générer le nouveau badge');
  }

  return { newBadgeCode: badgeData.badgeCode as string };
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
