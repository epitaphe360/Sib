import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PayPalWebhookEvent {
  event_type: string;
  resource: {
    id: string;
    status: string;
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{
          id: string;
          status: string;
          amount: {
            value: string;
            currency_code: string;
          };
        }>;
      };
      custom_id?: string;
    }>;
  };
}

/**
 * SECURITY: Verify PayPal webhook signature via PayPal REST API
 * https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
 */
async function verifyPayPalWebhook(
  headers: Headers,
  body: string,
  webhookId: string,
  clientId: string,
  clientSecret: string
): Promise<boolean> {
  try {
    const transmissionId = headers.get('paypal-transmission-id');
    const transmissionTime = headers.get('paypal-transmission-time');
    const transmissionSig = headers.get('paypal-transmission-sig');
    const certUrl = headers.get('paypal-cert-url');
    const authAlgo = headers.get('paypal-auth-algo');

    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
      console.error('[PayPal] Missing required webhook headers');
      return false;
    }

    // Step 1: Get OAuth2 access token from PayPal
    const paypalEnv = Deno.env.get('PAYPAL_ENV') || 'sandbox';
    const paypalBase = paypalEnv === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const tokenCredentials = btoa(`${clientId}:${clientSecret}`);
    const tokenRes = await fetch(`${paypalBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${tokenCredentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenRes.ok) {
      console.error('[PayPal] Failed to get access token:', tokenRes.status);
      return false;
    }

    const { access_token } = await tokenRes.json();

    // Step 2: Verify webhook signature via PayPal API
    // Parse body to send as object, or keep as string
    let webhookEvent: unknown;
    try {
      webhookEvent = JSON.parse(body);
    } catch {
      console.error('[PayPal] Invalid JSON body');
      return false;
    }

    const verifyRes = await fetch(`${paypalBase}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: webhookEvent,
      }),
    });

    if (!verifyRes.ok) {
      console.error('[PayPal] Verification API call failed:', verifyRes.status);
      return false;
    }

    const { verification_status } = await verifyRes.json();
    const isValid = verification_status === 'SUCCESS';

    if (!isValid) {
      console.error('[PayPal] Webhook signature verification FAILED:', verification_status);
    } else {
      console.log('[PayPal] Webhook signature verified successfully');
    }

    return isValid;
  } catch (error) {
    console.error('[PayPal] Webhook verification error:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const PAYPAL_WEBHOOK_ID = Deno.env.get('PAYPAL_WEBHOOK_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('Variables PayPal manquantes');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables Supabase manquantes');
    }

    // Get raw body for signature verification
    const body = await req.text();

    // SECURITY: Verify PayPal webhook signature via PayPal REST API
    if (PAYPAL_WEBHOOK_ID) {
      const isValid = await verifyPayPalWebhook(req.headers, body, PAYPAL_WEBHOOK_ID, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
      if (!isValid) {
        console.error('❌ [SECURITY] Invalid PayPal webhook signature');
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }
      console.log('✅ [SECURITY] PayPal webhook signature verified');
    } else {
      console.warn('⚠️ [SECURITY] PAYPAL_WEBHOOK_ID not configured - skipping verification');
    }

    // Parse webhook event
    const webhookEvent: PayPalWebhookEvent = JSON.parse(body);

    console.log('📥 Webhook PayPal reçu:', webhookEvent.event_type);

    // Traiter l'événement de capture de paiement
    if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = webhookEvent.resource;

      console.log('✅ Paiement PayPal capturé:', resource.id);
      console.log('   Status:', resource.status);

      // Extraire les données du custom_id qui contient userId
      const customId = resource.purchase_units?.[0]?.custom_id;

      if (!customId) {
        console.error('❌ Custom ID manquant dans le webhook PayPal');
        return new Response(
          JSON.stringify({ error: 'Custom ID manquant' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Parse custom_id: format "userId:visitorLevel"
      const [userId, visitorLevel] = customId.split(':');

      if (!userId || !visitorLevel) {
        console.error('❌ Format custom_id invalide:', customId);
        return new Response(
          JSON.stringify({ error: 'Format custom_id invalide' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Initialiser Supabase
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Mettre à jour le niveau du visiteur
      const { error: updateError } = await supabase
        .from('users')
        .update({
          visitor_level: visitorLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Erreur mise à jour visitor_level:', updateError);
        throw updateError;
      }

      console.log('✅ Visitor level mis à jour:', userId, '->', visitorLevel);

      // Créer une notification pour l'utilisateur
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'system',
          message: `Votre abonnement ${visitorLevel.toUpperCase()} a été activé avec succès via PayPal!`,
          read: false,
          created_at: new Date().toISOString()
        });

      console.log('✅ Notification créée pour l\'utilisateur');

      // Extraire les informations de paiement
      const capture = resource.purchase_units?.[0]?.payments?.captures?.[0];
      const amount = capture?.amount?.value ? parseFloat(capture.amount.value) * 100 : 0; // Convert to cents
      const currency = capture?.amount?.currency_code || 'USD';

      // Enregistrer la transaction
      await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          paypal_order_id: resource.id,
          paypal_capture_id: capture?.id,
          amount: amount,
          currency: currency.toLowerCase(),
          visitor_level: visitorLevel,
          status: 'completed',
          payment_method: 'paypal',
          created_at: new Date().toISOString()
        });

      console.log('✅ Transaction PayPal enregistrée');
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Erreur traitement webhook PayPal:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors du traitement du webhook'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
