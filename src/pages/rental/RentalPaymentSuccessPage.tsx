import React, { useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Clock, Download, ArrowRight, Package,
  Calendar, CreditCard, Hash, Mail, Home,
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import { loadInvoiceConfig, INVOICE_CONFIG_DEFAULTS } from '../../hooks/useInvoiceConfig';

interface SuccessState {
  invoiceNumber: string;
  paymentRef: string;
  paymentMethod: 'paypal' | 'cmi';
  cartItems: Array<{
    id: string;
    name: string;
    unit: string;
    price_per_day: number;
    currency: string;
    quantity: number;
  }>;
  subtotalHT: number;
  tvaAmount: number;
  totalTTC: number;
  totalDays: number;
  rentalStart: string;
  rentalEnd: string;
  userType: 'exhibitor' | 'partner';
  dashboardRoute: string;
  userName: string;
  userEmail: string;
}

function buildInvoicePrintHtml(
  s: SuccessState,
  logoUrl: string,
  cfg = INVOICE_CONFIG_DEFAULTS,
): string {
  const dateStart = new Date(s.rentalStart + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const dateEnd = new Date(s.rentalEnd + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const now = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const methodLabel = s.paymentMethod === 'paypal' ? 'PayPal' : 'CMI / Carte bancaire marocaine';
  const statusLabel = s.paymentMethod === 'paypal' ? 'Payé' : 'En attente de paiement CMI';

  const rows = s.cartItems.map(ci => `
    <tr>
      <td class="td">${ci.name}</td>
      <td class="td center">${ci.quantity}</td>
      <td class="td center">${ci.price_per_day.toLocaleString('fr-MA')} MAD/${ci.unit}/j</td>
      <td class="td center">${s.totalDays}j</td>
      <td class="td right">${(ci.price_per_day * ci.quantity * s.totalDays).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture ${s.invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1f2937; background: #fff; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #059669; }
    .logo { display: block; height: 52px; width: auto; }
    .logo-sub { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .invoice-meta { text-align: right; }
    .invoice-meta .num { font-size: 16px; font-weight: 700; color: #1f2937; }
    .invoice-meta .date { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .info-box { background: #f9fafb; border-radius: 8px; padding: 14px 16px; }
    .info-box h3 { font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; margin-bottom: 6px; }
    .info-box p { font-size: 13px; color: #374151; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f3f4f6; text-align: left; padding: 10px 12px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #e5e7eb; }
    .td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    .center { text-align: center; }
    .right { text-align: right; }
    .totals { width: 300px; margin-left: auto; margin-bottom: 28px; }
    .totals tr td { padding: 6px 0; font-size: 13px; }
    .totals .label { color: #6b7280; }
    .totals .amount { text-align: right; color: #374151; }
    .totals .total-row td { border-top: 2px solid #e5e7eb; padding-top: 10px; font-weight: 700; font-size: 15px; }
    .totals .total-row .amount { color: #059669; }
    .payment-info { background: #f0fdf4; border-radius: 8px; padding: 14px 16px; margin-bottom: 28px; }
    .payment-info p { font-size: 12px; color: #065f46; line-height: 1.8; }
    .footer { border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center; font-size: 11px; color: #9ca3af; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <img src="${logoUrl}" alt="${cfg.emitter_name}" class="logo"
           onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
      <div style="display:none;font-size:22px;font-weight:700;color:#059669">${cfg.emitter_name}</div>
      <div class="logo-sub">${cfg.emitter_org} · ${cfg.emitter_address}</div>
    </div>
    <div class="invoice-meta">
      <div class="num">FACTURE N° ${s.invoiceNumber}</div>
      <div class="date">Émise le ${now}</div>
      <div class="date">Statut : <strong>${statusLabel}</strong></div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Émetteur</h3>
      <p><strong>${cfg.emitter_name}</strong><br>${cfg.emitter_org}<br>${cfg.emitter_address}<br>${cfg.emitter_email}${cfg.emitter_phone ? '<br>' + cfg.emitter_phone : ''}${cfg.emitter_ice ? '<br>' + cfg.emitter_ice : ''}</p>
    </div>
    <div class="info-box">
      <h3>Client</h3>
      <p><strong>${s.userName}</strong><br>${s.userEmail}<br>Type : ${s.userType === 'exhibitor' ? 'Exposant' : 'Sponsor'}</p>
    </div>
  </div>

  <div class="info-box" style="margin-bottom:20px">
    <h3>Période de location</h3>
    <p>Du <strong>${dateStart}</strong> au <strong>${dateEnd}</strong> — ${s.totalDays} jour${s.totalDays > 1 ? 's' : ''}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Article</th>
        <th class="center">Qté</th>
        <th class="center">Prix unitaire</th>
        <th class="center">Durée</th>
        <th class="right">Montant HT</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <table class="totals">
    <tr>
      <td class="label">Sous-total HT</td>
      <td class="amount">${s.subtotalHT.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</td>
    </tr>
    <tr>
      <td class="label">TVA (20%)</td>
      <td class="amount">${s.tvaAmount.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</td>
    </tr>
    <tr class="total-row">
      <td class="label">Total TTC</td>
      <td class="amount">${s.totalTTC.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</td>
    </tr>
  </table>

  <div class="payment-info">
    <p>
      <strong>Mode de paiement :</strong> ${methodLabel}<br>
      <strong>Référence transaction :</strong> ${s.paymentRef}<br>
      <strong>Numéro de facture :</strong> ${s.invoiceNumber}
    </p>
  </div>

  <div class="footer">
    ${cfg.footer_text}
  </div>
</body>
</html>`;
}

export default function RentalPaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const state = location.state as SuccessState | null;
  const { t } = useTranslation();

  if (!state?.invoiceNumber) {
    navigate(ROUTES.HOME, { replace: true });
    return null;
  }

  const { invoiceNumber, paymentRef, paymentMethod, cartItems, subtotalHT,
    tvaAmount, totalTTC, totalDays, rentalStart, rentalEnd,
    dashboardRoute, userName } = state;

  const isPaid = paymentMethod === 'paypal';
  const dateStart = new Date(rentalStart + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const dateEnd = new Date(rentalEnd + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrintInvoice = async () => {
    const logoUrl = `${window.location.origin}/logo-sib2026.png`;
    const cfg = await loadInvoiceConfig();
    const html = buildInvoicePrintHtml(state, logoUrl, cfg);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 pb-16 px-4">
      <div className="w-full max-w-lg">
        {/* Icône succès */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          {isPaid ? (
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="h-10 w-10 text-amber-600" />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Titre */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isPaid ? t('rentalSuccess.payment_confirmed') : t('rentalSuccess.order_registered')}
            </h1>
            <p className="text-gray-500 text-sm">
              {isPaid
                ? `${t('rentalSuccess.thanks_paypal_pre')} ${userName} ${t('rentalSuccess.thanks_paypal_post')}`
                : `${t('rentalSuccess.thanks_cmi_pre')} ${userName} ${t('rentalSuccess.thanks_cmi_post')}`}
            </p>
          </div>

          {/* Carte récap */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            {/* Numéro facture */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50 mb-4">
              <div className={`p-2 rounded-lg ${isPaid ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <Hash className={`h-5 w-5 ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <div className="text-xs text-gray-400">{t('rentalSuccess.invoice_number')}</div>
                <div className="font-bold text-gray-900 font-mono text-sm">{invoiceNumber}</div>
              </div>
              <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${
                isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {isPaid ? t('rentalSuccess.paid') : t('rentalSuccess.pending')}
              </span>
            </div>

            {/* Période */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{dateStart} → {dateEnd}</span>
              <span className="text-gray-400">·</span>
              <span className="font-medium text-emerald-700">{totalDays} jour{totalDays > 1 ? 's' : ''}</span>
            </div>

            {/* Articles */}
            <div className="space-y-2 mb-4">
              {cartItems.map(ci => (
                <div key={ci.id} className="flex items-center gap-2 text-sm">
                  <Package className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-700 flex-1 truncate">{ci.name} × {ci.quantity}</span>
                  <span className="text-gray-900 font-medium">
                    {(ci.price_per_day * ci.quantity * totalDays).toLocaleString('fr-MA')} MAD
                  </span>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{t('checkout.subtotal_ht')}</span>
                <span>{subtotalHT.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{t('checkout.tva')}</span>
                <span>{tvaAmount.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>{t('checkout.total_ttc')}</span>
                <span className="text-emerald-700">
                  {totalTTC.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
                </span>
              </div>
            </div>

            {/* Mode de paiement */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500">
              <CreditCard className="h-3.5 w-3.5 text-gray-400" />
              <span>{paymentMethod === 'paypal' ? 'PayPal' : 'CMI / Carte bancaire marocaine'}</span>
              <span className="text-gray-300">·</span>
              <span className="font-mono text-gray-400 truncate">{paymentRef}</span>
            </div>
          </div>

          {/* Email note */}
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white rounded-xl border border-gray-100 px-4 py-3 mb-4">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{t('rentalSuccess.email_sent')}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePrintInvoice}
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition"
            >
              <Download className="h-4 w-4" />
              {t('rentalSuccess.download_invoice')}
            </button>

            <Link
              to={dashboardRoute}
              className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-3 rounded-xl font-semibold text-sm transition"
            >
              <Home className="h-4 w-4" />
              {t('common.back_dashboard')}
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
