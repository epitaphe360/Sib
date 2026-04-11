import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PushNotificationRequest {
  userId: string;
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: Record<string, any>;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@siports.dz';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables Supabase manquantes');
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error('Variables VAPID manquantes');
    }

    // Parse request body
    const { userId, notification }: PushNotificationRequest = await req.json();

    if (!userId || !notification) {
      throw new Error('userId et notification requis');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active subscriptions found',
          sent: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Configure web-push
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    // Prepare notification payload
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/logo.png',
      badge: notification.badge || '/badge.png',
      data: notification.data || {},
    });

    // Send to all subscriptions
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payload
        );

        // Update last_used_at
        await supabase
          .from('push_subscriptions')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', subscription.id);

        return { success: true, subscriptionId: subscription.id };
      } catch (error: any) {
        console.error('Error sending to subscription:', subscription.id, error);

        // Si l'abonnement est invalide (410 Gone), le désactiver
        if (error.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', subscription.id);
        }

        return { success: false, subscriptionId: subscription.id, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter((r) => r.success).length;

    console.log(`📲 Push notifications sent: ${successCount}/${subscriptions.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        total: subscriptions.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ Erreur send-push-notification:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors de l\'envoi de la notification',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
