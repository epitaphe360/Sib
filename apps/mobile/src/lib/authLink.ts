/** Deep link de retour Supabase Auth (magic link, OAuth) */
export const AUTH_CALLBACK_PATH = 'auth-callback';
export const AUTH_CALLBACK_URL = `urbaevent://${AUTH_CALLBACK_PATH}`;
export const RESET_PASSWORD_URL = 'urbaevent://reset-password';

export function parseAuthTokensFromUrl(url: string): {
  accessToken: string | null;
  refreshToken: string | null;
  type: string | null;
} {
  const hash = url.includes('#') ? url.split('#')[1] : '';
  const query = url.includes('?') ? url.split('?')[1]?.split('#')[0] ?? '' : '';
  const params = new URLSearchParams(hash || query);
  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    type: params.get('type'),
  };
}
