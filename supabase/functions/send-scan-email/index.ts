import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SMTP_CONFIG = {
  hostname: Deno.env.get('SMTP_HOST') || 'mail.sib2026.ma',
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  username: Deno.env.get('SMTP_USERNAME') || 'contact@sib2026.ma',
  password: Deno.env.get('SMTP_PASSWORD') || '',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let id: number | undefined
  try {
    const timeout = new Promise<never>((_, reject) => {
      id = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    })
    return await Promise.race([promise, timeout])
  } finally {
    if (id !== undefined) clearTimeout(id)
  }
}

async function sendViaSMTP(to: string, subject: string, html: string): Promise<void> {
  // Tentative port 465 (SSL)
  try {
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_CONFIG.hostname,
        port: 465,
        tls: true,
        auth: { username: SMTP_CONFIG.username, password: SMTP_CONFIG.password },
      },
    })
    await withTimeout(
      client.send({ from: `SIB 2026 <${SMTP_CONFIG.username}>`, to, subject, content: 'auto', html }),
      5000
    )
    await client.close()
    return
  } catch (e) {
    console.error('SMTP 465 failed, trying 587...', e instanceof Error ? e.message : e)
  }

  // Tentative port 587 (STARTTLS)
  const client2 = new SMTPClient({
    connection: {
      hostname: SMTP_CONFIG.hostname,
      port: 587,
      tls: false,
      auth: { username: SMTP_CONFIG.username, password: SMTP_CONFIG.password },
    },
  })
  await withTimeout(
    client2.send({ from: `SIB 2026 <${SMTP_CONFIG.username}>`, to, subject, content: 'auto', html }),
    5000
  )
  await client2.close()
}

function buildEmailHtml(
  visitorName: string,
  scannerName: string,
  scannerCompany: string | null,
  scannerEmail: string,
  scannerPhone: string | null,
  salonName: string,
  profileUrl: string
): string {
  const company = scannerCompany ? `<p style="margin:4px 0;color:#555;font-size:15px;">🏢 ${scannerCompany}</p>` : ''
  const phone = scannerPhone ? `<p style="margin:4px 0;color:#555;font-size:15px;">📞 ${scannerPhone}</p>` : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vous avez été contacté au ${salonName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4598D1,#1a6fa3);padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;">SIB 2026</h1>
              <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Salon International du Bâtiment</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="font-size:17px;color:#222;margin:0 0 20px;">Bonjour <strong>${visitorName}</strong>,</p>
              <p style="font-size:15px;color:#444;line-height:1.6;margin:0 0 24px;">
                Un exposant a scanné votre badge lors du <strong>${salonName}</strong> et souhaite rester en contact avec vous :
              </p>

              <!-- Exposant Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border-left:4px solid #4598D1;border-radius:8px;padding:0;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1a6fa3;">📋 ${scannerName}</p>
                    ${company}
                    <p style="margin:4px 0;color:#555;font-size:15px;">✉️ <a href="mailto:${scannerEmail}" style="color:#4598D1;text-decoration:none;">${scannerEmail}</a></p>
                    ${phone}
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${profileUrl}"
                       style="display:inline-block;background:#4598D1;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                      Voir le profil complet →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
                Vous recevez cet email car votre badge a été scanné lors du salon.
                Pour ne plus recevoir ces notifications, rendez-vous dans vos paramètres de l'application SIB.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:13px;color:#aaa;">© 2026 SIB — Salon International du Bâtiment</p>
              <p style="margin:6px 0 0;font-size:13px;color:#aaa;">
                <a href="https://sib2026.vercel.app" style="color:#4598D1;text-decoration:none;">sib2026.vercel.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { scannerId, scannedUserId, salonId } = await req.json()

    if (!scannerId || !scannedUserId) {
      return new Response(
        JSON.stringify({ error: 'scannerId et scannedUserId sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer les profils des deux utilisateurs en parallèle
    const [scannerRes, visitorRes] = await Promise.all([
      supabase.from('users').select('id, name, email, company, phone, type').eq('id', scannerId).maybeSingle(),
      supabase.from('users').select('id, name, email, email_notifications').eq('id', scannedUserId).maybeSingle(),
    ])

    const scanner = scannerRes.data
    const visitor = visitorRes.data

    if (!scanner || !visitor) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur introuvable', scanner: !!scanner, visitor: !!visitor }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Respecter l'opt-out email du visiteur (si le champ existe)
    if (visitor.email_notifications === false) {
      return new Response(
        JSON.stringify({ message: 'Visiteur a désactivé les notifications email', sent: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!visitor.email) {
      return new Response(
        JSON.stringify({ error: 'Visiteur sans adresse email', sent: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer le nom du salon si disponible
    let salonName = 'SIB 2026'
    if (salonId) {
      const salonRes = await supabase.from('salons').select('name').eq('id', salonId).maybeSingle()
      if (salonRes.data?.name) salonName = salonRes.data.name
    }

    // URL du profil exposant sur le site web
    const profileUrl = `https://sib2026.vercel.app/exposants/${encodeURIComponent(scanner.email)}`

    const subject = `${scanner.name} vous a rendu visite au ${salonName} !`
    const html = buildEmailHtml(
      visitor.name || 'Visiteur',
      scanner.name || 'Exposant',
      scanner.company || null,
      scanner.email,
      scanner.phone || null,
      salonName,
      profileUrl
    )

    await sendViaSMTP(visitor.email, subject, html)

    console.log(`✅ Email envoyé à ${visitor.email} (scan par ${scanner.name})`)

    return new Response(
      JSON.stringify({ success: true, sent: true, to: visitor.email }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ Erreur send-scan-email:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
