/**
 * Service pour envoyer l'email d'instructions de paiement après inscription partenaire
 */

import { supabase } from '../lib/supabase';

export interface PartnerSignupEmailData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

/**
 * Crée une demande de paiement et envoie l'email d'instructions bancaires
 * Appelé automatiquement après inscription d'un partenaire
 */
export async function sendPartnerPaymentInstructions(
  data: PartnerSignupEmailData
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  try {
    const { userId, email, firstName, lastName, companyName } = data;

    // Créer une demande de paiement par défaut (tier museum)
    const defaultTier = 'museum';
    const amount = 20000; // $20,000 pour tier museum

    // Créer la payment_request
    const { data: paymentRequest, error: paymentError } = await supabase
      .from('payment_requests')
      .insert({
        user_id: userId,
        requested_level: defaultTier,
        amount: amount,
        currency: 'USD',
        payment_method: 'bank_transfer',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Erreur création payment_request:', paymentError);
      return { success: false, error: paymentError.message };
    }

    if (!paymentRequest) {
      return { success: false, error: 'Payment request not created' };
    }

    // Générer la référence de paiement
    const paymentReference = `sib-PARTNER-${defaultTier.toUpperCase()}-${userId.substring(0, 8)}-${paymentRequest.id.substring(0, 8)}`;

    // Appeler la fonction Edge pour envoyer l'email
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-partner-payment-instructions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            email: email,
            name: `${firstName} ${lastName}`,
            companyName: companyName,
            partnerTier: defaultTier,
            amount: amount,
            paymentReference: paymentReference,
            userId: userId,
            requestId: paymentRequest.id
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('⚠️ Erreur envoi email paiement:', errorText);
        // Ne pas retourner d'erreur car la payment_request est créée
        return {
          success: true,
          requestId: paymentRequest.id,
          error: `Email not sent: ${errorText}`
        };
      }

      const result = await response.json();
      console.log('✅ Email de paiement envoyé avec succès:', result);

      return { success: true, requestId: paymentRequest.id };
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // Ne pas bloquer si l'email échoue - la payment_request est créée
      return {
        success: true,
        requestId: paymentRequest.id,
        error: emailError instanceof Error ? emailError.message : 'Email send failed'
      };
    }
  } catch (error) {
    console.error('Erreur sendPartnerPaymentInstructions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
