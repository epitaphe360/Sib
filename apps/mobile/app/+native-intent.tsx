/**
 * Expo Router — préserve token_hash / query params des deep links email.
 */
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): string {
  try {
    const lower = path.toLowerCase();
    if (lower.includes('reset-password')) {
      const query = path.includes('?') ? path.slice(path.indexOf('?')) : '';
      return `/(auth)/reset-password${query}`;
    }

    if (!lower.includes('auth-callback') && !lower.includes('token_hash') && !lower.includes('access_token')) {
      return path;
    }

    if (path.includes('?')) {
      const query = path.slice(path.indexOf('?'));
      return `/(auth)/auth-callback${query}`;
    }

    return '/(auth)/auth-callback';
  } catch {
    return path;
  }
}
