/**
 * Generic Email Sending Function
 *
 * Sends emails using SMTP (mail.sibevent.com)
 * Supports HTML and plain text emails
 */

import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Configuration SMTP
const SMTP_CONFIG = {
  hostname: Deno.env.get('SMTP_HOST') || 'mail.sibevent.com',
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  username: Deno.env.get('SMTP_USERNAME') || 'contact@sibevent.com',
  password: Deno.env.get('SMTP_PASSWORD') || 'S!P0RT@9083',
};

const DEFAULT_SENDER_EMAIL = 'contact@sibevent.com';

interface EmailRequest {
  to: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      to,
      from,
      replyTo,
      subject,
      html,
      text,
      cc,
      bcc,
    }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html');
    }

    console.log('📧 Envoi email via SMTP à:', Array.isArray(to) ? to.join(', ') : to);
    console.log('📋 Sujet:', subject);

    // Connexion au serveur SMTP
    const client = new SmtpClient()
    
    try {
      await client.connectTLS({
        hostname: SMTP_CONFIG.hostname,
        port: SMTP_CONFIG.port,
        username: SMTP_CONFIG.username,
        password: SMTP_CONFIG.password,
      })

      console.log('✅ Connexion SMTP établie')

      // Préparation des destinataires
      const recipients = Array.isArray(to) ? to : [to]
      
      // Envoi de l'email à chaque destinataire
      for (const recipient of recipients) {
        await client.send({
          from: from || DEFAULT_SENDER_EMAIL,
          to: recipient,
          subject: subject,
          content: html,
          html: html,
        })
        console.log(`✅ Email envoyé à ${recipient}`)
      }

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
        message: 'Email envoyé avec succès via SMTP',
        details: {
          to: Array.isArray(to) ? to : [to],
          subject,
          from: from || DEFAULT_SENDER_EMAIL,
          sentAt: new Date().toISOString(),
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ Erreur dans send-template-email:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred while sending email',
        details: error.toString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
