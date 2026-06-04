import { parseAuthTokensFromUrl } from './authLink';
import { supabase } from './supabase';
import { finalizeProfileAfterMagicLink } from '../services/magicLinkAuth';
import type { AppUser } from '../types';

export async function completeAuthSessionFromUrl(
  url: string
): Promise<{ appUser: AppUser; paymentRequestId?: string }> {
  const { accessToken, refreshToken } = parseAuthTokensFromUrl(url);
  if (!accessToken || !refreshToken) {
    throw new Error('Lien invalide ou expiré');
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw error;
  if (!data.user) throw new Error('Session invalide');

  return finalizeProfileAfterMagicLink(data.user);
}
