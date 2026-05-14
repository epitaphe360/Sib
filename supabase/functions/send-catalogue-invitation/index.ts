import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'catalogue@sib2026.ma'
const SITE_URL = Deno.env.get('SITE_URL') || 'https://sib2026.vercel.app'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface InvitationRequest {
  catalogue_entry_id: string
  type: 'initial' | 'reminder_1' | 'reminder_2' | 'manual'
  sent_by?: string
}

function getEmailHTML(data: {
  company_name: string
  contact_name: string
  form_url: string
  completion_percent: number
  reminder_type: string
  stand_number: string
  hall: string
}): string {
  const isReminder = data.reminder_type !== 'initial'
  const subject_label = isReminder ? 'Rappel — ' : ''
  const progress_bar_width = Math.max(data.completion_percent, 5)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject_label}Fiche Catalogue SIB 2026</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f2f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
        
        <!-- Header navy -->
        <tr>
          <td style="background:#0B1C3D;padding:32px 40px;text-align:center;">
            <div style="font-size:11px;letter-spacing:3px;color:#C9A84C;text-transform:uppercase;margin-bottom:8px;">SALON INTERNATIONAL DU BÂTIMENT</div>
            <div style="font-size:32px;font-weight:800;color:#ffffff;letter-spacing:2px;">SIB 2026</div>
            <div style="font-size:13px;color:#94a3b8;margin-top:6px;">25 — 29 Novembre 2026 · El Jadida, Maroc</div>
          </td>
        </tr>

        <!-- Gold stripe -->
        <tr><td style="background:#C9A84C;height:4px;"></td></tr>

        <!-- Contenu -->
        <tr>
          <td style="padding:40px;">
            
            <p style="font-size:16px;color:#1e293b;margin:0 0 8px 0;">
              ${isReminder ? '<strong>Rappel</strong> — ' : ''}Bonjour <strong>${data.contact_name}</strong>,
            </p>

            ${isReminder ? `
            <p style="font-size:14px;color:#64748b;margin:0 0 24px 0;">
              Nous n'avons pas encore reçu votre fiche catalogue complète. Il vous reste encore le temps de la compléter avant la clôture du catalogue officiel SIB 2026.
            </p>
            ` : `
            <p style="font-size:14px;color:#64748b;margin:0 0 24px 0;">
              Dans le cadre du <strong>Catalogue Officiel SIB 2026</strong>, nous vous invitons à remplir votre fiche exposant. Elle sera diffusée à plus de <strong>10 000 visiteurs professionnels</strong> et partenaires institutionnels.
            </p>
            `}

            <!-- Info stand -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#64748b;">Entreprise</td>
                  <td style="font-size:13px;color:#64748b;text-align:right;">Stand / Hall</td>
                </tr>
                <tr>
                  <td style="font-size:16px;font-weight:700;color:#0B1C3D;padding-top:4px;">${data.company_name}</td>
                  <td style="font-size:16px;font-weight:700;color:#C9A84C;text-align:right;padding-top:4px;">
                    ${data.stand_number ? `Stand ${data.stand_number}` : ''}${data.hall ? ` — Hall ${data.hall}` : ''}
                  </td>
                </tr>
              </table>
            </div>

            ${data.completion_percent > 0 ? `
            <!-- Barre de progression -->
            <div style="margin-bottom:24px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="font-size:13px;color:#64748b;">Progression de votre fiche</span>
                <span style="font-size:13px;font-weight:700;color:#0B1C3D;">${data.completion_percent}%</span>
              </div>
              <div style="background:#e2e8f0;border-radius:999px;height:10px;overflow:hidden;">
                <div style="background:linear-gradient(90deg,#C9A84C,#e6c06b);height:100%;width:${progress_bar_width}%;border-radius:999px;"></div>
              </div>
            </div>
            ` : ''}

            <!-- CTA bouton -->
            <div style="text-align:center;margin:32px 0;">
              <a href="${data.form_url}" 
                 style="display:inline-block;background:#C9A84C;color:#0B1C3D;font-weight:700;font-size:16px;padding:16px 40px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
                ${isReminder ? '✏️ Compléter ma fiche maintenant' : '✏️ Remplir ma fiche catalogue'}
              </a>
            </div>

            <p style="font-size:12px;color:#94a3b8;text-align:center;margin-bottom:0;">
              Lien unique et sécurisé — valable jusqu'à la clôture du catalogue
            </p>
            <p style="font-size:12px;color:#94a3b8;text-align:center;margin-top:6px;">
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
              <a href="${data.form_url}" style="color:#C9A84C;word-break:break-all;">${data.form_url}</a>
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
            <p style="font-size:12px;color:#94a3b8;margin:0;">
              <strong style="color:#0B1C3D;">URBACOM</strong> — Organisateur SIB 2026<br>
              63, Imm B, Rés LE YACHT, Bd de la Corniche 7ème étage N°185, Casablanca 20510<br>
              <a href="mailto:Sib2026@urbacom.net" style="color:#C9A84C;">Sib2026@urbacom.net</a> · 
              <a href="https://sibevent.com" style="color:#C9A84C;">sibevent.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { catalogue_entry_id, type, sent_by }: InvitationRequest = await req.json()

    if (!catalogue_entry_id || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing catalogue_entry_id or type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer la fiche catalogue
    const { data: entry, error: entryError } = await supabase
      .from('catalogue_entries')
      .select('*, exhibitors(company_name, stand_number)')
      .eq('id', catalogue_entry_id)
      .single()

    if (entryError || !entry) {
      return new Response(
        JSON.stringify({ error: 'Catalogue entry not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formUrl = `${SITE_URL}/catalogue/fill/${entry.token}`
    const companyName = entry.company_name || entry.exhibitors?.company_name || 'Votre entreprise'
    const contactName = entry.contact_name || 'Madame, Monsieur'
    const standNumber = entry.stand_number || entry.exhibitors?.stand_number || ''

    const subject = type === 'initial'
      ? `📋 SIB 2026 — Complétez votre fiche catalogue officielle`
      : `🔔 Rappel SIB 2026 — Votre fiche catalogue n'est pas encore complète`

    const htmlContent = getEmailHTML({
      company_name: companyName,
      contact_name: contactName,
      form_url: formUrl,
      completion_percent: entry.completion_percent || 0,
      reminder_type: type,
      stand_number: standNumber,
      hall: entry.hall || '',
    })

    // Envoi via Resend
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY non configurée' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `SIB 2026 Catalogue <${RESEND_FROM_EMAIL}>`,
        to: [entry.contact_email],
        subject,
        html: htmlContent,
      }),
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      console.error('Resend error:', errorText)
      return new Response(
        JSON.stringify({ error: `Email send failed: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mettre à jour la fiche
    const now = new Date().toISOString()
    const updateData: Record<string, unknown> = {
      last_reminder_at: now,
      reminder_count: (entry.reminder_count || 0) + 1,
    }
    if (type === 'initial' && !entry.invited_at) {
      updateData.invited_at = now
      updateData.status = 'invited'
    }

    await supabase.from('catalogue_entries').update(updateData).eq('id', catalogue_entry_id)

    // Logger dans catalogue_reminders_log
    await supabase.from('catalogue_reminders_log').insert({
      catalogue_entry_id,
      reminder_type: type,
      sent_by: sent_by || null,
      note: `Email envoyé à ${entry.contact_email}`,
    })

    console.log(`✅ Email catalogue (${type}) envoyé à ${entry.contact_email} pour ${companyName}`)

    return new Response(
      JSON.stringify({ success: true, sent_to: entry.contact_email }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur send-catalogue-invitation:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
