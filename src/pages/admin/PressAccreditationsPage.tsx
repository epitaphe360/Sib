import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Camera, CheckCircle, XCircle, UserPlus, Globe,
  Mail, Phone, Building2, Search, Printer, BadgeCheck, Newspaper,
  MapPin, Briefcase, FileText, X, Trash2, Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import PrintableBadgeA4 from '../../components/badge/PrintableBadgeA4';
import type { UserBadge } from '../../types';

interface PressAccreditation {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  media_name: string;
  media_type: string;
  job_title: string;
  country: string;
  coverage_plan: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  badge_number?: string;
}

const MEDIA_TYPES = [
  'Presse écrite', 'Presse en ligne', 'Télévision', 'Radio',
  'Agence de presse', 'Photographe', 'Vidéaste', 'Podcast', 'Blog spécialisé',
];

const EMPTY_FORM = {
  first_name: '', last_name: '', email: '', phone: '',
  media_name: '', media_type: 'Presse en ligne', job_title: '',
  country: 'Maroc', coverage_plan: '',
};

function badgeNum(id: string) {
  return 'PR-' + id.replace(/-/g, '').slice(0, 6).toUpperCase();
}

// ─── Badge visuel ────────────────────────────────────────────────────────────
function PressBadge({ acc, onClose }: { acc: PressAccreditation; onClose: () => void }) {
  const { t } = useTranslation();
  const badgeRef = useRef<HTMLDivElement>(null);
  const num = badgeNum(acc.id);

  // Construction du UserBadge compatible PrintableBadgeA4
  const badge: UserBadge = {
    id: acc.id,
    userId: acc.id,
    badgeCode: `SIB2026-PRESS-${num}`,
    userType: 'visitor',           // type de base compatible
    fullName: `${acc.first_name} ${acc.last_name}`,
    companyName: acc.media_name,
    position: acc.job_title,
    email: acc.email,
    phone: acc.phone,
    accessLevel: 'press' as UserBadge['accessLevel'],
    validFrom: new Date('2026-11-25'),
    validUntil: new Date('2026-11-29'),
    status: 'active',
    scanCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const handlePrint = useCallback(() => {
    const el = badgeRef.current;
    if (!el) { return; }
    const html = [
      '<!DOCTYPE html><html><head>',
      '<meta charset="utf-8">',
      `<base href="${window.location.origin}/">`,
      `<title>Badge Presse - ${acc.first_name} ${acc.last_name}</title>`,
      '<style>* { margin: 0; padding: 0; box-sizing: border-box; }',
      'body { font-family: Segoe UI, sans-serif; background: white; }',
      '@page { size: A4; margin: 10mm; }',
      '@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }',
      '</style>',
      '<script>window.onafterprint=function(){window.close();};window.onload=function(){setTimeout(function(){window.print();},500);};</script>',
      '</head><body>',
      el.innerHTML,
      '</body></html>',
    ].join('');
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = globalThis.open(url, '_blank');
    if (!w) {
      URL.revokeObjectURL(url);
      toast.error('Autorisez les popups pour ce site dans Chrome, puis réessayez.');
      return;
    }
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [acc]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden"
        style={{ maxWidth: 880 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100">
          <h3 className="font-bold text-[#0F2034] text-base">{t('admin.press_badge_title')}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><X className="w-5 h-5" /></button>
        </div>

        {/* Badge A4 complet avec config de /admin/badge-config */}
        <div ref={badgeRef} className="overflow-auto max-h-[75vh]">
          <PrintableBadgeA4 badge={badge} loadConfig />
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0F2034] hover:bg-[#1B365D] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" /> {t('admin.press_print_badge')}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors">
            {t('common.close') || 'Fermer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Formulaire d'ajout ──────────────────────────────────────────────────────
function AddPressModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.media_name) {
      toast.error(t('admin.press_form_required'));
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('press_accreditations').insert({
        ...form,
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success(`${t('admin.press_created')} ${form.first_name} ${form.last_name}`);
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || t('admin.press_create_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F2034] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C9A84C]/20 rounded-lg"><Newspaper className="w-5 h-5 text-[#C9A84C]" /></div>
            <div>
              <h2 className="text-white font-bold text-base">{t('admin.press_add_journalist')}</h2>
              <p className="text-white/50 text-xs">{t('admin.press_badge_auto')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
              <input value={form.first_name} onChange={set('first_name')} placeholder="Jean" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
              <input value={form.last_name} onChange={set('last_name')} placeholder="Dupont" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={form.email} onChange={set('email')} placeholder="journaliste@media.com" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.phone} onChange={set('phone')} placeholder="+212 6 00 00 00 00" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Média / Rédaction <span className="text-red-500">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.media_name} onChange={set('media_name')} placeholder="Le Journal BTP" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type de média</label>
              <select value={form.media_type} onChange={set('media_type')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white">
          {MEDIA_TYPES.map(mt => <option key={mt}>{mt}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fonction / Titre</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.job_title} onChange={set('job_title')} placeholder="Journaliste" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pays</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.country} onChange={set('country')} placeholder="Maroc" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Plan de couverture (optionnel)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea value={form.coverage_plan} onChange={set('coverage_plan')} rows={3} placeholder="Sujets prévus : stands, conférences, interviews..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 border-t border-gray-100 pt-4">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0F2034] hover:bg-[#1B365D] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> {t('common.creating')}</> : <><BadgeCheck className="w-4 h-4" /> {t('admin.press_create_badge_btn')}</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default function AdminPressAccreditationsPage() {
  const { t } = useTranslation();
  const [accreditations, setAccreditations] = useState<PressAccreditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [badgeFor, setBadgeFor] = useState<PressAccreditation | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { fetchAccreditations(); }, []);

  const fetchAccreditations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('press_accreditations').select('*').order('created_at', { ascending: false });
      if (error) {
        if (error.code === '42P01') { setAccreditations([]); }
        else throw error;
      } else {
        setAccreditations(data as PressAccreditation[]);
      }
    } catch {
      toast.error(t('admin.press_fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      const { error } = await supabase.from('press_accreditations')
        .update({ status: newStatus, reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error && error.code !== '42P01') throw error;
      setAccreditations(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      toast.success(newStatus === 'approved' ? t('admin.press_validated') : t('admin.press_rejected'));
    } catch {
      toast.error(t('admin.press_update_error'));
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase.from('press_accreditations').delete().eq('id', id);
      if (error && error.code !== '42P01') throw error;
      setAccreditations(prev => prev.filter(a => a.id !== id));
      toast.success(t('admin.press_deleted'));
      setConfirmDelete(null);
    } catch {
      toast.error(t('admin.press_delete_error'));
    } finally {
      setProcessing(null);
    }
  };

  const filtered = accreditations.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (a.first_name + a.last_name + a.email + a.media_name).toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: accreditations.length,
    pending: accreditations.filter(a => a.status === 'pending').length,
    approved: accreditations.filter(a => a.status === 'approved').length,
    rejected: accreditations.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-[#1B365D] hover:text-[#C9A84C] mb-4 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> {t('common.back_dashboard')}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0F2034] rounded-xl">
                <Camera className="w-7 h-7 text-[#C9A84C]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0F2034]">{t('admin.press_title')}</h1>
                <p className="text-gray-500 text-sm mt-0.5">{t('admin.press_subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0F2034] hover:bg-[#1B365D] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" /> {t('admin.press_add_journalist')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {([
            { key: 'all',      label: t('common.total'),          color: 'bg-[#0F2034] text-white' },
            { key: 'pending',  label: t('common.pending_plural'), color: 'bg-amber-50 text-amber-800 border border-amber-200' },
            { key: 'approved', label: t('admin.press_validated_plural'), color: 'bg-green-50 text-green-800 border border-green-200' },
            { key: 'rejected', label: t('admin.press_rejected_plural'), color: 'bg-red-50 text-red-800 border border-red-200' },
          ] as const).map(s => (
            <button
              key={s.key}
              onClick={() => setFilterStatus(s.key)}
              className={`rounded-xl px-4 py-3 text-left transition-all ${s.color} ${filterStatus === s.key ? 'ring-2 ring-[#C9A84C]' : 'opacity-80 hover:opacity-100'}`}
            >
              <div className="text-2xl font-bold">{counts[s.key]}</div>
              <div className="text-xs font-medium opacity-75 mt-0.5">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.press_search_ph')}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center p-16"><div className="animate-spin h-10 w-10 border-4 border-[#C9A84C] border-t-transparent rounded-full" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('admin.press_empty')}</p>
            <button onClick={() => setShowAddModal(true)} className="mt-4 text-sm text-[#1B365D] hover:text-[#C9A84C] font-medium transition-colors">
              + {t('admin.press_add_first')}
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map(acc => {
                const isProc = processing === acc.id;
                const initials = (acc.first_name?.[0] || '') + (acc.last_name?.[0] || '');
                return (
                  <motion.div
                    key={acc.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                  >
                    {/* Top accent */}
                    <div className={`h-1 ${acc.status === 'approved' ? 'bg-green-500' : acc.status === 'rejected' ? 'bg-red-400' : 'bg-amber-400'}`} />

                    <div className="p-5 flex-1 flex flex-col">
                      {/* Identity */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-11 h-11 rounded-full bg-[#0F2034] flex items-center justify-center text-[#C9A84C] font-bold text-sm flex-shrink-0">
                          {initials.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[#0F2034] text-sm leading-tight">{acc.first_name} {acc.last_name}</div>
                          <div className="text-xs text-[#C9A84C] font-medium">{acc.job_title || 'Journaliste'}</div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">{acc.media_name}</div>
                        </div>
                        <div className="flex-shrink-0">
                          {acc.status === 'pending' && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">{t('common.pending_status')}</span>}
                          {acc.status === 'approved' && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" />{t('admin.press_validated_sing')}</span>}
                          {acc.status === 'rejected' && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><XCircle className="w-3 h-3" />{t('admin.press_rejected_sing')}</span>}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="text-xs text-gray-500 space-y-1.5 flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 flex-shrink-0" /><span className="font-medium text-gray-700">{acc.media_name}</span><span className="opacity-60">({acc.media_type})</span></div>
                        <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{acc.email}</span></div>
                        {acc.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 flex-shrink-0" /><span>{acc.phone}</span></div>}
                        {acc.country && <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 flex-shrink-0" /><span>{acc.country}</span></div>}
                      </div>

                      {acc.coverage_plan && (
                        <div className="mt-3 text-xs bg-blue-50 text-blue-800 px-3 py-2 rounded-lg border border-blue-100 line-clamp-2">
                          {acc.coverage_plan}
                        </div>
                      )}

                      {/* Badge number if approved */}
                      {acc.status === 'approved' && (
                        <div className="mt-3 text-xs text-center font-mono text-[#C9A84C] bg-[#0F2034]/5 rounded-lg py-1.5 border border-[#C9A84C]/20">
                          Badge {badgeNum(acc.id)}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="px-4 pb-4 flex gap-2">
                      {acc.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(acc.id, 'approved')}
                            disabled={isProc}
                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> {t('common.accept')}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(acc.id, 'rejected')}
                            disabled={isProc}
                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> {t('common.reject')}
                          </button>
                        </>
                      )}
                      {acc.status === 'approved' && (
                        <>
                          <button
                            onClick={() => setBadgeFor(acc)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#0F2034] hover:bg-[#1B365D] text-[#C9A84C] rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> {t('admin.press_view_badge')}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(acc.id, 'rejected')}
                            disabled={isProc}
                            className="py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {acc.status === 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(acc.id, 'approved')}
                          disabled={isProc}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> {t('common.approve')}
                        </button>
                      )}
                      {/* Delete */}
                      {confirmDelete === acc.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(acc.id)} disabled={isProc} className="py-2 px-3 bg-red-600 text-white rounded-lg text-xs font-bold">{t('common.yes')}</button>
                          <button onClick={() => setConfirmDelete(null)} className="py-2 px-3 border border-gray-200 text-gray-600 rounded-lg text-xs">{t('common.no')}</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(acc.id)} className="py-2 px-3 border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 rounded-lg text-xs transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && <AddPressModal onClose={() => setShowAddModal(false)} onSaved={fetchAccreditations} />}
        {badgeFor && <PressBadge acc={badgeFor} onClose={() => setBadgeFor(null)} />}
      </AnimatePresence>
    </div>
  );
}

