import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, ArrowLeft, Loader2, CheckCircle2, XCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import {
  fetchInvoices,
  downloadInvoicePDF,
  type Invoice,
} from '../../services/invoiceService';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  issued: {
    label: 'Émise',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: 'Annulée',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

export default function VisitorInvoicesPage() {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvoices = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchInvoices(user.id);
      setInvoices(data);
    } catch {
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const vipInvoice = invoices.find(inv => inv.status === 'issued');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <Link to={ROUTES.VISITOR_DASHBOARD} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <FileText className="w-6 h-6 text-purple-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ma Facture</h1>
            <p className="text-sm text-gray-500">Pass Premium VIP — SIB 2026</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Bannière Pass VIP */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Pass Premium VIP</h2>
            <p className="text-purple-100 text-sm">
              Salon International du Bâtiment — 25-29 Novembre 2026, El Jadida
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-black">700,00 EUR</p>
            <p className="text-purple-200 text-xs">Accès 5 jours All Inclusive</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-600">Aucune facture disponible</p>
            <p className="text-sm text-gray-400 mt-1">
              Votre facture sera générée après validation de votre paiement.
            </p>
            <Link
              to={ROUTES.VISITOR_PAYMENT}
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Procéder au paiement
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map(inv => (
              <div
                key={inv.id}
                className="bg-white rounded-2xl border hover:shadow-md transition-shadow p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-700 text-sm">
                        {inv.invoice_number}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[inv.status]?.color}`}>
                        {STATUS_CONFIG[inv.status]?.icon}
                        {STATUS_CONFIG[inv.status]?.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Émise le {new Date(inv.issued_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                    {inv.invoice_lines && inv.invoice_lines.map(line => (
                      <p key={line.id} className="text-xs text-gray-500 mt-0.5">
                        {line.description}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-700">
                      {inv.amount_ttc.toFixed(2)} {inv.currency.toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadInvoicePDF(inv)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lien paiement si pas de facture active */}
        {!loading && !vipInvoice && invoices.length > 0 && (
          <div className="mt-6 bg-purple-50 rounded-2xl border border-purple-100 p-5 text-sm text-purple-700 text-center">
            <p className="font-semibold mb-2">Votre paiement Pass VIP n'a pas encore été validé</p>
            <Link
              to={ROUTES.VISITOR_PAYMENT}
              className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Voir les options de paiement
            </Link>
          </div>
        )}

        {/* Contact */}
        <div className="mt-8 bg-gray-50 rounded-2xl border p-5 text-sm text-gray-600">
          <p className="font-semibold mb-1">Besoin d'aide ?</p>
          <p>
            Pour toute question concernant votre facture, contactez-nous à{' '}
            <a href="mailto:Sib2026@urbacom.net" className="underline font-medium text-purple-600">
              Sib2026@urbacom.net
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
