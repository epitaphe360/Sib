import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Génère un token HMAC-SHA256 signé pour un badge QR.
 * Le QR encode UNIQUEMENT ce token — jamais de données en clair.
 *
 * Format du token: base64url(userId | salonId | issuedAt | exp | signature)
 */
async function signToken(
  userId: string,
  salonId: string,
  secret: string,
  ttlSeconds = 86400  // 24h par défaut
): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000)
  const exp = issuedAt + ttlSeconds

  const payload = `${userId}|${salonId}|${issuedAt}|${exp}`
  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  const tokenData = btoa(`${payload}|${sigBase64}`)
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  return tokenData
}

/**
 * Vérifie un token QR et retourne les données si valide.
 */
async function verifyToken(
  token: string,
  secret: string
): Promise<{ userId: string; salonId: string; issuedAt: number; exp: number } | null> {
  try {
    const decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'))
    const parts = decoded.split('|')
    if (parts.length !== 5) return null

    const [userId, salonId, issuedAt, exp, signature] = parts
    const now = Math.floor(Date.now() / 1000)

    if (parseInt(exp) < now) return null  // Expiré

    const payload = `${userId}|${salonId}|${issuedAt}|${exp}`
    const encoder = new TextEncoder()

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const sigBytes = Uint8Array.from(
      atob(signature.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    )

    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payload))
    if (!valid) return null

    return { userId, salonId, issuedAt: parseInt(issuedAt), exp: parseInt(exp) }
  } catch {
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const QR_SECRET = Deno.env.get('QR_BADGE_SECRET') ?? 'change-me-in-production'

  try {
    const body = await req.json()
    const { action } = body

    // ── GÉNÉRER un token QR ─────────────────────────────────────────────────
    if (action === 'generate') {
      const { userId, salonId, ttl } = body

      if (!userId || !salonId) {
        return new Response(
          JSON.stringify({ error: 'userId and salonId are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Vérifier auth
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const userSupabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      )
      const { data: { user }, error: authError } = await userSupabase.auth.getUser()
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const token = await signToken(userId, salonId, QR_SECRET, ttl ?? 86400)

      return new Response(
        JSON.stringify({ token, expiresIn: ttl ?? 86400 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── VÉRIFIER / SCANNER un token QR ─────────────────────────────────────
    if (action === 'verify') {
      const { token, scannerUserId, gate } = body

      if (!token) {
        return new Response(
          JSON.stringify({ error: 'token is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const result = await verifyToken(token, QR_SECRET)

      if (!result) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Token invalide ou expiré' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Charger le profil de l'utilisateur scanné (sans exposer d'infos sensibles)
      const { data: profile } = await supabase
        .from('users')
        .select('id, first_name, last_name, company, photo_url, type')
        .eq('id', result.userId)
        .single()

      // Anti-double scan: vérifier si ce badge a déjà été scanné par cette gate
      if (gate) {
        const { data: existing } = await supabase
          .from('scans')
          .select('id')
          .eq('scanned_user_id', result.userId)
          .eq('salon_id', result.salonId)
          .eq('gate', gate)
          .single()

        if (existing) {
          return new Response(
            JSON.stringify({
              valid: true,
              duplicate: true,
              user: profile,
              message: 'Badge déjà scanné à cette entrée'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Enregistrer le scan
        if (scannerUserId) {
          await supabase.from('scans').insert({
            scanner_user_id: scannerUserId,
            scanned_user_id: result.userId,
            salon_id: result.salonId,
            gate,
            scanned_at: new Date().toISOString(),
          })
        }
      }

      return new Response(
        JSON.stringify({
          valid: true,
          duplicate: false,
          user: profile,
          salonId: result.salonId,
          issuedAt: result.issuedAt,
          exp: result.exp,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'action must be "generate" or "verify"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
