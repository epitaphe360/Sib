import type { EmailOtpType } from '@supabase/supabase-js';
import { parseAuthTokensFromUrl } from './authLink';
import { supabase } from './supabase';
import { finalizeProfileAfterMagicLink } from '../services/magicLinkAuth';
import type { AppUser } from '../types';

const OTP_TYPE_FALLBACKS: EmailOtpType[] = ['magiclink', 'email', 'invite', 'signup', 'recovery'];
const SESSION_RECOVERY_ATTEMPTS = 6;
const SESSION_RECOVERY_DELAY_MS = 250;

const inFlightByUrl = new Map<string, Promise<{ appUser: AppUser; paymentRequestId?: string }>>();

function mapOtpType(type: string | null): EmailOtpType {
  const normalized = (type ?? 'magiclink').toLowerCase();
  if (
    normalized === 'invite' ||
    normalized === 'signup' ||
    normalized === 'magiclink' ||
    normalized === 'recovery' ||
    normalized === 'email_change' ||
    normalized === 'email'
  ) {
    return normalized as EmailOtpType;
  }
  return 'magiclink';
}

function otpTypesToTry(preferred: string | null): EmailOtpType[] {
  const primary = mapOtpType(preferred);
  if (primary === 'invite') {
    return ['invite', 'email'];
  }
  const ordered = [primary, ...OTP_TYPE_FALLBACKS.filter((t) => t !== primary)];
  return [...new Set(ordered)];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readSessionUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

async function readSessionUserWithRetry() {
  for (let attempt = 0; attempt < SESSION_RECOVERY_ATTEMPTS; attempt += 1) {
    const user = await readSessionUser();
    if (user) return user;
    if (attempt < SESSION_RECOVERY_ATTEMPTS - 1) {
      await sleep(SESSION_RECOVERY_DELAY_MS);
    }
  }
  return null;
}

async function verifyOtpWithFallback(
  tokenHash: string,
  preferredType: string | null,
): Promise<{ user: NonNullable<Awaited<ReturnType<typeof supabase.auth.verifyOtp>>['data']['user']> }> {
  const types = otpTypesToTry(preferredType);
  let lastError: Error | null = null;

  for (const type of types) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error && data.user) {
      return { user: data.user };
    }
    if (error) {
      lastError = error;
      const msg = error.message.toLowerCase();
      if (!msg.includes('invalid') && !msg.includes('expired') && !msg.includes('otp')) {
        throw error;
      }
    }
  }

  const user = await readSessionUserWithRetry();
  if (user) {
    return { user };
  }

  throw lastError ?? new Error('Lien invalide ou expiré. Demandez un nouveau lien depuis l’application.');
}

/** Session déjà créée mais verifyOtp échoue (lien consommé par un 1er passage). */
export async function recoverMagicLinkSession(): Promise<{
  appUser: AppUser;
  paymentRequestId?: string;
} | null> {
  const user = await readSessionUserWithRetry();
  if (!user) return null;
  try {
    return await finalizeProfileAfterMagicLink(user);
  } catch {
    return null;
  }
}

async function completeAuthSessionFromUrlInner(
  url: string,
): Promise<{ appUser: AppUser; paymentRequestId?: string }> {
  const { accessToken, refreshToken, code, tokenHash, type } = parseAuthTokensFromUrl(url);

  if (tokenHash) {
    const { user } = await verifyOtpWithFallback(tokenHash, type);
    return finalizeProfileAfterMagicLink(user);
  }

  if (code && !accessToken) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    if (!data.user) throw new Error('Session invalide');
    return finalizeProfileAfterMagicLink(data.user);
  }

  if (!accessToken || !refreshToken) {
    const recovered = await recoverMagicLinkSession();
    if (recovered) return recovered;
    throw new Error('Lien invalide ou expiré. Demandez un nouveau lien depuis l’application.');
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw error;
  if (!data.user) throw new Error('Session invalide');

  return finalizeProfileAfterMagicLink(data.user);
}

export async function completeAuthSessionFromUrl(
  url: string,
): Promise<{ appUser: AppUser; paymentRequestId?: string }> {
  const key = url.trim();
  const existing = inFlightByUrl.get(key);
  if (existing) return existing;

  const promise = completeAuthSessionFromUrlInner(key).finally(() => {
    inFlightByUrl.delete(key);
  });
  inFlightByUrl.set(key, promise);
  return promise;
}

/** Reconstruit une URL auth-callback depuis les paramètres expo-router (Android). */
export function buildAuthCallbackUrlFromParams(params: {
  token_hash?: string | string[];
  type?: string | string[];
  code?: string | string[];
  access_token?: string | string[];
  refresh_token?: string | string[];
}): string | null {
  const tokenHash = [params.token_hash].flat().find(Boolean);
  if (tokenHash) {
    const otpType = [params.type].flat().find(Boolean) ?? 'magiclink';
    return `urbaevent://auth-callback?token_hash=${encodeURIComponent(String(tokenHash))}&type=${encodeURIComponent(String(otpType))}`;
  }
  const accessToken = [params.access_token].flat().find(Boolean);
  const refreshToken = [params.refresh_token].flat().find(Boolean);
  if (accessToken && refreshToken) {
    const otpType = [params.type].flat().find(Boolean) ?? 'magiclink';
    return `urbaevent://auth-callback?access_token=${encodeURIComponent(String(accessToken))}&refresh_token=${encodeURIComponent(String(refreshToken))}&type=${encodeURIComponent(String(otpType))}`;
  }
  const authCode = [params.code].flat().find(Boolean);
  if (authCode) {
    return `urbaevent://auth-callback?code=${encodeURIComponent(String(authCode))}`;
  }
  return null;
}

export function isAuthCallbackPayload(
  url: string | null,
  params?: {
    token_hash?: string | string[];
    code?: string | string[];
    access_token?: string | string[];
    refresh_token?: string | string[];
  },
): boolean {
  if (params?.token_hash || params?.code || (params?.access_token && params?.refresh_token)) return true;
  return Boolean(
    url &&
      (url.includes('access_token') || url.includes('code=') || url.includes('token_hash')),
  );
}
