/**
 * Service d'impression de badges papier
 * Utilisé par le stand "Service Clientèle" pour imprimer des badges physiques
 * après scan du QR code d'un participant
 */

import { supabase } from '../lib/supabase';
import { UserBadge } from '../types';
import { getBadgeColor, getAccessLevelLabel } from './badgeService';


type AnyRecord = Record<string, any>;

function getClient() {
  if (!supabase) {throw new Error('Supabase client not initialized');}
  return supabase;
}

// Types pour l'historique d'impression
export interface PrintRecord {
  id: string;
  badgeId: string;
  badgeCode: string;
  fullName: string;
  userType: string;
  printedAt: Date;
  printedBy: string;
  stationId: string;
  status: 'success' | 'error' | 'cancelled';
  copies: number;
}

export interface BadgeLookupResult {
  found: boolean;
  badge: UserBadge | null;
  user: {
    id: string;
    name: string;
    email: string;
    type: string;
    visitorLevel?: string;
    profile?: Record<string, unknown>;
  } | null;
  exhibitor?: {
    companyName: string;
    sector?: string;
    standNumber?: string;
    logoUrl?: string;
  } | null;
  partner?: {
    companyName: string;
    partnerType?: string;
    logoUrl?: string;
  } | null;
  error?: string;
}

/**
 * Recherche un badge par son code (scanné depuis QR)
 */
export async function lookupBadgeByCode(badgeCode: string): Promise<BadgeLookupResult> {
  try {
    const db = getClient();
    const { data, error: badgeError } = await db
      .from('user_badges')
      .select('*')
      .eq('badge_code', badgeCode)
      .maybeSingle();

    if (badgeError) {throw badgeError;}

    const badge = data as AnyRecord | null;

    if (!badge) {
      return { found: false, badge: null, user: null, error: 'Badge non trouvé' };
    }

    // Récupérer les infos utilisateur
    const { data: userData, error: userError } = await db
      .from('users')
      .select(`
        id, name, email, type, visitor_level, profile,
        exhibitors:exhibitors!exhibitors_user_id_fkey(company_name, sector, stand_number, logo_url),
        partners:partners!partners_user_id_fkey(company_name, partner_type, logo_url)
      `)
      .eq('id', badge.user_id)
      .single();

    const user = userData as AnyRecord | null;

    if (userError) {
      console.warn('User not found for badge:', userError);
    }

    const transformedBadge: UserBadge = {
      id: badge.id,
      userId: badge.user_id,
      badgeCode: badge.badge_code,
      userType: badge.user_type,
      userLevel: badge.user_level,
      fullName: badge.full_name,
      companyName: badge.company_name,
      position: badge.position,
      email: badge.email,
      phone: badge.phone,
      avatarUrl: badge.avatar_url,
      standNumber: badge.stand_number,
      accessLevel: badge.access_level,
      validFrom: new Date(badge.valid_from),
      validUntil: new Date(badge.valid_until),
      status: badge.status,
      qrData: badge.qr_data,
      scanCount: badge.scan_count || 0,
      lastScannedAt: badge.last_scanned_at ? new Date(badge.last_scanned_at) : undefined,
      createdAt: new Date(badge.created_at),
      updatedAt: new Date(badge.updated_at),
    };

    return {
      found: true,
      badge: transformedBadge,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        visitorLevel: user.visitor_level,
        profile: user.profile as Record<string, unknown>,
      } : null,
      exhibitor: user?.exhibitors?.[0] ? {
        companyName: user.exhibitors[0].company_name,
        sector: user.exhibitors[0].sector,
        standNumber: user.exhibitors[0].stand_number,
        logoUrl: user.exhibitors[0].logo_url,
      } : null,
      partner: user?.partners?.[0] ? {
        companyName: user.partners[0].company_name,
        partnerType: user.partners[0].partner_type,
        logoUrl: user.partners[0].logo_url,
      } : null,
    };
  } catch (error) {
    console.error('Erreur lookup badge:', error);
    return { found: false, badge: null, user: null, error: String(error) };
  }
}

/**
 * Recherche par QR data (JSON ou badge_code direct)
 */
export async function lookupBadgeByQRData(qrRawData: string): Promise<BadgeLookupResult> {
  try {
    // Tenter de parser comme JSON (format QR badge)
    let badgeCode: string | null = null;
    let userId: string | null = null;

    try {
      const parsed = JSON.parse(qrRawData);
      badgeCode = parsed.code || parsed.badge_code || parsed.badgeCode || null;
      userId = parsed.userId || parsed.user_id || null;
    } catch {
      // Pas du JSON — traiter comme un badge_code direct
      badgeCode = qrRawData.trim();
    }

    // D'abord essayer par badge_code
    if (badgeCode) {
      const result = await lookupBadgeByCode(badgeCode);
      if (result.found) {return result;}
    }

    // Essayer par user_id si disponible
    if (userId) {
      return await lookupBadgeByUserId(userId);
    }

    // Tenter le JWT (QR dynamique du DigitalBadge)
    try {
      const parts = qrRawData.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.userId) {
          return await lookupBadgeByUserId(payload.userId);
        }
      }
    } catch {
      // Pas un JWT
    }

    return { found: false, badge: null, user: null, error: 'Format QR non reconnu' };
  } catch (error) {
    console.error('Erreur lookup QR:', error);
    return { found: false, badge: null, user: null, error: String(error) };
  }
}

/**
 * Recherche badge par user ID
 */
export async function lookupBadgeByUserId(userId: string): Promise<BadgeLookupResult> {
  try {
    const db = getClient();
    const { data, error } = await db
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {throw error;}

    const badge = data as AnyRecord | null;

    if (!badge) {
      return { found: false, badge: null, user: null, error: 'Aucun badge trouvé pour cet utilisateur. Génération nécessaire.' };
    }

    return await lookupBadgeByCode(badge.badge_code);
  } catch (error) {
    console.error('Erreur lookup par userId:', error);
    return { found: false, badge: null, user: null, error: String(error) };
  }
}

/**
 * Recherche badge par email (recherche manuelle)
 */
export async function lookupBadgeByEmail(email: string): Promise<BadgeLookupResult> {
  try {
    const db = getClient();
    const { data, error } = await db
      .from('user_badges')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {throw error;}

    const badge = data as AnyRecord | null;

    if (!badge) {
      // Essayer via la table users
      const { data: userData } = await db
        .from('users')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      const foundUser = userData as AnyRecord | null;

      if (foundUser) {
        return { found: false, badge: null, user: { id: foundUser.id, name: '', email, type: '' }, error: 'Badge non encore généré. Veuillez d\'abord générer le badge.' };
      }

      return { found: false, badge: null, user: null, error: 'Aucun compte trouvé avec cet email' };
    }

    return await lookupBadgeByCode(badge.badge_code);
  } catch (error) {
    console.error('Erreur lookup par email:', error);
    return { found: false, badge: null, user: null, error: String(error) };
  }
}

/**
 * Recherche badge par nom (recherche manuelle)
 */
export async function lookupBadgeByName(name: string): Promise<BadgeLookupResult[]> {
  try {
    const db = getClient();
    const { data: badgesData, error } = await db
      .from('user_badges')
      .select('*')
      .ilike('full_name', `%${name.trim()}%`)
      .limit(10);

    if (error) {throw error;}

    const badges = (badgesData || []) as AnyRecord[];

    if (badges.length === 0) {
      return [{ found: false, badge: null, user: null, error: 'Aucun badge trouvé' }];
    }

    const results: BadgeLookupResult[] = [];
    for (const badge of badges) {
      const result = await lookupBadgeByCode(badge.badge_code);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Erreur lookup par nom:', error);
    return [{ found: false, badge: null, user: null, error: String(error) }];
  }
}

/**
 * Enregistre un print dans l'historique local (localStorage)
 */
export function recordPrint(record: Omit<PrintRecord, 'id'>): PrintRecord {
  const id = `print_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const fullRecord: PrintRecord = { id, ...record };

  const history = getPrintHistory();
  history.unshift(fullRecord);

  // Garder max 500 enregistrements
  if (history.length > 500) {history.length = 500;}

  localStorage.setItem('badge_print_history', JSON.stringify(history));
  return fullRecord;
}

/**
 * Récupère l'historique d'impression
 */
export function getPrintHistory(): PrintRecord[] {
  try {
    const raw = localStorage.getItem('badge_print_history');
    if (!raw) {return [];}
    return JSON.parse(raw).map((r: PrintRecord) => ({
      ...r,
      printedAt: new Date(r.printedAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Statistiques d'impression de la session
 */
export function getPrintStats(): {
  totalPrinted: number;
  todayPrinted: number;
  byType: Record<string, number>;
  errorCount: number;
} {
  const history = getPrintHistory();
  const today = new Date().toDateString();

  const todayRecords = history.filter(r => new Date(r.printedAt).toDateString() === today);

  const byType: Record<string, number> = {};
  for (const r of todayRecords) {
    byType[r.userType] = (byType[r.userType] || 0) + 1;
  }

  return {
    totalPrinted: history.length,
    todayPrinted: todayRecords.length,
    byType,
    errorCount: todayRecords.filter(r => r.status === 'error').length,
  };
}

export { getBadgeColor, getAccessLevelLabel };
