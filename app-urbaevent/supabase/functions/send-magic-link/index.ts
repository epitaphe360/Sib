/**
 * Envoie un lien magique via Resend API (contourne SMTP Auth cassé si mail.sib2026.ma invalide).
 * Inscription : type "invite" (sans mot de passe) — pas "signup" qui exige un password.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

/** Deep link natif ouvert par la page pont Storage. */
const MOBILE_AUTH_REDIRECT = 'urbaevent://auth-callback';

function authOpenUrl(): string {
  const base = Deno.env.get('SUPABASE_URL') ?? '';
  return `${base}/functions/v1/auth-open`;
}

type LinkProperties = {
  hashed_token?: string;
  verification_type?: string;
  action_link?: string;
};

/** Lien HTTPS cliquable → redirection 302 vers l'app (pas de page HTML). */
function buildEmailClickableLink(
  data: { properties?: LinkProperties } | null,
  fallbackType: string,
): string | undefined {
  const props = data?.properties ?? {};
  if (props.hashed_token) {
    const otpType = props.verification_type ?? fallbackType;
    const open = new URL(authOpenUrl());
    open.searchParams.set('token_hash', props.hashed_token);
    open.searchParams.set('type', otpType);
    return open.toString();
  }
  const actionLink =
    props.action_link ?? (data as { action_link?: string } | null)?.action_link;
  return actionLink?.startsWith('http') ? actionLink : undefined;
}

function resolveFromEmail(): string {
  const raw = Deno.env.get('RESEND_FROM_EMAIL') || '';
  if (raw.includes('@')) return raw;
  return 'onboarding@resend.dev';
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

/** Inscription → invite ; connexion → magiclink (pas signup = password obligatoire). */
function resolveLinkType(
  shouldCreateUser: boolean | undefined,
  linkType: 'magiclink' | 'signup' | undefined,
): 'invite' | 'magiclink' {
  const isRegistration = shouldCreateUser === true || linkType === 'signup';
  return isRegistration ? 'invite' : 'magiclink';
}

/** Toujours urbaevent:// — les Edge Functions Supabase ne servent pas le HTML correctement (text/plain). */
function normalizeRedirectTo(_redirectTo: string): string {
  return MOBILE_AUTH_REDIRECT;
}

async function authUserExists(
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error('listUsers:', error);
    return false;
  }
  const normalized = email.toLowerCase();
  return (data.users ?? []).some((u) => (u.email ?? '').toLowerCase() === normalized);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Trop de tentatives. Attendez 1 minute.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
    });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  let isPrivileged = false;
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const supabaseCheck = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: { user: caller } } = await supabaseCheck.auth.getUser(token);
    if (caller) {
      const { data: callerProfile } = await supabaseCheck.from('users').select('type').eq('id', caller.id).single();
      isPrivileged = ['admin', 'service_client'].includes(callerProfile?.type ?? '');
    }
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
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const normalized = email.toLowerCase().trim();
    const isRegistration = shouldCreateUser === true || linkType === 'signup';
    const type = resolveLinkType(shouldCreateUser, linkType);
    const safeRedirectTo = normalizeRedirectTo(redirectTo);

    if (!isPrivileged && !isRegistration) {
      const exists = await authUserExists(supabaseAdmin, normalized);
      if (!exists) {
        return new Response(JSON.stringify({ ok: false, skipped: true, reason: 'profile_missing' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    let actionLink: string | undefined;

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type,
      email: normalized,
      options: { redirectTo: safeRedirectTo },
    });

    if (linkError) {
      console.error('generateLink:', linkError);
      const msg = linkError.message ?? '';
      const alreadyRegistered =
        msg.toLowerCase().includes('already been registered') ||
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('user already');

      if (alreadyRegistered && isRegistration) {
        const { data: retryData, error: retryError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: normalized,
          options: { redirectTo: safeRedirectTo },
        });
        if (retryError) {
          return new Response(JSON.stringify({ error: retryError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        actionLink = buildEmailClickableLink(retryData, 'magiclink');
      } else {
        return new Response(JSON.stringify({ error: linkError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      actionLink = buildEmailClickableLink(linkData, type);
    }

    if (!actionLink) {
      return new Response(JSON.stringify({ error: 'Lien magique non généré' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject = isRegistration
      ? 'Activez votre compte UrbaEvent — SIB 2026'
      : 'Votre lien de connexion UrbaEvent';
    const intro = isRegistration
      ? 'Cliquez pour activer votre compte et accéder à votre badge :'
      : 'Cliquez pour vous connecter à l\'application mobile :';

    const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:24px">
      <h2 style="color:#1B365D">UrbaEvent — SIB 2026</h2>
      <p>${intro}</p>
      <p><a href="${actionLink}" style="display:inline-block;background:#1B365D;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px">Ouvrir UrbaEvent</a></p>
      <p style="color:#666;font-size:12px;margin-top:20px">Si le bouton ne s'ouvre pas dans Gmail, appuyez sur ⋮ puis «&nbsp;Ouvrir dans Chrome&nbsp;», ou copiez ce lien :<br><a href="${actionLink}" style="color:#1B365D;word-break:break-all">${actionLink}</a></p>
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
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend:', errText);
      let userMessage = `Resend: ${errText}`;
      try {
        const parsed = JSON.parse(errText) as { message?: string; statusCode?: number };
        const msg = parsed.message ?? '';
        if (parsed.statusCode === 403) {
          if (msg.includes('domain is not verified')) {
            userMessage =
              'Domaine email non vérifié sur Resend. Vérifiez sib2026.ma sur resend.com/domains puis configurez RESEND_FROM_EMAIL=noreply@sib2026.ma.';
          } else if (msg.includes('only send testing emails')) {
            userMessage =
              'Compte Resend en mode test : seul l’email du compte Resend peut recevoir des messages. Vérifiez le domaine sib2026.ma sur resend.com/domains pour envoyer à tous les visiteurs.';
          }
        }
      } catch {
        /* keep raw */
      }
      return new Response(JSON.stringify({ error: userMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, linkType: type }), {
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
