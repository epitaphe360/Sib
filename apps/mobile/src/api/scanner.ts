import { supabase } from '../lib/supabase';
import { enqueueScanLog, getPendingScanLogs, clearPendingScanLogs } from '../lib/offlineQueue';
import { isNetworkError } from '../lib/errors';
import { checkZoneAccess, validateQRCode } from './qr';

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
}

const sessionHistory: ScanHistoryEntry[] = [];

export function getScanHistory(): ScanHistoryEntry[] {
  return [...sessionHistory];
}

interface ValidatedBadge {
  userId?: string;
  userName?: string;
  userType?: string;
  userLevel?: string;
  badgeCode?: string;
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
    };
  } | null;
  if (!row?.success) {
    return { ok: false, reason: row?.error ?? row?.message ?? 'Badge invalide' };
  }
  const u = row.user ?? {};
  return {
    ok: true,
    badge: {
      userId: u.id,
      userName: u.full_name,
      userType: u.user_type,
      userLevel: u.user_level,
      badgeCode: row.badge_code ?? u.id,
    },
  };
}

function pushSession(entry: ScanHistoryEntry) {
  sessionHistory.unshift(entry);
  if (sessionHistory.length > 50) sessionHistory.pop();
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

  await supabase.from('access_logs').insert({
    user_id: params.badge?.userId ?? null,
    user_name: params.badge?.userName ?? null,
    user_type: params.badge?.userType ?? null,
    user_level: params.badge?.userLevel ?? null,
    zone: params.zone,
    status: params.valid ? 'granted' : 'denied',
    reason: params.reason ?? null,
    scanned_by: scannerId,
    scanner_device: 'UrbaEvent Mobile',
    accessed_at: new Date().toISOString(),
  });
}

export async function fetchAccessLogHistory(limit = 20): Promise<ScanHistoryEntry[]> {
  const { data, error } = await supabase
    .from('access_logs')
    .select('id, zone, status, reason, user_name, accessed_at')
    .order('accessed_at', { ascending: false })
    .limit(limit);

  if (error) return getScanHistory();

  return (data ?? []).map((row) => ({
    id: row.id as string,
    zone: (row.zone as string) ?? 'public',
    valid: row.status === 'granted',
    reason: (row.reason as string) ?? undefined,
    userName: (row.user_name as string) ?? undefined,
    scannedAt: (row.accessed_at as string) ?? new Date().toISOString(),
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
  const rpc = await validateBadgeRpc(qrData);
  if (rpc.ok && rpc.badge) return rpc;

  const jwt = await validateQRCode(qrData);
  if (jwt.valid && jwt.payload) {
    return {
      ok: true,
      badge: {
        userId: jwt.payload.userId,
        userName: jwt.payload.name,
        userType: jwt.payload.userType,
        userLevel: jwt.payload.level,
        badgeCode: jwt.payload.userId,
      },
    };
  }
  return { ok: false, reason: rpc.reason ?? jwt.reason ?? 'Badge invalide' };
}

export async function scanQrPayload(qrData: string, zone: string): Promise<ScanResult> {
  const scannedAt = new Date().toISOString();

  try {
    const resolved = await resolveBadge(qrData);
    let valid = resolved.ok;
    let reason = resolved.reason;

    if (resolved.ok && resolved.badge) {
      const allowed = checkZoneAccess(
        resolved.badge.userType ?? 'visitor',
        resolved.badge.userLevel,
        resolved.badge.userLevel,
        zone
      );
      if (!allowed) {
        valid = false;
        reason = `Accès refusé — zone ${zone}`;
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
    return { valid: false, reason: resolved.reason ?? 'Badge invalide', scannedAt };
  }

  if (resolved.badge.userType !== 'visitor') {
    return { valid: false, reason: 'Scannez le badge d\'un visiteur', scannedAt };
  }

  const { error } = await supabase.from('exhibitor_leads').insert({
    exhibitor_user_id: exhibitorUserId,
    visitor_user_id: resolved.badge.userId,
    scanned_at: scannedAt,
  });
  if (error) throw error;

  return {
    valid: true,
    userName: resolved.badge.userName,
    badgeCode: resolved.badge.userId,
    scannedAt,
  };
}

export async function scanLeadForExhibitor(badgeCode: string, exhibitorUserId: string): Promise<ScanResult> {
  return scanLeadFromQr(badgeCode, exhibitorUserId);
}
