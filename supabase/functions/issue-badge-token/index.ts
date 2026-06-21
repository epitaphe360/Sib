import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QR_VALIDITY_MS = 60_000;

const ACCESS_LEVELS: Record<string, { level: string; zones: string[] }> = {
  visitor_free: { level: 'free', zones: ['public', 'exhibition_hall'] },
  visitor_premium: { level: 'premium', zones: ['public', 'exhibition_hall', 'vip_lounge', 'networking_area'] },
  visitor_vip: { level: 'vip', zones: ['public', 'exhibition_hall', 'vip_lounge', 'networking_area'] },
  exhibitor: { level: 'exhibitor', zones: ['public', 'exhibition_hall', 'stand', 'backstage'] },
  partner_museum: { level: 'museum', zones: ['public', 'exhibition_hall', 'partner_area', 'stand'] },
  partner_silver: { level: 'silver', zones: ['public', 'exhibition_hall', 'partner_area', 'stand', 'vip_lounge'] },
  partner_gold: { level: 'gold', zones: ['public', 'exhibition_hall', 'partner_area', 'stand', 'vip_lounge'] },
  partner_platinium: { level: 'platinium', zones: ['public', 'exhibition_hall', 'partner_area', 'stand', 'vip_lounge', 'backstage'] },
  admin: { level: 'admin', zones: ['*'] },
  security: { level: 'security', zones: ['*'] },
};

function normalizePartnerTier(tier: string | null | undefined): string {
  const t = (tier ?? 'museum').toLowerCase();
  if (t.includes('platin')) return 'platinium';
  if (t.includes('gold')) return 'gold';
  if (t.includes('silver')) return 'silver';
  return 'museum';
}

function getAccessKey(user: {
  type: string;
  visitor_level?: string | null;
  partner_tier?: string | null;
  status?: string | null;
}): string {
  if (user.type === 'admin') return 'admin';
  if (user.type === 'security') return 'security';
  if (user.type === 'exhibitor') return 'exhibitor';
  if (user.type === 'partner') {
    const tier = normalizePartnerTier(user.partner_tier);
    const key = `partner_${tier}`;
    return key in ACCESS_LEVELS ? key : 'partner_museum';
  }
  const vl = user.status === 'pending_payment' ? 'free' : (user.visitor_level ?? 'free');
  if (vl === 'premium' || vl === 'vip') return 'visitor_premium';
  return 'visitor_free';
}

function b64url(data: string): string {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  let binary = '';
  new Uint8Array(sig).forEach((b) => { binary += String.fromCharCode(b); });
  return b64url(binary);
}

async function encodeJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const sig = await hmacSign(data, secret);
  return `${data}.${sig}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const jwtSecret = Deno.env.get('JWT_SECRET') ?? Deno.env.get('VITE_JWT_SECRET');
  if (!jwtSecret) {
    return new Response(JSON.stringify({ error: 'JWT_SECRET not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user: authUser }, error: authError } = await userClient.auth.getUser();
  if (authError || !authUser) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: profile, error: profileError } = await adminClient
    .from('users')
    .select('id, email, name, type, visitor_level, partner_tier, status, profile')
    .eq('id', authUser.id)
    .single();

  if (profileError || !profile) {
    return new Response(JSON.stringify({ error: 'User profile not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const accessKey = getAccessKey(profile);
  const access = ACCESS_LEVELS[accessKey];
  const now = Date.now();
  const userProfile = (profile.profile ?? {}) as Record<string, unknown>;

  const payload = {
    userId: profile.id,
    email: profile.email,
    name: profile.name ?? profile.email,
    userType: profile.type,
    level: access.level,
    iat: now,
    exp: now + QR_VALIDITY_MS,
    nonce: crypto.randomUUID().replace(/-/g, '').slice(0, 12),
    zones: [...access.zones],
    company: (userProfile.company as string) ?? undefined,
  };

  const qrData = await encodeJWT(payload, jwtSecret);

  return new Response(
    JSON.stringify({ qrData, expiresAt: new Date(now + QR_VALIDITY_MS).toISOString() }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
