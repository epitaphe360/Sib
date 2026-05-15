import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Building2, CreditCard, Loader2, ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import useAuthStore from '../store/authStore';
import { ROUTES } from '../lib/routes';
import { supabase } from '../lib/supabase';
import {
  PAYPAL_CLIENT_ID,
  capturePayPalOrder,
  createCMIPaymentRequest,
} from '../services/paymentService';
import { createInvoice } from '../services/invoiceService';
import { generateVisitorPaymentReference } from '../config/visitorBankTransferConfig';

// ── Bouton PayPal interne ─────────────────────────────────────────────────────
function PayPalPayButton({ onSuccess, amount, currency }: Readonly<{ onSuccess: (orderId: string) => void; amount: number; currency: string }>) {
  const [{ isPending }] = usePayPalScriptReducer();
  if (isPending) {
    return <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /></div>;
  }
  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 }}
      createOrder={(_data, actions) =>
        actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: { currency_code: currency, value: amount.toString() },
            description: 'Pass Premium VIP SIB 2026',
          }],
        })
      }
      onApprove={async (_data, actions) => {
        const result = await actions.order!.capture();
        onSuccess(result.id!);
      }}
      onError={() => toast.error('Erreur PayPal. Veuillez réessayer.')}
    />
  );
}

export default function VisitorPaymentPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'cmi' | 'bank_transfer' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vipAmount, setVipAmount] = useState(700);
  const [vipCurrency, setVipCurrency] = useState('EUR');

  useEffect(() => {
    supabase
      .from('pricing_config')
      .select('amount, currency')
      .eq('category', 'visitor')
      .eq('level', 'vip')
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }: { data: { amount: number; currency: string } | null }) => {
        if (data) {
          setVipAmount(data.amount);
          setVipCurrency(data.currency);
        }
      });
  }, []);

  // ── Flux PayPal ─────────────────────────────────────────────────────────────
  const handlePayPalSuccess = useCallback(async (orderId: string) => {
    if (!user) { return; }
    setIsProcessing(true);
    try {
      await capturePayPalOrder(orderId, user.id);

      // Upgrade visiteur → premium
      await supabase.from('users').update({ status: 'active', visitor_level: 'vip' }).eq('id', user.id);

      // Générer facture automatiquement
      createInvoice({
        user_id: user.id,
        user_type: 'visitor',
        user_email: user.email ?? '',
        user_name: (user as any).full_name || (user as any).name || user.email || '',
        vat_rate: 0,
        currency: 'EUR',
        notes: `Pass Premium VIP SIB 2026 — PayPal (${orderId})`,
        lines: [{ description: 'Pass Premium VIP SIB 2026', quantity: 1, unit_price: vipAmount }],
      }).catch(err => console.warn('[Invoice] Non-blocking error:', err));

      toast.success('Paiement confirmé ! Bienvenue en tant que VIP.');
      navigate(ROUTES.VISITOR_PAYMENT_SUCCESS, { replace: true });
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la confirmation du paiement');
      setIsProcessing(false);
    }
  }, [user, navigate, vipAmount, vipCurrency]);

  // ── Flux CMI ─────────────────────────────────────────────────────────────────
  const handleCMI = useCallback(async () => {
    if (!user) { return; }
    setIsProcessing(true);
    try {
      const cmiData = await createCMIPaymentRequest(user.id, user.email ?? '');
      globalThis.location.href = cmiData.paymentUrl as string;
    } catch (err: any) {
      toast.error(err?.message || 'Erreur CMI. Veuillez réessayer.');
      setIsProcessing(false);
    }
  }, [user]);

  // ── Flux Virement bancaire ────────────────────────────────────────────────────
  const handleBankTransfer = useCallback(async () => {
    if (!user) { return; }
    setIsProcessing(true);
    try {
      const { data: existing } = await supabase
        .from('payment_requests').select('id').eq('user_id', user.id).eq('status', 'pending').maybeSingle();
      if (existing) {
        navigate(`/visitor/bank-transfer?request_id=${existing.id}`);
        return;
      }
      const ref = generateVisitorPaymentReference(user.id);
      const { data: newReq, error } = await supabase
        .from('payment_requests')
        .insert({ user_id: user.id, amount: vipAmount, currency: vipCurrency, payment_method: 'bank_transfer', status: 'pending', requested_level: 'premium', transfer_reference: ref })
        .select('id').single();
      if (error) { throw error; }
      navigate(`/visitor/bank-transfer?request_id=${newReq.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur. Veuillez réessayer.');
      setIsProcessing(false);
    }
  }, [user, navigate, vipAmount, vipCurrency]);

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: vipCurrency, intent: 'capture' }}>
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="max-w-xl mx-auto px-4">

          {/* Header */}
          <button onClick={() => navigate(ROUTES.VISITOR_DASHBOARD)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
          </button>

          {/* Prix */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-700 to-indigo-700 rounded-2xl p-6 text-white mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-7 h-7 text-yellow-300" />
              <h1 className="text-xl font-bold">Pass Premium VIP SIB 2026</h1>
            </div>
            <p className="text-purple-200 text-sm mb-4">Accès complet au salon, networking avancé, badge officiel</p>
            <div className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
              <span className="text-purple-100 text-sm">Montant total</span>
              <span className="text-2xl font-extrabold text-yellow-300">{vipAmount.toLocaleString('fr-FR')} {vipCurrency}</span>
            </div>
            <ul className="mt-4 space-y-1">
              {['Accès illimité au salon', 'Badge VIP nominatif', 'Sessions networking VIP', 'Conférences & séminaires'].map(b => (
                <li key={b} className="flex items-center gap-2 text-sm text-purple-100">
                  <Check className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />{b}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Choix méthode */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border shadow-sm p-6 mb-4">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Choisissez votre mode de paiement</h2>

            <div className="space-y-3 mb-6">
              {/* PayPal */}
              <button onClick={() => setPaymentMethod('paypal')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm">PayPal</p>
                  <p className="text-xs text-gray-500">Paiement immédiat — carte ou compte PayPal</p>
                </div>
                {paymentMethod === 'paypal' && <Check className="w-5 h-5 text-blue-600 ml-auto" />}
              </button>

              {/* CMI */}
              <button onClick={() => setPaymentMethod('cmi')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cmi' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm">CMI / Carte bancaire marocaine</p>
                  <p className="text-xs text-gray-500">Visa, Mastercard — CMI Maroc</p>
                </div>
                {paymentMethod === 'cmi' && <Check className="w-5 h-5 text-emerald-600 ml-auto" />}
              </button>

              {/* Virement bancaire */}
              <button onClick={() => setPaymentMethod('bank_transfer')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'bank_transfer' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm">Virement bancaire</p>
                  <p className="text-xs text-gray-500">Attijariwafa bank — validation sous 24–48h</p>
                </div>
                {paymentMethod === 'bank_transfer' && <Check className="w-5 h-5 text-amber-600 ml-auto" />}
              </button>
            </div>

            {/* Zone de paiement selon méthode choisie */}
            {paymentMethod === 'paypal' && (
              <div>
                {isProcessing ? (
                  <div className="flex items-center justify-center py-6 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="text-gray-600 text-sm">Confirmation du paiement…</span>
                  </div>
                ) : (
                  <PayPalPayButton onSuccess={handlePayPalSuccess} amount={vipAmount} currency={vipCurrency} />
                )}
              </div>
            )}

            {paymentMethod === 'cmi' && (
              <button onClick={handleCMI} disabled={isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                {isProcessing ? 'Redirection…' : 'Payer par CMI'}
              </button>
            )}

            {paymentMethod === 'bank_transfer' && (
              <button onClick={handleBankTransfer} disabled={isProcessing}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Building2 className="w-5 h-5" />}
                {isProcessing ? 'Chargement…' : 'Obtenir les coordonnées bancaires'}
              </button>
            )}
          </motion.div>

          {/* Sécurité */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Paiement sécurisé — Vos données sont protégées</span>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

