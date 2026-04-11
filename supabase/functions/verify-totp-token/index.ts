import { createClient } from 'npm:@supabase/supabase-js@2';
import * as OTPAuth from 'npm:otpauth@9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables Supabase manquantes');
    }

    const { userId, token } = await req.json();

    if (!userId || !token) {
      throw new Error('userId et token requis');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get 2FA config
    const { data: twoFAConfig, error: configError } = await supabase
      .from('two_factor_auth')
      .select('totp_secret')
      .eq('user_id', userId)
      .single();

    if (configError || !twoFAConfig?.totp_secret) {
      throw new Error('Configuration 2FA introuvable');
    }

    // Create TOTP instance with user's secret
    const totp = new OTPAuth.TOTP({
      issuer: 'SIPORTS 2026',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(twoFAConfig.totp_secret),
    });

    // Verify token with a window of ±1 period (30 seconds before/after)
    const delta = totp.validate({
      token,
      window: 1,
    });

    const isValid = delta !== null;

    console.log(isValid ? '✅ Token TOTP valide' : '❌ Token TOTP invalide');

    return new Response(
      JSON.stringify({
        success: true,
        valid: isValid,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ Erreur verify-totp-token:', error);

    return new Response(
      JSON.stringify({
        success: false,
        valid: false,
        error: error.message || 'Erreur lors de la vérification du token',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
