import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CMICallbackData {
  oid: string;              // Order ID
  tranid: string;           // Transaction ID
  response: string;         // Response code (Approved, Declined, etc.)
  AuthCode: string;         // Authorization code
  ProcReturnCode: string;   // Processing return code
  amount: string;           // Amount in smallest unit (cents/millimes)
  currency: string;         // Currency code (504 for MAD)
  clientId: string;         // Client/Merchant ID
  HASH: string;             // Security hash
  userId?: string;          // Custom field: user ID
  visitorLevel?: string;    // Custom field: visitor level
}

/**
 * Verify CMI hash signature
 * Formula: HASH = BASE64(SHA512(clientId + oid + AuthCode + ProcReturnCode + response + storeKey))
 */
function verifyCMIHash(data: CMICallbackData, storeKey: string): boolean {
  const hashString = `${data.clientId}${data.oid}${data.AuthCode}${data.ProcReturnCode}${data.response}${storeKey}`;

  const hash = createHmac('sha512', '')
    .update(hashString)
    .digest('base64');

  return hash === data.HASH;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const CMI_STORE_KEY = Deno.env.get('CMI_STORE_KEY');
    const CMI_CLIENT_ID = Deno.env.get('CMI_CLIENT_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!CMI_STORE_KEY || !CMI_CLIENT_ID) {
      throw new Error('Variables CMI manquantes');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables Supabase manquantes');
    }

    // Parse callback data (CMI sends as URL-encoded form data)
    const formData = await req.formData();
    const callbackData: CMICallbackData = {
      oid: formData.get('oid') as string,
      tranid: formData.get('tranid') as string,
      response: formData.get('response') as string,
      AuthCode: formData.get('AuthCode') as string,
      ProcReturnCode: formData.get('ProcReturnCode') as string,
      amount: formData.get('amount') as string,
      currency: formData.get('currency') as string,
      clientId: formData.get('clientId') as string,
      HASH: formData.get('HASH') as string,
      userId: formData.get('userId') as string,
      visitorLevel: formData.get('visitorLevel') as string,
    };

    console.log('📥 Callback CMI reçu:');
    console.log('   Order ID:', callbackData.oid);
    console.log('   Response:', callbackData.response);
    console.log('   Transaction ID:', callbackData.tranid);

    // Verify hash signature for security
    if (!verifyCMIHash(callbackData, CMI_STORE_KEY)) {
      console.error('❌ Signature CMI invalide');
      return new Response(
        JSON.stringify({ error: 'Signature invalide' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('✅ Signature CMI vérifiée');

    // Check if payment was approved
    if (callbackData.response !== 'Approved' || callbackData.ProcReturnCode !== '00') {
      console.warn('⚠️  Paiement CMI non approuvé:', callbackData.response, callbackData.ProcReturnCode);

      // Log failed transaction
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      if (callbackData.userId) {
        await supabase
          .from('payment_transactions')
          .insert({
            user_id: callbackData.userId,
            cmi_order_id: callbackData.oid,
            cmi_transaction_id: callbackData.tranid,
            amount: parseInt(callbackData.amount, 10),
            currency: callbackData.currency === '504' ? 'mad' : 'usd',
            visitor_level: callbackData.visitorLevel || 'premium',
            status: 'failed',
            payment_method: 'cmi',
            error_message: `${callbackData.response} - ${callbackData.ProcReturnCode}`,
            created_at: new Date().toISOString()
          });
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Paiement non approuvé',
          response: callbackData.response,
          code: callbackData.ProcReturnCode
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Extract user data
    const userId = callbackData.userId;
    const visitorLevel = callbackData.visitorLevel || 'premium';

    if (!userId) {
      console.error('❌ User ID manquant dans le callback CMI');
      return new Response(
        JSON.stringify({ error: 'User ID manquant' }),
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
        message: `Votre abonnement ${visitorLevel.toUpperCase()} a été activé avec succès via CMI!`,
        read: false,
        created_at: new Date().toISOString()
      });

    console.log('✅ Notification créée pour l\'utilisateur');

    // Convertir le montant (CMI envoie en millimes pour MAD: 1 MAD = 100 millimes)
    const amount = parseInt(callbackData.amount, 10);
    const currency = callbackData.currency === '504' ? 'mad' : 'usd';

    // Enregistrer la transaction
    await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        cmi_order_id: callbackData.oid,
        cmi_transaction_id: callbackData.tranid,
        cmi_auth_code: callbackData.AuthCode,
        amount: amount,
        currency: currency,
        visitor_level: visitorLevel,
        status: 'completed',
        payment_method: 'cmi',
        created_at: new Date().toISOString()
      });

    console.log('✅ Transaction CMI enregistrée');

    // Return success response (CMI expects specific format)
    return new Response(
      'ACTION=POSTAUTH',  // CMI expects this exact response for successful processing
      {
        headers: {
          'Content-Type': 'text/plain',
        },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Erreur traitement callback CMI:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors du traitement du callback'
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
