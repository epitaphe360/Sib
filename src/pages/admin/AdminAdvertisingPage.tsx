import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Loader2, Plus, Edit2, Save, X, Trash2,
  TrendingUp, ShoppingBag, AlertTriangle, Search,
  CheckCircle2, CreditCard, RefreshCw, Image as ImageIcon,
  ChevronDown, Download, ArrowLeft, CheckCheck, XCircle, Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface AdSpaceType {
  id: string;
  name: string;
  description: string;
  category: string;
  audience: string;
  price: number;
  currency: string;
  duration_days: number;
  stock_total: number;
  stock_available: number;
  image_url: string;
  is_active: boolean;
}

interface AdBooking {
  id: string;
  space_id: string;
  customer_id: string;
  customer_type: string;
  customer_email: string | null;
  customer_name: string | null;
  quantity: number;
  total_amount: number;
  currency: string;
  payment_method: string | null;
  payment_status: string;
  payment_ref: string | null;
  invoice_number: string | null;
  paid_at: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  ad_space_types: { name: string; category: string } | null;
}

/* ── Constantes ─────────────────────────────────────────────────────────────── */
const CATEGORIES = ['banner-app', 'email', 'push', 'featured', 'physique', 'conference', 'autre'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  'banner-app': 'Bannière digitale',
  email:        'Email marketing',
  push:         'Notification push',
  featured:     'Featured listing',
  physique:     'Espace physique',
  conference:   'Sponsoring conférence',
  autre:        'Autre',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  'banner-app': '🖥️', email: '📧', push: '🔔', featured: '⭐',
  physique: '🏷️', conference: '🎤', autre: '📢',
};

const BOOKING_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved:  { label: 'Approuvé',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  active:    { label: 'Actif ✓',     color: 'bg-green-50 text-green-700 border-green-200' },
  rejected:  { label: 'Refusé',      color: 'bg-red-50 text-red-700 border-red-200' },
  expired:   { label: 'Expiré',      color: 'bg-gray-100 text-gray-600 border-gray-200' },
  cancelled: { label: 'Annulé',      color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Non payé',    color: 'bg-gray-100 text-gray-600 border-gray-200' },
  completed: { label: 'Payé ✓',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed:    { label: 'Échoué',      color: 'bg-red-50 text-red-600 border-red-200' },
  refunded:  { label: 'Remboursé',   color: 'bg-violet-50 text-violet-700 border-violet-200' },
};

const EMPTY_FORM: Omit<AdSpaceType, 'id'> = {
  name: '', description: '', category: 'banner-app', audience: '',
  price: 0, currency: 'MAD', duration_days: 5,
  stock_total: 5, stock_available: 5, image_url: '', is_active: true,
};

const Pill: React.FC<Readonly<{ cfg: { label: string; color: string } }>> = ({ cfg }) => (
  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
    {cfg.label}
  </span>
);

/* ── Component ──────────────────────────────────────────────────────────────── */
export default function AdminAdvertisingPage() {
  const [activeTab, setActiveTab]           = useState<'spaces' | 'bookings'>('spaces');
  const [spaces, setSpaces]                 = useState<AdSpaceType[]>([]);
  const [bookings, setBookings]             = useState<AdBooking[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [isCreating, setIsCreating]         = useState(false);
  const [form, setForm]                     = useState<Omit<AdSpaceType, 'id'>>(EMPTY_FORM);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter]   = useState('');
  const [statusFilter, setStatusFilter]     = useState('');
  const [isSaving, setIsSaving]             = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  /* ── Fetch ────────────────────────────────────────────────────────────────── */
  const fetchSpaces = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from('ad_space_types')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Erreur chargement espaces'); return; }
    setSpaces(data || []);
  }, []);

  const fetchBookings = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from('ad_bookings')
      .select('*, ad_space_types(name, category)')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Erreur chargement réservations'); return; }
    setBookings(data || []);
  }, []);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchSpaces(), fetchBookings()]);
    setIsLoading(false);
  }, [fetchSpaces, fetchBookings]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Stats ────────────────────────────────────────────────────────────────── */
  const stats = useMemo(() => ({
    totalSpaces:   spaces.length,
    activeSpaces:  spaces.filter(s => s.is_active).length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    revenue:       bookings
      .filter(b => b.payment_status === 'completed')
      .reduce((s, b) => s + b.total_amount, 0),
  }), [spaces, bookings]);

  /* ── CRUD Espaces ─────────────────────────────────────────────────────────── */
  const startEdit = (space: AdSpaceType) => {
    setEditingId(space.id);
    setIsCreating(false);
    setForm({
      name: space.name, description: space.description, category: space.category,
      audience: space.audience, price: space.price, currency: space.currency,
      duration_days: space.duration_days, stock_total: space.stock_total,
      stock_available: space.stock_available, image_url: space.image_url ?? '', is_active: space.is_active,
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const cancelEdit = () => { setEditingId(null); setIsCreating(false); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nom requis'); return; }
    if (form.price < 0)    { toast.error('Prix invalide'); return; }
    setIsSaving(true);
    try {
      if (isCreating) {
        const { error } = await (supabase as any).from('ad_space_types').insert(form);
        if (error) { throw error; }
        toast.success('Espace créé');
      } else if (editingId) {
        const { error } = await (supabase as any).from('ad_space_types').update(form).eq('id', editingId);
        if (error) { throw error; }
        toast.success('Espace mis à jour');
      }
      cancelEdit();
      await fetchSpaces();
    } catch (e: any) {
      toast.error(e.message || 'Erreur sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!globalThis.confirm('Supprimer cet espace ? Les réservations existantes resteront archivées.')) { return; }
    const { error } = await (supabase as any).from('ad_space_types').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Espace supprimé');
    await fetchSpaces();
  };

  const handleToggleActive = async (space: AdSpaceType) => {
    const { error } = await (supabase as any)
      .from('ad_space_types').update({ is_active: !space.is_active }).eq('id', space.id);
    if (error) { toast.error(error.message); return; }
    await fetchSpaces();
  };

  /* ── Upload image ─────────────────────────────────────────────────────────── */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { return; }
    setUploadingImage(true);
    try {
      const ext  = file.name.split('.').pop();
      const path = `advertising/${Date.now()}.${ext}`;
      const { error: upErr } = await (supabase as any).storage.from('media').upload(path, file, { upsert: true });
      if (upErr) { throw upErr; }
      const { data } = (supabase as any).storage.from('media').getPublicUrl(path);
      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success('Image uploadée');
    } catch (e: any) {
      toast.error(e.message || 'Erreur upload');
    } finally {
      setUploadingImage(false);
    }
  };

  /* ── Actions réservations ─────────────────────────────────────────────────── */
  const updateBookingStatus = async (id: string, status: string, extra: Record<string, unknown> = {}) => {
    const { error } = await (supabase as any)
      .from('ad_bookings')
      .update({ status, updated_at: new Date().toISOString(), ...extra })
      .eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Réservation : ${status}`);
    await fetchBookings();
  };

  const approveBooking = (id: string) =>
    updateBookingStatus(id, 'approved', { approved_at: new Date().toISOString() });

  const activateBooking = (id: string) =>
    updateBookingStatus(id, 'active', { activated_at: new Date().toISOString() });

  const rejectBooking = async (id: string) => {
    const reason = globalThis.prompt('Raison du refus (facultatif) :') ?? '';
    updateBookingStatus(id, 'rejected', { admin_notes: reason });
  };

  const updatePaymentStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any)
      .from('ad_bookings').update({ payment_status: status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    await fetchBookings();
  };

  /* ── CSV Export ───────────────────────────────────────────────────────────── */
  const exportCSV = () => {
    const rows = [
      ['ID', 'Espace', 'Client', 'Email', 'Montant', 'Statut', 'Paiement', 'Date'],
      ...bookings.map(b => [
        b.id, b.ad_space_types?.name ?? b.space_id,
        b.customer_name ?? b.customer_type, b.customer_email ?? '',
        b.total_amount, b.status, b.payment_status,
        new Date(b.created_at).toLocaleDateString('fr-FR'),
      ]),
    ];
    const csv  = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `reservations-pub-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Filter bookings ──────────────────────────────────────────────────────── */
  const filteredBookings = useMemo(() => {
    const q = bookingFilter.toLowerCase();
    return bookings.filter(b => {
      const matchSearch = !q || (
        (b.customer_email ?? '').toLowerCase().includes(q) ||
        (b.customer_name ?? '').toLowerCase().includes(q) ||
        (b.ad_space_types?.name ?? '').toLowerCase().includes(q) ||
        (b.invoice_number ?? '').toLowerCase().includes(q)
      );
      const matchStatus = !statusFilter || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, bookingFilter, statusFilter]);

  /* ── Render ─────────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#F39200]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8f7f4' }}>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={ROUTES.ADMIN_DASHBOARD}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
              <Megaphone className="w-5 h-5 text-[#F39200]" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base">Espaces Publicitaires</h1>
              <p className="text-xs text-gray-500">Catalogue & Réservations — SIB 2026</p>
            </div>
          </div>
          <button onClick={fetchAll}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ── Stats ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: Megaphone,      label: 'Espaces total',  value: stats.totalSpaces,   color: '#0B1C3D' },
            { icon: CheckCircle2,   label: 'Actifs',         value: stats.activeSpaces,  color: '#10b981' },
            { icon: ShoppingBag,    label: 'Réservations',   value: stats.totalBookings, color: '#3b82f6' },
            { icon: AlertTriangle,  label: 'En attente',     value: stats.pendingBookings, color: '#f59e0b' },
            { icon: TrendingUp,     label: 'CA encaissé',    value: `${stats.revenue.toLocaleString('fr-MA')} MAD`, color: '#F39200' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {(['spaces', 'bookings'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab === 'spaces'   ? `📋 Espaces (${stats.totalSpaces})`   : ''}
              {tab === 'bookings' ? `📑 Réservations (${stats.totalBookings})` : ''}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1 — Catalogue des espaces publicitaires
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'spaces' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                Catalogue — {stats.totalSpaces} espaces
              </h2>
              <button onClick={startCreate}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow hover:opacity-90 transition"
                style={{ background: 'linear-gradient(135deg, #F39200, #E07A00)' }}>
                <Plus className="w-4 h-4" /> Ajouter un espace
              </button>
            </div>

            {/* Form créer / modifier */}
            <AnimatePresence>
              {(isCreating || editingId !== null) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl border border-[#F39200]/30 shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">
                      {isCreating ? 'Nouvel espace publicitaire' : 'Modifier l\'espace'}
                    </h3>
                    <button onClick={cancelEdit} className="p-1 hover:bg-gray-100 rounded-lg">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nom */}
                    <div className="sm:col-span-2">
                      <label htmlFor="adform-name" className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
                      <input id="adform-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F39200]/30"
                        placeholder="Ex: Bannière Homepage" />
                    </div>
                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label htmlFor="adform-desc" className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                      <textarea id="adform-desc" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F39200]/30 resize-none"
                        placeholder="Description détaillée visible par les exposants/partenaires" />
                    </div>
                    {/* Catégorie */}
                    <div>
                      <label htmlFor="adform-category" className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
                      <select id="adform-category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F39200]/30">
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {CATEGORY_LABELS[c]}</option>
                        ))}
                      </select>
                    </div>
                    {/* Audience */}
                    <div>
                      <label htmlFor="adform-audience" className="block text-xs font-semibold text-gray-600 mb-1">Audience cible</label>
                      <input id="adform-audience" value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F39200]/30"
                        placeholder="Ex: ~3 500 visiteurs inscrits" />
                    </div>
                    {/* Prix */}
                    <div>
                      <label htmlFor="adform-price" className="block text-xs font-semibold text-gray-600 mb-1">Prix (MAD HT)</label>
                      <input id="adform-price" type="number" min={0} value={form.price}
                        onChange={e => setForm(p => ({ ...p, price: +e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F39200]/30" />
                    </div>
                    {/* Durée */}
                    <div>
                      <label htmlFor="adform-duration" className="block text-xs font-semibold text-gray-600 mb-1">Durée (jours)</label>
                      <input id="adform-duration" type="number" min={1} value={form.duration_days}
                        onChange={e => setForm(p => ({ ...p, duration_days: +e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F39200]/30" />
                    </div>
                    {/* Stock total */}
                    <div>
                      <label htmlFor="adform-stock-total" className="block text-xs font-semibold text-gray-600 mb-1">Stock total</label>
                      <input id="adform-stock-total" type="number" min={0} value={form.stock_total}
                        onChange={e => setForm(p => ({ ...p, stock_total: +e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F39200]/30" />
                    </div>
                    {/* Stock dispo */}
                    <div>
                      <label htmlFor="adform-stock-avail" className="block text-xs font-semibold text-gray-600 mb-1">Stock disponible</label>
                      <input id="adform-stock-avail" type="number" min={0} value={form.stock_available}
                        onChange={e => setForm(p => ({ ...p, stock_available: +e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F39200]/30" />
                    </div>
                    {/* Image */}
                    <div className="sm:col-span-2">
                      <label htmlFor="adform-image" className="block text-xs font-semibold text-gray-600 mb-1">Image</label>
                      <div className="flex items-center gap-3">
                        {form.image_url && (
                          <img src={form.image_url} alt="" className="w-16 h-10 object-cover rounded-lg" />
                        )}
                        <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                          {uploadingImage
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <ImageIcon className="w-4 h-4" />}
                          {uploadingImage ? 'Upload…' : 'Choisir une image'}
                          <input id="adform-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        {form.image_url && (
                          <button onClick={() => setForm(p => ({ ...p, image_url: '' }))}
                            className="text-xs text-red-500 hover:underline">Retirer</button>
                        )}
                      </div>
                    </div>
                    {/* Actif */}
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="is_active" checked={form.is_active}
                        onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                        className="w-4 h-4 accent-[#F39200]" />
                      <label htmlFor="is_active" className="text-sm text-gray-700">Actif (visible pour les acheteurs)</label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-5">
                    <button onClick={handleSave} disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow disabled:opacity-50 hover:opacity-90 transition"
                      style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isCreating ? 'Créer' : 'Mettre à jour'}
                    </button>
                    <button onClick={cancelEdit}
                      className="px-5 py-2.5 rounded-xl text-gray-600 text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition">
                      Annuler
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Liste espaces */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {spaces.map(space => (
                <div key={space.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                    space.is_active ? 'border-gray-100' : 'border-gray-200 opacity-70'
                  }`}>
                  {/* Visuel */}
                  <div className="relative h-28"
                    style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                    {space.image_url ? (
                      <img src={space.image_url} alt={space.name} className="w-full h-full object-cover opacity-70" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-3xl">{CATEGORY_EMOJIS[space.category] ?? '📢'}</span>
                        <span className="text-xs text-[#F39200]/70 mt-1 font-semibold">
                          {CATEGORY_LABELS[space.category] ?? space.category}
                        </span>
                      </div>
                    )}
                    {!space.is_active && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        Inactif
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{space.name}</h3>
                      <span className="text-xs font-bold text-[#F39200] shrink-0 ml-2">
                        {space.price.toLocaleString('fr-MA')} MAD
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{space.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span>Stock: {space.stock_available}/{space.stock_total}</span>
                      <span>·</span>
                      <span>{space.duration_days}j</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(space)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition">
                        <Edit2 className="w-3.5 h-3.5" /> Modifier
                      </button>
                      <button onClick={() => handleToggleActive(space)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          space.is_active
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}>
                        {space.is_active ? '● Actif' : '○ Inactif'}
                      </button>
                      <button onClick={() => handleDelete(space.id)}
                        className="ml-auto p-1.5 hover:bg-red-50 rounded-lg transition text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {spaces.length === 0 && !isCreating && (
              <div className="text-center py-16 text-gray-400">
                <Megaphone className="w-14 h-14 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Aucun espace publicitaire</p>
                <p className="text-sm mt-1">Créez votre premier espace pour commencer</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2 — Réservations
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                Réservations — {filteredBookings.length} / {stats.totalBookings}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input value={bookingFilter} onChange={e => setBookingFilter(e.target.value)}
                    className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F39200]/30 w-52"
                    placeholder="Chercher…" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F39200]/30">
                  <option value="">Tous les statuts</option>
                  {Object.entries(BOOKING_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <button onClick={exportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                  <Download className="w-4 h-4" /> CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Espace</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Montant</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Paiement</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.map(booking => (
                      <React.Fragment key={booking.id}>
                        <tr className="hover:bg-gray-50/50 transition">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-800 text-xs">{booking.customer_name ?? '—'}</div>
                            <div className="text-xs text-gray-400">{booking.customer_email ?? booking.customer_type}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span>{CATEGORY_EMOJIS[booking.ad_space_types?.category ?? ''] ?? '📢'}</span>
                              <span className="text-xs text-gray-700 font-medium">
                                {booking.ad_space_types?.name ?? booking.space_id.slice(0, 8)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-[#F39200] text-xs">
                              {booking.total_amount.toLocaleString('fr-MA')} MAD
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <Pill cfg={PAYMENT_STATUS[booking.payment_status] ?? { label: booking.payment_status, color: 'bg-gray-100 text-gray-600 border-gray-200' }} />
                              {booking.payment_method && (
                                <span className="text-xs text-gray-400">{booking.payment_method}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Pill cfg={BOOKING_STATUS[booking.status] ?? { label: booking.status, color: 'bg-gray-100 text-gray-600 border-gray-200' }} />
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {new Date(booking.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {/* Approve */}
                              {booking.status === 'pending' && (
                                <button onClick={() => approveBooking(booking.id)}
                                  title="Approuver"
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition">
                                  <CheckCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {/* Activate */}
                              {booking.status === 'approved' && (
                                <button onClick={() => activateBooking(booking.id)}
                                  title="Activer"
                                  className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition">
                                  <Zap className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {/* Reject */}
                              {['pending', 'approved'].includes(booking.status) && (
                                <button onClick={() => rejectBooking(booking.id)}
                                  title="Refuser"
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition">
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {/* Expand */}
                              <button onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedBooking === booking.id ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {expandedBooking === booking.id && (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 bg-gray-50/60">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                <div>
                                  <span className="text-gray-400 block mb-0.5">N° Facture</span>
                                  <span className="font-semibold text-gray-700">{booking.invoice_number ?? '—'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-0.5">Réf paiement</span>
                                  <span className="font-semibold text-gray-700">{booking.payment_ref ?? '—'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-0.5">Quantité</span>
                                  <span className="font-semibold text-gray-700">{booking.quantity}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-0.5">Type client</span>
                                  <span className="font-semibold text-gray-700">{booking.customer_type}</span>
                                </div>
                                {booking.admin_notes && (
                                  <div className="col-span-2 sm:col-span-4">
                                    <span className="text-gray-400 block mb-0.5">Notes admin</span>
                                    <span className="text-gray-700">{booking.admin_notes}</span>
                                  </div>
                                )}
                              </div>
                              {/* Changer statut paiement */}
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs text-gray-500">Statut paiement :</span>
                                <select
                                  value={booking.payment_status}
                                  onChange={e => updatePaymentStatus(booking.id, e.target.value)}
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                                  {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredBookings.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Aucune réservation</p>
                  {(bookingFilter || statusFilter) && (
                    <button onClick={() => { setBookingFilter(''); setStatusFilter(''); }}
                      className="mt-2 text-sm text-[#F39200] hover:underline">
                      Effacer les filtres
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
