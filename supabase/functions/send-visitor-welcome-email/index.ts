import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration SMTP
const SMTP_CONFIG = {
  hostname: Deno.env.get('SMTP_HOST') || 'mail.siportevent.com',
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  username: Deno.env.get('SMTP_USERNAME') || 'contact@siportevent.com',
  password: Deno.env.get('SMTP_PASSWORD') || 'S!P0RT@9083',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || SMTP_CONFIG.username

// Client Supabase pour accéder à la DB
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface EmailRequest {
  email: string
  name: string
  level: 'free' | 'vip'
  userId: string
  qrContent?: string
}

interface EmailTemplate {
  subject: string
  html_content: string
  text_content: string
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutId: number | undefined
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`${label} timeout after ${timeoutMs}ms`)), timeoutMs)
    })
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}

async function sendViaSmtp(to: string, subject: string, htmlContent: string): Promise<void> {
  try {
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_CONFIG.hostname,
        port: 465,
        tls: true,
        auth: {
          username: SMTP_CONFIG.username,
          password: SMTP_CONFIG.password,
        },
      },
    })

    await withTimeout(client.send({
      from: `SIB 2026 <${SMTP_CONFIG.username}>`,
      to,
      subject,
      content: 'auto',
      html: htmlContent,
    }), 5000, 'smtp:465 send')

    await client.close()
    return
  } catch (smtpError) {
    console.error('❌ Erreur SMTP port 465, tentative port 587...', smtpError instanceof Error ? smtpError.message : smtpError)
  }

  const client2 = new SMTPClient({
    connection: {
      hostname: SMTP_CONFIG.hostname,
      port: 587,
      tls: false,
      auth: {
        username: SMTP_CONFIG.username,
        password: SMTP_CONFIG.password,
      },
    },
  })

  await withTimeout(client2.send({
    from: `SIB 2026 <${SMTP_CONFIG.username}>`,
    to,
    subject,
    content: 'auto',
    html: htmlContent,
  }), 5000, 'smtp:587 send')
  await client2.close()
}

function normalizeSibBranding(content: string): string {
  return content
    .replace(/SIPORTS?\s*2026/gi, 'SIB 2026')
    .replace(/SIPORTS?/gi, 'SIB')
    .replace(/Salon International des Infrastructures Portuaires/gi, 'Salon International du Batiment')
}

async function sendViaResend(to: string, subject: string, htmlContent: string): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY non configurée')
  }

  const response = await withTimeout(fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `SIB 2026 <${RESEND_FROM_EMAIL}>`,
      to: [to],
      subject,
      html: htmlContent,
    }),
  }), 5000, 'resend send')

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Resend error ${response.status}: ${text}`)
  }
}

/**
 * Récupère le template depuis la base de données
 */
async function getEmailTemplate(level: 'free' | 'vip'): Promise<EmailTemplate | null> {
  try {
    const template_key = level === 'free' ? 'visitor_welcome_free' : 'visitor_welcome_vip'
    
    const { data, error } = await supabase
      .from('email_templates')
      .select('subject, html_content, text_content')
      .eq('template_key', template_key)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Erreur récupération template:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erreur getEmailTemplate:', error)
    return null
  }
}

/**
 * Remplace les variables dans le contenu
 */
function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  })
  
  return result
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, level, userId, qrContent }: EmailRequest = await req.json()

    // Validation
    if (!email || !name || !level || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, name, level, userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📧 Récupération du template pour niveau: ${level}`)

    // Récupérer le template depuis la DB
    const template = await getEmailTemplate(level)

    if (!template) {
      console.error('❌ Template non trouvé ou inactif')
      return new Response(
        JSON.stringify({ 
          error: 'Template not found', 
          message: `Aucun template actif trouvé pour le niveau: ${level}` 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Variables à remplacer
    const variables = {
      name,
      email,
      level: level === 'free' ? 'Gratuit' : 'VIP Premium',
      qr_content: qrContent || '',
      qr_image_url: qrContent ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrContent)}` : '',
    }

    console.log('📝 Remplacement des variables:', variables)

    // Remplacer les variables dans le contenu
    const subject = normalizeSibBranding(replaceVariables(template.subject, variables))
    const templateHtmlContent = normalizeSibBranding(replaceVariables(template.html_content, variables))
    const textContent = template.text_content
      ? normalizeSibBranding(replaceVariables(template.text_content, variables))
      : ''

    // Garantit que le QR est présent dans l'email, meme sans placeholder dans le template.
    const qrBlock = qrContent
      ? `<div style="margin-top:24px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;text-align:center;">
          <h3 style="margin:0 0 12px 0;font-size:16px;color:#111827;">Votre code QR d'acces</h3>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrContent)}" alt="Code QR SIB 2026" width="220" height="220" style="display:block;margin:0 auto 12px auto;" />
          <p style="margin:0;color:#6b7280;font-size:12px;word-break:break-all;">${qrContent}</p>
        </div>`
      : '<div style="margin-top:24px;color:#b91c1c;font-size:12px;">QR non disponible: merci de contacter le support SIB.</div>'

    const htmlContent = `${templateHtmlContent}${qrBlock}`

    // Provider primaire: SMTP, fallback: Resend
    let providerUsed = 'smtp'
    try {
      console.log(`📧 Envoi email via SMTP à ${email} (niveau: ${level})...`)
      await sendViaSmtp(email, subject, htmlContent)
      console.log(`✅ Email envoyé via SMTP à ${email}`)
    } catch (smtpFatalError) {
      console.error('❌ SMTP indisponible, bascule vers Resend:', smtpFatalError instanceof Error ? smtpFatalError.message : smtpFatalError)
      providerUsed = 'resend'
      await sendViaResend(email, subject, htmlContent)
      console.log(`✅ Email envoyé via Resend à ${email}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email envoyé avec succès à ${email} via ${providerUsed.toUpperCase()}`,
        to: email,
        subject: subject,
        level: level,
        provider: providerUsed,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
