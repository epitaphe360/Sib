// @ts-nocheck - Deno runtime, not TypeScript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Génère un mot de passe alphanumérique (lettres + chiffres, pas de caractères spéciaux) */
function generateAlphanumericPassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, b => chars[b % chars.length]).join('')
}

/** Template email d'envoi des accès */
function buildCredentialsEmail(name: string, email: string, password: string, appUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vos accès — Espace SIB 2026</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1B365D 0%,#0F2034 100%);padding:32px;text-align:center;">
              <h1 style="color:#C9A84C;margin:0;font-size:22px;font-weight:700;letter-spacing:2px;">SIB 2026</h1>
              <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:13px;">Salon International du Bâtiment</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 36px;">
              <h2 style="color:#1B365D;margin:0 0 8px;font-size:20px;">Bonjour ${name},</h2>
              <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Votre espace personnel sur la plateforme SIB 2026 est prêt. Voici vos identifiants de connexion :
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fc;border:1px solid #e2e8f0;border-radius:8px;margin:0 0 28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🔗 Lien de connexion</span><br/>
                          <a href="${appUrl}/login" style="color:#1B365D;font-size:14px;font-weight:600;text-decoration:none;">${appUrl}/login</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 8px;border-bottom:1px solid #e2e8f0;">
                          <span style="color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📧 Email</span><br/>
                          <span style="color:#2d3748;font-size:15px;font-weight:600;">${email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 0;">
                          <span style="color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🔑 Mot de passe</span><br/>
                          <span style="color:#1B365D;font-size:18px;font-weight:700;font-family:monospace;letter-spacing:2px;">${password}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/login" style="display:inline-block;background:linear-gradient(135deg,#1B365D,#0F2034);color:#C9A84C;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:1px;">
                      Se connecter maintenant →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#718096;font-size:13px;line-height:1.6;margin:0;">
                Conservez ces informations en lieu sûr. En cas de problème, contactez l'équipe SIB.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7f9fc;border-top:1px solid #e2e8f0;padding:20px 36px;text-align:center;">
              <p style="color:#a0aec0;font-size:12px;margin:0;">© 2026 SIB — Salon International du Bâtiment · Casablanca, Maroc</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    // ── 1. Vérification auth : l'appelant doit être admin ──────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !caller) {
      return new Response(JSON.stringify({ error: 'Token invalide' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: callerData } = await supabaseAdmin
      .from('users')
      .select('type')
      .eq('id', caller.id)
      .single()

    if (!callerData || callerData.type !== 'admin') {
      return new Response(JSON.stringify({ error: 'Accès réservé aux administrateurs' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 2. Lecture du body ────────────────────────────────────────────────
    const { userId, email, name } = await req.json()

    if (!userId || !email) {
      return new Response(JSON.stringify({ error: 'userId et email sont requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 3. Génération mot de passe alphanumérique ─────────────────────────
    const password = generateAlphanumericPassword(12)

    // ── 4. Mise à jour du mot de passe via Admin API ──────────────────────
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
    })

    if (updateError) {
      console.error('updateUserById error:', updateError)
      return new Response(JSON.stringify({ error: 'Erreur lors de la mise à jour du mot de passe : ' + updateError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 5. Envoi de l'email via Resend ────────────────────────────────────
    const appUrl = Deno.env.get('APP_URL') ?? Deno.env.get('FRONTEND_URL') ?? 'https://sib2026.ma'
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const displayName = name || email.split('@')[0]

    if (resendKey) {
      const htmlBody = buildCredentialsEmail(displayName, email, password, appUrl)

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SIB 2026 <noreply@sib2026.ma>',
          to: email,
          subject: 'Vos accès — Espace SIB 2026',
          html: htmlBody,
        }),
      })

      if (!emailResponse.ok) {
        const emailErr = await emailResponse.text()
        console.error('Resend error:', emailErr)
        // On ne bloque pas : le mot de passe a été mis à jour, on signale juste l'échec email
        return new Response(JSON.stringify({
          success: true,
          password,
          emailSent: false,
          emailError: emailErr,
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    // ── 6. Log dans admin_audit_log (si la table existe) ──────────────────
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_id: caller.id,
      action: 'send_credentials',
      target_user_id: userId,
      target_email: email,
      metadata: { name: displayName, email_sent: !!resendKey },
    }).then(() => {}).catch(() => {}) // Non bloquant

    // ── 7. Réponse ────────────────────────────────────────────────────────
    return new Response(JSON.stringify({
      success: true,
      password,
      emailSent: !!resendKey,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('Function error:', err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Erreur inconnue' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
