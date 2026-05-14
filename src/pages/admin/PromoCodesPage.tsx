import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, ArrowLeft, Plus, Copy, Trash2, ToggleLeft, ToggleRight,
  CheckCircle, XCircle, Clock, Loader2, Search, Percent, DollarSign,
  Users, TrendingDown, AlertCircle, Edit2, RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  original_price: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  target: string;
  created_at: string;
}

interface CreateForm {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  max_uses: string;
  expires_at: string;
  target: 'vip' | 'all';
}

const EMPTY_FORM: CreateForm = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  max_uses: '',
  expires_at: '',
  target: 'vip',
};

function generateCode(): string {
  const prefix = 'SIB';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix + '-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function calcDiscountedPrice(code: PromoCode): number {
  if (code.discount_type === 'percentage') {
    return Math.max(0, code.original_price * (1 - code.discount_value / 100));
  }
  return Math.max(0, code.original_price - code.discount_value);
}

function StatusBadge({ code }: { code: PromoCode }) {
  const now = new Date();
  const expired = code.expires_at && new Date(code.expires_at) < now;
  const exhausted = code.max_uses !== null && code.used_count >= code.max_uses;

  if (!code.is_active) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500"><XCircle className="h-3 w-3" /> Inactif</span>;
  if (expired) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600"><Clock className="h-3 w-3" /> Expiré</span>;
  if (exhausted) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600"><XCircle className="h-3 w-3" /> Épuisé</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="h-3 w-3" /> Actif</span>;
}

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCode, setEditCode] = useState<PromoCode | null>(null);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await (supabase as any)
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Erreur chargement : ' + error.message);
    else setCodes((data || []) as PromoCode[]);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const filtered = codes.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const now = new Date();
  const active = codes.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) > now) && (c.max_uses === null || c.used_count < c.max_uses));
  const totalUsed = codes.reduce((acc, c) => acc + c.used_count, 0);
  const totalSaved = codes.reduce((acc, c) => {
    const saved = c.discount_type === 'percentage'
      ? c.original_price * (c.discount_value / 100)
      : c.discount_value;
    return acc + saved * c.used_count;
  }, 0);

  // ── Ouvrir modal édition ──────────────────────────────────────────────────
  const openEdit = (code: PromoCode) => {
    setEditCode(code);
    setForm({
      code: code.code,
      description: code.description || '',
      discount_type: code.discount_type,
      discount_value: String(code.discount_value),
      max_uses: code.max_uses !== null ? String(code.max_uses) : '',
      expires_at: code.expires_at ? code.expires_at.slice(0, 10) : '',
      target: (code.target as 'vip' | 'all') || 'vip',
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditCode(null);
    setForm({ ...EMPTY_FORM, code: generateCode() });
    setShowModal(true);
  };

  // ── Sauvegarder ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.code.trim()) return toast.error('Le code est requis');
    if (!form.discount_value || isNaN(Number(form.discount_value)) || Number(form.discount_value) <= 0)
      return toast.error('La valeur de remise doit être > 0');
    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100)
      return toast.error('Le pourcentage ne peut pas dépasser 100');

    setIsSaving(true);
    const payload: Record<string, unknown> = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at + 'T23:59:59').toISOString() : null,
      target: form.target,
    };

    let error;
    if (editCode) {
      ({ error } = await (supabase as any).from('promo_codes').update(payload).eq('id', editCode.id));
    } else {
      ({ error } = await (supabase as any).from('promo_codes').insert([{ ...payload, is_active: true, used_count: 0 }]));
    }

    if (error) {
      toast.error(error.code === '23505' ? 'Ce code existe déjà' : 'Erreur : ' + error.message);
    } else {
      toast.success(editCode ? 'Code mis à jour' : 'Code créé');
      setShowModal(false);
      fetchCodes();
    }
    setIsSaving(false);
  };

  // ── Toggle actif ──────────────────────────────────────────────────────────
  const handleToggle = async (code: PromoCode) => {
    setTogglingId(code.id);
    const { error } = await (supabase as any)
      .from('promo_codes')
      .update({ is_active: !code.is_active })
      .eq('id', code.id);
    if (error) toast.error('Erreur : ' + error.message);
    else {
      setCodes(prev => prev.map(c => c.id === code.id ? { ...c, is_active: !c.is_active } : c));
      toast.success(code.is_active ? 'Code désactivé' : 'Code activé');
    }
    setTogglingId(null);
  };

  // ── Supprimer ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce code promo ? Cette action est irréversible.')) return;
    setDeletingId(id);
    const { error } = await (supabase as any).from('promo_codes').delete().eq('id', id);
    if (error) toast.error('Erreur : ' + error.message);
    else { setCodes(prev => prev.filter(c => c.id !== id)); toast.success('Code supprimé'); }
    setDeletingId(null);
  };

  // ── Copier ────────────────────────────────────────────────────────────────
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié !');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="h-6 w-6 text-indigo-600" />
              Codes Promo Visiteurs VIP
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Gérez les remises sur les badges VIP (700 MAD)</p>
          </div>
          <button
            onClick={fetchCodes}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            Nouveau code
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total codes', value: codes.length, icon: Tag, color: '#6366f1', bg: '#eef2ff' },
            { label: 'Codes actifs', value: active.length, icon: CheckCircle, color: '#22c55e', bg: '#f0fdf4' },
            { label: 'Utilisations', value: totalUsed, icon: Users, color: '#0ea5e9', bg: '#f0f9ff' },
            { label: 'Remises accordées', value: `${Math.round(totalSaved).toLocaleString()} MAD`, icon: TrendingDown, color: '#f59e0b', bg: '#fffbeb' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
                <div className="p-1.5 rounded-lg" style={{ background: bg }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un code ou description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Tag className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Aucun code promo</p>
              <p className="text-sm mt-1">Créez votre premier code avec le bouton "Nouveau code"</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    <th className="px-5 py-3 text-left">Code</th>
                    <th className="px-5 py-3 text-left">Remise</th>
                    <th className="px-5 py-3 text-left">Prix final</th>
                    <th className="px-5 py-3 text-left">Utilisations</th>
                    <th className="px-5 py-3 text-left">Expiration</th>
                    <th className="px-5 py-3 text-left">Statut</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(code => (
                    <motion.tr
                      key={code.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700 text-sm bg-indigo-50 px-2 py-0.5 rounded">
                            {code.code}
                          </span>
                          <button
                            onClick={() => copyCode(code.code)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Copier"
                          >
                            <Copy className="h-3.5 w-3.5 text-gray-400" />
                          </button>
                        </div>
                        {code.description && (
                          <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">{code.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          {code.discount_type === 'percentage'
                            ? <><Percent className="h-3.5 w-3.5" />{code.discount_value}%</>
                            : <><span className="text-xs">MAD</span>{code.discount_value}</>
                          }
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-bold text-gray-800">
                            {Math.round(calcDiscountedPrice(code))} MAD
                          </span>
                          <span className="text-xs text-gray-400 line-through ml-1">{code.original_price} MAD</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">{code.used_count}</span>
                          {code.max_uses !== null && (
                            <span className="text-gray-400"> / {code.max_uses}</span>
                          )}
                        </div>
                        {code.max_uses !== null && (
                          <div className="w-20 h-1 bg-gray-100 rounded-full mt-1">
                            <div
                              className="h-1 rounded-full bg-indigo-400 transition-all"
                              style={{ width: `${Math.min(100, (code.used_count / code.max_uses) * 100)}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {code.expires_at
                          ? new Date(code.expires_at).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' })
                          : <span className="text-gray-300 italic">Illimité</span>
                        }
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge code={code} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(code)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleToggle(code)}
                            disabled={togglingId === code.id}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            title={code.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {togglingId === code.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                              : code.is_active
                                ? <ToggleRight className="h-4 w-4 text-green-500" />
                                : <ToggleLeft className="h-4 w-4 text-gray-400" />
                            }
                          </button>
                          <button
                            onClick={() => handleDelete(code.id)}
                            disabled={deletingId === code.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            {deletingId === code.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin text-red-400" />
                              : <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            }
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL CRÉER / ÉDITER ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-700">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  {editCode ? 'Modifier le code promo' : 'Créer un code promo'}
                </h2>
              </div>

              <div className="p-6 space-y-4">

                {/* Code */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Code promo *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.code}
                      onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="SIB-XXXXXX"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <button
                      onClick={() => setForm(f => ({ ...f, code: generateCode() }))}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg transition-colors font-medium"
                    >
                      Générer
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Ex : Remise presse, Partenaire CGEM..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                {/* Type + Valeur */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Type de remise *</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setForm(f => ({ ...f, discount_type: 'percentage' }))}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border text-sm font-medium transition-all ${form.discount_type === 'percentage' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                      >
                        <Percent className="h-3.5 w-3.5" /> %
                      </button>
                      <button
                        onClick={() => setForm(f => ({ ...f, discount_type: 'fixed' }))}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border text-sm font-medium transition-all ${form.discount_type === 'fixed' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                      >
                        <DollarSign className="h-3.5 w-3.5" /> MAD
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Valeur * {form.discount_type === 'percentage' ? '(%)' : '(MAD)'}
                    </label>
                    <input
                      type="number"
                      value={form.discount_value}
                      onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                      placeholder={form.discount_type === 'percentage' ? '20' : '100'}
                      min="1"
                      max={form.discount_type === 'percentage' ? '100' : undefined}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                </div>

                {/* Aperçu prix */}
                {form.discount_value && Number(form.discount_value) > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-emerald-700">Prix après remise (badge VIP 700 MAD)</span>
                    <span className="font-bold text-emerald-700 text-lg">
                      {form.discount_type === 'percentage'
                        ? Math.max(0, Math.round(700 * (1 - Number(form.discount_value) / 100)))
                        : Math.max(0, 700 - Number(form.discount_value))
                      } MAD
                    </span>
                  </div>
                )}

                {/* Max utilisations + Expiration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Max utilisations</label>
                    <input
                      type="number"
                      value={form.max_uses}
                      onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                      placeholder="Illimité"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Expiration</label>
                    <input
                      type="date"
                      value={form.expires_at}
                      onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                </div>

                {/* Cible */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Cible</label>
                  <select
                    value={form.target}
                    onChange={e => setForm(f => ({ ...f, target: e.target.value as 'vip' | 'all' }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="vip">Visiteurs VIP uniquement</option>
                    <option value="all">Tous types</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {editCode ? 'Mettre à jour' : 'Créer le code'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
