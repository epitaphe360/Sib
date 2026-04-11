import { createClient } from 'npm:@supabase/supabase-js@2';
import { SendGrid } from 'npm:@sendgrid/mail';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RegistrationEmailRequest {
  userType: 'exhibitor' | 'partner' | 'visitor';
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
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

    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY non configurée');
    }

    const { userType, email, firstName, lastName, companyName }: RegistrationEmailRequest = await req.json();

    const sgMail = new SendGrid(SENDGRID_API_KEY);
    
    // Déterminer le type de compte en français

    // Déterminer le type de compte en français
    const accountTypeLabel = {
      exhibitor: 'Exposant',
      partner: 'Partenaire',
      visitor: 'Visiteur'
    }[userType];

    // Préparer le sujet et le contenu de l'email
    const subject = `SIPORTS 2026 - Demande d'inscription ${accountTypeLabel} reçue`;
    
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
            .info-box { background: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue sur SIPORTS 2026</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${escapeHtml(firstName)} ${escapeHtml(lastName)},</h2>

              <p>Votre demande d'inscription en tant que <strong>${escapeHtml(accountTypeLabel)}</strong> a bien été reçue !</p>

              <div class="info-box">
                <h3>📋 Informations de votre demande</h3>
                <ul>
                  <li><strong>Type de compte :</strong> ${escapeHtml(accountTypeLabel)}</li>
                  <li><strong>Email :</strong> ${escapeHtml(email)}</li>
                  ${companyName ? `<li><strong>Entreprise :</strong> ${escapeHtml(companyName)}</li>` : ''}
                </ul>
              </div>
              
              <h3>⏳ Prochaines étapes</h3>
              <p>Votre demande est actuellement <strong>en attente de validation</strong> par notre équipe administrative.</p>
              
              <p>Vous recevrez un email de confirmation dès que votre compte sera validé par un administrateur. Ce processus prend généralement entre 24 et 48 heures.</p>
              
              <div class="info-box">
                <h3>✨ Une fois votre compte validé, vous pourrez :</h3>
                <ul>
                  ${userType === 'exhibitor' ? `
                    <li>Créer et personnaliser votre mini-site exposant</li>
                    <li>Publier vos produits et services</li>
                    <li>Gérer vos rendez-vous avec les visiteurs</li>
                    <li>Accéder aux statistiques de votre stand</li>
                  ` : ''}
                  ${userType === 'partner' ? `
                    <li>Accéder à votre espace partenaire</li>
                    <li>Gérer vos événements et contenus</li>
                    <li>Suivre vos leads et interactions</li>
                    <li>Accéder aux analytics détaillés</li>
                  ` : ''}
                  ${userType === 'visitor' ? `
                    <li>Découvrir tous les exposants</li>
                    <li>Prendre des rendez-vous</li>
                    <li>Participer aux événements</li>
                    <li>Réseauter avec les participants</li>
                  ` : ''}
                </ul>
              </div>
              
              <p>Si vous avez des questions, n'hésitez pas à contacter notre équipe support.</p>
              
              <div class="footer">
                <p><strong>SIPORTS 2026</strong><br>
                Salon International des Ports et de la Logistique<br>
                El Jadida, Maroc</p>
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

    console.log('📧 Email de confirmation envoyé via SendGrid à:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de confirmation envoyé',
        emailDetails: {
          to: email,
          subject: subject,
          preview: `Bonjour ${firstName}, votre demande d'inscription en tant que ${accountTypeLabel} a bien été reçue...`
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
    console.error('Erreur dans send-registration-email:', error);
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