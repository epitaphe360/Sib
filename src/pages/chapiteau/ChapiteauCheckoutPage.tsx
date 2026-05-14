import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShoppingCart, CreditCard, Building2,
  Receipt, Calendar, Tent, Loader2, Info, Shield,
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import { PAYPAL_CLIENT_ID } from '../../services/paymentService';
import { createInvoice } from '../../services/invoiceService';
import { useTranslation } from '../../hooks/useTranslation';

const TVA_RATE  = 0.2;
const MAD_TO_EUR = 11;

interface CartItem {
  id: string;
  name: string;
  size_label: string;
  includes_installation: boolean;
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
  return `FAC-CHAP-2026-${ts}`;
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
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${ci.name} (${ci.size_label})</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center">${ci.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center">${totalDays}j</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right">
          ${(ci.price_per_day * ci.quantity * totalDays).toLocaleString('fr-MA')} MAD
        </td>
      </tr>`)
    .join('');

  const dateStart = new Date(rentalStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const dateEnd   = new Date(rentalEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Facture ${invoiceNumber}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
<tr><td style="background:linear-gradient(135deg,#0B1C3D,#1e3a5f);padding:28px 32px">
  <h1 style="margin:0;color:#C9A84C;font-size:22px">SIB 2026 — Location de Chapiteaux</h1>
  <p style="margin:6px 0 0;color:#fff;font-size:14px">Facture N° ${invoiceNumber}</p>
</td></tr>
<tr><td style="padding:32px">
  <p style="margin:0 0 8px;color:#6b7280;font-size:14px">Bonjour <strong>${userName}</strong>,</p>
  <p style="margin:0 0 24px;color:#374151;font-size:14px">
    ${paymentMethod === 'paypal'
    ? 'Votre paiement a été confirmé. Voici le récapitulatif de votre réservation.'
    : 'Votre réservation est enregistrée. Notre équipe vous contactera sous 24h pour le paiement CMI.'}
  </p>
  <div style="background:#f0f9ff;border-radius:8px;padding:12px 16px;margin-bottom:20px">
    <p style="margin:0;color:#0c4a6e;font-size:13px">
      📅 Période : <strong>${dateStart} au ${dateEnd}</strong> (${totalDays} jour${totalDays > 1 ? 's' : ''})
    </p>
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
    <thead><tr style="background:#f9fafb">
      <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb">Chapiteau</th>
      <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb">Qté</th>
      <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb">Durée</th>
      <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb">Montant HT</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
    <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Sous-total HT</td>
      <td style="padding:6px 0;text-align:right;color:#374151;font-size:14px">${subtotalHT.toLocaleString('fr-MA',{minimumFractionDigits:2})} MAD</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">TVA (20%)</td>
      <td style="padding:6px 0;text-align:right;color:#374151;font-size:14px">${tvaAmount.toLocaleString('fr-MA',{minimumFractionDigits:2})} MAD</td></tr>
    <tr style="border-top:2px solid #e5e7eb">
      <td style="padding:10px 0;font-size:16px;font-weight:700;color:#0B1C3D">Total TTC</td>
      <td style="padding:10px 0;text-align:right;font-size:16px;font-weight:700;color:#C9A84C">${totalTTC.toLocaleString('fr-MA',{minimumFractionDigits:2})} MAD</td>
    </tr>
  </table>
  <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;font-size:13px;color:#374151">
    Réf. paiement : <strong>${paymentRef}</strong> — Méthode : ${paymentMethod === 'paypal' ? 'PayPal' : 'CMI'}
  </div>
</td></tr>
<tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af">
  SIB 2026 — Salon International des Bâtisseurs<br>
  Ce document tient lieu de facture provisoire.
</td></tr>
</table></td></tr></table>
</body></html>`;
}

/* ── PayPal inner component ── */
function PayPalSection({
  amountEUR, onSuccess,
}: {
  amountEUR: number;
  onSuccess: (orderId: string) => void;
}) {
  const [{ isPending }] = usePayPalScriptReducer();
  if (isPending) {
    return <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
      createOrder={(_data, actions) =>
        actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{ amount: { value: amountEUR.toFixed(2), currency_code: 'EUR' } }],
        })
      }
      onApprove={async (_data, actions) => {
        const details = await actions.order?.capture();
        onSuccess(details?.id ?? 'paypal-ref');
      }}
      onError={() => toast.error('Erreur PayPal, veuillez réessayer')}
    />
  );
}

/* ── Main checkout component ── */
export default function ChapiteauCheckoutPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const { t }     = useTranslation();

  const state = location.state as CheckoutState | null;

  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'cmi' | null>(null);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [userProfile, setUserProfile]     = useState<{ full_name?: string; email?: string } | null>(null);

  useEffect(() => {
    if (!state) { navigate(ROUTES.CHAPITEAU_CATALOG); return; }
    if (user?.id) {
      (supabase as any).from('profiles').select('full_name, email').eq('id', user.id).maybeSingle()
        .then(({ data }: any) => setUserProfile(data));
    }
  }, [state, user, navigate]);

  const { cartItems = [], rentalStart = '', rentalEnd = '', totalDays = 1, userType = 'exhibitor', entityId = '' } = state ?? {};

  const subtotalHT = useMemo(
    () => cartItems.reduce((s, ci) => s + ci.price_per_day * ci.quantity * totalDays, 0),
    [cartItems, totalDays],
  );
  const tvaAmount = useMemo(() => subtotalHT * TVA_RATE, [subtotalHT]);
  const totalTTC  = useMemo(() => subtotalHT + tvaAmount, [subtotalHT, tvaAmount]);
  const totalEUR  = useMemo(() => Math.ceil(totalTTC / MAD_TO_EUR * 100) / 100, [totalTTC]);

  const processOrder = useCallback(async (method: 'paypal' | 'cmi', paymentRef: string) => {
    if (!user || !entityId) { toast.error('Session expirée'); return; }
    setIsProcessing(true);
    try {
      const invoiceNumber = generateInvoiceNumber();

      // Insert orders for each cart item
      for (const ci of cartItems) {
        const { error } = await (supabase as any).from('chapiteau_orders').insert({
          item_id:        ci.id,
          customer_id:    entityId,
          customer_type:  userType,
          customer_email: userProfile?.email ?? user.email,
          quantity:       ci.quantity,
          rental_start:   rentalStart,
          rental_end:     rentalEnd,
          unit_price:     ci.price_per_day,
          total_amount:   ci.price_per_day * ci.quantity * totalDays * (1 + TVA_RATE),
          currency:       ci.currency,
          payment_method: method,
          payment_status: method === 'paypal' ? 'paid' : 'pending',
          payment_ref:    paymentRef,
          paid_at:        method === 'paypal' ? new Date().toISOString() : null,
          status:         'pending',
          invoice_number: invoiceNumber,
        });
        if (error) { throw error; }
      }

      // Send invoice email
      try {
        const html = buildInvoiceEmailHtml({
          invoiceNumber,
          userName: userProfile?.full_name ?? user.email ?? 'Client',
          cartItems,
          subtotalHT,
          tvaAmount,
          totalTTC,
          totalDays,
          rentalStart,
          rentalEnd,
          paymentMethod: method,
          paymentRef,
        });
        await createInvoice({
          to:      userProfile?.email ?? user.email ?? '',
          subject: `Facture ${invoiceNumber} — Location de chapiteaux SIB 2026`,
          html,
        });
      } catch {
        // Email failure is non-blocking
      }

      navigate(ROUTES.CHAPITEAU_PAYMENT_SUCCESS, {
        state: {
          invoiceNumber,
          totalTTC,
          paymentMethod: method,
          paymentRef,
          cartItems,
          rentalStart,
          rentalEnd,
          totalDays,
        },
      });
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la réservation");
    } finally {
      setIsProcessing(false);
    }
  }, [user, entityId, userType, userProfile, cartItems, rentalStart, rentalEnd, totalDays, subtotalHT, tvaAmount, totalTTC, navigate]);

  if (!state) { return null; }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Retour au catalogue
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
            <Tent className="w-5 h-5 text-[#C9A84C]" />
          </div>
          Paiement — Location de chapiteaux
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment method selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#C9A84C]" /> Méthode de paiement
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'paypal' as const, label: 'PayPal', sub: 'Carte visa/mastercard internationale', icon: '💳' },
                  { id: 'cmi'    as const, label: 'CMI',    sub: 'Carte bancaire marocaine (CIH, CIH…)', icon: '🏦' },
                ].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                    className={`p-4 rounded-xl border-2 text-left transition ${
                      paymentMethod === m.id
                        ? 'border-[#C9A84C] bg-[#C9A84C]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <div className="font-semibold text-gray-900 text-sm">{m.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* PayPal */}
            <AnimatePresence>
              {paymentMethod === 'paypal' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Paiement sécurisé PayPal — {totalEUR.toFixed(2)} EUR
                  </h3>
                  <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'EUR' }}>
                    <PayPalSection
                      amountEUR={totalEUR}
                      onSuccess={ref => processOrder('paypal', ref)}
                    />
                  </PayPalScriptProvider>
                </motion.div>
              )}

              {/* CMI */}
              {paymentMethod === 'cmi' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-3 mb-5">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">Paiement CMI — Carte bancaire marocaine</h3>
                      <p className="text-sm text-gray-500">
                        Votre réservation sera enregistrée immédiatement. Un membre de notre équipe vous contactera
                        sous 24h pour finaliser le paiement par CMI.
                      </p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-4">
                    ⚡ Votre place sera réservée pour 48h le temps de confirmer le paiement.
                  </div>
                  <button
                    onClick={() => processOrder('cmi', `CMI-CHAP-${Date.now()}`)}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                    {isProcessing
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement…</>
                      : <><Building2 className="w-4 h-4" /> Confirmer la réservation CMI</>
                    }
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-4 h-4" /> Paiement 100% sécurisé · Facture envoyée par email
            </div>
          </div>

          {/* Right: summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#C9A84C]" /> Récapitulatif
              </h3>
              <div className="space-y-3 mb-4">
                {cartItems.map(ci => (
                  <div key={ci.id} className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-[#0B1C3D]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tent className="w-4 h-4 text-[#C9A84C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{ci.name}</div>
                      <div className="text-xs text-gray-400">{ci.size_label} · {ci.quantity} u. · {totalDays}j</div>
                    </div>
                    <div className="text-xs font-bold text-gray-700 shrink-0">
                      {(ci.price_per_day * ci.quantity * totalDays).toLocaleString('fr-MA')} MAD
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Sous-total HT</span>
                  <span>{subtotalHT.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>TVA 20%</span>
                  <span>{tvaAmount.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
                  <span>Total TTC</span>
                  <span className="text-[#C9A84C]">{totalTTC.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0B1C3D]/5 rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[#0B1C3D] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-[#0B1C3D]">Période de location</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {rentalStart} → {rentalEnd}<br />
                    <strong>{totalDays} jours</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
