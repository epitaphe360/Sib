import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      throw new Error('Variables Stripe manquantes');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables Supabase manquantes');
    }

    // Initialiser Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Récupérer la signature Stripe
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Signature Stripe manquante');
    }

    // Récupérer le body brut
    const body = await req.text();

    // Vérifier la signature du webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('❌ Erreur validation signature webhook:', err.message);
      return new Response(
        JSON.stringify({ error: 'Signature webhook invalide' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('📥 Webhook Stripe reçu:', event.type);

    // Traiter l'événement checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('✅ Paiement réussi pour session:', session.id);
      console.log('   Client:', session.customer_email);
      console.log('   Metadata:', session.metadata);

      // Extraire les données de la session
      const userId = session.metadata?.userId;
      const visitorLevel = session.metadata?.visitorLevel;

      if (!userId || !visitorLevel) {
        console.error('❌ Metadata manquantes dans la session Stripe');
        return new Response(
          JSON.stringify({ error: 'Metadata manquantes' }),
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

      // Récupérer les infos utilisateur
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('email, name, profile')
        .eq('id', userId)
        .single();

      if (!userFetchError && userData) {
        // 9. Call generate-visitor-badge function with photo
        console.log('📌 Appel generate-visitor-badge...');
        try {
          const { error: badgeError } = await supabase.functions.invoke('generate-visitor-badge', {
            body: {
              userId: userId,
              email: userData.email,
              name: userData.name,
              level: visitorLevel,
              photoUrl: userData.profile?.photoUrl || '',
              includePhoto: visitorLevel === 'vip' // Include photo for VIP
            }
          });

          if (badgeError) {
            console.warn('⚠️ Erreur génération badge:', badgeError);
          } else {
            console.log('✅ Badge généré avec succès');
          }
        } catch (badgeErr: any) {
          console.error('❌ Erreur appel generate-visitor-badge:', badgeErr);
        }

        // 10. Send confirmation email with badge
        console.log('📧 Envoi email de confirmation...');
        try {
          const { error: emailError } = await supabase.functions.invoke('send-visitor-welcome-email', {
            body: {
              email: userData.email,
              name: userData.name,
              level: visitorLevel,
              userId: userId,
              paymentConfirmed: true // Mark as payment confirmed
            }
          });

          if (emailError) {
            console.warn('⚠️ Erreur envoi email confirmation:', emailError);
          } else {
            console.log('✅ Email de confirmation envoyé');
          }
        } catch (emailErr: any) {
          console.error('❌ Erreur appel send-visitor-welcome-email:', emailErr);
        }

        // 11. Update user status to 'active'
        console.log('🔄 Activation du compte utilisateur...');
        const { error: statusError } = await supabase
          .from('users')
          .update({
            status: 'active', // 11. Status → 'active'
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (statusError) {
          console.error('❌ Erreur activation compte:', statusError);
        } else {
          console.log('✅ Compte utilisateur activé');
        }
      }

      // Créer une notification pour l'utilisateur
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'system',
          message: `Votre abonnement ${visitorLevel.toUpperCase()} a été activé avec succès!`,
          read: false,
          created_at: new Date().toISOString()
        });

      console.log('✅ Notification créée pour l\'utilisateur');

      // Optionnel : enregistrer la transaction
      await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent,
          amount: session.amount_total,
          currency: session.currency,
          visitor_level: visitorLevel,
          status: 'completed',
          created_at: new Date().toISOString()
        });

      console.log('✅ Transaction enregistrée');
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
    console.error('❌ Erreur traitement webhook Stripe:', error);

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
