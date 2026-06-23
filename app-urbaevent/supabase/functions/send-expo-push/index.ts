import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ExpoPushRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables Supabase manquantes');
    }

    const { userId, title, body, data }: ExpoPushRequest = await req.json();
    if (!userId || !title || !body) {
      return new Response(JSON.stringify({ error: 'userId, title et body requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: devices, error } = await supabase
      .from('notifications_devices')
      .select('device_token')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    const tokens = (devices ?? [])
      .map((d: { device_token: string }) => d.device_token)
      .filter((t: string) => t.startsWith('ExponentPushToken'));

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No Expo push tokens' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const messages = tokens.map((to: string) => ({
      to,
      sound: 'default',
      title,
      body,
      data: data ?? {},
      priority: 'high',
      channelId: 'default',
    }));

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    };
    if (EXPO_ACCESS_TOKEN) {
      headers.Authorization = `Bearer ${EXPO_ACCESS_TOKEN}`;
    }

    const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers,
      body: JSON.stringify(messages),
    });

    const result = await pushRes.json();
    const tickets = Array.isArray(result.data) ? result.data : [];
    const sent = tickets.filter((t: { status?: string }) => t.status === 'ok').length;

    return new Response(JSON.stringify({ sent, total: tokens.length, tickets }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
