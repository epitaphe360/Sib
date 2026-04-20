import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY');

    if (!FIREBASE_SERVER_KEY) {
      throw new Error('FIREBASE_SERVER_KEY manquant. Ajoutez-le avec : supabase secrets set FIREBASE_SERVER_KEY=<votre_clé>');
    }

    const { title, message, audience } = await req.json();

    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: 'title et message sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Récupérer les tokens FCM selon l'audience
    let tokens: string[] = [];

    if (!audience || audience === 'all') {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('fcm_token')
        .not('fcm_token', 'is', null);
      tokens = (subs ?? []).map((s: { fcm_token: string }) => s.fcm_token).filter(Boolean);
    } else {
      const typeMap: Record<string, string> = {
        visitors: 'visitor',
        vip: 'vip',
        exhibitors: 'exhibitor',
        agents: 'agent',
      };
      const userType = typeMap[audience] ?? audience;

      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('type', userType);

      const ids = (users ?? []).map((u: { id: string }) => u.id);

      if (ids.length === 0) {
        return new Response(
          JSON.stringify({ sent: 0, message: 'Aucun utilisateur de ce type' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('fcm_token')
        .in('user_id', ids)
        .not('fcm_token', 'is', null);

      tokens = (subs ?? []).map((s: { fcm_token: string }) => s.fcm_token).filter(Boolean);
    }

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'Aucun appareil enregistré' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Envoi FCM Legacy API — batch de 500 max
    let totalSent = 0;
    let totalFailed = 0;

    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);

      const fcmRes = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${FIREBASE_SERVER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration_ids: batch,
          notification: {
            title,
            body: message,
            sound: 'default',
          },
          data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            audience: audience ?? 'all',
          },
          priority: 'high',
          content_available: true,
        }),
      });

      const result = await fcmRes.json();
      totalSent += result.success ?? 0;
      totalFailed += result.failure ?? 0;
    }

    console.log(`📲 FCM broadcast: ${totalSent} envoyés, ${totalFailed} échoués`);

    return new Response(
      JSON.stringify({ sent: totalSent, failed: totalFailed, total: tokens.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ broadcast-push-notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message ?? String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
