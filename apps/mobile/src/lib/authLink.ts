import * as Linking from 'expo-linking';
import { parseAuthTokensFromUrl } from './authTokens';

export { parseAuthTokensFromUrl };

/** Deep link de retour Supabase Auth (magic link, OAuth) */
export const AUTH_CALLBACK_PATH = 'auth-callback';

export const AUTH_CALLBACK_URL = `urbaevent://${AUTH_CALLBACK_PATH}`;

export function getAuthCallbackUrl(): string {
  return Linking.createURL(AUTH_CALLBACK_PATH);
}

export const RESET_PASSWORD_URL = 'urbaevent://reset-password';
