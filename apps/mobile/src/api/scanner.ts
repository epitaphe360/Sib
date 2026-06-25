import { PLATFORM } from '../config/platform';
import { supabase } from '../lib/supabase';
import { resolveSalonForScan } from '../lib/scanSalon';
import { enqueueScanLog, getPendingScanLogs, clearPendingScanLogs } from '../lib/offlineQueue';
import { CACHE_KEYS, loadCache, saveCache } from '../lib/dataCache';
import { isNetworkError } from '../lib/errors';
import { normalizePartnerTierDb } from '../lib/partnerTier';
import { checkZoneAccess } from './qr';

export interface ScanResult {
  valid: boolean;
  reason?: string;
  badgeCode?: string;
  userName?: string;
  scannedAt: string;
}

export interface ScanHistoryEntry extends ScanResult {
  id: string;
  zone: string;
  salonName?: string;
  scannedBy?: string;
  scannedByName?: string;
}

const sessionHistory: ScanHistoryEntry[] = [];
const exhibitorSessionHistory: ScanHistoryEntry[] = [];
let historyHydrated = false;

async function hydrateScanHistory(): Promise<void> {
  if (historyHydrated) return;
  const cached = await loadCache<ScanHistoryEntry[]>(CACHE_KEYS.scanHistory);
  if (cached?.length) {
    sessionHistory.push(...cached.slice(0, 50));
  }
  historyHydrated = true;
}

async function persistScanHistory(): Promise<void> {
  await saveCache(CACHE_KEYS.scanHistory, sessionHistory.slice(0, 50), 24 * 60 * 60 * 1000);
}

export function getScanHistory(): ScanHistoryEntry[] {
  hydrateScanHistory().catch(() => undefined);
  return [...sessionHistory];
}

export function getExhibitorScanHistory(): ScanHistoryEntry[] {
  return [...exhibitorSessionHistory];
}

function pushExhibitorSession(entry: ScanHistoryEntry) {
  exhibitorSessionHistory.unshift(entry);
  if (exhibitorSessionHistory.length > 50) exhibitorSessionHistory.pop();
}

interface ValidatedBadge {
  userId?: string;
  userName?: string;
  userType?: string;
  userLevel?: string;
  partnerTier?: string;
  status?: string;
  badgeCode?: string;
}

function badgeFromJwtPayload(payload: {
  userId: string;
  name: string;
  userType: string;
  level: string;
}): ValidatedBadge {
  const isPartner = payload.userType === 'partner';
  return {
    userId: payload.userId,
    userName: payload.name,
    userType: payload.userType,
    userLevel: isPartner ? undefined : payload.level,
    partnerTier: isPartner ? normalizePartnerTierDb(payload.level) : undefined,
    badgeCode: payload.userId,
  };
}

function badgeFromRpcUser(u: {
  id?: string;
  full_name?: string;
  user_type?: string;
  user_level?: string;
  partner_tier?: string;
  status?: string;
}, badgeCode?: string): ValidatedBadge {
  const userType = u.user_type ?? 'visitor';
  const isPartner = userType === 'partner';
  return {
    userId: u.id,
    userName: u.full_name,
    userType,
    userLevel: isPartner ? undefined : u.user_level,
    partnerTier: isPartner
      ? normalizePartnerTierDb(u.partner_tier ?? u.user_level)
      : undefined,
    status: u.status,
    badgeCode: badgeCode ?? u.id,
  };
}

async function validateBadgeRpc(qrData: string): Promise<{ ok: boolean; badge?: ValidatedBadge; reason?: string }> {
  const { data, error } = await supabase.rpc('validate_scanned_badge', { p_qr_data: qrData });
  if (error) return { ok: false, reason: error.message };
  const row = data as {
    success?: boolean;
    error?: string;
    message?: string;
    badge_code?: string;
    user?: {
      id?: string;
      full_name?: string;
      user_type?: string;
      user_level?: string;
      partner_tier?: string;
      status?: string;
    };
  } | null;
  if (!row?.success) {
    return { ok: false, reason: row?.error ?? row?.message ?? 'Badge invalide' };
  }
  const u = row.user ?? {};
  return {
    ok: true,
    badge: badgeFromRpcUser(u, row.badge_code ?? u.id),
  };
}

function pushSession(entry: ScanHistoryEntry) {
  sessionHistory.unshift(entry);
  if (sessionHistory.length > 50) sessionHistory.pop();
  persistScanHistory().catch(() => undefined);
}

async function persistAccessLog(params: {
  zone: string;
  valid: boolean;
  reason?: string;
  badge?: ValidatedBadge;
}): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const scannerId = session?.user?.id;
  if (!scannerId) return;

  const { salonId, salonName } = await resolveSalonForScan();

  await supabase.from('access_logs').insert({
    user_id: params.badge?.userId ?? null,
    user_name: params.badge?.userName ?? null,
    user_type: params.badge?.userType ?? null,
    user_level: params.badge?.userLevel ?? null,
    zone: params.zone,
    status: params.valid ? 'granted' : 'denied',
    reason: params.reason ?? null,
    scanned_by: scannerId,
    scanner_device: PLATFORM.scannerDevice,
    accessed_at: new Date().toISOString(),
    salon_id: salonId,
    salon_name: salonName,
    event: salonName,
  });
}

export async function fetchAccessLogHistory(
  limit = 20,
  options?: { scannedBy?: string; salonId?: string },
): Promise<ScanHistoryEntry[]> {
  let query = supabase
    .from('access_logs')
    .select('id, zone, status, reason, user_name, accessed_at, salon_name, scanned_by')
    .order('accessed_at', { ascending: false })
    .limit(limit);

  if (options?.scannedBy) {
    query = query.eq('scanned_by', options.scannedBy);
  }
  if (options?.salonId) {
    query = query.eq('salon_id', options.salonId);
  }

  const { data, error } = await query;

  if (error) return getScanHistory();

  return (data ?? []).map((row) => ({
    id: row.id as string,
    zone: (row.zone as string) ?? 'public',
    valid: row.status === 'granted',
    reason: (row.reason as string) ?? undefined,
    userName: (row.user_name as string) ?? undefined,
    scannedAt: (row.accessed_at as string) ?? new Date().toISOString(),
    salonName: (row.salon_name as string) ?? undefined,
    scannedBy: (row.scanned_by as string) ?? undefined,
  }));
}

export async function flushOfflineScanQueue(): Promise<number> {
  const pending = await getPendingScanLogs();
  if (!pending.length) return 0;

  let synced = 0;
  for (const item of pending) {
    try {
      await persistAccessLog({
        zone: item.zone,
        valid: item.valid,
        reason: item.reason,
        badge: {
          userId: item.userId,
          userName: item.userName,
          userType: item.userType,
          userLevel: item.userLevel,
        },
      });
      synced++;
    } catch {
      break;
    }
  }
  if (synced === pending.length) await clearPendingScanLogs();
  return synced;
}

async function resolveBadge(qrData: string): Promise<{ ok: boolean; badge?: ValidatedBadge; reason?: string }> {
  try {
    const rpc = await validateBadgeRpc(qrData);
    if (rpc.ok && rpc.badge) return rpc;
    return { ok: false, reason: rpc.reason ?? 'Badge invalide' };
  } catch (e) {
    if (isNetworkError(e)) {
      return { ok: false, reason: 'Réseau indisponible — scanner déconnecté' };
    }
    return { ok: false, reason: e instanceof Error ? e.message : 'Badge invalide' };
  }
}

async function checkBadgeZoneAccess(
  _qrData: string,
  badge: ValidatedBadge,
  zone: string
): Promise<{ allowed: boolean; reason?: string }> {
  const allowed = checkZoneAccess(
    badge.userType ?? 'visitor',
    badge.userLevel,
    badge.partnerTier,
    zone,
    badge.status
  );
  return allowed
    ? { allowed: true }
    : { allowed: false, reason: `Accès refusé — zone ${zone}` };
}

export async function scanQrPayload(qrData: string, zone: string): Promise<ScanResult> {
  const scannedAt = new Date().toISOString();

  try {
    const resolved = await resolveBadge(qrData);
    let valid = resolved.ok;
    let reason = resolved.reason;

    if (resolved.ok && resolved.badge) {
      const zoneCheck = await checkBadgeZoneAccess(qrData, resolved.badge, zone);
      if (!zoneCheck.allowed) {
        valid = false;
        reason = zoneCheck.reason;
      }
    }

    const result: ScanResult = {
      valid,
      reason,
      userName: resolved.badge?.userName,
      badgeCode: resolved.badge?.badgeCode,
      scannedAt,
    };

    pushSession({ id: `${Date.now()}`, zone, ...result });

    try {
      await persistAccessLog({ zone, valid, reason, badge: resolved.badge });
    } catch (e) {
      if (isNetworkError(e)) {
        await enqueueScanLog({
          qrData,
          zone,
          valid,
          reason,
          userId: resolved.badge?.userId,
          userName: resolved.badge?.userName,
          userType: resolved.badge?.userType,
          userLevel: resolved.badge?.userLevel,
          scannedAt,
        });
      }
    }

    return result;
  } catch (e) {
    const result: ScanResult = {
      valid: false,
      reason: e instanceof Error ? e.message : 'Scan échoué',
      scannedAt,
    };
    pushSession({ id: `${Date.now()}`, zone, ...result });
    return result;
  }
}

export async function scanBadgeCode(badgeCode: string, zone: string): Promise<ScanResult> {
  return scanQrPayload(badgeCode, zone);
}

export async function scanLeadFromQr(qrData: string, exhibitorUserId: string): Promise<ScanResult> {
  const scannedAt = new Date().toISOString();
  const resolved = await resolveBadge(qrData);

  if (!resolved.ok || !resolved.badge) {
    const fail = { valid: false, reason: resolved.reason ?? 'Badge invalide', scannedAt };
    pushExhibitorSession({ id: `${Date.now()}`, zone: 'stand', ...fail });
    return fail;
  }

  if (resolved.badge.userType !== 'visitor') {
    const fail = { valid: false, reason: 'Scannez le badge d\'un visiteur', scannedAt };
    pushExhibitorSession({ id: `${Date.now()}`, zone: 'stand', ...fail });
    return fail;
  }

  const visitorUserId = resolved.badge.userId;
  if (!visitorUserId) {
    const fail = { valid: false, reason: 'Badge visiteur invalide', scannedAt };
    pushExhibitorSession({ id: `${Date.now()}`, zone: 'stand', ...fail });
    return fail;
  }

  const { data: existing } = await supabase
    .from('exhibitor_leads')
    .select('id')
    .eq('exhibitor_user_id', exhibitorUserId)
    .eq('visitor_user_id', visitorUserId)
    .maybeSingle();

  if (existing?.id) {
    const dup = {
      valid: true,
      userName: resolved.badge.userName,
      badgeCode: visitorUserId,
      reason: 'Déjà scanné',
      scannedAt,
    };
    pushExhibitorSession({ id: `${Date.now()}`, zone: 'stand', ...dup });
    return dup;
  }

  const { salonId, salonName } = await resolveSalonForScan();

  const { error } = await supabase.from('exhibitor_leads').insert({
    exhibitor_user_id: exhibitorUserId,
    visitor_user_id: visitorUserId,
    scanned_at: scannedAt,
    salon_id: salonId,
    salon_name: salonName,
  });
  if (error) {
    if (error.code === '23505') {
      const dup = {
        valid: true,
        userName: resolved.badge.userName,
        badgeCode: visitorUserId,
        reason: 'Déjà scanné',
        scannedAt,
      };
      pushExhibitorSession({ id: `${Date.now()}`, zone: 'stand', ...dup });
      return dup;
    }
    throw error;
  }

  const ok = {
    valid: true,
    userName: resolved.badge.userName,
    badgeCode: resolved.badge.userId,
    scannedAt,
  };
  pushExhibitorSession({ id: `${Date.now()}`, zone: 'stand', ...ok });
  return ok;
}

export async function scanLeadForExhibitor(badgeCode: string, exhibitorUserId: string): Promise<ScanResult> {
  return scanLeadFromQr(badgeCode, exhibitorUserId);
}
