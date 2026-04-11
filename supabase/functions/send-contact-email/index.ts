import { createClient } from 'npm:@supabase/supabase-js@2';
import { SendGrid } from 'npm:@sendgrid/mail';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ContactEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'no-reply@siports.com';
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'contact@siportevent.com';

    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY non configurée');
    }

    const { firstName, lastName, email, company, subject, message }: ContactEmailRequest = await req.json();

    const sgMail = new SendGrid(SENDGRID_API_KEY);

    // Traduire le sujet en français
    const subjectLabels: { [key: string]: string } = {
      exhibitor: 'Devenir exposant',
      visitor: 'S\'inscrire comme visiteur',
      partnership: 'Partenariat',
      support: 'Support technique',
      other: 'Autre'
    };

    const subjectLabel = subjectLabels[subject] || subject;

    // Email de confirmation pour l'utilisateur
    const userEmailSubject = 'SIPORTS 2026 - Votre message a bien été reçu';
    const userEmailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
            .message-box { background: white; border: 1px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .check-icon { color: #10b981; font-size: 48px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Message bien reçu !</h1>
            </div>
            <div class="content">
              <div class="check-icon">✓</div>

              <h2>Bonjour ${escapeHtml(firstName)} ${escapeHtml(lastName)},</h2>

              <p>Nous avons bien reçu votre message concernant : <strong>${escapeHtml(subjectLabel)}</strong></p>

              <div class="info-box">
                <h3>📋 Récapitulatif de votre message</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Sujet :</strong> ${escapeHtml(subjectLabel)}</li>
                  ${company ? `<li><strong>Entreprise :</strong> ${escapeHtml(company)}</li>` : ''}
                  <li><strong>Email de contact :</strong> ${escapeHtml(email)}</li>
                </ul>
              </div>

              <div class="message-box">
                <h4>Votre message :</h4>
                <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
              </div>

              <div class="info-box">
                <h3>⏰ Délai de réponse</h3>
                <p>Notre équipe vous répondra dans les <strong>24 à 48 heures ouvrées</strong>.</p>
                <p>Si votre demande est urgente, vous pouvez nous contacter directement :</p>
                <ul>
                  <li>📧 Email : <a href="mailto:contact@siportevent.com">contact@siportevent.com</a></li>
                  <li>📞 Téléphone : +212 1 23 45 67 89</li>
                </ul>
              </div>

              <p style="margin-top: 30px;">En attendant, n'hésitez pas à découvrir notre plateforme SIPORTS 2026 !</p>

              <div class="footer">
                <p><strong>SIPORTS 2026</strong><br>
                Salon International des Ports et de la Logistique<br>
                5-7 Février 2026 • El Jadida, Maroc</p>
                <p style="font-size: 12px; color: #9ca3af;">Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Email de notification pour l'admin
    const adminEmailSubject = `[CONTACT SIPORTS] ${subjectLabel} - ${firstName} ${lastName}`;
    const adminEmailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            .message-box { background: white; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .action-button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Nouveau Message de Contact</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <h3>📋 Informations du contact</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Nom :</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</li>
                  <li><strong>Email :</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></li>
                  ${company ? `<li><strong>Entreprise :</strong> ${escapeHtml(company)}</li>` : ''}
                  <li><strong>Sujet :</strong> ${escapeHtml(subjectLabel)}</li>
                  <li><strong>Date :</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}</li>
                </ul>
              </div>

              <div class="message-box">
                <h3 style="margin-top: 0;">💬 Message :</h3>
                <p style="white-space: pre-wrap; background: #f9fafb; padding: 15px; border-radius: 5px;">${escapeHtml(message)}</p>
              </div>

              <div style="text-align: center;">
                <a href="mailto:${escapeHtml(email)}?subject=Re: ${encodeURIComponent(subjectLabel)}" class="action-button">
                  Répondre par email
                </a>
              </div>

              <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; margin-top: 20px; border-radius: 5px;">
                <p style="margin: 0;"><strong>⚠️ Action requise :</strong> Veuillez répondre à ce message dans les 24-48h ouvrées.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Envoyer email de confirmation à l'utilisateur
    await sgMail.send({
      to: email,
      from: SENDER_EMAIL,
      subject: userEmailSubject,
      html: userEmailContent,
    });

    console.log('📧 Email de confirmation envoyé à:', email);

    // Envoyer email de notification à l'admin
    await sgMail.send({
      to: ADMIN_EMAIL,
      from: SENDER_EMAIL,
      subject: adminEmailSubject,
      html: adminEmailContent,
      replyTo: email, // Permet à l'admin de répondre directement
    });

    console.log('📧 Email de notification envoyé à l\'admin:', ADMIN_EMAIL);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emails envoyés avec succès',
        emailDetails: {
          userEmail: email,
          adminEmail: ADMIN_EMAIL,
          subject: subjectLabel
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Erreur dans send-contact-email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Une erreur est survenue lors de l\'envoi des emails'
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
