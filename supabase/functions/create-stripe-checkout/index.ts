import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CheckoutRequest {
  userId: string;
  level: 'premium';
  successUrl: string;
  cancelUrl: string;
}

// Prix par niveau (en centimes)
const LEVEL_PRICES = {
  premium: {
    amount: 70000, // 700€
    name: 'Pass Premium VIP',
    description: 'Accès VIP complet 3 jours All Inclusive - Rendez-vous illimités, networking illimité, service concierge, soirée gala, transferts aéroport'
  }
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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY non configurée');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables Supabase manquantes');
    }

    const { userId, level, successUrl, cancelUrl }: CheckoutRequest = await req.json();

    // Validation
    if (!userId || !level || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Paramètres manquants' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (level !== 'premium') {
      return new Response(
        JSON.stringify({ error: 'Niveau d\'abonnement invalide. Seul le niveau premium est disponible.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const priceInfo = LEVEL_PRICES[level];

    // Initialiser Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Initialiser Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('Utilisateur non trouvé');
    }

    console.log('🛒 Création session Stripe Checkout pour:', user.email, 'niveau:', level);

    // Créer une session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: priceInfo.name,
              description: priceInfo.description,
              images: ['https://images.unsplash.com/photo-1528605248644-14dd04022da1'], // Image de port
            },
            unit_amount: priceInfo.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: user.email,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        visitorLevel: level,
        userName: user.name || ''
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    console.log('✅ Session Stripe créée:', session.id);

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        url: session.url
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Erreur création session Stripe:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors de la création de la session de paiement'
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
