import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, ArrowLeft, Search, Send, RefreshCw,
  Phone, Eye, CheckCircle, AlertCircle,
  Loader2, Filter, Download, Printer,
  ChevronUp, ChevronDown, Building2, Users, Pencil, Settings2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';
import { CataloguePagePrint } from '../../components/catalogue/CataloguePagePrint';
import type { CatalogueEntry } from '../../components/catalogue/CatalogueFicheCard';

type FilterStatus = 'all' | 'not_sent' | 'invited' | 'in_progress' | 'completed' | 'validated';
type FilterSource = 'all' | 'exhibitor' | 'partner';
type ActiveTab = 'list' | 'phone' | 'print';
type SortField = 'company_name' | 'completion_percent' | 'last_reminder_at' | 'status';

interface MergedParticipant {
  /** source ID: exhibitor.id or partner.id */
  id: string;
  source_type: 'exhibitor' | 'partner';
  company_name: string;
  contact_email: string;
  stand_number?: string;
  entry?: CatalogueEntry;
}

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

function pStatus(p: MergedParticipant): string {
  return p.entry?.status ?? 'not_sent';
}

function pCompletion(p: MergedParticipant): number {
  return p.entry?.completion_percent ?? 0;
}

function needsPhoneCall(p: MergedParticipant): boolean {
  if (!p.entry) return false;
  const days = daysSince(p.entry.last_reminder_at || p.entry.invited_at);
  return (
    (p.entry.status === 'invited' || p.entry.status === 'in_progress') &&
    p.entry.reminder_count >= 2 &&
    (days === null || days >= 14)
  );
}

function eligibleForReminder(p: MergedParticipant): boolean {
  if (!p.contact_email) return false;
  if (!p.entry) return true;
  if (p.entry.status === 'completed' || p.entry.status === 'validated') return false;
  const days = daysSince(p.entry.last_reminder_at || p.entry.invited_at);
  return days === null || days >= 7;
}

export default function CatalogueManagementPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<MergedParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterSource, setFilterSource] = useState<FilterSource>('all');
  const [filterCompletion, setFilterCompletion] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [sortField, setSortField] = useState<SortField>('company_name');
  const [sortAsc, setSortAsc] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [batchSending, setBatchSending] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const [exhibitorsRes, partnersRes, entriesRes] = await Promise.all([
      (supabase as any).from('exhibitors').select('id, company_name, stand_number, contact_info').order('company_name'),
      (supabase as any).from('partners').select('id, company_name, contact_info').order('company_name'),
      (supabase as any).from('catalogue_entries').select('*'),
    ]);
    if (exhibitorsRes.error) toast.error('Erreur chargement exposants : ' + exhibitorsRes.error.message);
    if (partnersRes.error) toast.error('Erreur chargement partenaires : ' + partnersRes.error.message);
    if (entriesRes.error) toast.error('Erreur chargement catalogue : ' + entriesRes.error.message);

    const exhibitors: any[] = exhibitorsRes.data || [];
    const partners: any[] = partnersRes.data || [];
    const entries: CatalogueEntry[] = entriesRes.data || [];

    const merged: MergedParticipant[] = [];
    for (const ex of exhibitors) {
      const entry = entries.find((e) => (e as any).exhibitor_id === ex.id);
      merged.push({
        id: ex.id,
        source_type: 'exhibitor',
        company_name: ex.company_name || '',
        contact_email: (ex.contact_info as any)?.email || '',
        stand_number: ex.stand_number || '',
        entry,
      });
    }
    for (const pt of partners) {
      const entry = entries.find((e) => (e as any).partner_id === pt.id);
      merged.push({
        id: pt.id,
        source_type: 'partner',
        company_name: pt.company_name || '',
        contact_email: (pt.contact_info as any)?.email || '',
        entry,
      });
    }
    setParticipants(merged);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── FILTRES & TRI ──────────────────────────────────────────────
  const filtered = participants
    .filter((p) => {
      if (filterSource !== 'all' && p.source_type !== filterSource) return false;
      const st = pStatus(p);
      if (filterStatus !== 'all' && st !== filterStatus) return false;
      const pct = pCompletion(p);
      if (filterCompletion === 'low' && pct >= 25) return false;
      if (filterCompletion === 'mid' && (pct < 25 || pct > 75)) return false;
      if (filterCompletion === 'high' && pct <= 75) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.company_name.toLowerCase().includes(q) ||
          p.contact_email.toLowerCase().includes(q) ||
          (p.stand_number || '').toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      if (sortField === 'company_name') {
        va = a.company_name.toLowerCase();
        vb = b.company_name.toLowerCase();
      } else if (sortField === 'completion_percent') {
        va = pCompletion(a);
        vb = pCompletion(b);
      } else if (sortField === 'status') {
        va = pStatus(a);
        vb = pStatus(b);
      } else {
        va = a.entry?.last_reminder_at ?? '';
        vb = b.entry?.last_reminder_at ?? '';
      }
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const phoneList = participants.filter(needsPhoneCall);

  // ─── KPIs ────────────────────────────────────────────────────────
  const kpis = {
    total: participants.length,
    validated: participants.filter((p) => pStatus(p) === 'validated').length,
    completed: participants.filter((p) => pStatus(p) === 'completed').length,
    in_progress: participants.filter((p) => pStatus(p) === 'in_progress').length,
    not_sent: participants.filter((p) => pStatus(p) === 'not_sent').length,
    avg_completion: participants.length
      ? Math.round(participants.reduce((s, p) => s + pCompletion(p), 0) / participants.length)
      : 0,
  };

  // ─── ACTIONS ────────────────────────────────────────────────────
  const handleSendInvitation = async (
    p: MergedParticipant,
    type: 'initial' | 'reminder_1' | 'reminder_2' | 'manual'
  ) => {
    if (!p.contact_email) { toast.error('Email manquant pour ' + p.company_name); return; }
    setSendingId(p.id);
    try {
      let entryId = p.entry?.id;
      if (!entryId) {
        const insertData: any = {
          company_name: p.company_name,
          contact_email: p.contact_email,
          stand_number: p.stand_number || null,
          source_type: p.source_type,
        };
        if (p.source_type === 'exhibitor') insertData.exhibitor_id = p.id;
        else insertData.partner_id = p.id;
        const { data: newEntry, error: insertError } = await (supabase as any)
          .from('catalogue_entries')
          .insert(insertData)
          .select()
          .maybeSingle();
        if (insertError) throw insertError;
        entryId = newEntry.id;
      }
      const { error } = await supabase.functions.invoke('send-catalogue-invitation', {
        body: { catalogue_entry_id: entryId, type, sent_by: user?.id },
      });
      if (error) throw error;
      toast.success(`Email envoyé à ${p.contact_email}`);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur envoi email');
    } finally {
      setSendingId(null);
    }
  };

  const handleValidate = async (p: MergedParticipant) => {
    if (!p.entry) return;
    setValidatingId(p.id);
    try {
      const { error } = await (supabase as any)
        .from('catalogue_entries')
        .update({ status: 'validated', validated_at: new Date().toISOString(), validated_by: user?.id })
        .eq('id', p.entry.id);
      if (error) throw error;
      toast.success(`Fiche validée : ${p.company_name}`);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur validation');
    } finally {
      setValidatingId(null);
    }
  };

  const handleOpenEdit = async (p: MergedParticipant) => {
    if (p.entry) {
      navigate(ROUTES.ADMIN_CATALOGUE_EDIT.replace(':entryId', p.entry.id));
      return;
    }
    // Créer une fiche vide pour cet exposant / partenaire
    const token = crypto.randomUUID();
    const insert: Record<string, any> = {
      token,
      status: 'not_sent',
      completion_percent: 0,
      company_name: p.company_name,
      contact_email: p.contact_email,
      email: p.contact_email,
      source_type: p.source_type,
    };
    if (p.source_type === 'exhibitor') insert.exhibitor_id = p.id;
    else insert.partner_id = p.id;
    const { data, error } = await (supabase as any)
      .from('catalogue_entries')
      .insert(insert)
      .select('id')
      .maybeSingle();
    if (error || !data) {
      toast.error('Impossible de créer la fiche : ' + (error?.message ?? 'erreur inconnue'));
      return;
    }
    navigate(ROUTES.ADMIN_CATALOGUE_EDIT.replace(':entryId', data.id));
  };

  const handleMarkPhoneContacted = async (p: MergedParticipant) => {
    if (!p.entry) return;
    const note = globalThis.prompt(`Note pour ${p.company_name} :`, '');
    if (note === null) return;
    await (supabase as any)
      .from('catalogue_entries')
      .update({ last_phone_contact_at: new Date().toISOString(), phone_contact_note: note || 'Contacté' })
      .eq('id', p.entry.id);
    await (supabase as any).from('catalogue_reminders_log').insert({
      catalogue_entry_id: p.entry.id,
      reminder_type: 'phone',
      sent_by: user?.id,
      note: note || 'Contacté par téléphone',
    });
    toast.success('Contact téléphonique enregistré');
    fetchAll();
  };

  const handleBatchReminders = async () => {
    const eligible = participants.filter(eligibleForReminder);
    if (eligible.length === 0) { toast.info('Aucune relance à envoyer'); return; }
    setBatchSending(true);
    let sent = 0;
    for (const p of eligible) {
      if (!p.contact_email) continue;
      try {
        let entryId = p.entry?.id;
        if (!entryId) {
          const insertData: any = {
            company_name: p.company_name,
            contact_email: p.contact_email,
            stand_number: p.stand_number || null,
            source_type: p.source_type,
          };
          if (p.source_type === 'exhibitor') insertData.exhibitor_id = p.id;
          else insertData.partner_id = p.id;
          const { data: ne, error: ie } = await (supabase as any)
            .from('catalogue_entries').insert(insertData).select().maybeSingle();
          if (ie) continue;
          entryId = ne.id;
        }
        const type = !p.entry ? 'initial'
          : p.entry.reminder_count === 0 ? 'initial'
          : p.entry.reminder_count === 1 ? 'reminder_1' : 'reminder_2';
        await supabase.functions.invoke('send-catalogue-invitation', {
          body: { catalogue_entry_id: entryId, type, sent_by: user?.id },
        });
        sent++;
      } catch { /* continuer */ }
    }
    setBatchSending(false);
    toast.success(`${sent} relance${sent > 1 ? 's' : ''} envoyée${sent > 1 ? 's' : ''}`);
    fetchAll();
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

        <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Tableau de bord admin
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#0B1C3D] p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catalogue Exposants &amp; Partenaires</h1>
              <p className="text-sm text-gray-500">SIB 2026 — Envoi des invitations et suivi des fiches</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate(ROUTES.ADMIN_CATALOGUE_FORM_CONFIG)}
              className="flex items-center gap-2 bg-[#0B1C3D] text-[#C9A84C] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3060] transition"
            >
              <Settings2 className="h-4 w-4" /> Configurer le formulaire
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

              <div className="flex gap-1">
                {([
                  { id: 'all', label: 'Tous' },
                  { id: 'exhibitor', label: 'Exposants' },
                  { id: 'partner', label: 'Partenaires' },
                ] as const).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFilterSource(s.id)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                      filterSource === s.id
                        ? 'bg-[#0B1C3D] text-white border-[#0B1C3D]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {s.id === 'exhibitor' && <Building2 className="h-3 w-3" />}
                    {s.id === 'partner' && <Users className="h-3 w-3" />}
                    {s.label}
                  </button>
                ))}
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
                  {s === 'all' ? 'Tous statuts' : STATUS_LABEL[s]}
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
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => toggleSort('company_name')}>
                        <span className="flex items-center gap-1">Société <SortIcon field="company_name" /></span>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Stand</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => toggleSort('status')}>
                        <span className="flex items-center gap-1">Statut <SortIcon field="status" /></span>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => toggleSort('completion_percent')}>
                        <span className="flex items-center gap-1">Progression <SortIcon field="completion_percent" /></span>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Dernier contact</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const st = pStatus(p);
                      const days = daysSince(p.entry?.last_reminder_at || p.entry?.invited_at);
                      const needsPhone = needsPhoneCall(p);
                      const noEmail = !p.contact_email;
                      return (
                        <tr key={`${p.source_type}-${p.id}`} className={`border-b border-gray-50 hover:bg-gray-50 ${needsPhone ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">{p.company_name || '—'}</span>
                            {needsPhone && <span className="ml-2 text-xs text-red-600 font-semibold">📞 Appel requis</span>}
                          </td>
                          <td className="px-4 py-3">
                            {p.source_type === 'exhibitor' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                                <Building2 className="h-3 w-3" /> Exposant
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                                <Users className="h-3 w-3" /> Partenaire
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {p.stand_number ? `Stand ${p.stand_number}` : <span className="text-gray-300">—</span>}
                            {p.entry?.hall && ` — Hall ${p.entry.hall}`}
                          </td>
                          <td className="px-4 py-3 text-xs truncate max-w-[160px]">
                            {noEmail
                              ? <span className="text-red-400 font-semibold">Email manquant</span>
                              : <span className="text-gray-500">{p.contact_email}</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[st]}`}>
                              {STATUS_LABEL[st]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pCompletion(p)}%`, background: COMPLETION_COLOR(pCompletion(p)) }} />
                              </div>
                              <span className="text-xs font-semibold text-gray-600">{pCompletion(p)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {days !== null ? `Il y a ${days}j` : '—'}
                            {(p.entry?.reminder_count ?? 0) > 0 && (
                              <span className="ml-1 text-gray-400">({p.entry!.reminder_count} envoi{p.entry!.reminder_count > 1 ? 's' : ''})</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {st === 'not_sent' && !noEmail && (
                                <button
                                  onClick={() => handleSendInvitation(p, 'initial')}
                                  disabled={sendingId === p.id}
                                  title="Envoyer invitation"
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                                >
                                  {sendingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                </button>
                              )}
                              {(st === 'invited' || st === 'in_progress') && !noEmail && (
                                <button
                                  onClick={() => handleSendInvitation(p, (p.entry?.reminder_count ?? 0) === 1 ? 'reminder_1' : 'reminder_2')}
                                  disabled={sendingId === p.id}
                                  title="Envoyer relance"
                                  className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-50"
                                >
                                  {sendingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                </button>
                              )}
                              {st === 'completed' && p.entry && (
                                <button
                                  onClick={() => handleValidate(p)}
                                  disabled={validatingId === p.id}
                                  title="Valider la fiche"
                                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50"
                                >
                                  {validatingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEdit(p)}
                                title="Éditer la fiche (admin)"
                                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              {p.entry?.token && (
                                <a
                                  href={`/catalogue/fill/${p.entry.token}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Voir le formulaire"
                                  className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </a>
                              )}
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
                {phoneList.length} participant{phoneList.length > 1 ? 's' : ''} à contacter par téléphone
              </span>
              <span className="text-xs text-gray-400 ml-2">(≥ 2 emails envoyés, aucune réponse depuis 14 jours)</span>
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
                    {phoneList.map((p) => {
                      const days = daysSince(p.entry?.last_reminder_at);
                      return (
                        <tr key={`phone-${p.id}`} className="border-b border-gray-50 hover:bg-red-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{p.company_name || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{p.entry?.contact_name || '—'}</td>
                          <td className="px-4 py-3 font-mono text-blue-700">
                            {p.entry?.phone
                              ? <a href={`tel:${p.entry.phone}`} className="hover:underline">{p.entry.phone}</a>
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold" style={{ color: COMPLETION_COLOR(pCompletion(p)) }}>{pCompletion(p)}%</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{days !== null ? `Il y a ${days}j` : '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleMarkPhoneContacted(p)}
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
                Catalogue imprimable — {participants.filter((p) => pStatus(p) === 'validated' || pStatus(p) === 'completed').length} fiches validées/complétées
              </span>
              <button
                onClick={() => window.print()}
                className="ml-auto flex items-center gap-2 bg-[#0B1C3D] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3060]"
              >
                <Printer className="h-4 w-4" /> Lancer l'impression
              </button>
            </div>
            <CataloguePagePrint
              entries={participants.filter((p) => p.entry && (pStatus(p) === 'validated' || pStatus(p) === 'completed')).map((p) => p.entry!)}
              title="Catalogue Officiel SIB 2026"
            />
          </div>
        )}

      </div>
    </div>
  );
}