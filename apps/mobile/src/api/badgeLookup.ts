import { supabase } from '../lib/supabase';
import { participantNamesMatch } from '../lib/participantNameMatch';
import type { UserBadge } from '../types';

export interface BadgeLookupResult {
  found: boolean;
  badge: UserBadge | null;
  error?: string;
}

interface BadgeRow {
  id: string;
  user_id: string;
  badge_code: string;
  user_type: string;
  user_level?: string;
  full_name: string;
  company_name?: string;
  email: string;
  access_level: string;
  valid_from: string;
  valid_until: string;
  status: string;
}

function mapBadge(row: BadgeRow): UserBadge {
  return {
    id: row.id,
    userId: row.user_id,
    badgeCode: row.badge_code,
    userType: row.user_type,
    userLevel: row.user_level,
    fullName: row.full_name,
    companyName: row.company_name,
    email: row.email,
    accessLevel: row.access_level,
    validFrom: new Date(row.valid_from),
    validUntil: new Date(row.valid_until),
    status: row.status,
  };
}

const BADGE_COLS = 'id, user_id, badge_code, user_type, user_level, full_name, company_name, email, access_level, valid_from, valid_until, status';

function handleBadgeError(error: { code?: string; message?: string }): BadgeLookupResult | null {
  if (error.code === '42P01') return { found: false, badge: null, error: 'Table badges non disponible' };
  if (error.code === '42501' || error.message?.includes('permission')) {
    return { found: false, badge: null, error: 'Droits insuffisants pour accéder aux badges' };
  }
  return null;
}

async function lookupByCode(badgeCode: string): Promise<BadgeLookupResult> {
  const { data, error } = await supabase
    .from('user_badges')
    .select(BADGE_COLS)
    .eq('badge_code', badgeCode.trim())
    .maybeSingle();

  if (error) {
    const handled = handleBadgeError(error);
    if (handled) return handled;
    throw error;
  }
  if (!data) return { found: false, badge: null, error: 'Badge introuvable' };
  return { found: true, badge: mapBadge(data as BadgeRow) };
}

async function lookupByUserId(userId: string): Promise<BadgeLookupResult> {
  const { data, error } = await supabase
    .from('user_badges')
    .select(BADGE_COLS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    const handled = handleBadgeError(error);
    if (handled) return handled;
    throw error;
  }
  if (!data) return { found: false, badge: null, error: 'Aucun badge pour cet utilisateur' };
  return lookupByCode((data as BadgeRow).badge_code);
}

function decodeJwtUserId(raw: string): string | null {
  try {
    const parts = raw.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.userId ?? payload.user_id ?? null;
  } catch {
    return null;
  }
}

export async function lookupBadgeByQRData(qrRawData: string): Promise<BadgeLookupResult> {
  const raw = qrRawData.trim();
  if (!raw) return { found: false, badge: null, error: 'QR vide' };

  let badgeCode: string | null = null;
  let userId: string | null = null;

  try {
    const parsed = JSON.parse(raw);
    badgeCode = parsed.code ?? parsed.badge_code ?? parsed.badgeCode ?? null;
    userId = parsed.userId ?? parsed.user_id ?? null;
  } catch {
    badgeCode = raw;
  }

  if (badgeCode) {
    const byCode = await lookupByCode(badgeCode);
    if (byCode.found) return byCode;
  }

  if (userId) return lookupByUserId(userId);

  const jwtUser = decodeJwtUserId(raw);
  if (jwtUser) return lookupByUserId(jwtUser);

  return { found: false, badge: null, error: 'Format QR non reconnu' };
}

export interface ParticipantNameFilter {
  firstName?: string;
  lastName?: string;
}

export async function lookupBadgesByEmail(
  email: string,
  nameFilter?: ParticipantNameFilter,
): Promise<BadgeLookupResult[]> {
  const normalized = email.trim().toLowerCase();
  const hasNameFilter = Boolean(nameFilter?.firstName?.trim() || nameFilter?.lastName?.trim());

  const { data: badges, error } = await supabase
    .from('user_badges')
    .select(BADGE_COLS)
    .eq('email', normalized);

  if (error) {
    const handled = handleBadgeError(error);
    if (handled) return [handled];
    throw error;
  }

  let rows = (badges ?? []) as BadgeRow[];
  if (hasNameFilter) {
    rows = rows.filter((b) =>
      participantNamesMatch(b.full_name, {
        firstName: nameFilter?.firstName,
        lastName: nameFilter?.lastName,
      }),
    );
  }

  if (rows.length > 0) {
    const results: BadgeLookupResult[] = [];
    for (const row of rows) {
      results.push(await lookupByCode(row.badge_code));
    }
    return results;
  }

  const { data: users } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('email', normalized);

  let userRows = users ?? [];
  if (hasNameFilter) {
    userRows = userRows.filter((u) =>
      participantNamesMatch(String(u.name ?? ''), {
        firstName: nameFilter?.firstName,
        lastName: nameFilter?.lastName,
      }),
    );
  }

  if (userRows.length === 0) {
    return [{ found: false, badge: null, error: 'Aucun compte avec cet email et ce nom' }];
  }

  const results: BadgeLookupResult[] = [];
  for (const u of userRows) {
    results.push(await lookupByUserId(u.id as string));
  }
  return results;
}

export async function lookupBadgeByEmail(
  email: string,
  nameFilter?: ParticipantNameFilter,
): Promise<BadgeLookupResult> {
  const results = await lookupBadgesByEmail(email, nameFilter);
  const found = results.filter((r) => r.found);
  if (found.length === 1) return found[0];
  if (found.length > 1) {
    return {
      found: false,
      badge: null,
      error: `${found.length} visiteurs avec cet email — précisez le prénom et le nom.`,
    };
  }
  return results[0] ?? { found: false, badge: null, error: 'Aucun compte avec cet email' };
}

export function buildStaticParticipantQR(badge: UserBadge): string {
  return JSON.stringify({
    code: badge.badgeCode,
    userId: badge.userId,
    type: badge.userType,
    level: badge.accessLevel,
    name: badge.fullName,
  });
}

export async function fetchVisitorBadgeForLead(visitorUserId: string): Promise<UserBadge | null> {
  const result = await lookupByUserId(visitorUserId);
  return result.badge;
}
