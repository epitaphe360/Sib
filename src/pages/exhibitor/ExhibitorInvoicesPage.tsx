import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
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

export default function ExhibitorInvoicesPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-3">
          <Link to={ROUTES.EXHIBITOR_DASHBOARD} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mes Factures</h1>
            <p className="text-sm text-gray-500">Historique de vos factures SIB 2026</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border p-16 text-center">
            <FileText className="w-14 h-14 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold text-gray-600">Aucune facture</p>
            <p className="text-sm text-gray-400 mt-1">
              Vos factures apparaîtront ici une fois générées par l'administration.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map(inv => (
              <div
                key={inv.id}
                className="bg-white rounded-2xl border hover:shadow-md transition-shadow p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700 text-sm">
                        {inv.invoice_number}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[inv.status]?.color}`}>
                        {STATUS_CONFIG[inv.status]?.icon}
                        {STATUS_CONFIG[inv.status]?.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(inv.issued_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                    {inv.invoice_lines && inv.invoice_lines.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {inv.invoice_lines.map(line => (
                          <p key={line.id} className="text-xs text-gray-500">
                            {line.description} — {line.quantity} × {line.unit_price.toFixed(2)} {inv.currency.toUpperCase()}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {inv.amount_ttc.toFixed(2)} {inv.currency.toUpperCase()}
                    </p>
                    {inv.vat_rate > 0 && (
                      <p className="text-xs text-gray-400">
                        dont TVA {inv.vat_rate}%: {inv.vat_amount.toFixed(2)} {inv.currency.toUpperCase()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => downloadInvoicePDF(inv)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info contact admin */}
        <div className="mt-8 bg-blue-50 rounded-2xl border border-blue-100 p-5 text-sm text-blue-700">
          <p className="font-semibold mb-1">Une facture manquante ?</p>
          <p>
            Si vous ne trouvez pas une facture attendue, contactez l'équipe SIB 2026 à{' '}
            <a href="mailto:Sib2026@urbacom.net" className="underline font-medium">
              Sib2026@urbacom.net
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
