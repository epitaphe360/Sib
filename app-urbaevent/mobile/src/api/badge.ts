import { supabase } from '../lib/supabase';
import type { UserBadge } from '../types';

export { ensureUserBadge, getUserBadge, badgeLevelLabel } from '../services/badge';
export { generateSecureQRCode, validateQRCode, ACCESS_LEVELS } from './qr';

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

export async function ensureUserBadgeWithProfile(userId: string): Promise<UserBadge> {
  const { data: userRow } = await supabase
    .from('users')
    .select('id, type, visitor_level, name, email, profile')
    .eq('id', userId)
    .single();

  if (!userRow) throw new Error('Utilisateur introuvable');

  const profile = (userRow.profile ?? {}) as Record<string, unknown>;
  let standNumber: string | null = null;
  let companyName = (profile.company as string) ?? null;

  if (userRow.type === 'exhibitor') {
    const { data: ex } = await supabase
      .from('exhibitors')
      .select('company_name, stand_number, hall_number')
      .eq('user_id', userId)
      .maybeSingle();
    if (ex) {
      companyName = ex.company_name ?? companyName;
      standNumber = ex.stand_number ?? ex.hall_number ?? null;
    }
  }

  const { data, error } = await supabase.rpc('upsert_user_badge', {
    p_user_id: userId,
    p_user_type: userRow.type,
    p_user_level: userRow.visitor_level ?? null,
    p_full_name: userRow.name,
    p_company_name: companyName,
    p_position: (profile.position as string) ?? null,
    p_email: userRow.email,
    p_phone: (profile.phone as string) ?? null,
    p_avatar_url: (profile.photoUrl as string) ?? (profile.avatar as string) ?? null,
    p_stand_number: standNumber,
  });

  if (error) throw error;
  return mapBadge(data as BadgeRow);
}
