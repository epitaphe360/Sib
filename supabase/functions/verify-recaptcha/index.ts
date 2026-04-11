import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY') || '';

interface RecaptchaVerifyRequest {
  token: string;
  action?: string;
  minimumScore?: number;
}

interface RecaptchaGoogleResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

serve(async (req) => {
  const origin = req.headers.get('Origin') || '*';

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': origin,
      }
    });
  }

  try {
    const { token, action, minimumScore = 0.5 }: RecaptchaVerifyRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token manquant' }),
        {
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json' 
          },
        }
      );
    }

    // Vérifier le token avec Google
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
    });

    const googleResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data: RecaptchaGoogleResponse = await googleResponse.json();

    // Vérification basique
    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Verification reCAPTCHA échouée',
          errorCodes: data['error-codes'],
        }),
        {
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json' 
          },
        }
      );
    }

    // Vérification du score (reCAPTCHA v3)
    if (data.score !== undefined && data.score < minimumScore) {
      console.warn(`reCAPTCHA score too low: ${data.score} < ${minimumScore}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Score reCAPTCHA trop bas',
          score: data.score,
          minimumScore,
        }),
        {
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json' 
          },
        }
      );
    }

    // Vérification de l'action (optionnel)
    if (action && data.action !== action) {
      console.warn(`reCAPTCHA action mismatch: expected "${action}", got "${data.action}"`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Action reCAPTCHA incorrecte',
          expected: action,
          received: data.action,
        }),
        {
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json' 
          },
        }
      );
    }

    // Succès !
    return new Response(
      JSON.stringify({
        success: true,
        score: data.score,
        action: data.action,
        challenge_ts: data.challenge_ts,
        hostname: data.hostname,
      }),
      {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json' 
        },
      }
    );
  } catch (error) {
    console.error('Error in verify-recaptcha function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur serveur lors de la vérification reCAPTCHA',
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
