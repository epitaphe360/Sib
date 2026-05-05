import { supabase } from '../lib/supabase';

/**
 * Payment Service for sib 2026
 * Handles PayPal, CMI Morocco and bank transfer payment integrations
 */

// PayPal client ID (should be in env variables)
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

// Payment amounts
export const PAYMENT_AMOUNTS = {
  VIP_PASS: 300, // euros
  VIP_PASS_CENTS: 30000,
};

/**
 * Stripe is disabled for this project
 */
export async function createStripeCheckoutSession(userId: string, userEmail: string) {
  void userId;
  void userEmail;
  throw new Error('Stripe est désactivé. Utilisez PayPal, CMI ou virement bancaire.');
}

/**
 * Stripe is disabled for this project
 */
export async function redirectToStripeCheckout(sessionId: string) {
  void sessionId;
  throw new Error('Stripe est désactivé.');
}

/**
 * Create PayPal order for VIP pass
 */
export async function createPayPalOrder(userId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('create-paypal-order', {
      body: {
        userId,
        amount: PAYMENT_AMOUNTS.VIP_PASS.toString(),
        currency: 'EUR',
        description: 'Pass Premium VIP sib 2026',
      },
    });

    if (error) {throw error;}

    return data.orderId;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
}

/**
 * Capture PayPal order after approval
 */
export async function capturePayPalOrder(orderId: string, userId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
      body: {
        orderId,
        userId,
      },
    });

    if (error) {throw error;}

    return data;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
}

/**
 * Create CMI payment request (Morocco local cards)
 */
export async function createCMIPaymentRequest(userId: string, userEmail: string) {
  try {
    const { data, error } = await supabase.functions.invoke('create-cmi-payment', {
      body: {
        userId,
        userEmail,
        amount: PAYMENT_AMOUNTS.VIP_PASS,
        currency: 'MAD', // Moroccan Dirham
        description: 'Pass Premium VIP sib 2026',
        returnUrl: `${window.location.origin}/visitor/payment-success`,
        cancelUrl: `${window.location.origin}/visitor/subscription`,
      },
    });

    if (error) {throw error;}

    return data;
  } catch (error) {
    console.error('Error creating CMI payment:', error);
    throw error;
  }
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(userId: string): Promise<{
  hasPaid: boolean;
  paymentMethod?: string;
  paidAt?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('id, payment_method, validated_at, status, created_at')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {throw error;}

    if (data) {
      return {
        hasPaid: true,
        paymentMethod: data.payment_method,
        paidAt: data.validated_at,
      };
    }

    return { hasPaid: false };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return { hasPaid: false };
  }
}

/**
 * Create payment record in database
 * ✅ FIXED: Improved error handling for RLS 42501
 */
export async function createPaymentRecord(params: {
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'paypal' | 'cmi' | 'bank_transfer';
  transactionId?: string;
  status: 'pending' | 'approved' | 'rejected';
}) {
  try {
    console.log('💳 Creating payment record for user:', params.userId);

    // ✅ Verify user exists before attempting INSERT
    const { data: userExists, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', params.userId)
      .single();

    if (userCheckError || !userExists) {
      throw new Error(`User ${params.userId} not found - cannot create payment record`);
    }

    // ✅ Attempt INSERT with improved error handling
    const { data, error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: params.userId,
        requested_level: 'premium',
        amount: params.amount,
        currency: params.currency,
        payment_method: params.paymentMethod,
        transfer_reference: params.transactionId,
        status: params.status,
      })
      .select('id, user_id, requested_level, amount, currency, payment_method, transfer_reference, status, transfer_proof_url, created_at, validated_by, validated_at, validation_notes, updated_at');

    // ✅ Handle RLS errors specifically
    if (error) {
      console.error('❌ Payment record creation error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      // Check for RLS violation (code 42501)
      if (error.code === '42501') {
        throw new Error(
          'RLS Error: Cannot create payment record - insufficient permissions. ' +
          'Please contact support or try again later. ' +
          `[Error: ${error.message}]`
        );
      }

      throw error;
    }

    // ✅ Verify data was actually inserted
    if (!data || data.length === 0) {
      throw new Error('Payment record created but no data returned - possible RLS issue');
    }

    console.log('✅ Payment record created successfully:', {
      id: data[0].id,
      user_id: data[0].user_id,
      amount: data[0].amount,
      status: data[0].status
    });

    return data[0];
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error creating payment record:', errorMsg);

    // Re-throw with enhanced context
    if (errorMsg.includes('RLS')) {
      throw new Error(
        'Payment system error: Row-Level Security violation. ' +
        'This usually means your account permissions need to be verified. ' +
        'Please try again or contact support.'
      );
    }

    throw error;
  }
}

/**
 * Upgrade user to VIP after successful payment
 */
export async function upgradeUserToVIP(userId: string, paymentRequestId: string) {
  try {
    // Update user visitor_level to premium
    const { error: userError } = await supabase
      .from('users')
      .update({ visitor_level: 'premium' })
      .eq('id', userId);

    if (userError) {throw userError;}

    // Mark payment as approved
    const { error: paymentError } = await supabase
      .from('payment_requests')
      .update({
        status: 'approved',
        validated_at: new Date().toISOString(),
      })
      .eq('id', paymentRequestId);

    if (paymentError) {throw paymentError;}

    return true;
  } catch (error) {
    console.error('Error upgrading user to VIP:', error);
    throw error;
  }
}

/**
 * Get payment history for user
 */
export async function getPaymentHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('id, user_id, requested_level, amount, currency, payment_method, transfer_reference, status, transfer_proof_url, created_at, validated_by, validated_at, validation_notes, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {throw error;}

    return data || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
}

/**
 * Convert EUR to MAD (Moroccan Dirham)
 * Fix P1-1 : Utilise le taux mis en cache depuis l'API Frankfurter (BCE).
 * Importer convertEURtoMAD (async) ou convertEURtoMADSync depuis currencyUtils.
 */
export { convertEURtoMAD, convertEURtoMADSync } from '../utils/currencyUtils';
