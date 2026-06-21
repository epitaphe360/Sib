import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

/**
 * Vérifie le statut d'un paiement CMI en consultant la table `payment_requests`.
 * Le webhook CMI (`cmi-webhook`) met à jour le statut lors du callback de la passerelle.
 */
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

    const { orderId } = await req.json();
    if (!orderId) throw new Error('orderId est requis');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Chercher la payment_request correspondant à cet orderId CMI
    const { data, error } = await supabase
      .from('payment_requests')
      .select('id, status, payment_method, amount, currency, cmi_order_id')
      .eq('cmi_order_id', orderId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Commande CMI introuvable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const verified = data.status === 'approved';

    console.log(`CMI verify — orderId: ${orderId}, status: ${data.status}, verified: ${verified}`);

    return new Response(
      JSON.stringify({
        verified,
        status: data.status,
        orderId,
        amount: data.amount,
        currency: data.currency,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erreur payment-cmi-verify:', error);
    return new Response(
      JSON.stringify({ verified: false, error: error.message ?? 'Erreur vérification CMI' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
