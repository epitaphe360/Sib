/**
 * QR JWT rotatif — aligné sur src/services/qrCodeService.ts (web)
 */
import { supabase } from '../lib/supabase';

const QR_VALIDITY_MS = 60_000;
const JWT_SECRET =
  process.env.EXPO_PUBLIC_JWT_SECRET ??
  process.env.EXPO_PUBLIC_VITE_JWT_SECRET ??
  'dev-only-secret-do-not-use-in-production-32ch';

export const ACCESS_LEVELS = {
  visitor_free: { level: 'free', zones: ['public', 'exhibition_hall'] },
  visitor_premium: { level: 'premium', zones: ['public', 'exhibition_hall', 'vip_lounge', 'networking_area'] },
  visitor_vip: { level: 'vip', zones: ['public', 'exhibition_hall', 'vip_lounge', 'networking_area'] },
  exhibitor: { level: 'exhibitor', zones: ['public', 'exhibition_hall', 'stand', 'backstage'] },
  partner_museum: { level: 'museum', zones: ['public', 'exhibition_hall', 'partner_area', 'stand'] },
  partner_silver: { level: 'silver', zones: ['public', 'exhibition_hall', 'partner_area', 'stand', 'vip_lounge'] },
  partner_gold: { level: 'gold', zones: ['public', 'exhibition_hall', 'partner_area', 'stand', 'vip_lounge'] },
  partner_platinium: { level: 'platinium', zones: ['public', 'exhibition_hall', 'partner_area', 'stand', 'vip_lounge', 'backstage'] },
  admin: { level: 'admin', zones: ['*'] },
  security: { level: 'security', zones: ['*'] },
} as const;

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

function b64url(data: string): string {
  const b64 = typeof btoa !== 'undefined' ? btoa(data) : Buffer.from(data).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? padded : padded + '='.repeat(4 - (padded.length % 4));
  return typeof atob !== 'undefined'
    ? atob(pad)
    : Buffer.from(pad, 'base64').toString();
}

async function decodeJWT(token: string): Promise<QRCodePayload> {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new Error('Invalid JWT format');
  }

  const data = `${headerB64}.${payloadB64}`;
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.subtle) {
    throw new Error('Crypto non disponible');
  }

  const enc = new TextEncoder();
  const key = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const sigBinary = b64urlDecode(signatureB64);
  const signature = new Uint8Array(sigBinary.length);
  for (let i = 0; i < sigBinary.length; i++) {
    signature[i] = sigBinary.charCodeAt(i);
  }

  const valid = await cryptoObj.subtle.verify('HMAC', key, signature, enc.encode(data));
  if (!valid) {
    throw new Error('Invalid JWT signature');
  }

  return JSON.parse(b64urlDecode(payloadB64)) as QRCodePayload;
}

export function getAccessKey(user: {
  type: string;
  visitor_level?: string | null;
  partner_tier?: string | null;
}): keyof typeof ACCESS_LEVELS {
  if (user.type === 'admin') return 'admin';
  if (user.type === 'security') return 'security';
  if (user.type === 'exhibitor') return 'exhibitor';
  if (user.type === 'partner') {
    const tier = user.partner_tier ?? 'museum';
    const key = `partner_${tier}` as keyof typeof ACCESS_LEVELS;
    return key in ACCESS_LEVELS ? key : 'partner_museum';
  }
  const vl = user.visitor_level ?? 'free';
  if (vl === 'premium' || vl === 'vip') return 'visitor_premium';
  return 'visitor_free';
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.subtle) {
    return b64url(`${data}-${secret.slice(0, 8)}`);
  }
  const enc = new TextEncoder();
  const key = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await cryptoObj.subtle.sign('HMAC', key, enc.encode(data));
  const bytes = new Uint8Array(sig);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return b64url(binary);
}

async function encodeJWT(payload: QRCodePayload): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const sig = await hmacSign(data, JWT_SECRET);
  return `${data}.${sig}`;
}

export async function generateSecureQRCode(userId: string): Promise<{
  qrData: string;
  expiresAt: Date;
}> {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, type, visitor_level, partner_tier, profile')
    .eq('id', userId)
    .single();

  if (error || !user) throw new Error('Utilisateur introuvable');

  const accessKey = getAccessKey(user);
  const access = ACCESS_LEVELS[accessKey];
  const now = Date.now();
  const profile = (user.profile ?? {}) as Record<string, unknown>;

  const payload: QRCodePayload = {
    userId: user.id,
    email: user.email,
    name: user.name ?? user.email,
    userType: user.type,
    level: access.level,
    iat: now,
    exp: now + QR_VALIDITY_MS,
    nonce: Math.random().toString(36).slice(2, 14),
    zones: [...access.zones],
    company: (profile.company as string) ?? undefined,
  };

  return {
    qrData: await encodeJWT(payload),
    expiresAt: new Date(now + QR_VALIDITY_MS),
  };
}

export async function validateQRCode(
  qrData: string,
  options?: { requiredZone?: string }
): Promise<{ valid: boolean; reason?: string; payload?: QRCodePayload }> {
  try {
    const parts = qrData.split('.');
    if (parts.length !== 3) {
      const legacy = JSON.parse(qrData);
      if (legacy.code) {
        const { data } = await supabase.rpc('scan_badge', { p_badge_code: legacy.code });
        return data ? { valid: true } : { valid: false, reason: 'Badge invalide' };
      }
      return { valid: false, reason: 'Format QR non reconnu' };
    }

    const payload = await decodeJWT(qrData);
    const now = Date.now();

    if (payload.exp < now) {
      return { valid: false, reason: 'QR expiré — rescannez le badge' };
    }

    if (now - payload.iat > QR_VALIDITY_MS) {
      return { valid: false, reason: 'QR trop ancien — rescannez le badge' };
    }

    if (options?.requiredZone && !payload.zones.includes('*') && !payload.zones.includes(options.requiredZone)) {
      return { valid: false, reason: `Accès refusé — zone ${options.requiredZone}` };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'QR invalide' };
  }
}

/** Vérifie l'accès zone après validation RPC badge */
export function checkZoneAccess(
  userType: string,
  userLevel: string | null | undefined,
  partnerTier: string | null | undefined,
  requiredZone: string
): boolean {
  const key = getAccessKey({
    type: userType,
    visitor_level: userLevel,
    partner_tier: partnerTier,
  });
  const zones = ACCESS_LEVELS[key].zones as readonly string[];
  return zones.includes('*') || zones.includes(requiredZone);
}
