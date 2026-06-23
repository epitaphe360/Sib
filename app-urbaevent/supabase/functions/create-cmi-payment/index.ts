import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHash, createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

/**
 * CMI (Centre Monétique Interbancaire) — Maroc
 * Passerelle de paiement par carte bancaire marocaine
 * Documentation: https://www.cmi.co.ma
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const CMI_MERCHANT_ID = Deno.env.get('CMI_MERCHANT_ID');
    const CMI_STORE_KEY = Deno.env.get('CMI_STORE_KEY');
    const CMI_GATEWAY_URL = Deno.env.get('CMI_GATEWAY_URL') || 'https://testpayment.cmi.co.ma/fim/est3Dgate';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables Supabase manquantes');
    }
    if (!CMI_MERCHANT_ID || !CMI_STORE_KEY) {
      throw new Error('Variables CMI manquantes (CMI_MERCHANT_ID, CMI_STORE_KEY)');
    }

    const { userId, userEmail, amount, currency, description, returnUrl, cancelUrl } = await req.json();

    if (!userId || !userEmail || !amount || !currency) {
      throw new Error('userId, userEmail, amount et currency sont requis');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Générer un identifiant de commande unique
    const orderId = `SIB-${Date.now()}-${userId.slice(0, 8)}`;
    const amountStr = parseFloat(amount).toFixed(2);

    // Construire les paramètres CMI selon la spec
    const params: Record<string, string> = {
      clientid: CMI_MERCHANT_ID,
      amount: amountStr,
      currency: '504', // Code ISO numérique MAD = 504
      oid: orderId,
      okurl: returnUrl || `${Deno.env.get('SITE_URL') || ''}/visitor/payment-success`,
      failUrl: cancelUrl || `${Deno.env.get('SITE_URL') || ''}/visitor/subscription`,
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/cmi-webhook`,
      storetype: '3D_PAY_HOSTING',
      trantype: 'PreAuth',
      instalment: '',
      rnd: Date.now().toString(),
      lang: 'fr',
      encoding: 'UTF-8',
      description: description || 'Pass Premium VIP SIB 2026',
      email: userEmail,
      BillToName: user.name || userEmail,
    };

    // Calculer le hash de sécurité CMI (HMAC-SHA512)
    const hashStr = Object.keys(params)
      .sort()
      .map(k => params[k])
      .join('|') + '|';

    const hash = createHmac('sha512', CMI_STORE_KEY)
      .update(hashStr)
      .digest('base64');

    params.hash = hash;

    // Enregistrer la demande de paiement en attente
    const { error: insertError } = await supabase
      .from('payment_requests')
      .insert({
        user_id: userId,
        payment_method: 'cmi',
        amount: parseFloat(amountStr),
        currency: currency,
        cmi_order_id: orderId,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Erreur insertion payment_requests:', insertError);
    }

    console.log(`✅ Paiement CMI initialisé: orderId=${orderId} pour userId: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        gatewayUrl: CMI_GATEWAY_URL,
        params,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erreur create-cmi-payment:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erreur lors de l\'initialisation du paiement CMI' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
