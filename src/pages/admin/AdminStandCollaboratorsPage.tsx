import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ArrowLeft, Search, Building2, Phone, Mail,
  BadgeCheck, XCircle, RefreshCw, Loader2, UserPlus, Trash2,
  Edit2, X, Save, Plus, ChevronDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import type { StandCollaborator } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface CollaboratorRow extends StandCollaborator {
  company_name?: string;
  stand_number?: string;
}

interface ExhibitorOption { id: string; company_name: string; stand_number?: string; user_id: string; }
interface PartnerOption   { id: string; name: string; user_id: string; }

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:   { label: 'Actif',      color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactif',    color: 'bg-red-100 text-red-700' },
  pending:  { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
};

const EMPTY_FORM = {
  owner_type: 'exhibitor' as 'exhibitor' | 'partner',
  owner_id: '',
  exhibitor_id: '',
  partner_id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  position: 'Staff Stand',
  status: 'active' as 'active' | 'inactive' | 'pending',
};

export default function AdminStandCollaboratorsPage() {
  const { t } = useTranslation();
  const [collaborators, setCollaborators]     = useState<CollaboratorRow[]>([]);
  const [exhibitors, setExhibitors]           = useState<ExhibitorOption[]>([]);
  const [partners, setPartners]               = useState<PartnerOption[]>([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [search, setSearch]                   = useState('');
  const [filterType, setFilterType]           = useState<'all'|'exhibitor'|'partner'>('all');
  const [filterStatus, setFilterStatus]       = useState<'all'|'active'|'inactive'|'pending'>('all');
  const [deletingId, setDeletingId]           = useState<string | null>(null);
  const [showModal, setShowModal]             = useState(false);
  const [editTarget, setEditTarget]           = useState<CollaboratorRow | null>(null);
  const [form, setForm]                       = useState({ ...EMPTY_FORM });
  const [isSaving, setIsSaving]               = useState(false);

  const fetchOptions = useCallback(async () => {
    const [exhRes, ptRes] = await Promise.all([
      (supabase as any).from('exhibitors').select('id, company_name, stand_number, user_id').order('company_name'),
      (supabase as any).from('partners').select('id, name, user_id').order('name'),
    ]);
    setExhibitors(exhRes.data || []);
    setPartners(ptRes.data || []);
  }, []);

  const fetchCollaborators = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('stand_collaborators')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const exhibitorIds = [...new Set((data || []).filter((r: any) => r.exhibitor_id).map((r: any) => r.exhibitor_id))];
      const partnerIds   = [...new Set((data || []).filter((r: any) => r.partner_id).map((r: any) => r.partner_id))];

      const exhibitorMap: Record<string, { company_name: string; stand_number: string }> = {};
      const partnerMap:   Record<string, string> = {};

      if (exhibitorIds.length) {
        const { data: exh } = await (supabase as any).from('exhibitors').select('id, company_name, stand_number').in('id', exhibitorIds);
        (exh || []).forEach((e: any) => { exhibitorMap[e.id] = { company_name: e.company_name, stand_number: e.stand_number }; });
      }
      if (partnerIds.length) {
        const { data: pts } = await (supabase as any).from('partners').select('id, name').in('id', partnerIds);
        (pts || []).forEach((p: any) => { partnerMap[p.id] = p.name; });
      }

      setCollaborators((data || []).map((row: any) => ({
        ...row,
        company_name:
          row.owner_type === 'partner'
            ? (partnerMap[row.partner_id] || 'e')
            : (exhibitorMap[row.exhibitor_id]?.company_name || 'e'),
        stand_number: exhibitorMap[row.exhibitor_id]?.stand_number,
      })));
    } catch (err: any) {
      toast.error(err?.message || t('common.load_error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCollaborators(); fetchOptions(); }, [fetchCollaborators, fetchOptions]);

  const openAdd = () => { setEditTarget(null); setForm({ ...EMPTY_FORM }); setShowModal(true); };

  const openEdit = (c: CollaboratorRow) => {
    setEditTarget(c);
    setForm({
      owner_type: c.owner_type,
      owner_id: c.owner_id,
      exhibitor_id: c.exhibitor_id || '',
      partner_id: c.partner_id || '',
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email,
      phone: c.phone || '',
      position: c.position,
      status: c.status,
    });
    setShowModal(true);
  };

  const buildPayload = (ownerId: string | undefined) => ({
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email.toLowerCase().trim(),
    phone: form.phone || null,
    position: form.position,
    status: form.status,
    owner_type: form.owner_type,
    exhibitor_id: form.owner_type === 'exhibitor' ? (form.exhibitor_id || null) : null,
    partner_id: form.owner_type === 'partner' ? (form.partner_id || null) : null,
    owner_id: ownerId || '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email) {
      toast.error('Prenom, nom et email sont obligatoires');
      return;
    }
    const ownerId = form.owner_type === 'exhibitor'
      ? exhibitors.find(ex => ex.id === form.exhibitor_id)?.user_id
      : partners.find(pt => pt.id === form.partner_id)?.user_id;

    setIsSaving(true);
    try {
      const payload = buildPayload(ownerId);
      if (editTarget) {
        const { error } = await (supabase as any)
          .from('stand_collaborators')
          .update({ ...payload, owner_id: ownerId || editTarget.owner_id })
          .eq('id', editTarget.id);
        if (error) throw error;
        toast.success(t('admin.collab_updated'));
      } else {
        const { error } = await (supabase as any)
          .from('stand_collaborators')
          .insert({ ...payload, badge_generated: false });
        if (error) throw error;
        toast.success(t('admin.collab_added'));
      }
      setShowModal(false);
      fetchCollaborators();
    } catch (err: any) {
      toast.error(err?.message || t('common.save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, current: string) => {
    const next = current === 'active' ? 'inactive' : 'active';
    const { error } = await (supabase as any).from('stand_collaborators').update({ status: next }).eq('id', id);
    if (error) { toast.error(t('admin.collab_status_error')); return; }
    toast.success(`Collaborateur ${next === 'active' ? 'active' : 'desactive'}`);
    fetchCollaborators();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer definitvement ce collaborateur ?')) return;
    setDeletingId(id);
    try {
      const { error } = await (supabase as any).from('stand_collaborators').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('admin.collab_deleted'));
      setCollaborators(prev => prev.filter(c => c.id !== id));
    } catch { toast.error(t('admin.collab_delete_error')); }
    finally { setDeletingId(null); }
  };

  const filtered = collaborators.filter(c => {
    const q = search.toLowerCase();
    return (
      (!search || `${c.first_name} ${c.last_name} ${c.email} ${c.company_name || ''}`.toLowerCase().includes(q)) &&
      (filterType === 'all' || c.owner_type === filterType) &&
      (filterStatus === 'all' || c.status === filterStatus)
    );
  });

  const total    = collaborators.length;
  const active   = collaborators.filter(c => c.status === 'active').length;
  const inactive = collaborators.filter(c => c.status === 'inactive').length;
  const pending  = collaborators.filter(c => c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1a1f3c] text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <UserPlus className="h-6 w-6 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">{t('admin.collab_title')}</h1>
            <p className="text-white/60 text-sm">{t('admin.collab_subtitle')}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={fetchCollaborators} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-medium text-sm transition-colors">
              <Plus className="h-4 w-4" /> {t('common.add')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: t('common.total'),    value: total,    color: 'text-[#1a1f3c]', bg: 'bg-white' },
            { label: t('common.active_plural'), value: active,   color: 'text-green-700', bg: 'bg-green-50' },
            { label: t('common.inactive_plural'), value: inactive, color: 'text-red-700',   bg: 'bg-red-50' },
            { label: t('common.pending_plural'), value: pending,  color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center shadow-sm border border-gray-100`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.collab_search_ph')}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">{t('admin.collab_all_types')}</option>
            <option value="exhibitor">{t('admin.collab_exhibitors')}</option>
            <option value="partner">{t('admin.collab_partners')}</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">{t('admin.collab_all_statuses')}</option>
            <option value="active">{t('common.active_plural')}</option>
            <option value="inactive">{t('common.inactive_plural')}</option>
            <option value="pending">{t('common.pending_plural')}</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {(() => {
            if (isLoading) return (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> {t('common.loading')}
              </div>
            );
            if (filtered.length === 0) return (
              <div className="text-center py-20 text-gray-400">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>{t('admin.collab_empty')}</p>
                <button onClick={openAdd} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-400 transition-colors">
                  {t('admin.collab_add_first')}
                </button>
              </div>
            );
            return (
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">{t('admin.collab_col_name')}</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">{t('admin.collab_col_contact')}</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">{t('admin.collab_col_company')}</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">{t('admin.collab_col_type')}</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">{t('admin.collab_col_status')}</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((c, i) => {
                    const statusInfo = STATUS_LABEL[c.status] || STATUS_LABEL.pending;
                    return (
                      <motion.tr key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.025 }} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-[#1a1f3c] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {c.first_name[0]}{c.last_name[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{c.first_name} {c.last_name}</div>
                              <div className="text-xs text-gray-400">{c.position}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-1 text-xs"><Mail className="h-3 w-3" />{c.email}</div>
                          {c.phone && <div className="flex items-center gap-1 text-xs mt-0.5"><Phone className="h-3 w-3" />{c.phone}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                            <Building2 className="h-3 w-3 text-gray-400" />{c.company_name || 'e'}
                          </div>
                          {c.stand_number && <div className="text-xs text-gray-400 mt-0.5">{t('admin.collab_stand')} {c.stand_number}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.owner_type === 'partner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {c.owner_type === 'partner' ? t('admin.collab_partners_sing') : t('admin.collab_exhibitors_sing')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(c)} title="Modifier"
                              className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-blue-500">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleToggleStatus(c.id, c.status)}
                              title={c.status === 'active' ? 'Desactiver' : 'Activer'}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                              {c.status === 'active'
                                ? <XCircle className="h-4 w-4 text-red-500" />
                                : <BadgeCheck className="h-4 w-4 text-green-500" />}
                            </button>
                            <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400 disabled:opacity-50">
                              {deletingId === c.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            );
          })()}
        </div>

        <p className="text-xs text-gray-400 text-center">{filtered.length} {t('admin.collab_count')}</p>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{editTarget ? t('admin.collab_modal_edit') : t('admin.collab_modal_add')}</h2>
                    <p className="text-xs text-gray-500">Controle admin total</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">{t('admin.collab_belongs_to')}</p>
                  <div className="flex gap-2">
                    {(['exhibitor', 'partner'] as const).map(otype => (
                      <button key={otype} type="button"
                        onClick={() => setForm(f => ({ ...f, owner_type: otype, exhibitor_id: '', partner_id: '' }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.owner_type === otype ? 'bg-[#1a1f3c] text-white border-[#1a1f3c]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                        {otype === 'exhibitor' ? t('admin.collab_exhibitors_sing') : t('admin.collab_partners_sing')}
                      </button>
                    ))}
                  </div>
                </div>

                {form.owner_type === 'exhibitor' ? (
                  <div>
                    <label htmlFor="sel-exhibitor" className="block text-sm font-medium text-gray-700 mb-1">Exposant <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select id="sel-exhibitor" value={form.exhibitor_id} onChange={e => setForm(f => ({ ...f, exhibitor_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Selectionner un exposant --</option>
                        {exhibitors.map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.company_name}{ex.stand_number ? ` (Stand ${ex.stand_number})` : ''}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="sel-partner" className="block text-sm font-medium text-gray-700 mb-1">Sponsor <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select id="sel-partner" value={form.partner_id} onChange={e => setForm(f => ({ ...f, partner_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Selectionner un sponsor --</option>
                        {partners.map(pt => (
                          <option key={pt.id} value={pt.id}>{pt.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="f-prenom" className="block text-sm font-medium text-gray-700 mb-1">Prenom <span className="text-red-500">*</span></label>
                    <input id="f-prenom" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="f-nom" className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                    <input id="f-nom" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label htmlFor="f-email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input id="f-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label htmlFor="f-phone" className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
                  <input id="f-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label htmlFor="f-position" className="block text-sm font-medium text-gray-700 mb-1">Poste / Fonction</label>
                  <input id="f-position" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">Statut</p>
                  <div className="flex gap-2">
                    {(['active', 'inactive', 'pending'] as const).map(s => {
                      const activeClass = { active: 'bg-green-600 text-white border-green-600', inactive: 'bg-red-500 text-white border-red-500', pending: 'bg-amber-500 text-white border-amber-500' };
                      const cls = form.status === s ? activeClass[s] : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300';
                      return (
                      <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${cls}`}>
                        {STATUS_LABEL[s].label}
                      </button>
                      );
                    })}
                  </div>
                </div>

                  <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" disabled={isSaving}
                    className="flex-1 py-2.5 bg-[#1a1f3c] text-white rounded-xl text-sm font-medium hover:bg-[#2d3561] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {editTarget ? t('admin.collab_update_btn') : t('common.add')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
