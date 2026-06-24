export function parseAuthTokensFromUrl(url: string): {
  accessToken: string | null;
  refreshToken: string | null;
  type: string | null;
  code: string | null;
  tokenHash: string | null;
} {
  const hashStart = url.indexOf('#');
  const queryStart = url.indexOf('?');
  const hash = hashStart >= 0 ? url.slice(hashStart + 1) : '';
  const queryEnd = hashStart >= 0 ? hashStart : url.length;
  const query = queryStart >= 0 ? url.slice(queryStart + 1, queryEnd) : '';
  const params = new URLSearchParams(hash || query);
  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    type: params.get('type'),
    code: params.get('code'),
    tokenHash: params.get('token_hash'),
  };
}
