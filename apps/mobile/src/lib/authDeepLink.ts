import * as Linking from 'expo-linking';

function qpString(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value[0] : String(value);
}

/** Reconstruit une URL auth complète quand Android/Expo ne transmet pas la query dans la string. */
export function normalizeAuthDeepLink(raw: string | null): string | null {
  if (!raw) return null;

  if (/reset-password/i.test(raw)) {
    return null;
  }

  if (raw.includes('token_hash=') || raw.includes('access_token=') || raw.includes('code=')) {
    return raw;
  }

  const parsed = Linking.parse(raw);
  const qp = parsed.queryParams ?? {};
  const tokenHash = qpString(qp.token_hash as string | string[] | undefined);
  const accessToken = qpString(qp.access_token as string | string[] | undefined);
  const refreshToken = qpString(qp.refresh_token as string | string[] | undefined);
  const code = qpString(qp.code as string | string[] | undefined);
  const otpType = qpString(qp.type as string | string[] | undefined) ?? 'magiclink';

  if (tokenHash) {
    return `urbaevent://auth-callback?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(otpType)}`;
  }
  if (accessToken && refreshToken) {
    return `urbaevent://auth-callback?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}&type=${encodeURIComponent(otpType)}`;
  }
  if (code) {
    return `urbaevent://auth-callback?code=${encodeURIComponent(code)}`;
  }

  return null;
}

export function hasAuthDeepLinkPayload(raw: string | null): boolean {
  return normalizeAuthDeepLink(raw) != null;
}
