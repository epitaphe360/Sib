import { createClient } from 'npm:@supabase/supabase-js@2';
import { SendGrid } from 'npm:@sendgrid/mail';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ValidationEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  status: 'approved' | 'rejected';
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
    const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'no-reply@sib.com';

    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY non configurée');
    }

    const { email, firstName, lastName, companyName, status }: ValidationEmailRequest = await req.json();

    const sgMail = new SendGrid(SENDGRID_API_KEY);

    const isApproved = status === 'approved';
    const subject = isApproved 
      ? `✅ SIB 2026 - Votre compte Exposant a été validé !`
      : `❌ SIB 2026 - Mise à jour de votre demande d'inscription`;
    
    const statusLabel = isApproved ? 'Approuvée' : 'Rejetée';
    const statusColor = isApproved ? '#10b981' : '#ef4444';
    const actionText = isApproved ? 'Connectez-vous à votre tableau de bord' : 'Contactez notre support';
    const actionLink = isApproved ? '/login' : '/contact';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SIB 2026 - Mise à Jour</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${escapeHtml(firstName)} ${escapeHtml(lastName)},</h2>

              <p>Nous avons une mise à jour concernant votre demande d'inscription en tant qu'exposant pour votre entreprise <strong>${escapeHtml(companyName)}</strong>.</p>

              <div class="info-box">
                <h3>Statut de votre demande : <span style="color: ${statusColor};">${escapeHtml(statusLabel)}</span></h3>
                
                ${isApproved ? `
                  <p>Félicitations ! Votre compte a été examiné et **approuvé** par notre équipe administrative. Vous êtes maintenant un exposant officiel de SIB 2026.</p>
                  <p>Vous pouvez désormais vous connecter pour accéder à toutes les fonctionnalités de votre espace exposant (création de mini-site, gestion des produits, prise de rendez-vous, etc.).</p>
                  <a href="${Deno.env.get('SITE_URL') || 'http://localhost:3000'}${actionLink}" class="button">${actionText}</a>
                ` : `
                  <p>Votre demande d'inscription a été **rejetée** par notre équipe administrative.</p>
                  <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus de détails sur les raisons du rejet, veuillez contacter notre équipe support.</p>
                  <a href="${Deno.env.get('SITE_URL') || 'http://localhost:3000'}${actionLink}" class="button">${actionText}</a>
                `}
              </div>
              
              <p>Merci de votre intérêt pour SIB 2026.</p>
              
              <div class="footer">
                <p><strong>SIB 2026</strong><br>
                Salon International du Bâtiment</p>
                <p style="font-size: 12px; color: #9ca3af;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Envoi de l'email via SendGrid
    const msg = {
      to: email,
      from: SENDER_EMAIL,
      subject: subject,
      html: htmlContent,
    };

    await sgMail.send(msg);

    console.log(`📧 Email de validation/rejet (${status}) envoyé via SendGrid à:`, email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email de validation/rejet (${status}) envoyé`,
        emailDetails: {
          to: email,
          subject: subject,
          preview: `Bonjour ${firstName}, votre demande d'inscription a été ${status}...`
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
    console.error('Erreur dans send-validation-email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Une erreur est survenue lors de l\'envoi de l\'email' 
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
