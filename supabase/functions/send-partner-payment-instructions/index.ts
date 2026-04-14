import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PartnerPaymentInstructionRequest {
  email: string;
  name: string;
  companyName: string;
  partnerTier: 'museum' | 'silver' | 'gold' | 'platinium';
  amount: number;
  paymentReference: string;
  userId: string;
  requestId: string;
}

// Configuration des montants par tier
const TIER_AMOUNTS: Record<string, number> = {
  museum: 20000,
  silver: 48000,
  gold: 68000,
  platinium: 98000
};

const TIER_LABELS: Record<string, string> = {
  museum: 'Pass Musée 🏛️',
  silver: 'Pass Silver 🥈',
  gold: 'Pass Gold 🥇',
  platinium: 'Pass Platinium 💎'
};

/**
 * Template HTML pour l'email d'instructions de paiement partenaire
 */
function getPartnerPaymentInstructionHTML(data: PartnerPaymentInstructionRequest): string {
  const {
    name,
    companyName,
    partnerTier,
    amount,
    paymentReference
  } = data;

  const tierLabel = TIER_LABELS[partnerTier] || partnerTier;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 3px solid #2563EB;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #2563EB;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #6B7280;
      font-size: 14px;
    }
    .content {
      padding: 30px 0;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 20px;
    }
    .tier-box {
      background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
      color: white;
      padding: 25px;
      border-radius: 10px;
      margin: 25px 0;
    }
    .tier-box h3 {
      margin-top: 0;
      font-size: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.3);
      padding-bottom: 10px;
    }
    .tier-amount {
      font-size: 36px;
      font-weight: bold;
      margin: 15px 0;
      text-align: center;
    }
    .payment-box {
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .payment-box h3 {
      color: #92400E;
      margin-top: 0;
      font-size: 18px;
    }
    .bank-details {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .bank-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    .bank-row:last-child {
      border-bottom: none;
    }
    .bank-label {
      font-weight: 600;
      color: #374151;
    }
    .bank-value {
      color: #1F2937;
      font-family: 'Courier New', monospace;
      font-weight: 500;
    }
    .reference-highlight {
      background-color: #DBEAFE;
      color: #1E40AF;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
      font-size: 16px;
      font-weight: bold;
      border: 2px dashed #3B82F6;
    }
    .warning-box {
      background-color: #FEE2E2;
      border-left: 4px solid #DC2626;
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .warning-box p {
      color: #7F1D1D;
      margin: 8px 0;
      font-size: 14px;
    }
    .steps {
      margin: 25px 0;
    }
    .step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .step-number {
      background-color: #8B5CF6;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
      margin-right: 15px;
    }
    .step-content h4 {
      margin: 0 0 8px 0;
      color: #1F2937;
      font-size: 16px;
    }
    .step-content p {
      margin: 0;
      color: #6B7280;
      font-size: 14px;
    }
    .tier-amounts {
      background-color: #F3F4F6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .tier-amounts h4 {
      margin-top: 0;
      color: #1F2937;
    }
    .tier-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    .tier-row:last-child {
      border-bottom: none;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #E5E7EB;
      color: #6B7280;
      font-size: 13px;
    }
    .contact-info {
      background-color: #F3F4F6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .contact-info h4 {
      margin-top: 0;
      color: #1F2937;
    }
    .contact-item {
      margin: 10px 0;
      color: #374151;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px;
      }
      .bank-row {
        flex-direction: column;
        gap: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">⚓ SIB 2026</div>
      <p class="subtitle">Salon International des Ports & Services Maritimes</p>
      <p class="subtitle">5-7 Février 2026 • Casablanca, Maroc</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Bonjour ${name},</p>

      <p style="font-size: 16px; color: #374151;">
        Félicitations ! 🎉 Votre inscription en tant que <strong>Partenaire SIB 2026</strong> a été créée avec succès pour <strong>${companyName}</strong>.
      </p>

      <!-- Tier Selection -->
      <div class="tier-box">
        <h3>🤝 Votre Partenariat</h3>
        <div style="text-align: center; margin: 15px 0;">
          <div style="font-size: 20px; opacity: 0.9;">${tierLabel}</div>
          <div class="tier-amount">$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <!-- Tier Amounts Reference -->
      <div class="tier-amounts">
        <h4>📊 Tableau des Montants par Niveau</h4>
        <div class="tier-row">
          <span>🏛️ Pass Musée</span>
          <span style="font-weight: 600;">$${TIER_AMOUNTS.museum.toLocaleString('en-US')}</span>
        </div>
        <div class="tier-row">
          <span>🥈 Pass Silver</span>
          <span style="font-weight: 600;">$${TIER_AMOUNTS.silver.toLocaleString('en-US')}</span>
        </div>
        <div class="tier-row">
          <span>🥇 Pass Gold</span>
          <span style="font-weight: 600;">$${TIER_AMOUNTS.gold.toLocaleString('en-US')}</span>
        </div>
        <div class="tier-row">
          <span>💎 Pass Platinium</span>
          <span style="font-weight: 600;">$${TIER_AMOUNTS.platinium.toLocaleString('en-US')}</span>
        </div>
      </div>

      <!-- Payment Instructions -->
      <div class="payment-box">
        <h3>💰 Instructions de Paiement par Virement Bancaire</h3>
        <p style="color: #78350F; margin-bottom: 15px;">
          Pour activer votre compte partenaire, veuillez effectuer un virement bancaire avec les coordonnées suivantes :
        </p>

        <div class="bank-details">
          <div class="bank-row">
            <span class="bank-label">Bénéficiaire :</span>
            <span class="bank-value">LINECO EVENTS</span>
          </div>
          <div class="bank-row">
            <span class="bank-label">Banque :</span>
            <span class="bank-value">Attijariwafa bank</span>
          </div>
          <div class="bank-row">
            <span class="bank-label">Domiciliation :</span>
            <span class="bank-value">CASA MY IDRISS 1ER</span>
          </div>
          <div class="bank-row">
            <span class="bank-label">IBAN :</span>
            <span class="bank-value">MA64 007 780 000413200000498 25</span>
          </div>
          <div class="bank-row">
            <span class="bank-label">SWIFT/BIC :</span>
            <span class="bank-value">BCMAMAMC</span>
          </div>
          <div class="bank-row">
            <span class="bank-label">Montant :</span>
            <span class="bank-value" style="color: #DC2626; font-size: 18px; font-weight: bold;">
              $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </span>
          </div>
        </div>

        <div class="reference-highlight">
          <div style="font-size: 12px; margin-bottom: 5px; opacity: 0.8;">Référence obligatoire :</div>
          <div style="font-size: 20px; letter-spacing: 1px;">${paymentReference}</div>
        </div>

        <div class="warning-box">
          <p style="margin-top: 0;"><strong>⚠️ IMPORTANT :</strong></p>
          <p>• La référence <strong>${paymentReference}</strong> est <strong>OBLIGATOIRE</strong> dans le libellé du virement</p>
          <p>• Sans cette référence, votre paiement ne pourra pas être traité automatiquement</p>
          <p>• Conservez votre preuve de virement pour la soumettre sur votre espace personnel</p>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="steps">
        <h3 style="color: #1F2937; font-size: 18px;">📋 Prochaines Étapes</h3>

        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>Effectuer le virement bancaire</h4>
            <p>Utilisez les coordonnées ci-dessus et n'oubliez pas d'inclure la référence ${paymentReference}</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>Télécharger votre justificatif de paiement</h4>
            <p>Connectez-vous à votre espace personnel et soumettez votre reçu bancaire dans la section paiement</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>Validation par notre équipe</h4>
            <p>Nous validerons votre paiement sous 2-5 jours ouvrables et activerons votre compte partenaire</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>Création de votre profil partenaire</h4>
            <p>Une fois activé, vous pourrez créer votre profil partenaire personnalisé avec logo, description, et produits/services</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">5</div>
          <div class="step-content">
            <h4>Accès aux fonctionnalités partenaire</h4>
            <p>Profitez de tous les avantages : rendez-vous B2B, networking IA, analytics, badge partenaire, et plus encore !</p>
          </div>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="contact-info">
        <h4>💬 Besoin d'aide ?</h4>
        <div class="contact-item">
          <strong>Email :</strong> <a href="mailto:partenaires@sib.com">partenaires@sib.com</a>
        </div>
        <div class="contact-item">
          <strong>Téléphone :</strong> +212 5 22 XX XX XX
        </div>
        <div class="contact-item">
          <strong>WhatsApp :</strong> +212 6 XX XX XX XX
        </div>
        <div class="contact-item">
          <strong>Horaires :</strong> Lun-Ven 9h-18h (GMT+1)
        </div>
      </div>

      <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
        Nous sommes impatients de vous accueillir en tant que partenaire SIB 2026 ! 🤝
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin-bottom: 10px;">
        <strong>SIB 2026</strong> - Salon International des Ports & Services Maritimes
      </p>
      <p style="margin: 5px 0;">
        5-7 Février 2026 • Mohammed VI Exhibition Center • Casablanca, Maroc
      </p>
      <p style="margin: 5px 0; font-size: 12px;">
        © 2024 SIB. Tous droits réservés.
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #9CA3AF;">
        Vous recevez cet email car vous vous êtes inscrit en tant que partenaire pour SIB 2026.
        <br>Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter immédiatement.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData: PartnerPaymentInstructionRequest = await req.json();

    const {
      email,
      name,
      companyName,
      partnerTier,
      amount,
      paymentReference,
      userId,
      requestId
    } = requestData;

    // Validation
    if (!email || !name || !companyName || !partnerTier || !amount || !paymentReference) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes pour l\'envoi de l\'email' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Générer le contenu HTML
    const htmlContent = getPartnerPaymentInstructionHTML(requestData);

    // Envoyer l'email via Resend
    if (!RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured');
      // En développement, continuer sans erreur
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email skipped (RESEND_API_KEY not configured)',
          dev_mode: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const tierLabel = TIER_LABELS[partnerTier] || partnerTier;
    const emailPayload = {
      from: 'SIB 2026 <noreply@sib.com>',
      to: [email],
      subject: `🤝 Instructions de Paiement - Partenariat ${tierLabel} SIB 2026`,
      html: htmlContent,
    };

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error('Resend API error:', errorData);
      throw new Error(`Resend API error: ${resendResponse.status}`);
    }

    const emailData = await resendResponse.json();

    console.log(`✅ Email de paiement partenaire envoyé à ${email} (${companyName}) - ${tierLabel} - Ref: ${paymentReference}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email de paiement envoyé avec succès',
        email_id: emailData.id,
        paymentReference
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-partner-payment-instructions:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'envoi de l\'email'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
