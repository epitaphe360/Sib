import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Home, Tent, Calendar, Receipt, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../lib/routes';

interface SuccessState {
  invoiceNumber: string;
  totalTTC: number;
  paymentMethod: 'paypal' | 'cmi';
  paymentRef: string;
  cartItems: Array<{ name: string; size_label: string; quantity: number; price_per_day: number }>;
  rentalStart: string;
  rentalEnd: string;
  totalDays: number;
}

export default function ChapiteauPaymentSuccessPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const state     = location.state as SuccessState | null;

  if (!state) {
    navigate(ROUTES.CHAPITEAU_CATALOG);
    return null;
  }

  const { invoiceNumber, totalTTC, paymentMethod, paymentRef, cartItems, rentalStart, rentalEnd, totalDays } = state;
  const isPaid = paymentMethod === 'paypal';

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden">

        {/* Header success */}
        <div className="relative overflow-hidden p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #0B1C3D 0%, #1e3a5f 100%)' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: isPaid ? '#10b981' : '#F39200' }}>
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isPaid ? 'Réservation confirmée !' : 'Demande enregistrée !'}
          </h1>
          <p className="text-[#F39200]/80 text-sm">
            {isPaid
              ? 'Votre paiement a été accepté et votre réservation est confirmée.'
              : 'Notre équipe vous contactera sous 24h pour finaliser le paiement.'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Invoice info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Receipt className="w-4 h-4" /> N° Facture
              </span>
              <span className="font-mono font-bold text-gray-900">{invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Méthode</span>
              <span className="font-semibold text-gray-900">
                {paymentMethod === 'paypal' ? '💳 PayPal' : '🏦 CMI'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Référence</span>
              <span className="font-mono text-xs text-gray-600">{paymentRef}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2 mt-2">
              <span className="font-bold text-gray-900">Total TTC</span>
              <span className="font-bold text-[#F39200]">
                {totalTTC.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
              </span>
            </div>
          </div>

          {/* Rental period */}
          <div className="flex items-center gap-3 bg-[#0B1C3D]/5 rounded-xl p-3">
            <Calendar className="w-5 h-5 text-[#0B1C3D] flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[#0B1C3D]">Période de location</div>
              <div className="text-sm text-gray-700">
                {rentalStart} → {rentalEnd} · <strong>{totalDays} jours</strong>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chapiteaux réservés</h3>
            {cartItems.map((ci, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-[#0B1C3D]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tent className="w-4 h-4 text-[#F39200]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{ci.name}</div>
                  <div className="text-xs text-gray-400">{ci.size_label} · {ci.quantity} unité(s)</div>
                </div>
                <div className="text-sm font-bold text-gray-700 shrink-0">
                  {(ci.price_per_day * ci.quantity * totalDays).toLocaleString('fr-MA')} MAD
                </div>
              </div>
            ))}
          </div>

          {!isPaid && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>Prochaine étape :</strong> Un conseiller SIB vous contactera par email ou téléphone
                dans les 24h ouvrables pour confirmer votre paiement CMI et valider définitivement votre réservation.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <button onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition print:hidden">
              <Download className="w-4 h-4" /> Imprimer / Télécharger la facture
            </button>
            <Link to={ROUTES.CHAPITEAU_CATALOG}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white text-sm font-semibold transition"
              style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
              <Tent className="w-4 h-4" /> Retour au catalogue chapiteaux
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to={ROUTES.HOME}
              className="flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition">
              <Home className="w-4 h-4" /> Accueil
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
