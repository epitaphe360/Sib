import { supabase } from '../lib/supabase';

export type PaymentMethod = 'paypal' | 'cmi' | 'bank_transfer';

export interface PaymentOrder {
  orderId: string;
  approvalUrl: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  /** Pour CMI : paramètres du formulaire POST à soumettre */
  cmiParams?: Record<string, string>;
  /** Pour CMI : URL de la passerelle vers laquelle soumettre */
  gatewayUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  captureId?: string;
  error?: string;
}

/** Activé sauf si EXPO_PUBLIC_PAYMENT_ENABLED=false (credentials sandbox requis). */
export const PAYMENT_ENABLED = process.env.EXPO_PUBLIC_PAYMENT_ENABLED !== 'false';

// ─── PayPal ──────────────────────────────────────────────────────────────────

/** Crée une commande PayPal via Supabase Edge Function `create-paypal-order` */
export async function createPaypalOrder(params: {
  userId: string;
  amount: number;
  currency: string;
  description: string;
}): Promise<PaymentOrder> {
  const { data, error } = await supabase.functions.invoke('create-paypal-order', {
    body: params,
  });
  if (error) throw new Error(error.message ?? 'Erreur PayPal');
  if (!data?.orderId) throw new Error('ID commande PayPal introuvable');
  if (!data?.approvalUrl) throw new Error('URL approbation PayPal introuvable — vérifiez les credentials PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET');
  return {
    orderId: data.orderId,
    approvalUrl: data.approvalUrl,
    method: 'paypal',
    amount: params.amount,
    currency: params.currency,
  };
}

/** Capture/confirme une commande PayPal après retour WebView */
export async function capturePaypalOrder(orderId: string): Promise<PaymentResult> {
  const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
    body: { orderId },
  });
  if (error) return { success: false, error: error.message };
  return {
    success: data?.success === true,
    orderId,
    captureId: data?.captureId,
  };
}

// ─── CMI ─────────────────────────────────────────────────────────────────────

/** Crée un paiement CMI (carte bancaire marocaine) via Edge Function `create-cmi-payment` */
export async function createCmiOrder(params: {
  userId: string;
  amount: number;
  currency: string;
  description: string;
  email: string;
  name: string;
}): Promise<PaymentOrder> {
  const { data, error } = await supabase.functions.invoke('create-cmi-payment', {
    body: {
      userId: params.userId,
      userEmail: params.email,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      returnUrl: 'urbaevent://payment-callback',
      cancelUrl: 'urbaevent://payment-cancel',
    },
  });
  if (error) throw new Error(error.message ?? 'Erreur CMI');
  if (!data?.gatewayUrl) throw new Error('URL passerelle CMI introuvable — vérifiez les credentials CMI_MERCHANT_ID / CMI_STORE_KEY');

  return {
    orderId: data.orderId,
    approvalUrl: data.gatewayUrl,
    gatewayUrl: data.gatewayUrl,
    cmiParams: data.params as Record<string, string>,
    method: 'cmi',
    amount: params.amount,
    currency: params.currency,
  };
}

/** Vérifie le statut d'un paiement CMI via `payment-cmi-verify` */
export async function verifyCmiPayment(orderId: string): Promise<PaymentResult> {
  const { data, error } = await supabase.functions.invoke('payment-cmi-verify', {
    body: { orderId },
  });
  if (error) return { success: false, error: error.message };
  return { success: !!data?.verified, orderId };
}

// ─── Activation Pass VIP ──────────────────────────────────────────────────────

/** Enregistre un paiement confirmé côté passerelle — le niveau VIP est activé par l'admin via approve_payment_request() */
export async function activateVipPass(params: {
  userId: string;
  paymentMethod: PaymentMethod;
  orderId: string;
  amount: number;
  currency: string;
}): Promise<void> {
  const { error } = await supabase.from('payment_requests').insert([{
    user_id: params.userId,
    amount: params.amount,
    currency: params.currency,
    status: 'pending',
    payment_method: params.paymentMethod,
    transfer_reference: params.orderId,
    requested_level: 'premium',
  }]);
  if (error) throw error;
}
