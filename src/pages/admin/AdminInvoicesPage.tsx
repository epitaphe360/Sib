import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Download, Plus, X, Search, Loader2,
  CheckCircle2, XCircle, ArrowLeft, RefreshCw, Trash2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';
import { Link } from 'react-router-dom';
import {
  fetchInvoices,
  createInvoice,
  cancelInvoice,
  downloadInvoicePDF,
  type Invoice,
  type UserType,
  type CreateInvoicePayload,
} from '../../services/invoiceService';

// ── Types locaux ─────────────────────────────────────────────────────────────

interface LineForm {
  description: string;
  quantity: number;
  unit_price: number;
}

const EMPTY_LINE: LineForm = { description: '', quantity: 1, unit_price: 0 };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  issued:    { label: 'Émise',    color: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Annulée', color: 'bg-red-50 text-red-700 border-red-200' },
};

const USER_TYPE_LABELS: Record<string, string> = {
  visitor:   'Visiteur VIP',
  exhibitor: 'Exposant',
  partner:   'Partenaire',
};

const USER_TYPE_COLORS: Record<string, string> = {
  visitor:   'bg-purple-50 text-purple-700 border-purple-200',
  exhibitor: 'bg-blue-50 text-blue-700 border-blue-200',
  partner:   'bg-amber-50 text-amber-700 border-amber-200',
};

// ── Composant principal ───────────────────────────────────────────────────────

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modale création
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState<UserType>('visitor');
  const [vatRate, setVatRate] = useState(0);
  const [currency, setCurrency] = useState('EUR');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineForm[]>([{ ...EMPTY_LINE }]);

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInvoices();
      setInvoices(data);
    } catch {
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // ── Filtres ────────────────────────────────────────────────────────────────

  const filtered = invoices.filter(inv => {
    if (filterType !== 'all' && inv.user_type !== filterType) return false;
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.user_email.toLowerCase().includes(q) ||
        (inv.user_name ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Création ───────────────────────────────────────────────────────────────

  const resetCreateForm = () => {
    setUserEmail('');
    setUserName('');
    setUserType('visitor');
    setVatRate(0);
    setCurrency('EUR');
    setNotes('');
    setLines([{ ...EMPTY_LINE }]);
  };

  const handleCreate = async () => {
    if (!userEmail.trim()) { toast.error('Email requis'); return; }
    if (lines.some(l => !l.description.trim() || l.unit_price <= 0)) {
      toast.error('Toutes les lignes doivent avoir une description et un prix > 0');
      return;
    }

    setCreating(true);
    try {
      // Résoudre l'user_id depuis l'email
      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail.toLowerCase().trim())
        .maybeSingle();

      if (userErr || !userRow) {
        toast.error('Utilisateur introuvable avec cet email');
        setCreating(false);
        return;
      }

      const payload: CreateInvoicePayload = {
        user_id: userRow.id,
        user_type: userType,
        user_email: userEmail.toLowerCase().trim(),
        user_name: userName.trim() || undefined,
        vat_rate: vatRate,
        currency,
        notes: notes.trim() || undefined,
        lines: lines.map(l => ({
          description: l.description.trim(),
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
      };

      await createInvoice(payload);
      toast.success('Facture créée avec succès');
      setShowCreate(false);
      resetCreateForm();
      loadInvoices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur création facture';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  // ── Annulation ─────────────────────────────────────────────────────────────

  const handleCancel = async (inv: Invoice) => {
    if (!confirm(`Annuler la facture ${inv.invoice_number} ?`)) return;
    setCancellingId(inv.id);
    try {
      await cancelInvoice(inv.id);
      toast.success('Facture annulée');
      loadInvoices();
    } catch {
      toast.error('Erreur lors de l\'annulation');
    } finally {
      setCancellingId(null);
    }
  };

  // ── Lignes de la modale ────────────────────────────────────────────────────

  const updateLine = (i: number, field: keyof LineForm, value: string | number) => {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  };

  const addLine = () => setLines(prev => [...prev, { ...EMPTY_LINE }]);
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i));

  const totalHt = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
  const totalVat = totalHt * vatRate / 100;
  const totalTtc = totalHt + totalVat;

  // ── Rendu ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={ROUTES.ADMIN_DASHBOARD} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Facturation</h1>
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {invoices.length} facture{invoices.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadInvoices} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Actualiser">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Nouvelle facture
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtres */}
        <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher n° facture, email, nom..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous profils</option>
            <option value="visitor">Visiteur VIP</option>
            <option value="exhibitor">Exposant</option>
            <option value="partner">Partenaire</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous statuts</option>
            <option value="issued">Émises</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Aucune facture trouvée</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">N° Facture</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Client</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Profil</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-semibold">Montant TTC</th>
                  <th className="text-center px-4 py-3 text-gray-600 font-semibold">Statut</th>
                  <th className="text-center px-4 py-3 text-gray-600 font-semibold">Date</th>
                  <th className="text-center px-4 py-3 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{inv.user_name ?? '—'}</div>
                      <div className="text-xs text-gray-500">{inv.user_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${USER_TYPE_COLORS[inv.user_type]}`}>
                        {USER_TYPE_LABELS[inv.user_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {inv.amount_ttc.toFixed(2)} {inv.currency.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_LABELS[inv.status]?.color}`}>
                        {inv.status === 'issued' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {STATUS_LABELS[inv.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {new Date(inv.issued_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => downloadInvoicePDF(inv)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {inv.status === 'issued' && (
                          <button
                            onClick={() => handleCancel(inv)}
                            disabled={cancellingId === inv.id}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Annuler la facture"
                          >
                            {cancellingId === inv.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modale création facture ─────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">Nouvelle facture</h2>
              <button onClick={() => { setShowCreate(false); resetCreateForm(); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Infos client */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email client *</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    placeholder="client@exemple.com"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom / Société</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="Nom ou société"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profil *</label>
                  <select
                    value={userType}
                    onChange={e => setUserType(e.target.value as UserType)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="visitor">Visiteur VIP</option>
                    <option value="exhibitor">Exposant</option>
                    <option value="partner">Partenaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EUR">EUR</option>
                    <option value="MAD">MAD</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TVA (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={vatRate}
                    onChange={e => setVatRate(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Lignes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Lignes de facturation *</label>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((line, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={line.description}
                        onChange={e => updateLine(i, 'description', e.target.value)}
                        placeholder="Description"
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={line.quantity}
                        onChange={e => updateLine(i, 'quantity', parseFloat(e.target.value) || 1)}
                        className="w-16 border rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Quantité"
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={line.unit_price}
                        onChange={e => updateLine(i, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-28 border rounded-lg px-2 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Prix unitaire"
                        placeholder="P.U."
                      />
                      <div className="w-28 px-2 py-2 text-sm text-right text-gray-600 font-medium bg-gray-50 border rounded-lg">
                        {(line.quantity * line.unit_price).toFixed(2)}
                      </div>
                      {lines.length > 1 && (
                        <button type="button" onClick={() => removeLine(i)} className="p-2 text-red-400 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totaux */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total HT</span>
                  <span>{totalHt.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>TVA ({vatRate}%)</span>
                  <span>{totalVat.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-700 text-base border-t pt-1.5">
                  <span>Total TTC</span>
                  <span>{totalTtc.toFixed(2)} {currency}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notes ou informations complémentaires..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button
                onClick={() => { setShowCreate(false); resetCreateForm(); }}
                className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {creating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</>
                  : <><FileText className="w-4 h-4" /> Créer la facture</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
