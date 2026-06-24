/**
 * Redirection HTTPS → urbaevent:// (sans page HTML — Gmail/Storage servent text/plain).
 * GET /auth-open?token_hash=...&type=invite → 302 urbaevent://auth-callback?...
 */
Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  const url = new URL(req.url);
  const tokenHash = url.searchParams.get('token_hash')?.trim();
  const otpType = url.searchParams.get('type')?.trim() || 'magiclink';

  if (!tokenHash) {
    return new Response('Lien invalide ou expiré. Demandez un nouveau lien depuis l\'application UrbaEvent.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const appUrl =
    `urbaevent://auth-callback?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(otpType)}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: appUrl,
      'Cache-Control': 'no-store',
    },
  });
});
