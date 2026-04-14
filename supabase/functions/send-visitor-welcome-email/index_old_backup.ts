import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration SMTP
const SMTP_CONFIG = {
  hostname: Deno.env.get('SMTP_HOST') || 'mail.sib2026.ma',
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  username: Deno.env.get('SMTP_USERNAME') || 'contact@sib2026.ma',
  password: Deno.env.get('SMTP_PASSWORD') || 'S!P0RT@9083',
}

// Client Supabase pour accéder à la DB
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface EmailRequest {
  email: string
  name: string
  level: 'free' | 'vip'
  userId: string
}

interface EmailTemplate {
  subject: string
  html_content: string
  text_content: string
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
    const { email, name, level, userId }: EmailRequest = await req.json()

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
      level: level === 'free' ? 'Gratuit' : 'VIP Premium'
    }

    console.log('📝 Remplacement des variables:', variables)

    // Remplacer les variables dans le contenu
    const subject = replaceVariables(template.subject, variables)
    const htmlContent = replaceVariables(template.html_content, variables)
    const textContent = template.text_content ? replaceVariables(template.text_content, variables) : ''

    // Envoyer via SMTP
    console.log(`📧 Envoi email via SMTP à ${email} (niveau: ${level})...`)
    
    const client = new SmtpClient()
    
    try {
      // Connexion au serveur SMTP
      await client.connectTLS({
        hostname: SMTP_CONFIG.hostname,
        port: SMTP_CONFIG.port,
        username: SMTP_CONFIG.username,
        password: SMTP_CONFIG.password,
      })

      console.log('✅ Connexion SMTP établie')

      // Envoi de l'email
      await client.send({
        from: 'SIB 2026 <contact@sib2026.ma>',
        to: email,
        subject: subject,
        content: htmlContent,
        html: htmlContent,
      })

      console.log(`✅ Email envoyé avec succès à ${email} (${level})`)
      
      // Fermeture de la connexion
      await client.close()
    } catch (smtpError) {
      await client.close()
      console.error('❌ Erreur SMTP:', smtpError)
      throw new Error(`Erreur envoi SMTP: ${smtpError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email envoyé avec succès à ${email} via SMTP`,
        to: email,
        subject: subject,
        level: level
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
