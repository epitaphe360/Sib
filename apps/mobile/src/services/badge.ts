import { supabase } from '../lib/supabase';
import { supabaseErrorMessage } from '../lib/supabaseError';
import { badgeAccessColor, badgeLevelLabel } from '../lib/badgeDisplay';
import type { UserBadge } from '../types';

export { badgeAccessColor, badgeLevelLabel };

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

export async function ensureUserBadge(userId: string): Promise<UserBadge> {
  const existing = await getUserBadge(userId);
  if (existing) return existing;

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('id, type, visitor_level, name, email')
    .eq('id', userId)
    .single();

  if (userError || !userRow) {
    throw new Error(supabaseErrorMessage(userError, 'Utilisateur introuvable'));
  }

  let companyName: string | null = null;
  let standNumber: string | null = null;

  if (userRow.type === 'exhibitor') {
    const { data: exhibitor } = await supabase
      .from('exhibitors')
      .select('company_name, stand_number')
      .eq('user_id', userId)
      .maybeSingle();
    companyName = (exhibitor?.company_name as string) ?? null;
    standNumber = (exhibitor?.stand_number as string) ?? null;
  }

  const { data, error } = await supabase.rpc('upsert_user_badge', {
    p_user_id: userId,
    p_user_type: userRow.type,
    p_user_level: userRow.visitor_level ?? null,
    p_full_name: userRow.name,
    p_company_name: companyName,
    p_position: null,
    p_email: userRow.email,
    p_phone: null,
    p_avatar_url: null,
    p_stand_number: standNumber,
  });

  if (error) throw new Error(supabaseErrorMessage(error, 'Impossible de créer le badge'));
  return mapBadge(data as BadgeRow);
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
