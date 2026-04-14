import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BadgeRequest {
  userId: string
  email: string
  name: string
  level: 'free' | 'vip'
  includePhoto?: boolean
  photoUrl?: string
  sendWelcomeEmail?: boolean
}

/**
 * Génère un JWT simple (sans bibliothèque externe)
 * Format: header.payload.signature
 */
async function generateJWT(payload: any, secret: string): Promise<string> {
  payload.iat = Math.floor(Date.now() / 1000);
  payload.exp = Math.floor(Date.now() / 1000) + (30 * 60); // 30 minutes
  const encoder = new TextEncoder()

  // Header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  // Encoder header et payload en base64url
  const base64Header = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const base64Payload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  // Créer la signature HMAC-SHA256
  const data = `${base64Header}.${base64Payload}`
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  )

  // Convertir signature en base64url
  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `${data}.${base64Signature}`
}

/**
 * Valide un JWT et retourne le payload si valide
 */
async function validateJWT(token: string, secret: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid JWT format' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    // Verify signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Parse and check expiration
    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return { valid: false, error: 'JWT expired' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Génère un nonce unique pour anti-replay
 */
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

async function withTransientRetry<T>(operation: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message.toLowerCase() : ''
      const isTransient =
        message.includes('timeout') ||
        message.includes('too many') ||
        message.includes('temporar') ||
        message.includes('deadlock') ||
        message.includes('could not serialize')

      if (!isTransient || attempt === maxAttempts) {
        throw error
      }

      const backoffMs = 100 * attempt
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unknown transient retry failure')
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutId: number | undefined
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`${label} timeout after ${timeoutMs}ms`)), timeoutMs)
    })
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const {
      userId,
      email,
      name,
      level,
      includePhoto = false,
      photoUrl = '',
      sendWelcomeEmail = true,
    }: BadgeRequest = await req.json()

    // Validation
    if (!userId || !email || !name || !level) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Générer JWT payload
    const now = Math.floor(Date.now() / 1000)
    const jwtPayload = {
      sub: userId,
      email: email,
      name: name,
      type: 'visitor',
      level: level,
      nonce: generateNonce(),
      iat: now,
      exp: now + (365 * 24 * 60 * 60), // 1 an
      zones: level === 'free'
        ? ['public', 'exhibition_hall']
        : ['public', 'exhibition_hall', 'vip_lounge', 'networking_area']
    }

    // Générer JWT
    const jwtSecret = Deno.env.get('JWT_SECRET') || 'sib-2026-secure-secret-key-change-in-production'
    const token = await generateJWT(jwtPayload, jwtSecret)

    // Créer QR code data (le QR sera généré côté client)
    const qrData = {
      version: '1.0',
      type: 'visitor_badge',
      token: token,
      level: level,
      userId: userId
    }

    const qrContent = JSON.stringify(qrData)

    // Déterminer le type de badge
    const badgeType = level === 'free' ? 'visitor_free' : 'visitor_premium'

    const badgePayload = {
      user_id: userId,
      qr_data: qrContent,
      badge_type: badgeType,
      current_token: token,
      token_expires_at: new Date(jwtPayload.exp * 1000).toISOString(),
      last_rotation_at: new Date().toISOString(),
      rotation_interval_seconds: 30,
      photo_url: photoUrl || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    }

    const { data: badgeData, error: badgeError } = await withTransientRetry(async () => {
      return await supabaseClient
        .from('digital_badges')
        .upsert(badgePayload, { onConflict: 'user_id' })
        .select()
        .single()
    })

    if (badgeError || !badgeData) {
      throw badgeError || new Error('Badge upsert failed with empty response')
    }

    console.log(`Badge upserted for user ${userId} (${level})`)

    // Best effort email sending (non-bloquant)
    let emailSent = false
    let emailError: string | null = null

    if (sendWelcomeEmail) {
      try {
        const { error: welcomeEmailError } = await withTimeout(
          supabaseClient.functions.invoke('send-visitor-welcome-email', {
            body: {
              userId,
              email,
              name,
              level,
              qrContent,
            },
          }),
          6000,
          'send-visitor-welcome-email invoke'
        )

        if (welcomeEmailError) {
          emailError = welcomeEmailError.message || 'Email function invocation failed'
          console.error('❌ Error invoking send-visitor-welcome-email:', welcomeEmailError)
        } else {
          emailSent = true
          console.log(`✅ Welcome email queued/sent for ${email}`)
        }
      } catch (mailError) {
        emailError = mailError instanceof Error ? mailError.message : 'Unknown email error'
        console.error('❌ Welcome email error:', mailError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        badge: badgeData,
        qrContent: qrContent,
        message: `Badge ${level} généré avec succès`,
        emailSent,
        emailError,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error generating badge:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
