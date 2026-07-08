/**
 * QR JWT rotatif — tokens émis côté serveur (Edge Function issue-badge-token).
 */
import { ACCESS_LEVELS, checkZoneAccess, getAccessKey } from '../lib/qrAccessLevels';
import { supabase } from '../lib/supabase';

export { ACCESS_LEVELS, checkZoneAccess, getAccessKey };

const QR_VALIDITY_MS = 60_000;

export interface QRCodePayload {
  userId: string;
  email: string;
  name: string;
  userType: string;
  level: string;
  iat: number;
  exp: number;
  nonce: string;
  zones: string[];
  company?: string;
}

/** Demande un QR JWT signé serveur (secret jamais exposé au client). */
export async function generateSecureQRCode(_userId: string): Promise<{
  qrData: string;
  expiresAt: Date;
}> {
  const { data, error } = await supabase.functions.invoke('issue-badge-token', { body: {} });
  if (error) throw new Error(error.message ?? 'Impossible de générer le QR badge');
  if (!data?.qrData || !data?.expiresAt) {
    throw new Error(data?.error ?? 'Réponse badge invalide');
  }
  return {
    qrData: data.qrData as string,
    expiresAt: new Date(data.expiresAt as string),
  };
}

function payloadFromRpcUser(u: {
  id?: string;
  email?: string;
  full_name?: string;
  user_type?: string;
  user_level?: string;
  partner_tier?: string;
  status?: string;
}): QRCodePayload | undefined {
  if (!u.id) return undefined;
  const accessKey = getAccessKey({
    type: u.user_type ?? 'visitor',
    visitor_level: u.user_level,
    partner_tier: u.partner_tier,
    status: u.status,
  });
  const access = ACCESS_LEVELS[accessKey];
  const now = Date.now();
  return {
    userId: u.id,
    email: u.email ?? '',
    name: u.full_name ?? u.email ?? '',
    userType: u.user_type ?? 'visitor',
    level: access.level,
    iat: now,
    exp: now + QR_VALIDITY_MS,
    nonce: '',
    zones: [...access.zones],
  };
}

/** Valide un QR via RPC serveur — JWT et JSON statique passent par validate_scanned_badge. */
export async function validateQRCode(
  qrData: string,
  options?: { requiredZone?: string }
): Promise<{ valid: boolean; reason?: string; payload?: QRCodePayload }> {
  try {
    const { data, error } = await supabase.rpc('validate_scanned_badge', { p_qr_data: qrData });
    if (error) return { valid: false, reason: error.message };

    const row = data as {
      success?: boolean;
      error?: string;
      message?: string;
      user?: {
        id?: string;
        email?: string;
        full_name?: string;
        user_type?: string;
        user_level?: string;
        partner_tier?: string;
        status?: string;
      };
    } | null;

    if (!row?.success) {
      return { valid: false, reason: row?.error ?? row?.message ?? 'Badge invalide' };
    }

    const payload = payloadFromRpcUser(row.user ?? {});
    if (!payload) return { valid: false, reason: 'Profil badge introuvable' };

    if (
      options?.requiredZone &&
      !payload.zones.includes('*') &&
      !payload.zones.includes(options.requiredZone)
    ) {
      return { valid: false, reason: `Accès refusé — zone ${options.requiredZone}` };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'QR invalide' };
  }
}
