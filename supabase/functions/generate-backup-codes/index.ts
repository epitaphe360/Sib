import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHash, randomBytes } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

/**
 * Générer des codes de backup 2FA
 * Chaque code = 10 caractères alphanumériques groupés en X-XXXXX-XXXXX
 * Les codes sont stockés hashés (SHA-256) en base de données
 */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans 0, O, I, 1 (ambigus)
  let code = '';
  const bytes = randomBytes(10);
  for (let i = 0; i < 10; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `${code.slice(0, 5)}-${code.slice(5)}`;
}

function hashCode(code: string): string {
  return createHash('sha256').update(code.replace('-', '').toUpperCase()).digest('hex');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables Supabase manquantes');
    }

    const { userId, count } = await req.json();

    if (!userId) {
      throw new Error('userId est requis');
    }

    const codeCount = Math.min(Math.max(parseInt(count) || 10, 5), 20); // entre 5 et 20

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Vérifier que l'utilisateur existe et a 2FA configuré
    const { data: twoFA, error: twoFAError } = await supabase
      .from('two_factor_auth')
      .select('id, totp_secret')
      .eq('user_id', userId)
      .single();

    if (twoFAError || !twoFA) {
      throw new Error('Configuration 2FA non trouvée pour cet utilisateur');
    }

    if (!twoFA.totp_secret) {
      throw new Error('TOTP non configuré — impossible de générer des codes de backup');
    }

    // Générer les codes en clair
    const codes: string[] = [];
    for (let i = 0; i < codeCount; i++) {
      codes.push(generateCode());
    }

    // Hasher les codes pour le stockage
    const hashedCodes: string[] = codes.map(hashCode);

    // Sauvegarder en base
    const { error: updateError } = await supabase
      .from('two_factor_auth')
      .update({
        backup_codes: hashedCodes,
        backup_codes_generated_at: new Date().toISOString(),
        backup_codes_remaining: codeCount,
      })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ ${codeCount} codes backup générés pour userId: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        codes,        // codes en clair — à afficher une seule fois à l'utilisateur
        hashedCodes,  // codes hashés — déjà sauvegardés en base
        count: codeCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erreur generate-backup-codes:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erreur lors de la génération des codes de backup' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
