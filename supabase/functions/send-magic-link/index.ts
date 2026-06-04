/**
 * Envoie un lien magique via Resend API (contourne SMTP Auth cassé si mail.sib2026.ma invalide).
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
function resolveFromEmail(): string {
  const raw = Deno.env.get('RESEND_FROM_EMAIL') || '';
  if (raw.includes('@resend.dev')) return raw;
  return 'onboarding@resend.dev';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, redirectTo, shouldCreateUser, linkType } = await req.json() as {
      email: string;
      redirectTo: string;
      shouldCreateUser?: boolean;
      linkType?: 'magiclink' | 'signup';
    };

    if (!email?.trim() || !redirectTo?.trim()) {
      return new Response(JSON.stringify({ error: 'email et redirectTo requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY non configurée' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const normalized = email.toLowerCase().trim();

    const type = linkType ?? (shouldCreateUser ? 'signup' : 'magiclink');

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type,
      email: normalized,
      options: {
        redirectTo,
      },
    });

    if (linkError) {
      console.error('generateLink:', linkError);
      return new Response(JSON.stringify({ error: linkError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const actionLink =
      linkData?.properties?.action_link ??
      (linkData as { action_link?: string })?.action_link;

    if (!actionLink) {
      return new Response(JSON.stringify({ error: 'Lien magique non généré' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:24px">
      <h2 style="color:#1B365D">UrbaEvent — SIB 2026</h2>
      <p>Cliquez sur le bouton pour vous connecter à l'application mobile :</p>
      <p><a href="${actionLink}" style="display:inline-block;background:#1B365D;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px">Ouvrir UrbaEvent</a></p>
      <p style="color:#666;font-size:12px">Si le bouton ne fonctionne pas, copiez ce lien :<br>${actionLink}</p>
    </body></html>`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `UrbaEvent SIB <${resolveFromEmail()}>`,
        to: [normalized],
        subject: 'Votre lien de connexion UrbaEvent',
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend:', errText);
      return new Response(JSON.stringify({ error: `Resend: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
