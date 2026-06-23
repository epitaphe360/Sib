import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Download, Plus, X, Search, Loader2,
  CheckCircle2, XCircle, ArrowLeft, RefreshCw, Trash2,
  TrendingUp, CreditCard, AlertCircle, ChevronDown, ChevronUp,
  Receipt, Filter, FileDown,
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  issued:    { label: 'Émise',    color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Annulée', color: 'text-red-700',     bg: 'bg-red-50 border-red-200',         icon: <XCircle className="w-3.5 h-3.5" /> },
};

const PROFILE_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  visitor:   { label: 'Visiteur VIP', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  exhibitor: { label: 'Exposant',     color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  partner:   { label: 'Partenaire',   color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
};

// ── Utilitaires ───────────────────────────────────────────────────────────────

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' ' + currency.toUpperCase();
}

function exportCSV(invoices: Invoice[]) {
  const headers = ['N° Facture', 'Client', 'Email', 'Profil', 'Montant HT', 'TVA %', 'Montant TTC', 'Devise', 'Statut', 'Date'];
  const rows = invoices.map(inv => [
    inv.invoice_number,
    inv.user_name ?? '',
    inv.user_email,
    PROFILE_CONFIG[inv.user_type]?.label ?? inv.user_type,
    inv.amount_ht.toFixed(2),
    inv.vat_rate.toString(),
    inv.amount_ttc.toFixed(2),
    inv.currency.toUpperCase(),
    STATUS_CONFIG[inv.status]?.label ?? inv.status,
    new Date(inv.issued_at).toLocaleDateString('fr-FR'),
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `factures_sib_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modale création
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState<UserType>('visitor');
  const [vatRate, setVatRate] = useState(0);
  const [currency, setCurrency] = useState('MAD');
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

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = {
    total: invoices.length,
    issued: invoices.filter(i => i.status === 'issued').length,
    cancelled: invoices.filter(i => i.status === 'cancelled').length,
    totalTtc: invoices.filter(i => i.status === 'issued').reduce((s, i) => s + i.amount_ttc, 0),
  };

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

  const updateLine = (i: number, field: keyof LineForm, value: string | number) =>
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));

  const addLine = () => setLines(prev => [...prev, { ...EMPTY_LINE }]);
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i));

  const totalHt  = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);
  const totalVat = totalHt * vatRate / 100;
  const totalTtc = totalHt + totalVat;

  // ── Rendu ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to={ROUTES.ADMIN_DASHBOARD} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/30">
                  <Receipt className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight">Facturation</h1>
                  <p className="text-blue-200/60 text-sm">Gestion des factures SIB 2026</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadInvoices} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors" title="Actualiser">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => exportCSV(filtered)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold"
                title="Exporter CSV"
              >
                <FileDown className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/30"
              >
                <Plus className="w-4 h-4" />
                Nouvelle facture
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {([
              { label: 'Total factures', value: stats.total, icon: <FileText className="w-5 h-5" />, color: 'blue' },
              { label: 'Factures émises', value: stats.issued, icon: <CheckCircle2 className="w-5 h-5" />, color: 'emerald' },
              { label: 'Annulées', value: stats.cancelled, icon: <XCircle className="w-5 h-5" />, color: 'red' },
              { label: 'CA total (émises)', value: fmt(stats.totalTtc, 'MAD'), icon: <TrendingUp className="w-5 h-5" />, color: 'amber' },
            ] as const).map(s => (
              <div key={s.label} className="bg-white/8 border border-white/10 backdrop-blur rounded-2xl p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${
                  s.color === 'blue'    ? 'bg-blue-500/20 text-blue-300' :
                  s.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300' :
                  s.color === 'red'     ? 'bg-red-500/20 text-red-300' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-0.5">{s.label}</div>
                  <div className="text-xl font-black text-white leading-none">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ── Barre de filtres ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-widest">Filtres</span>
          </div>
          <div className="w-px h-6 bg-gray-200" />

          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="N° facture, email, nom..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous profils</option>
            <option value="visitor">Visiteur VIP</option>
            <option value="exhibitor">Exposant</option>
            <option value="partner">Partenaire</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous statuts</option>
            <option value="issued">Émises</option>
            <option value="cancelled">Annulées</option>
          </select>

          {(search || filterType !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterType('all'); setFilterStatus('all'); }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-600 font-semibold hover:bg-red-50 rounded-xl border border-red-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}

          <div className="ml-auto text-xs text-gray-400 font-semibold">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-sm text-gray-400 font-medium">Chargement des factures...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-800 font-bold text-lg mb-1">Aucune facture trouvée</p>
            <p className="text-gray-400 text-sm">Modifiez vos filtres ou créez une nouvelle facture.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="w-8 px-4 py-3.5" />
                  <th className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">N° Facture</th>
                  <th className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Profil</th>
                  <th className="text-right px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Montant HT</th>
                  <th className="text-right px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">TTC</th>
                  <th className="text-center px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Statut</th>
                  <th className="text-center px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Date</th>
                  <th className="text-center px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const isExpanded = expandedId === inv.id;
                  const statusConf  = STATUS_CONFIG[inv.status];
                  const profileConf = PROFILE_CONFIG[inv.user_type];
                  return (
                    <React.Fragment key={inv.id}>
                      <tr
                        className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/20' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                      >
                        <td className="px-4 py-3.5 text-gray-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg text-xs">
                            {inv.invoice_number}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-gray-900">
                            {inv.user_name ?? <span className="text-gray-400 italic text-xs">Sans nom</span>}
                          </div>
                          <div className="text-xs text-gray-400">{inv.user_email}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${profileConf.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${profileConf.dot}`} />
                            {profileConf.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-gray-600 font-medium">
                          {fmt(inv.amount_ht, inv.currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-gray-900">
                          {fmt(inv.amount_ttc, inv.currency)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConf.bg} ${statusConf.color}`}>
                            {statusConf.icon}
                            {statusConf.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="text-xs font-semibold text-gray-700">
                            {new Date(inv.issued_at).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(inv.issued_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => downloadInvoicePDF(inv)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                              title="Télécharger PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {inv.status === 'issued' && (
                              <button
                                onClick={() => handleCancel(inv)}
                                disabled={cancellingId === inv.id}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40"
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

                      {/* Ligne de détail */}
                      {isExpanded && (
                        <tr className="bg-blue-50/30">
                          <td colSpan={9} className="px-8 py-4">
                            <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                              <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-bold text-blue-800">Détail des lignes</span>
                              </div>
                              {inv.invoice_lines && inv.invoice_lines.length > 0 ? (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-gray-500 font-semibold border-b border-gray-100">
                                      <th className="text-left px-4 py-2.5">Description</th>
                                      <th className="text-right px-4 py-2.5 w-20">Qté</th>
                                      <th className="text-right px-4 py-2.5 w-32">Prix unitaire</th>
                                      <th className="text-right px-4 py-2.5 w-32">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {inv.invoice_lines.map(line => (
                                      <tr key={line.id} className="border-b border-gray-50">
                                        <td className="px-4 py-2.5 text-gray-800">{line.description}</td>
                                        <td className="px-4 py-2.5 text-right text-gray-600">{line.quantity}</td>
                                        <td className="px-4 py-2.5 text-right text-gray-600">{fmt(line.unit_price, inv.currency)}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{fmt(line.line_total, inv.currency)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-gray-50 text-sm">
                                    <tr>
                                      <td colSpan={3} className="px-4 py-2.5 text-right text-gray-500 font-medium">Sous-total HT</td>
                                      <td className="px-4 py-2.5 text-right font-semibold text-gray-700">{fmt(inv.amount_ht, inv.currency)}</td>
                                    </tr>
                                    {inv.vat_rate > 0 && (
                                      <tr>
                                        <td colSpan={3} className="px-4 py-2.5 text-right text-gray-500 font-medium">TVA ({inv.vat_rate}%)</td>
                                        <td className="px-4 py-2.5 text-right font-semibold text-gray-700">{fmt(inv.vat_amount, inv.currency)}</td>
                                      </tr>
                                    )}
                                    <tr className="border-t border-gray-200">
                                      <td colSpan={3} className="px-4 py-2.5 text-right font-bold text-blue-800">Total TTC</td>
                                      <td className="px-4 py-2.5 text-right font-black text-blue-700 text-base">{fmt(inv.amount_ttc, inv.currency)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              ) : (
                                <div className="px-4 py-4 text-sm text-gray-400 text-center">Aucune ligne disponible</div>
                              )}
                              {inv.notes && (
                                <div className="px-4 py-3 border-t border-gray-100 flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-gray-600 italic">{inv.notes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* ── Modale création facture ─────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* En-tête */}
            <div className="flex items-center justify-between px-6 py-5 border-b sticky top-0 bg-white z-10 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Nouvelle facture</h2>
              </div>
              <button
                onClick={() => { setShowCreate(false); resetCreateForm(); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Infos client */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Informations client</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={e => setUserEmail(e.target.value)}
                      placeholder="client@exemple.com"
                      className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom / Société</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      placeholder="Nom ou société"
                      className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Paramètres */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Paramètres</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profil *</label>
                    <select
                      value={userType}
                      onChange={e => setUserType(e.target.value as UserType)}
                      className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="visitor">Visiteur VIP</option>
                      <option value="exhibitor">Exposant</option>
                      <option value="partner">Partenaire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Devise</label>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MAD">MAD</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">TVA (%)</label>
                    <input
                      type="number" min={0} max={100} step={0.01}
                      value={vatRate}
                      onChange={e => setVatRate(parseFloat(e.target.value) || 0)}
                      className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lignes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lignes de facturation *</p>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_60px_100px_90px_24px] gap-2 px-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Qté</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">P.U.</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Total</span>
                    <span />
                  </div>
                  {lines.map((line, i) => (
                    <div key={i} className="grid grid-cols-[1fr_60px_100px_90px_24px] gap-2 items-center">
                      <input
                        type="text"
                        value={line.description}
                        onChange={e => updateLine(i, 'description', e.target.value)}
                        placeholder="Description"
                        className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      />
                      <input
                        type="number" min={1} step={1}
                        value={line.quantity}
                        onChange={e => updateLine(i, 'quantity', parseFloat(e.target.value) || 1)}
                        className="border rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      />
                      <input
                        type="number" min={0} step={0.01}
                        value={line.unit_price}
                        onChange={e => updateLine(i, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="border rounded-xl px-2 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      />
                      <div className="bg-gray-100 border border-gray-200 rounded-xl px-2 py-2 text-sm text-right font-semibold text-gray-700">
                        {(line.quantity * line.unit_price).toFixed(2)}
                      </div>
                      {lines.length > 1 ? (
                        <button type="button" onClick={() => removeLine(i)} className="p-1 text-red-400 hover:text-red-600 rounded-lg">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ) : <span />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totaux */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total HT</span>
                  <span className="font-medium">{totalHt.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>TVA ({vatRate}%)</span>
                  <span className="font-medium">{totalVat.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-base font-black text-blue-800 border-t border-blue-200 pt-2">
                  <span>Total TTC</span>
                  <span>{totalTtc.toFixed(2)} {currency}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes (optionnel)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notes ou informations complémentaires..."
                  className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => { setShowCreate(false); resetCreateForm(); }}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 border rounded-xl hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-200"
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
