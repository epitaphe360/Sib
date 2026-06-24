import { supabase } from '../lib/supabase';
import { supabaseErrorMessage } from '../lib/supabaseError';
import { fetchCollaboratorContext } from '../lib/collaboratorContext';
import { applyEventWindowToBadge, getActiveSalonEventWindow } from '../lib/salonEventWindow';
import type { UserBadge } from '../types';

export { badgeAccessColor, badgeLevelLabel } from '../lib/badgeDisplay';

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

export async function getUserBadge(userId: string): Promise<UserBadge | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    throw new Error('Non autorisé');
  }

  const { data, error } = await supabase
    .from('user_badges')
    .select(
      'id, user_id, badge_code, user_type, user_level, full_name, company_name, email, access_level, valid_from, valid_until, status'
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapBadge(data as BadgeRow) : null;
}

function badgeMatchesWindow(badge: UserBadge, window: { validFrom: Date; validUntil: Date }): boolean {
  return (
    Math.abs(badge.validFrom.getTime() - window.validFrom.getTime()) < 60_000 &&
    Math.abs(badge.validUntil.getTime() - window.validUntil.getTime()) < 60_000
  );
}

async function upsertBadgeForUser(
  userId: string,
  userRow: { type: string; visitor_level?: string | null; name: string; email: string; profile?: Record<string, unknown> | null },
  companyName: string | null,
  standNumber: string | null,
  position: string | null,
  profile: Record<string, unknown>
): Promise<UserBadge> {
  const window = userRow.type === 'visitor' ? await getActiveSalonEventWindow() : null;

  const rpcBody: Record<string, unknown> = {
    p_user_id: userId,
    p_user_type: userRow.type,
    p_user_level: userRow.visitor_level ?? null,
    p_full_name: userRow.name,
    p_company_name: companyName,
    p_position: position ?? (profile.position as string) ?? null,
    p_email: userRow.email,
    p_phone: null,
    p_avatar_url: null,
    p_stand_number: standNumber,
  };

  if (window) {
    rpcBody.p_valid_from = window.validFrom.toISOString();
    rpcBody.p_valid_until = window.validUntil.toISOString();
  }

  const { data, error } = await supabase.rpc('upsert_user_badge', rpcBody);

  if (error && window) {
    const retryBody = { ...rpcBody };
    delete retryBody.p_valid_from;
    delete retryBody.p_valid_until;
    const retry = await supabase.rpc('upsert_user_badge', retryBody);
    if (retry.error) throw new Error(supabaseErrorMessage(retry.error, 'Impossible de créer le badge'));
    return applyEventWindowToBadge(mapBadge(retry.data as BadgeRow), window);
  }

  if (error) throw new Error(supabaseErrorMessage(error, 'Impossible de créer le badge'));
  const badge = mapBadge(data as BadgeRow);
  return applyEventWindowToBadge(badge, window);
}

export async function ensureUserBadge(userId: string): Promise<UserBadge> {
  const window = await getActiveSalonEventWindow();
  const existing = await getUserBadge(userId);
  if (existing) {
    if (window && existing.userType === 'visitor' && !badgeMatchesWindow(existing, window)) {
        const { data: userRow } = await supabase
          .from('users')
          .select('id, type, visitor_level, name, email, profile')
          .eq('id', userId)
          .single();
        if (userRow) {
          const profile = (userRow.profile ?? {}) as Record<string, unknown>;
          return upsertBadgeForUser(userId, userRow, existing.companyName ?? null, null, null, profile);
        }
      }
    return applyEventWindowToBadge(existing, window);
  }

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('id, type, visitor_level, name, email, profile')
    .eq('id', userId)
    .single();

  if (userError || !userRow) {
    throw new Error(supabaseErrorMessage(userError, 'Utilisateur introuvable'));
  }

  let companyName: string | null = null;
  let standNumber: string | null = null;
  let position: string | null = null;
  const profile = (userRow.profile ?? {}) as Record<string, unknown>;

  if (userRow.type === 'exhibitor') {
    const { data: exhibitor } = await supabase
      .from('exhibitors')
      .select('company_name, stand_number')
      .eq('user_id', userId)
      .maybeSingle();
    if (exhibitor) {
      companyName = (exhibitor.company_name as string) ?? null;
      standNumber = (exhibitor.stand_number as string) ?? null;
    } else {
      const collaborator = await fetchCollaboratorContext(userId);
      if (collaborator) {
        companyName = collaborator.companyName || null;
        standNumber = collaborator.standNumber ?? null;
        position = collaborator.position ?? null;
      } else {
        companyName = (profile.company as string) ?? null;
      }
    }
  }

  return upsertBadgeForUser(userId, userRow, companyName, standNumber, position, profile);
}

export function generateQRPayload(badge: UserBadge): string {
  return JSON.stringify({
    code: badge.badgeCode,
    userId: badge.userId,
    type: badge.userType,
    level: badge.accessLevel,
    validUntil: badge.validUntil.toISOString(),
  });
}
