import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

async function getPayPalAccessToken(clientId: string, clientSecret: string, baseUrl: string): Promise<string> {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    throw new Error(`PayPal token error: ${res.status}`);
  }
  const { access_token } = await res.json();
  return access_token;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const PAYPAL_ENV = Deno.env.get('PAYPAL_ENV') || 'sandbox';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables Supabase manquantes');
    }
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('Variables PayPal manquantes (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)');
    }

    const { orderId, userId } = await req.json();

    if (!orderId || !userId) {
      throw new Error('orderId et userId sont requis');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const paypalBase = PAYPAL_ENV === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const accessToken = await getPayPalAccessToken(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, paypalBase);

    // Capturer la commande PayPal
    const captureRes = await fetch(`${paypalBase}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `sib-capture-${orderId}-${Date.now()}`,
      },
    });

    if (!captureRes.ok) {
      const errBody = await captureRes.text();
      throw new Error(`PayPal capture failed: ${captureRes.status} — ${errBody}`);
    }

    const captureData = await captureRes.json();

    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId = capture?.id;
    const captureStatus = capture?.status;
    const amount = capture?.amount?.value;
    const currency = capture?.amount?.currency_code;

    if (captureStatus !== 'COMPLETED') {
      throw new Error(`Paiement non complété: status=${captureStatus}`);
    }

    // Enregistrer le paiement en base
    const { error: insertError } = await supabase
      .from('payment_requests')
      .upsert({
        user_id: userId,
        payment_method: 'paypal',
        amount: parseFloat(amount),
        currency,
        paypal_order_id: orderId,
        paypal_capture_id: captureId,
        status: 'approved',
        validated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,payment_method' });

    if (insertError) {
      console.error('Erreur insertion payment_requests:', insertError);
    }

    // Mettre à jour le type d'abonnement de l'utilisateur
    const { error: updateError } = await supabase
      .from('users')
      .update({ subscription_type: 'vip', updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) {
      console.error('Erreur mise à jour subscription:', updateError);
    }

    console.log(`✅ Paiement PayPal capturé: ${captureId} pour userId: ${userId}, montant: ${amount} ${currency}`);

    return new Response(
      JSON.stringify({
        success: true,
        captureId,
        status: captureStatus,
        amount,
        currency,
        orderId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erreur capture-paypal-order:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erreur lors de la capture du paiement PayPal' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
