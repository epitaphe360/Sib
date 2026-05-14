import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, ArrowLeft, Search, Send, RefreshCw,
  Phone, Eye, CheckCircle, Clock, AlertCircle,
  Loader2, Filter, Download, Printer,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';
import { CataloguePagePrint } from '../../components/catalogue/CataloguePagePrint';
import type { CatalogueEntry } from '../../components/catalogue/CatalogueFicheCard';

type FilterStatus = 'all' | 'not_sent' | 'invited' | 'in_progress' | 'completed' | 'validated';
type ActiveTab = 'list' | 'phone' | 'print';
type SortField = 'company_name' | 'completion_percent' | 'last_reminder_at' | 'status';

const STATUS_LABEL: Record<string, string> = {
  not_sent: 'Non envoyé',
  invited: 'Invité',
  in_progress: 'En cours',
  completed: 'Complété',
  validated: 'Validé',
};

const STATUS_COLORS: Record<string, string> = {
  not_sent: 'bg-gray-100 text-gray-600',
  invited: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  completed: 'bg-green-50 text-green-700',
  validated: 'bg-emerald-100 text-emerald-800',
};

const COMPLETION_COLOR = (pct: number) =>
  pct >= 80 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';

function daysSince(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

/** Entrées qui ont besoin d'une relance téléphonique */
function needsPhoneCall(entry: CatalogueEntry): boolean {
  const days = daysSince(entry.last_reminder_at || entry.invited_at);
  return (
    (entry.status === 'invited' || entry.status === 'in_progress') &&
    entry.reminder_count >= 2 &&
    (days === null || days >= 14)
  );
}

/** Entrées éligibles à une relance email automatique */
function eligibleForReminder(entry: CatalogueEntry): boolean {
  if (entry.status === 'completed' || entry.status === 'validated') return false;
  const days = daysSince(entry.last_reminder_at || entry.invited_at);
  return days === null || days >= 7;
}

export default function CatalogueManagementPage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<CatalogueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCompletion, setFilterCompletion] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [sortField, setSortField] = useState<SortField>('company_name');
  const [sortAsc, setSortAsc] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ company_name: '', contact_email: '', stand_number: '', hall: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [batchSending, setBatchSending] = useState(false);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await (supabase as any)
      .from('catalogue_entries')
      .select('*')
      .order('company_name', { ascending: true });

    if (error) {
      toast.error('Erreur chargement catalogue : ' + error.message);
    } else {
      setEntries((data || []) as CatalogueEntry[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // ─── FILTRES & TRI ──────────────────────────────────────────────
  const filtered = entries
    .filter((e) => {
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      if (filterCompletion === 'low' && e.completion_percent >= 25) return false;
      if (filterCompletion === 'mid' && (e.completion_percent < 25 || e.completion_percent > 75)) return false;
      if (filterCompletion === 'high' && e.completion_percent <= 75) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (e.company_name || '').toLowerCase().includes(q) ||
          (e.contact_email || '').toLowerCase().includes(q) ||
          (e.stand_number || '').toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let va: string | number = a[sortField] as string | number ?? '';
      let vb: string | number = b[sortField] as string | number ?? '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const phoneList = entries.filter(needsPhoneCall);

  // ─── KPIs ────────────────────────────────────────────────────────
  const kpis = {
    total: entries.length,
    validated: entries.filter((e) => e.status === 'validated').length,
    completed: entries.filter((e) => e.status === 'completed').length,
    in_progress: entries.filter((e) => e.status === 'in_progress').length,
    not_sent: entries.filter((e) => e.status === 'not_sent').length,
    avg_completion: entries.length
      ? Math.round(entries.reduce((s, e) => s + e.completion_percent, 0) / entries.length)
      : 0,
  };

  // ─── ACTIONS ────────────────────────────────────────────────────
  const handleSendInvitation = async (entry: CatalogueEntry, type: 'initial' | 'reminder_1' | 'reminder_2' | 'manual') => {
    setSendingId(entry.id);
    try {
      const { error } = await supabase.functions.invoke('send-catalogue-invitation', {
        body: { catalogue_entry_id: entry.id, type, sent_by: user?.id },
      });
      if (error) throw error;
      toast.success(`Email envoyé à ${entry.contact_email}`);
      fetchEntries();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur envoi email');
    } finally {
      setSendingId(null);
    }
  };

  const handleValidate = async (entry: CatalogueEntry) => {
    setValidatingId(entry.id);
    try {
      const { error } = await (supabase as any)
        .from('catalogue_entries')
        .update({ status: 'validated', validated_at: new Date().toISOString(), validated_by: user?.id })
        .eq('id', entry.id);
      if (error) throw error;
      toast.success(`Fiche validée : ${entry.company_name}`);
      fetchEntries();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur validation');
    } finally {
      setValidatingId(null);
    }
  };

  const handleMarkPhoneContacted = async (entry: CatalogueEntry) => {
    const note = window.prompt(`Note pour ${entry.company_name} :`, '');
    if (note === null) return;
    await (supabase as any)
      .from('catalogue_entries')
      .update({ last_phone_contact_at: new Date().toISOString(), phone_contact_note: note || 'Contacté' })
      .eq('id', entry.id);
    await (supabase as any).from('catalogue_reminders_log').insert({
      catalogue_entry_id: entry.id,
      reminder_type: 'phone',
      sent_by: user?.id,
      note: note || 'Contacté par téléphone',
    });
    toast.success('Contact téléphonique enregistré');
    fetchEntries();
  };

  const handleBatchReminders = async () => {
    const eligible = entries.filter(eligibleForReminder);
    if (eligible.length === 0) { toast.info('Aucune relance à envoyer'); return; }
    setBatchSending(true);
    let sent = 0;
    for (const e of eligible) {
      const type = e.reminder_count === 0 ? 'initial'
        : e.reminder_count === 1 ? 'reminder_1'
        : 'reminder_2';
      try {
        await supabase.functions.invoke('send-catalogue-invitation', {
          body: { catalogue_entry_id: e.id, type, sent_by: user?.id },
        });
        sent++;
      } catch {
        // continuer
      }
    }
    setBatchSending(false);
    toast.success(`${sent} relance${sent > 1 ? 's' : ''} envoyée${sent > 1 ? 's' : ''}`);
    fetchEntries();
  };

  const handleCreateEntry = async () => {
    if (!newEntry.company_name || !newEntry.contact_email) {
      toast.error('Raison sociale et email requis');
      return;
    }
    setIsCreating(true);
    const { error } = await (supabase as any).from('catalogue_entries').insert({
      company_name: newEntry.company_name,
      contact_email: newEntry.contact_email,
      stand_number: newEntry.stand_number || null,
      hall: newEntry.hall || null,
    });
    if (error) { toast.error(error.message); }
    else {
      toast.success('Fiche créée');
      setShowCreateModal(false);
      setNewEntry({ company_name: '', contact_email: '', stand_number: '', hall: '' });
      fetchEntries();
    }
    setIsCreating(false);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
      : null;

  // ─── RENDER ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Tableau de bord admin
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#0B1C3D] p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catalogue Exposants</h1>
              <p className="text-sm text-gray-500">SIB 2026 — Gestion des fiches catalogue</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-[#0B1C3D] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3060] transition"
            >
              + Nouvelle fiche
            </button>
            <button
              onClick={handleBatchReminders}
              disabled={batchSending}
              className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50"
            >
              {batchSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Relances auto
            </button>
            <button
              onClick={() => { setActiveTab('print'); setTimeout(() => window.print(), 300); }}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
            >
              <Printer className="h-4 w-4" /> Imprimer catalogue
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', value: kpis.total, color: 'bg-slate-700' },
            { label: 'Validées', value: kpis.validated, color: 'bg-emerald-600' },
            { label: 'Complétées', value: kpis.completed, color: 'bg-green-500' },
            { label: 'En cours', value: kpis.in_progress, color: 'bg-amber-500' },
            { label: 'Non envoyées', value: kpis.not_sent, color: 'bg-red-500' },
          ].map((k) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${k.color} mb-2`}>
                <span className="text-white text-sm font-bold">{k.value}</span>
              </div>
              <div className="text-xs text-gray-500">{k.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Progression globale */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Progression moyenne du catalogue</span>
            <span className="font-bold text-[#0B1C3D]">{kpis.avg_completion}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${kpis.avg_completion}%`, background: COMPLETION_COLOR(kpis.avg_completion) }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {([
            { id: 'list', label: 'Liste', icon: Filter },
            { id: 'phone', label: `Relances tél. (${phoneList.length})`, icon: Phone },
            { id: 'print', label: 'Impression PDF', icon: Printer },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id ? 'bg-white shadow-sm text-[#0B1C3D]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: LISTE ──────────────────────────────────────────── */}
        {activeTab === 'list' && (
          <>
            {/* Filtres */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-56 focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                />
              </div>

              {(['all', 'not_sent', 'invited', 'in_progress', 'completed', 'validated'] as FilterStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                    filterStatus === s
                      ? 'bg-[#0B1C3D] text-white border-[#0B1C3D]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {s === 'all' ? 'Tous' : STATUS_LABEL[s]}
                </button>
              ))}

              <select
                value={filterCompletion}
                onChange={(e) => setFilterCompletion(e.target.value as any)}
                className="border border-gray-200 rounded-xl text-xs px-3 py-2 focus:outline-none"
              >
                <option value="all">Toutes progressions</option>
                <option value="low">&lt; 25%</option>
                <option value="mid">25 – 75%</option>
                <option value="high">&gt; 75%</option>
              </select>
            </div>

            {/* Tableau */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
                <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucune fiche trouvée</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th
                        className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900"
                        onClick={() => toggleSort('company_name')}
                      >
                        <span className="flex items-center gap-1">Société <SortIcon field="company_name" /></span>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Stand</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                      <th
                        className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900"
                        onClick={() => toggleSort('status')}
                      >
                        <span className="flex items-center gap-1">Statut <SortIcon field="status" /></span>
                      </th>
                      <th
                        className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900"
                        onClick={() => toggleSort('completion_percent')}
                      >
                        <span className="flex items-center gap-1">Progression <SortIcon field="completion_percent" /></span>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Dernier contact</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry) => {
                      const days = daysSince(entry.last_reminder_at || entry.invited_at);
                      const needsPhone = needsPhoneCall(entry);
                      return (
                        <tr key={entry.id} className={`border-b border-gray-50 hover:bg-gray-50 ${needsPhone ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">{entry.company_name || <span className="text-gray-400">—</span>}</span>
                            {needsPhone && (
                              <span className="ml-2 text-xs text-red-600 font-semibold">📞 Appel requis</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {entry.stand_number && `Stand ${entry.stand_number}`}
                            {entry.hall && ` — Hall ${entry.hall}`}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[160px]">
                            {entry.contact_email}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[entry.status]}`}>
                              {STATUS_LABEL[entry.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${entry.completion_percent}%`,
                                    background: COMPLETION_COLOR(entry.completion_percent),
                                  }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-600">{entry.completion_percent}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {days !== null ? `Il y a ${days}j` : '—'}
                            {entry.reminder_count > 0 && (
                              <span className="ml-1 text-gray-400">({entry.reminder_count} envoi{entry.reminder_count > 1 ? 's' : ''})</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {entry.status === 'not_sent' && (
                                <button
                                  onClick={() => handleSendInvitation(entry, 'initial')}
                                  disabled={sendingId === entry.id}
                                  title="Envoyer invitation"
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                                >
                                  {sendingId === entry.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                </button>
                              )}
                              {(entry.status === 'invited' || entry.status === 'in_progress') && (
                                <button
                                  onClick={() => handleSendInvitation(entry, entry.reminder_count === 1 ? 'reminder_1' : 'reminder_2')}
                                  disabled={sendingId === entry.id}
                                  title="Envoyer relance"
                                  className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-50"
                                >
                                  {sendingId === entry.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                </button>
                              )}
                              {entry.status === 'completed' && (
                                <button
                                  onClick={() => handleValidate(entry)}
                                  disabled={validatingId === entry.id}
                                  title="Valider la fiche"
                                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50"
                                >
                                  {validatingId === entry.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                </button>
                              )}
                              <a
                                href={`/catalogue/fill/${entry.token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Voir le formulaire"
                                className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── TAB: RELANCES TÉLÉPHONIQUES ─────────────────────────── */}
        {activeTab === 'phone' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-gray-800">
                {phoneList.length} exposant{phoneList.length > 1 ? 's' : ''} à contacter par téléphone
              </span>
              <span className="text-xs text-gray-400 ml-2">
                (≥ 2 emails envoyés, aucune réponse depuis 14 jours)
              </span>
            </div>

            {phoneList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
                <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune relance téléphonique nécessaire</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-red-50 border-b border-red-100">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Société</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Contact</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Téléphone</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">%</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Dernière relance</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phoneList.map((entry) => {
                      const days = daysSince(entry.last_reminder_at);
                      return (
                        <tr key={entry.id} className="border-b border-gray-50 hover:bg-red-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{entry.company_name || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{entry.contact_name || '—'}</td>
                          <td className="px-4 py-3 font-mono text-blue-700">
                            {entry.phone ? (
                              <a href={`tel:${entry.phone}`} className="hover:underline">{entry.phone}</a>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold" style={{ color: COMPLETION_COLOR(entry.completion_percent) }}>
                              {entry.completion_percent}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {days !== null ? `Il y a ${days}j` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleMarkPhoneContacted(entry)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition ml-auto"
                            >
                              <Phone className="h-3.5 w-3.5" /> Contacté
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: IMPRESSION ─────────────────────────────────────── */}
        {activeTab === 'print' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Download className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-800">
                Catalogue imprimable — {entries.filter((e) => e.status === 'validated' || e.status === 'completed').length} fiches validées/complétées
              </span>
              <button
                onClick={() => window.print()}
                className="ml-auto flex items-center gap-2 bg-[#0B1C3D] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3060]"
              >
                <Printer className="h-4 w-4" /> Lancer l'impression
              </button>
            </div>
            <CataloguePagePrint
              entries={entries.filter((e) => e.status === 'validated' || e.status === 'completed')}
              title="Catalogue Officiel Exposants SIB 2026"
            />
          </div>
        )}

      </div>

      {/* ── MODAL CRÉATION ──────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nouvelle fiche catalogue</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raison sociale *</label>
                <input
                  type="text"
                  value={newEntry.company_name}
                  onChange={(e) => setNewEntry({ ...newEntry, company_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email contact *</label>
                <input
                  type="email"
                  value={newEntry.contact_email}
                  onChange={(e) => setNewEntry({ ...newEntry, contact_email: e.target.value })}
                  placeholder="Destinataire du lien formulaire"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stand</label>
                  <input
                    type="text"
                    value={newEntry.stand_number}
                    onChange={(e) => setNewEntry({ ...newEntry, stand_number: e.target.value })}
                    placeholder="17a"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hall</label>
                  <select
                    value={newEntry.hall}
                    onChange={(e) => setNewEntry({ ...newEntry, hall: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                  >
                    <option value="">—</option>
                    {['A', 'B', 'C', 'D', 'Plein air'].map((h) => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateEntry}
                disabled={isCreating}
                className="flex-1 bg-[#0B1C3D] text-white rounded-lg py-2 text-sm font-bold hover:bg-[#1a3060] disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Créer & Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
