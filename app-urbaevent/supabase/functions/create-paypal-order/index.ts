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

    const { userId, amount, currency, description } = await req.json();

    if (!userId || !amount || !currency) {
      throw new Error('userId, amount et currency sont requis');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('Utilisateur non trouvé');
    }

    const paypalBase = PAYPAL_ENV === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const accessToken = await getPayPalAccessToken(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, paypalBase);

    // Créer la commande PayPal
    const orderRes = await fetch(`${paypalBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `sib-${userId}-${Date.now()}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          custom_id: userId,
          description: description || 'Pass Premium VIP SIB 2026',
          amount: {
            currency_code: currency,
            value: amount,
          },
        }],
        application_context: {
          brand_name: 'SIB 2026',
          locale: 'fr-MA',
          user_action: 'PAY_NOW',
        },
      }),
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      throw new Error(`PayPal order creation failed: ${orderRes.status} — ${errBody}`);
    }

    const order = await orderRes.json();

    // Extraire l'URL d'approbation PayPal (lien rel="approve" dans la liste des liens)
    const approvalLink = (order.links ?? []).find(
      (l: { rel: string; href: string }) => l.rel === 'approve'
    );
    const approvalUrl = approvalLink?.href ?? null;

    console.log(`✅ Commande PayPal créée: ${order.id} pour userId: ${userId}, approvalUrl: ${approvalUrl ? 'OK' : 'MANQUANT'}`);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        status: order.status,
        approvalUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erreur create-paypal-order:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erreur lors de la création de la commande PayPal' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
