import type { EmailOtpType } from '@supabase/supabase-js';
import { parseAuthTokensFromUrl } from './authLink';
import { supabase } from './supabase';
import { finalizeProfileAfterMagicLink } from '../services/magicLinkAuth';
import type { AppUser } from '../types';

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

export async function completeAuthSessionFromUrl(
  url: string
): Promise<{ appUser: AppUser; paymentRequestId?: string }> {
  const { accessToken, refreshToken, code, tokenHash, type } = parseAuthTokensFromUrl(url);

  if (tokenHash) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: mapOtpType(type),
    });
    if (error) throw error;
    if (!data.user) throw new Error('Session invalide');
    return finalizeProfileAfterMagicLink(data.user);
  }

  if (code && !accessToken) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    if (!data.user) throw new Error('Session invalide');
    return finalizeProfileAfterMagicLink(data.user);
  }

  if (!accessToken || !refreshToken) {
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
