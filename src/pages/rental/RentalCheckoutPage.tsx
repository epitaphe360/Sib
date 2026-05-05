import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShoppingCart, CreditCard, Building2, CheckCircle,
  Receipt, Calendar, Package, Loader2, Info, Shield,
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import { PAYPAL_CLIENT_ID } from '../../services/paymentService';

const TVA_RATE = 0.20;
const MAD_TO_EUR = 11; // taux approximatif

interface CartItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  price_per_day: number;
  currency: string;
  quantity: number;
}

interface CheckoutState {
  cartItems: CartItem[];
  rentalStart: string;
  rentalEnd: string;
  totalDays: number;
  userType: 'exhibitor' | 'partner';
  entityId: string;
}

function generateInvoiceNumber(): string {
  const ts = Date.now().toString().slice(-7);
  return `FAC-RENT-2026-${ts}`;
}

function buildInvoiceEmailHtml(params: {
  invoiceNumber: string;
  userName: string;
  cartItems: CartItem[];
  subtotalHT: number;
  tvaAmount: number;
  totalTTC: number;
  totalDays: number;
  rentalStart: string;
  rentalEnd: string;
  paymentMethod: 'paypal' | 'cmi';
  paymentRef: string;
}): string {
  const { invoiceNumber, userName, cartItems, subtotalHT, tvaAmount, totalTTC,
    totalDays, rentalStart, rentalEnd, paymentMethod, paymentRef } = params;

  const rows = cartItems
    .map(ci => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${ci.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center">${ci.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center">${totalDays}j</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right">
          ${(ci.price_per_day * ci.quantity * totalDays).toLocaleString('fr-MA')} MAD
        </td>
      </tr>`)
    .join('');

  const dateStart = new Date(rentalStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const dateEnd = new Date(rentalEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const methodLabel = paymentMethod === 'paypal' ? 'PayPal' : 'CMI / Carte bancaire marocaine';
  const statusLabel = paymentMethod === 'paypal' ? '✅ Paiement confirmé' : '⏳ En attente de paiement CMI';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Facture ${invoiceNumber}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <!-- Header -->
        <tr><td style="background:#059669;padding:28px 32px">
          <h1 style="margin:0;color:#ffffff;font-size:22px">SIB 2026 — Location de Matériel</h1>
          <p style="margin:6px 0 0;color:#d1fae5;font-size:14px">Facture N° ${invoiceNumber}</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;color:#6b7280;font-size:14px">Bonjour <strong>${userName}</strong>,</p>
          <p style="margin:0 0 24px;color:#374151;font-size:14px">
            ${paymentMethod === 'paypal'
    ? 'Votre paiement a été confirmé. Voici le récapitulatif de votre commande.'
    : 'Votre commande est enregistrée. Notre équipe vous contactera sous 24h pour le paiement CMI.'}
          </p>
          <!-- Dates -->
          <div style="background:#f0fdf4;border-radius:8px;padding:12px 16px;margin-bottom:20px">
            <p style="margin:0;color:#065f46;font-size:13px">
              📅 Période de location : <strong>${dateStart} au ${dateEnd}</strong> (${totalDays} jour${totalDays > 1 ? 's' : ''})
            </p>
          </div>
          <!-- Items table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
            <thead>
              <tr style="background:#f9fafb">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb">Article</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb">Qté</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb">Durée</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb">Montant HT</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px">Sous-total HT</td>
              <td style="padding:6px 0;text-align:right;color:#374151;font-size:14px">${subtotalHT.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px">TVA (20%)</td>
              <td style="padding:6px 0;text-align:right;color:#374151;font-size:14px">${tvaAmount.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</td>
            </tr>
            <tr style="border-top:2px solid #e5e7eb">
              <td style="padding:10px 0 0;color:#111827;font-size:16px;font-weight:700">Total TTC</td>
              <td style="padding:10px 0 0;text-align:right;color:#059669;font-size:16px;font-weight:700">${totalTTC.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</td>
            </tr>
          </table>
          <!-- Payment info -->
          <div style="background:#f3f4f6;border-radius:8px;padding:14px 16px">
            <p style="margin:0 0 4px;font-size:13px;color:#374151"><strong>Mode de paiement :</strong> ${methodLabel}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#374151"><strong>Référence :</strong> ${paymentRef}</p>
            <p style="margin:0;font-size:13px;color:#374151"><strong>Statut :</strong> ${statusLabel}</p>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center">
          <p style="margin:0;color:#9ca3af;font-size:12px">SIB 2026 · Salon International du Bâtiment · Casablanca, Maroc</p>
          <p style="margin:4px 0 0;color:#9ca3af;font-size:12px">contact@sib2026.ma · www.sib2026.ma</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── PayPal inner button (doit être enfant de PayPalScriptProvider) ──────────
function PayPalPayButton({
  amountEUR,
  invoiceNumber,
  onSuccess,
}: {
  amountEUR: string;
  invoiceNumber: string;
  onSuccess: (paypalOrderId: string) => void;
}) {
  const [{ isPending }] = usePayPalScriptReducer();

  if (isPending) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 }}
      createOrder={(_data, actions) =>
        actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: { currency_code: 'EUR', value: amountEUR },
            description: `Location matériel SIB 2026 — ${invoiceNumber}`,
            custom_id: invoiceNumber,
          }],
        })
      }
      onApprove={async (_data, actions) => {
        const result = await actions.order!.capture();
        onSuccess(result.id!);
      }}
      onError={(err) => {
        console.error('[PayPal] Error:', err);
        toast.error('Erreur PayPal. Veuillez réessayer.');
      }}
    />
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function RentalCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const state = location.state as CheckoutState | null;
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'cmi' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceNumber] = useState(() => generateInvoiceNumber());

  useEffect(() => {
    if (!state?.cartItems?.length) {
      navigate(-1);
    }
  }, [state, navigate]);

  const { cartItems = [], rentalStart = '', rentalEnd = '', totalDays = 1,
    userType = 'exhibitor', entityId = '' } = state ?? {};

  const subtotalHT = useMemo(
    () => cartItems.reduce((sum, ci) => sum + ci.price_per_day * ci.quantity * totalDays, 0),
    [cartItems, totalDays],
  );
  const tvaAmount = subtotalHT * TVA_RATE;
  const totalTTC = subtotalHT + tvaAmount;
  const amountEUR = (totalTTC / MAD_TO_EUR).toFixed(2);

  const dashboardRoute = userType === 'exhibitor' ? ROUTES.EXHIBITOR_DASHBOARD : ROUTES.PARTNER_DASHBOARD;

  const processPayment = useCallback(async (method: 'paypal' | 'cmi', paymentRef: string) => {
    if (!user?.id) { return; }
    setIsProcessing(true);
    try {
      // 1. Insérer les commandes rental_orders
      const orders = cartItems.map(ci => ({
        item_id: ci.id,
        customer_id: user.id,
        customer_type: userType,
        ...(userType === 'exhibitor' ? { exhibitor_id: entityId } : { partner_id: entityId }),
        quantity: ci.quantity,
        rental_start: rentalStart,
        rental_end: rentalEnd,
        unit_price: ci.price_per_day,
        total_amount: ci.price_per_day * ci.quantity * totalDays,
        currency: ci.currency,
        status: method === 'paypal' ? 'confirmed' : 'pending',
        payment_status: method === 'paypal' ? 'paid' : 'pending',
      }));

      const { error: ordersError } = await (supabase as any)
        .from('rental_orders')
        .insert(orders);
      if (ordersError) { throw ordersError; }

      // 2. Insérer le paiement rental_order_payments
      const { error: paymentError } = await (supabase as any)
        .from('rental_order_payments')
        .insert({
          invoice_number: invoiceNumber,
          customer_id: user.id,
          entity_type: userType,
          entity_id: entityId || null,
          subtotal_ht: subtotalHT,
          tva_rate: TVA_RATE,
          tva_amount: tvaAmount,
          total_ttc: totalTTC,
          currency: 'MAD',
          rental_start: rentalStart,
          rental_end: rentalEnd,
          payment_method: method,
          payment_status: method === 'paypal' ? 'completed' : 'pending',
          payment_ref: paymentRef,
          items_snapshot: cartItems,
          paid_at: method === 'paypal' ? new Date().toISOString() : null,
        });
      if (paymentError) { throw paymentError; }

      // 3. Envoyer l'email de confirmation (non-bloquant)
      supabase.functions.invoke('send-email-notification', {
        body: {
          to: user.email,
          subject: `Confirmation commande location — ${invoiceNumber}`,
          html: buildInvoiceEmailHtml({
            invoiceNumber,
            userName: (user as any).full_name || user.email || '',
            cartItems,
            subtotalHT,
            tvaAmount,
            totalTTC,
            totalDays,
            rentalStart,
            rentalEnd,
            paymentMethod: method,
            paymentRef,
          }),
        },
      }).catch(err => console.warn('[Email] Non-blocking error:', err));

      // 4. Naviguer vers la page de succès
      navigate(ROUTES.RENTAL_PAYMENT_SUCCESS, {
        state: {
          invoiceNumber,
          paymentRef,
          paymentMethod: method,
          cartItems,
          subtotalHT,
          tvaAmount,
          totalTTC,
          totalDays,
          rentalStart,
          rentalEnd,
          userType,
          dashboardRoute,
          userName: (user as any).full_name || user.email || '',
          userEmail: user.email,
        },
        replace: true,
      });
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors du traitement. Réessayez.');
      setIsProcessing(false);
    }
  }, [user, cartItems, rentalStart, rentalEnd, totalDays, userType, entityId,
    subtotalHT, tvaAmount, totalTTC, invoiceNumber, navigate, dashboardRoute]);

  if (!state?.cartItems?.length) { return null; }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 text-sm transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour au catalogue
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-3 rounded-xl">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Récapitulatif & Paiement</h1>
              <p className="text-sm text-gray-500">Vérifiez votre commande avant de payer</p>
            </div>
          </div>
        </div>

        {/* Récapitulatif commande */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-emerald-600" />
            Articles commandés
          </h2>

          {/* Période */}
          <div className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2 mb-4">
            <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Du {new Date(rentalStart + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' '}au {new Date(rentalEnd + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="ml-auto font-semibold text-emerald-700 shrink-0">
              {totalDays} jour{totalDays > 1 ? 's' : ''}
            </span>
          </div>

          {/* Lignes articles */}
          <div className="divide-y divide-gray-50">
            {cartItems.map(ci => (
              <div key={ci.id} className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{ci.name}</div>
                  <div className="text-xs text-gray-400">
                    {ci.quantity} {ci.unit} × {ci.price_per_day} MAD/jour × {totalDays}j
                  </div>
                </div>
                <span className="font-semibold text-gray-900 text-sm shrink-0">
                  {(ci.price_per_day * ci.quantity * totalDays).toLocaleString('fr-MA')} MAD
                </span>
              </div>
            ))}
          </div>

          {/* Total HT / TVA / TTC */}
          <div className="border-t border-gray-100 mt-3 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Sous-total HT</span>
              <span>{subtotalHT.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>TVA (20%)</span>
              <span>{tvaAmount.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total TTC</span>
              <span className="text-emerald-700 text-lg">
                {totalTTC.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
              </span>
            </div>
          </div>
        </div>

        {/* Choix du mode de paiement */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            Mode de paiement
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* PayPal */}
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                paymentMethod === 'paypal'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300 bg-gray-50/50'
              }`}
            >
              <span className="text-3xl">🅿️</span>
              <span className="font-semibold text-sm text-gray-800">PayPal</span>
              <span className="text-xs text-gray-500 text-center">Paiement en ligne sécurisé</span>
            </button>

            {/* CMI */}
            <button
              onClick={() => setPaymentMethod('cmi')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                paymentMethod === 'cmi'
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                  : 'border-gray-200 hover:border-emerald-300 bg-gray-50/50'
              }`}
            >
              <Building2 className="h-8 w-8 text-emerald-600" />
              <span className="font-semibold text-sm text-gray-800">CMI</span>
              <span className="text-xs text-gray-500 text-center">Carte bancaire marocaine</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* ── PayPal ── */}
            {paymentMethod === 'paypal' && (
              <motion.div
                key="paypal"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 mb-4 text-xs text-blue-700">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Le montant sera traité en EUR via PayPal.{' '}
                    <strong>{amountEUR} EUR</strong> ≈ {totalTTC.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
                    <br />Taux indicatif : 1 EUR = {MAD_TO_EUR} MAD
                  </span>
                </div>
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-gray-500 text-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Traitement du paiement en cours…
                  </div>
                ) : PAYPAL_CLIENT_ID ? (
                  <PayPalScriptProvider
                    options={{
                      clientId: PAYPAL_CLIENT_ID,
                      currency: 'EUR',
                      intent: 'capture',
                    }}
                  >
                    <PayPalPayButton
                      amountEUR={amountEUR}
                      invoiceNumber={invoiceNumber}
                      onSuccess={(paypalOrderId) => processPayment('paypal', paypalOrderId)}
                    />
                  </PayPalScriptProvider>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>PayPal non configuré. Contactez l'administrateur ou choisissez CMI.</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── CMI ── */}
            {paymentMethod === 'cmi' && (
              <motion.div
                key="cmi"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-2 bg-emerald-50 rounded-xl p-3 mb-4 text-xs text-emerald-700">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Votre commande sera enregistrée. Notre équipe vous enverra un lien de paiement
                    CMI sécurisé par email dans les <strong>24 heures</strong>.
                  </span>
                </div>
                <button
                  onClick={() => processPayment('cmi', `CMI-PENDING-${Date.now()}`)}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold text-sm transition"
                >
                  {isProcessing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Traitement…</>
                  ) : (
                    <><Building2 className="h-4 w-4" /> Confirmer & payer par CMI</>
                  )}
                </button>
              </motion.div>
            )}

            {/* ── Aucun choix ── */}
            {!paymentMethod && (
              <motion.div
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-gray-400 py-3"
              >
                Sélectionnez un mode de paiement ci-dessus
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Note sécurité */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="h-3.5 w-3.5 text-green-400" />
          Paiement sécurisé · Facture envoyée par email · TVA 20% incluse
        </div>
      </div>
    </div>
  );
}
