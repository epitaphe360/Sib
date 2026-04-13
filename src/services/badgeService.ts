import { supabase } from '../lib/supabase';
import { UserBadge } from '../types';
import { getDisplayName } from '@/utils/userHelpers';

type BadgeUserType = 'visitor' | 'exhibitor' | 'partner' | 'admin';

// Type definitions for database records
interface BadgeDBRecord {
  id: string;
  user_id: string;
  badge_code: string;
  user_type: string;
  user_level?: string;
  full_name: string;
  company_name?: string;
  sector?: string;
  created_at: string;
  qr_code_url?: string;
  [key: string]: unknown;
}

/**
 * Service de gestion des badges utilisateurs avec QR code
 * Supporte tous les types d'utilisateurs: visiteurs, exposants, partenaires
 */

/**
 * Récupère le badge d'un utilisateur
 * ✅ SECURITY FIX: Verify user ID matches current authenticated user
 */
export async function getUserBadge(userId: string): Promise<UserBadge | null> {
  try {
    // Security check: verify user is authenticated and requesting their own badge
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !currentUser) {
      throw new Error('Not authenticated');
    }
    
    if (currentUser.id !== userId) {
      console.warn(`⚠️ SECURITY ALERT: Unauthorized badge access attempt: ${currentUser.id} trying to access ${userId}`);
      throw new Error('Unauthorized: Cannot access badge for other user');
    }

    const { data, error } = await supabase
      .from('user_badges')
      .select('id, user_id, badge_code, user_type, user_level, full_name, company_name, position, email, phone, avatar_url, stand_number, access_level, valid_from, valid_until, status, qr_data, scan_count, last_scanned_at, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // Badge n'existe pas encore
        return null;
      }
      throw error;
    }

    // maybeSingle() can return null data without throwing when no row matches
    if (!data) {
      return null;
    }

    return transformBadgeFromDB(data);
  } catch (error) {
    console.error('Error fetching user badge:', error);
    throw error;
  }
}

/**
 * Crée ou met à jour le badge d'un utilisateur
 */
export async function upsertUserBadge(params: {
  userId: string;
  userType: BadgeUserType;
  userLevel?: string;
  fullName: string;
  companyName?: string;
  position?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  standNumber?: string;
}): Promise<UserBadge> {
  try {
    const { data, error } = await supabase.rpc('upsert_user_badge', {
      p_user_id: params.userId,
      p_user_type: params.userType,
      p_user_level: params.userLevel || null,
      p_full_name: params.fullName,
      p_company_name: params.companyName || null,
      p_position: params.position || null,
      p_email: params.email,
      p_phone: params.phone || null,
      p_avatar_url: params.avatarUrl || null,
      p_stand_number: params.standNumber || null,
    });

    if (error) throw error;
    if (!data) throw new Error('Badge RPC returned no data');

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('Badge RPC returned empty payload');

    return transformBadgeFromDB(row as BadgeDBRecord);
  } catch (error) {
    console.error('Error upserting user badge:', error);
    throw error;
  }
}

/**
 * Génère automatiquement un badge pour un utilisateur basé sur son profil
 */
export async function generateBadgeFromUser(userId: string): Promise<UserBadge> {
  try {
    // Récupérer l'utilisateur sans jointures imbriquées (plus robuste selon schéma/RLS)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, type, visitor_level, name, email, profile')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error('User not found');

    const normalizedUserType = String(user.type || '').toLowerCase();
    const allowedTypes: BadgeUserType[] = ['visitor', 'exhibitor', 'partner', 'admin'];
    if (!allowedTypes.includes(normalizedUserType as BadgeUserType)) {
      throw new Error(`Type utilisateur non supporte pour badge: ${normalizedUserType || 'inconnu'}`);
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const resolvedEmail = user.email || authUser?.email;
    if (!resolvedEmail) {
      throw new Error('Email utilisateur manquant pour generer le badge');
    }

    const resolvedFullName = getDisplayName(user) || user.name || 'Utilisateur SIB';

    // Préparer les paramètres selon le type d'utilisateur
    const badgeParams = {
      userId: user.id,
      userType: normalizedUserType as BadgeUserType,
      userLevel: user.visitor_level,
      fullName: resolvedFullName,
      email: resolvedEmail,
      phone: user.profile?.phone,
      avatarUrl: user.profile?.avatar,
      companyName: undefined as string | undefined,
      position: undefined as string | undefined,
      standNumber: undefined as string | undefined,
    };

    // Ajuster selon le type (requêtes séparées pour éviter les erreurs de relation)
    if (user.type === 'exhibitor') {
      const { data: exhibitor, error: exhibitorError } = await supabase
        .from('exhibitors')
        .select('company_name, stand_number')
        .eq('user_id', user.id)
        .maybeSingle();

      if (exhibitorError && exhibitorError.code !== 'PGRST116') throw exhibitorError;

      badgeParams.companyName = (exhibitor as any)?.company_name || user.profile?.company;
      badgeParams.position = user.profile?.position;
      badgeParams.standNumber = (exhibitor as any)?.stand_number;
    } else if (user.type === 'partner') {
      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('company_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (partnerError && partnerError.code !== 'PGRST116') throw partnerError;

      badgeParams.companyName = (partner as any)?.company_name || user.profile?.company;
      badgeParams.position = user.profile?.position;
    } else if (user.type === 'visitor') {
      badgeParams.companyName = user.profile?.company;
      badgeParams.position = user.profile?.position;
    }

    return await upsertUserBadge(badgeParams);
  } catch (error: any) {
    console.error('Error generating badge from user:', error);
    const message =
      error?.message ||
      error?.details ||
      error?.hint ||
      (typeof error === 'string' ? error : 'Erreur inconnue de génération de badge');
    throw new Error(message);
  }
}

/**
 * Vérifie un badge par son code
 */
export async function verifyBadgeByCode(badgeCode: string): Promise<UserBadge | null> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('id, user_id, badge_code, user_type, user_level, full_name, company_name, position, email, phone, avatar_url, stand_number, access_level, valid_from, valid_until, status, qr_data, scan_count, last_scanned_at, created_at, updated_at')
      .eq('badge_code', badgeCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    const badge = transformBadgeFromDB(data);

    // Vérifier la validité
    if (badge.status !== 'active') {
      throw new Error(`Badge is ${badge.status}`);
    }

    if (new Date(badge.validUntil) < new Date()) {
      throw new Error('Badge has expired');
    }

    return badge;
  } catch (error) {
    console.error('Error verifying badge:', error);
    throw error;
  }
}

/**
 * Scanne un badge (incrémente le compteur)
 */
export async function scanBadge(badgeCode: string): Promise<UserBadge> {
  try {
    const { data, error } = await supabase.rpc('scan_badge', {
      p_badge_code: badgeCode,
    });

    if (error) throw error;

    return transformBadgeFromDB(data);
  } catch (error) {
    console.error('Error scanning badge:', error);
    throw error;
  }
}

/**
 * Révoque un badge (admin uniquement)
 */
export async function revokeBadge(badgeId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_badges')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('id', badgeId);

    if (error) throw error;
  } catch (error) {
    console.error('Error revoking badge:', error);
    throw error;
  }
}

/**
 * Renouvelle la validité d'un badge (admin ou auto-renouvellement)
 */
export async function renewBadge(badgeId: string, daysToAdd: number = 3): Promise<UserBadge> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .update({
        valid_until: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', badgeId)
      .select('id, user_id, badge_code, user_type, user_level, full_name, company_name, position, email, phone, avatar_url, stand_number, access_level, valid_from, valid_until, status, qr_data, scan_count, last_scanned_at, created_at, updated_at')
      .single();

    if (error) throw error;

    return transformBadgeFromDB(data);
  } catch (error) {
    console.error('Error renewing badge:', error);
    throw error;
  }
}

/**
 * Transforme les données de la base de données en objet UserBadge
 */
function transformBadgeFromDB(data: BadgeDBRecord): UserBadge {
  return {
    id: data.id,
    userId: data.user_id,
    badgeCode: data.badge_code,
    userType: data.user_type,
    userLevel: data.user_level,
    fullName: data.full_name,
    companyName: data.company_name,
    position: data.position,
    email: data.email,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    standNumber: data.stand_number,
    accessLevel: data.access_level,
    validFrom: new Date(data.valid_from),
    validUntil: new Date(data.valid_until),
    status: data.status,
    qrData: data.qr_data,
    scanCount: data.scan_count || 0,
    lastScannedAt: data.last_scanned_at ? new Date(data.last_scanned_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Génère les données du QR code pour un badge
 */
export function generateQRData(badge: UserBadge): string {
  const qrData = {
    code: badge.badgeCode,
    userId: badge.userId,
    type: badge.userType,
    level: badge.accessLevel,
    validUntil: badge.validUntil.toISOString(),
  };
  return JSON.stringify(qrData);
}

/**
 * Obtient la couleur du badge selon le niveau d'accès
 */
export function getBadgeColor(accessLevel: string): string {
  switch (accessLevel) {
    case 'admin':
      return '#F44336'; // Rouge
    case 'security':
      return '#FF9800'; // Orange
    case 'exhibitor':
      return '#4CAF50'; // Vert
    case 'visitor_premium':
    case 'vip':
    case 'partner_gold':
      return '#FFD700'; // Or
    case 'partner':
      return '#3F51B5'; // Indigo
    case 'partner_silver':
      return '#C0C0C0'; // Argent
    case 'partner_official_sponsor':
      return '#E0E0E0'; // Sponsor Officiel
    case 'partner_organizer':
      return '#6f42c1'; // Violet
    case 'visitor_free':
      return '#9E9E9E'; // Gris
    case 'standard':
    default:
      return '#28a745'; // Vert par défaut
  }
}

/**
 * Obtient le libellé du niveau d'accès
 */
export function getAccessLevelLabel(accessLevel: string): string {
  switch (accessLevel) {
    case 'admin':
      return 'Administrateur';
    case 'security':
      return 'Sécurité';
    case 'exhibitor':
      return 'Exposant';
    case 'visitor_premium':
    case 'vip':
      return 'Visiteur VIP';
    case 'visitor_free':
      return 'Visiteur';
    case 'partner':
      return 'Partenaire';
    case 'partner_silver':
      return 'Sponsor Silver';
    case 'partner_gold':
      return 'Sponsor Gold';
    case 'partner_official_sponsor':
      return 'Sponsor Officiel';
    case 'partner_organizer':
      return 'Organisateur';
    case 'standard':
    default:
      return 'Standard';
  }
}
