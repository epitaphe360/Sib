import { createClient } from 'npm:@supabase/supabase-js@2';
import * as OTPAuth from 'npm:otpauth@9';
import QRCode from 'npm:qrcode@1';

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

    const { userId } = await req.json();

    if (!userId) {
      throw new Error('userId requis');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Generate TOTP secret
    const totp = new OTPAuth.TOTP({
      issuer: 'SIPORTS 2026',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    const secret = totp.secret.base32;

    // Generate QR code URL
    const otpauthUrl = totp.toString();
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    console.log('✅ TOTP secret généré pour:', user.email);

    return new Response(
      JSON.stringify({
        success: true,
        secret,
        qrCodeUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ Erreur generate-totp-secret:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors de la génération du secret TOTP',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
