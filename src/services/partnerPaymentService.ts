/**
 * Service de paiement pour les upgrades de niveau partenaire
 * Gère PayPal, CMI et virement pour les paiements partenaires
 *
 * ✅ FIX P0-3: Import des montants depuis Single Source of Truth
 */

import { PartnerTier, getPartnerTierConfig } from '../config/partnerTiers';
import { PARTNER_BILLING } from '../config/partnerBilling';

// ✅ Constantes de prix (base de calcul) - Import depuis SSOT
const TIER_PRICES = {
  museum: PARTNER_BILLING.museum.amount * 100,    // Convert USD to cents
  silver: PARTNER_BILLING.silver.amount * 100,    // Convert USD to cents
  gold: PARTNER_BILLING.gold.amount * 100,        // Convert USD to cents
  platinum: PARTNER_BILLING.platinum.amount * 100 // Convert USD to cents
};

// Conversion EUR/MAD pour CMI
const EUR_TO_MAD_RATE = 11;
const USD_TO_EUR_RATE = 0.92;

/**
 * Convertit USD en EUR
 */
export function convertUSDtoEUR(amountUSD: number): number {
  return Math.round(amountUSD * USD_TO_EUR_RATE);
}

/**
 * Convertit USD en MAD
 */
export function convertUSDtoMAD(amountUSD: number): number {
  const amountEUR = convertUSDtoEUR(amountUSD);
  return Math.round(amountEUR * EUR_TO_MAD_RATE);
}

/**
 * Stripe désactivé: conserver la signature pour compatibilité
 */
export async function createStripePartnerCheckout(
  userId: string,
  userEmail: string,
  targetTier: PartnerTier,
  currentTier?: PartnerTier
): Promise<{ sessionId: string }> {
  void userId;
  void userEmail;
  void targetTier;
  void currentTier;
  throw new Error('Stripe est désactivé. Utilisez PayPal, CMI ou virement bancaire.');
}

/**
 * Stripe désactivé
 */
export async function redirectToStripeCheckout(sessionId: string): Promise<void> {
  void sessionId;
  throw new Error('Stripe est désactivé.');
}

/**
 * PAYPAL: Crée un ordre PayPal pour upgrade partenaire
 */
export async function createPayPalPartnerOrder(
  userId: string,
  targetTier: PartnerTier,
  currentTier?: PartnerTier
): Promise<{ orderId: string }> {
  try {
    const tierConfig = getPartnerTierConfig(targetTier);
    const amountCents = TIER_PRICES[targetTier];
    const amountUSD = amountCents / 100;

    // Calculer le montant final (upgrade ou initial)
    let finalAmount = amountUSD;
    if (currentTier && currentTier !== targetTier) {
      const currentAmount = TIER_PRICES[currentTier] / 100;
      finalAmount = Math.max(0, amountUSD - currentAmount);
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-paypal-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        userId,
        amount: finalAmount.toFixed(2),
        currency: 'USD',
        description: `SIB 2026 - ${tierConfig.displayName}`,
        customId: `${userId}:${targetTier}:${currentTier || 'none'}`,
        metadata: {
          partnerTier: targetTier,
          currentTier: currentTier || 'none'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Erreur création ordre PayPal');
    }

    const data = await response.json();
    return { orderId: data.orderId };
  } catch (error) {
    console.error('Erreur createPayPalPartnerOrder:', error);
    throw error;
  }
}

/**
 * PAYPAL: Capture un paiement PayPal
 */
export async function capturePayPalPartnerOrder(
  orderId: string,
  userId: string,
  targetTier: PartnerTier
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-paypal-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        orderId,
        userId,
        partnerTier: targetTier
      })
    });

    if (!response.ok) {
      throw new Error('Erreur capture PayPal');
    }

    const data = await response.json();
    return { success: data.success };
  } catch (error) {
    console.error('Erreur capturePayPalPartnerOrder:', error);
    throw error;
  }
}

/**
 * CMI: Crée une demande de paiement CMI
 */
export async function createCMIPartnerPayment(
  userId: string,
  userEmail: string,
  targetTier: PartnerTier,
  currentTier?: PartnerTier
): Promise<{ paymentUrl: string; requestId: string }> {
  try {
    const tierConfig = getPartnerTierConfig(targetTier);
    const amountCents = TIER_PRICES[targetTier];
    const amountUSD = amountCents / 100;

    // Calculer le montant final
    let finalAmount = amountUSD;
    if (currentTier && currentTier !== targetTier) {
      const currentAmount = TIER_PRICES[currentTier] / 100;
      finalAmount = Math.max(0, amountUSD - currentAmount);
    }

    // Convertir en MAD
    const amountMAD = convertUSDtoMAD(finalAmount);

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-cmi-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        userId,
        userEmail,
        amount: amountMAD,
        currency: 'MAD',
        description: `SIB 2026 - ${tierConfig.displayName}`,
        metadata: {
          partnerTier: targetTier,
          currentTier: currentTier || 'none',
          amountUSD: finalAmount
        },
        callbackUrl: `${window.location.origin}/partner/payment-success`,
        failUrl: `${window.location.origin}/partner/upgrade?error=payment_failed`
      })
    });

    if (!response.ok) {
      throw new Error('Erreur création paiement CMI');
    }

    const data = await response.json();
    return {
      paymentUrl: data.paymentUrl,
      requestId: data.requestId
    };
  } catch (error) {
    console.error('Erreur createCMIPartnerPayment:', error);
    throw error;
  }
}

/**
 * Met à jour le niveau partenaire après paiement réussi
 */
export async function upgradePartnerTier(
  userId: string,
  targetTier: PartnerTier,
  paymentRequestId: string
): Promise<{ success: boolean }> {
  try {
    const { supabase } = await import('../lib/supabase');

    // Mettre à jour le niveau partenaire
    const { error: updateError } = await supabase
      .from('users')
      .update({
        partner_tier: targetTier,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Erreur mise à jour partner_tier:', updateError);
      throw updateError;
    }

    // Créer une notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'system',
      message: `Votre niveau partenaire a été mis à jour vers ${getPartnerTierConfig(targetTier).displayName}!`,
      read: false,
      created_at: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur upgradePartnerTier:', error);
    throw error;
  }
}

/**
 * Vérifie le statut d'un paiement
 */
export async function checkPartnerPaymentStatus(sessionId: string): Promise<{
  status: 'pending' | 'completed' | 'failed';
  partnerTier?: PartnerTier;
}> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-payment-status?session_id=${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erreur vérification statut paiement');
    }

    const data = await response.json();
    return {
      status: data.status,
      partnerTier: data.metadata?.partnerTier
    };
  } catch (error) {
    console.error('Erreur checkPartnerPaymentStatus:', error);
    throw error;
  }
}

/**
 * Formate un prix pour l'affichage
 */
export function formatPartnerPrice(tier: PartnerTier, currency: 'USD' | 'EUR' | 'MAD' = 'USD'): string {
  const amountCents = TIER_PRICES[tier];
  const amountUSD = amountCents / 100;

  switch (currency) {
    case 'EUR':
      return `€${convertUSDtoEUR(amountUSD).toLocaleString('fr-FR')}`;
    case 'MAD':
      return `${convertUSDtoMAD(amountUSD).toLocaleString('fr-MA')} MAD`;
    default:
      return `$${amountUSD.toLocaleString('en-US')}`;
  }
}

/**
 * BANK TRANSFER: Crée une demande de paiement par virement bancaire
 */
export async function createPartnerBankTransferRequest(
  userId: string,
  targetTier: PartnerTier,
  currentTier?: PartnerTier
): Promise<{ requestId: string; success: boolean }> {
  try {
    const { supabase } = await import('../lib/supabase');

    // Calculer le montant (full ou upgrade)
    const amountCents = TIER_PRICES[targetTier];
    let finalAmountCents = amountCents;

    if (currentTier && currentTier !== targetTier) {
      const currentAmountCents = TIER_PRICES[currentTier];
      finalAmountCents = Math.max(0, amountCents - currentAmountCents);
    }

    const finalAmountUSD = finalAmountCents / 100;

    // ✅ FIX P0-5: Validation du montant calculé
    const expectedFullAmount = PARTNER_BILLING[targetTier].amount;
    const expectedUpgradeAmount = currentTier
      ? PARTNER_BILLING[targetTier].amount - PARTNER_BILLING[currentTier].amount
      : expectedFullAmount;

    if (Math.abs(finalAmountUSD - expectedUpgradeAmount) > 0.01) {
      throw new Error(
        `Erreur calcul montant: ${finalAmountUSD} USD calculé, ${expectedUpgradeAmount} USD attendu. ` +
        `Tier cible: ${targetTier}, Tier actuel: ${currentTier || 'none'}`
      );
    }

    // Créer la demande de paiement
    const { data, error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: userId,
        requested_level: targetTier,
        amount: finalAmountUSD,
        currency: 'USD',
        payment_method: 'bank_transfer',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création demande virement:', error);
      throw error;
    }

    return {
      requestId: data.id,
      success: true
    };
  } catch (error) {
    console.error('Erreur createPartnerBankTransferRequest:', error);
    throw error;
  }
}

/**
 * BANK TRANSFER: Récupère les demandes de virement pour un utilisateur
 */
export async function getPartnerBankTransferRequests(userId: string): Promise<any[]> {
  try {
    const { supabase } = await import('../lib/supabase');

    const { data, error } = await supabase
      .from('payment_requests')
      .select('id, user_id, requested_level, amount, currency, payment_method, transfer_reference, status, transfer_proof_url, created_at, validated_by, validated_at, validation_notes, updated_at')
      .eq('user_id', userId)
      .eq('payment_method', 'bank_transfer')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erreur getPartnerBankTransferRequests:', error);
    return [];
  }
}

/**
 * BANK TRANSFER: Valide une demande de virement (admin uniquement)
 */
export async function approvePartnerBankTransfer(
  requestId: string,
  adminId: string,
  notes?: string
): Promise<{ success: boolean }> {
  try {
    const { supabase } = await import('../lib/supabase');

    // Récupérer la demande
    const { data: request, error: fetchError } = await supabase
      .from('payment_requests')
      .select('id, user_id, requested_level, amount, currency, payment_method, transfer_reference, status, transfer_proof_url, created_at, validated_by, validated_at, validation_notes, updated_at')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    // ✅ FIX P0-5: Validation du montant avant approbation
    const expectedAmount = PARTNER_BILLING[request.requested_level as PartnerTier].amount;
    const requestAmount = Number(request.amount);

    // Tolérance de 0.01 USD pour les arrondis
    const tolerance = 0.01;
    const amountDifference = Math.abs(requestAmount - expectedAmount);

    if (amountDifference > tolerance) {
      throw new Error(
        `Montant invalide: ${requestAmount} USD reçu, ${expectedAmount} USD attendu pour le tier ${request.requested_level}. ` +
        `Différence: ${amountDifference.toFixed(2)} USD. ⚠️ VALIDATION REFUSÉE - Possible tentative de fraude.`
      );
    }

    // Mettre à jour le statut de la demande
    const { error: updateRequestError } = await supabase
      .from('payment_requests')
      .update({
        status: 'approved',
        validated_by: adminId,
        validated_at: new Date().toISOString(),
        validation_notes: notes || null
      })
      .eq('id', requestId);

    if (updateRequestError) throw updateRequestError;

    // Mettre à jour le tier du partenaire
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        partner_tier: request.requested_level,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.user_id);

    if (updateUserError) throw updateUserError;

    // Créer une notification
    await supabase.from('notifications').insert({
      user_id: request.user_id,
      type: 'success',
      title: 'Paiement approuvé',
      message: `Votre paiement par virement pour le niveau ${request.requested_level} a été approuvé. Votre compte est maintenant activé !`,
      read: false,
      created_at: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur approvePartnerBankTransfer:', error);
    throw error;
  }
}

/**
 * BANK TRANSFER: Rejette une demande de virement (admin uniquement)
 */
export async function rejectPartnerBankTransfer(
  requestId: string,
  adminId: string,
  reason: string
): Promise<{ success: boolean }> {
  try {
    const { supabase } = await import('../lib/supabase');

    // Récupérer la demande
    const { data: request, error: fetchError } = await supabase
      .from('payment_requests')
      .select('id, user_id, requested_level, amount, currency, payment_method, transfer_reference, status, transfer_proof_url, created_at, validated_by, validated_at, validation_notes, updated_at')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    // Mettre à jour le statut
    const { error: updateError } = await supabase
      .from('payment_requests')
      .update({
        status: 'rejected',
        validated_by: adminId,
        validated_at: new Date().toISOString(),
        validation_notes: reason
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Créer une notification
    await supabase.from('notifications').insert({
      user_id: request.user_id,
      type: 'error',
      title: 'Paiement refusé',
      message: `Votre demande de paiement pour le niveau ${request.requested_level} a été refusée. Raison: ${reason}`,
      read: false,
      created_at: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur rejectPartnerBankTransfer:', error);
    throw error;
  }
}
