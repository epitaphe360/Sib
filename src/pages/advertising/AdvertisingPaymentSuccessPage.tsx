import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Download, Home, Megaphone, Tag,
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';

const CATEGORY_EMOJIS: Record<string, string> = {
  'banner-app': '🖥️',
  email:        '📧',
  push:         '🔔',
  featured:     '⭐',
  physique:     '🏷️',
  conference:   '🎤',
  autre:        '📢',
};

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  duration_days: number;
  quantity: number;
}

interface SuccessState {
  invoiceNumber: string;
  totalTTC: number;
  paymentMethod: 'paypal' | 'cmi';
  paymentRef: string;
  cartItems: CartItem[];
}

export default function AdvertisingPaymentSuccessPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const state     = location.state as SuccessState | null;

  const handlePrint = () => { window.print(); };

  if (!state) {
    navigate(ROUTES.HOME);
    return null;
  }

  const { invoiceNumber, totalTTC, paymentMethod, paymentRef, cartItems } = state;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden">

        {/* Header */}
        <div className="relative px-8 py-10 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #0B1C3D 0%, #1e3a5f 60%, #0B1C3D 100%)' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-[#C9A84C] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">
            {paymentMethod === 'paypal' ? 'Paiement confirmé !' : 'Réservation enregistrée !'}
          </h1>
          <p className="text-[#C9A84C]/90 text-sm">
            {paymentMethod === 'paypal'
              ? 'Votre espace publicitaire est réservé. Notre équipe le validera sous 24h.'
              : 'Notre équipe vous contactera sous 24h pour finaliser le paiement CMI.'}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          {/* Infos clés */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">N° Facture</div>
              <div className="font-bold text-[#0B1C3D] text-sm">{invoiceNumber}</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">Total TTC</div>
              <div className="font-bold text-[#C9A84C] text-sm">
                {totalTTC.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
              </div>
            </div>
          </div>

          {/* Badge méthode */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              paymentMethod === 'paypal'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {paymentMethod === 'paypal' ? '💳 PayPal' : '🏦 CMI en attente'}
            </span>
            <span className="text-xs text-gray-400 truncate">Réf : {paymentRef}</span>
          </div>

          {/* Espaces réservés */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="w-4 h-4 text-[#C9A84C]" />
              <span className="font-semibold text-gray-900 text-sm">Espaces réservés</span>
            </div>
            <div className="space-y-2">
              {cartItems.map(ci => (
                <div key={ci.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xl">{CATEGORY_EMOJIS[ci.category] ?? '📢'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{ci.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Tag className="w-3 h-3" />
                      {ci.duration_days} jour{ci.duration_days > 1 ? 's' : ''}
                      {ci.quantity > 1 ? ` · ${ci.quantity} emplacements` : ''}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#C9A84C] shrink-0">
                    {(ci.price * ci.quantity).toLocaleString('fr-MA')} MAD
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info workflow */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">Prochaines étapes</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-600">
              <li>Notre équipe examine votre réservation sous 24–48h</li>
              <li>Vous recevrez un email de confirmation à l'activation</li>
              {paymentMethod === 'cmi' && <li>Un agent vous contactera pour le paiement CMI</li>}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <button onClick={handlePrint}
              className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition">
              <Download className="w-4 h-4" /> Imprimer / Sauvegarder
            </button>
            <button onClick={() => navigate(ROUTES.HOME)}
              className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #b8963e)' }}>
              <Home className="w-4 h-4" /> Retour à l'accueil
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
