import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tent, Loader2, Plus, Edit2, Save, X, Trash2,
  TrendingUp, ShoppingBag, AlertTriangle, Search,
  CheckCircle2, CreditCard, Filter, RefreshCw, Image as ImageIcon,
  ChevronDown, Download, ArrowLeft, Ruler, Maximize,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';

interface ChapiteauItem {
  id: string;
  name: string;
  description: string;
  size_label: string;
  surface_m2: number | null;
  price_per_day: number;
  currency: string;
  includes_installation: boolean;
  stock_total: number;
  stock_available: number;
  image_url: string;
  is_active: boolean;
}

interface ChapiteauOrder {
  id: string;
  item_id: string;
  customer_id: string;
  customer_type: string;
  customer_email: string | null;
  quantity: number;
  rental_start: string;
  rental_end: string;
  total_days: number;
  unit_price: number;
  total_amount: number;
  currency: string;
  payment_method: string | null;
  payment_status: string;
  payment_ref: string | null;
  paid_at: string | null;
  status: string;
  notes: string | null;
  invoice_number: string | null;
  created_at: string;
  chapiteau_items: { name: string; size_label: string } | null;
}

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmée',   color: 'bg-green-50 text-green-700 border-green-200' },
  delivered: { label: 'Livrée',      color: 'bg-blue-50 text-blue-700 border-blue-200' },
  returned:  { label: 'Retournée',   color: 'bg-purple-50 text-purple-700 border-purple-200' },
  cancelled: { label: 'Annulée',     color: 'bg-red-50 text-red-700 border-red-200' },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Non payé',   color: 'bg-gray-100 text-gray-600 border-gray-200' },
  paid:     { label: 'Payé ✓',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed:   { label: 'Échoué',     color: 'bg-red-50 text-red-600 border-red-200' },
  refunded: { label: 'Remboursé',  color: 'bg-violet-50 text-violet-700 border-violet-200' },
};

const PAYMENT_METHODS = ['espèces', 'virement', 'carte bancaire', 'chèque', 'autre'];

const EMPTY_FORM = {
  name: '', description: '', size_label: '', surface_m2: '',
  price_per_day: 0, currency: 'MAD', includes_installation: true,
  stock_total: 1, stock_available: 1, image_url: '', is_active: true,
};

const EMPTY_ORDER_FORM = {
  item_id: '', customer_email: '', customer_type: 'exhibitor', quantity: 1,
  rental_start: '', rental_end: '', payment_method: '', payment_ref: '',
  payment_status: 'pending', status: 'pending', notes: '',
};

const Pill: React.FC<Readonly<{ cfg: { label: string; color: string } }>> = ({ cfg }) => (
  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
    {cfg.label}
  </span>
);

export default function AdminChapiteauPage() {
  const { t } = useTranslation();
  const [items, setItems]     = useState<ChapiteauItem[]>([]);
  const [orders, setOrders]   = useState<ChapiteauOrder[]>([]);
  const [tab, setTab]         = useState<'items' | 'orders'>('items');
  const [isLoading, setIsLoading] = useState(true);

  /* ── Items form ── */
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [formData, setFormData]     = useState({ ...EMPTY_FORM });
  const [isSaving, setIsSaving]     = useState(false);
  const [searchItems, setSearchItems] = useState('');

  /* ── Orders ── */
  const [statusFilter, setStatusFilter]   = useState('all');
  const [searchOrders, setSearchOrders]   = useState('');
  const [updatingId, setUpdatingId]       = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  /* ── Image upload ── */
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  /* ─────────────────────────── Fetch ─────────────────────── */
  const fetchItems = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from('chapiteau_items').select('*').order('price_per_day');
    if (error) { toast.error('Erreur chargement articles'); return; }
    setItems(data || []);
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from('chapiteau_orders')
      .select('*, chapiteau_items(name, size_label)')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Erreur chargement commandes'); return; }
    setOrders(data || []);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchItems(), fetchOrders()]).finally(() => setIsLoading(false));
  }, [fetchItems, fetchOrders]);

  /* ─────────────────────────── Stats ─────────────────────── */
  const stats = useMemo(() => ({
    totalItems:   items.length,
    activeItems:  items.filter(i => i.is_active).length,
    lowStock:     items.filter(i => i.stock_available <= 2).length,
    totalOrders:  orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders.filter(o => o.payment_status === 'paid')
      .reduce((s, o) => s + o.total_amount, 0),
  }), [items, orders]);

  /* ─────────────────────────── Image upload ────────────────── */
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext  = file.name.split('.').pop();
      const path = `chapiteau/${Date.now()}.${ext}`;
      const { error: upErr } = await (supabase as any).storage
        .from('media').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = (supabase as any).storage.from('media').getPublicUrl(path);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image téléchargée');
    } catch (err: any) {
      toast.error(`Erreur upload image : ${err?.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  /* ─────────────────────────── Item CRUD ─────────────────── */
  const openNew = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (item: ChapiteauItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name, description: item.description,
      size_label: item.size_label, surface_m2: item.surface_m2?.toString() ?? '',
      price_per_day: item.price_per_day, currency: item.currency,
      includes_installation: item.includes_installation,
      stock_total: item.stock_total, stock_available: item.stock_available,
      image_url: item.image_url, is_active: item.is_active,
    });
    setShowForm(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.size_label) {
      toast.error('Nom et taille requis'); return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        surface_m2: formData.surface_m2 !== '' ? Number(formData.surface_m2) : null,
        price_per_day: Number(formData.price_per_day),
        stock_total: Number(formData.stock_total),
        stock_available: Number(formData.stock_available),
      };
      if (editingId) {
        const { error } = await (supabase as any).from('chapiteau_items').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Article mis à jour');
      } else {
        const { error } = await (supabase as any).from('chapiteau_items').insert(payload);
        if (error) throw error;
        toast.success('Article créé');
      }
      setShowForm(false);
      fetchItems();
    } catch (e: any) {
      toast.error(e.message || 'Erreur sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    const { error } = await (supabase as any).from('chapiteau_items').delete().eq('id', id);
    if (error) { toast.error('Erreur suppression'); return; }
    toast.success('Article supprimé');
    fetchItems();
  };

  const toggleActive = async (item: ChapiteauItem) => {
    const { error } = await (supabase as any)
      .from('chapiteau_items').update({ is_active: !item.is_active }).eq('id', item.id);
    if (error) { toast.error('Erreur mise à jour'); return; }
    fetchItems();
  };

  /* ─────────────────────────── Order actions ─────────────── */
  const updateOrderStatus = async (orderId: string, field: 'status' | 'payment_status', value: string) => {
    setUpdatingId(orderId);
    try {
      const update: Record<string, string> = { [field]: value };
      if (field === 'payment_status' && value === 'paid') {
        update['paid_at'] = new Date().toISOString();
      }
      const { error } = await (supabase as any)
        .from('chapiteau_orders').update(update).eq('id', orderId);
      if (error) throw error;
      toast.success('Commande mise à jour');
      fetchOrders();
    } catch {
      toast.error('Erreur mise à jour commande');
    } finally {
      setUpdatingId(null);
    }
  };

  /* ─────────────────────────── CSV export ────────────────── */
  const exportCSV = () => {
    const rows = [
      ['N° Facture','Article','Taille','Client','Type','Qté','Début','Fin','Jours','Montant','Statut pmt','Statut cmd','Date'],
      ...orders.map(o => [
        o.invoice_number ?? '',
        o.chapiteau_items?.name ?? '',
        o.chapiteau_items?.size_label ?? '',
        o.customer_email ?? '',
        o.customer_type,
        o.quantity,
        o.rental_start, o.rental_end, o.total_days,
        `${o.total_amount} ${o.currency}`,
        o.payment_status, o.status,
        new Date(o.created_at).toLocaleDateString('fr-FR'),
      ]),
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `chapiteaux_commandes_${Date.now()}.csv`; a.click();
  };

  /* ─────────────────────────── Filtered data ─────────────── */
  const filteredItems = useMemo(() =>
    items.filter(i => i.name.toLowerCase().includes(searchItems.toLowerCase()) ||
      i.size_label.toLowerCase().includes(searchItems.toLowerCase())),
    [items, searchItems]);

  const filteredOrders = useMemo(() =>
    orders.filter(o =>
      (statusFilter === 'all' || o.status === statusFilter) &&
      (searchOrders === '' ||
        (o.customer_email ?? '').toLowerCase().includes(searchOrders.toLowerCase()) ||
        (o.invoice_number ?? '').toLowerCase().includes(searchOrders.toLowerCase()) ||
        (o.chapiteau_items?.name ?? '').toLowerCase().includes(searchOrders.toLowerCase()))
    ),
    [orders, statusFilter, searchOrders]);

  /* ─────────────────────────── Render ─────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={ROUTES.ADMIN_DASHBOARD} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                <Tent className="w-5 h-5 text-[#C9A84C]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Location de Chapiteaux</h1>
                <p className="text-xs text-gray-500">Gestion du catalogue et des réservations</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            {tab === 'items' && (
              <button onClick={openNew}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition"
                style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                <Plus className="w-4 h-4" /> Nouveau chapiteau
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Articles', value: stats.totalItems, icon: <Tent className="w-5 h-5" />, color: 'text-[#0B1C3D]' },
            { label: 'Actifs', value: stats.activeItems, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600' },
            { label: 'Stock faible', value: stats.lowStock, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber-600' },
            { label: 'Commandes', value: stats.totalOrders, icon: <ShoppingBag className="w-5 h-5" />, color: 'text-blue-600' },
            { label: 'En attente', value: stats.pendingOrders, icon: <TrendingUp className="w-5 h-5" />, color: 'text-orange-600' },
            { label: 'Revenu', value: `${stats.totalRevenue.toLocaleString('fr-MA')} MAD`, icon: <CreditCard className="w-5 h-5" />, color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`${s.color} mb-1`}>{s.icon}</div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(['items', 'orders'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                tab === t ? 'bg-white text-[#0B1C3D] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'items' ? '⛺ Articles' : '📋 Commandes'}
            </button>
          ))}
        </div>

        {/* ── Tab: Items ── */}
        {tab === 'items' && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={searchItems} onChange={e => setSearchItems(e.target.value)}
                  placeholder="Rechercher un chapiteau…"
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] outline-none" />
              </div>
              <button onClick={fetchItems}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <motion.div key={item.id} layout
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Image */}
                  <div className="relative h-44 bg-gradient-to-br from-[#0B1C3D] to-[#1e3a5f]">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name}
                        className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Tent className="w-16 h-16 text-[#C9A84C]/40" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button onClick={() => toggleActive(item)}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                        }`}>
                        {item.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </div>
                    {item.includes_installation && (
                      <div className="absolute bottom-2 left-2 bg-[#C9A84C] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        Installation incluse
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Ruler className="w-3 h-3" /> {item.size_label}
                          </span>
                          {item.surface_m2 && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Maximize className="w-3 h-3" /> {item.surface_m2} m²
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#C9A84C]">
                          {item.price_per_day.toLocaleString('fr-MA')}
                        </div>
                        <div className="text-xs text-gray-400">MAD/jour</div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-gray-600">
                        Stock : <span className={`font-semibold ${item.stock_available <= 2 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.stock_available}/{item.stock_total}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-[#0B1C3D]/5 hover:bg-[#0B1C3D]/10 text-[#0B1C3D] rounded-lg transition">
                        <Edit2 className="w-3.5 h-3.5" /> Modifier
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Tent className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucun chapiteau trouvé</p>
                <button onClick={openNew} className="mt-3 text-sm text-[#C9A84C] hover:underline">
                  Ajouter le premier chapiteau
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Orders ── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={searchOrders} onChange={e => setSearchOrders(e.target.value)}
                  placeholder="Rechercher email, facture, article…"
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] outline-none">
                  <option value="all">Tous les statuts</option>
                  {Object.entries(ORDER_STATUS).map(([v, s]) => (
                    <option key={v} value={v}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Facture','Chapiteau','Client','Période','Montant','Paiement','Statut','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map(order => (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50/50 transition cursor-pointer"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-600">{order.invoice_number ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{order.chapiteau_items?.name ?? '—'}</div>
                          <div className="text-xs text-gray-400">{order.chapiteau_items?.size_label ?? ''}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-700">{order.customer_email ?? '—'}</div>
                          <div className="text-xs text-gray-400 capitalize">{order.customer_type}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {order.rental_start} → {order.rental_end}
                          <div className="text-gray-400">{order.total_days}j × {order.quantity}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {order.total_amount.toLocaleString('fr-MA')} MAD
                        </td>
                        <td className="px-4 py-3">
                          <Pill cfg={PAYMENT_STATUS[order.payment_status] ?? PAYMENT_STATUS['pending']} />
                        </td>
                        <td className="px-4 py-3">
                          <Pill cfg={ORDER_STATUS[order.status] ?? ORDER_STATUS['pending']} />
                        </td>
                        <td className="px-4 py-3">
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedOrder === order.id ? 'rotate-180' : ''
                          }`} />
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedOrder === order.id && (
                          <tr>
                            <td colSpan={8} className="p-0">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-blue-50/30 px-6 py-4 border-t border-blue-100/50">
                                <div className="flex flex-wrap gap-4 items-end">
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Statut commande</label>
                                    <select
                                      value={order.status}
                                      disabled={updatingId === order.id}
                                      onChange={e => updateOrderStatus(order.id, 'status', e.target.value)}
                                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-[#C9A84C]/30 outline-none">
                                      {Object.entries(ORDER_STATUS).map(([v, s]) => (
                                        <option key={v} value={v}>{s.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Statut paiement</label>
                                    <select
                                      value={order.payment_status}
                                      disabled={updatingId === order.id}
                                      onChange={e => updateOrderStatus(order.id, 'payment_status', e.target.value)}
                                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-[#C9A84C]/30 outline-none">
                                      {Object.entries(PAYMENT_STATUS).map(([v, s]) => (
                                        <option key={v} value={v}>{s.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                  {updatingId === order.id && (
                                    <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
                                  )}
                                  {order.notes && (
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500 font-semibold mb-1">Notes</p>
                                      <p className="text-sm text-gray-700">{order.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Aucune commande trouvée</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Form Item ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId ? 'Modifier le chapiteau' : 'Nouveau chapiteau'}
                </h2>
                <button onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
                  <div className="flex items-center gap-4">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="preview"
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden"
                        onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                      <button onClick={() => fileRef.current?.click()} disabled={uploading}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Choisir image'}
                      </button>
                      {formData.image_url && (
                        <button onClick={() => setFormData(p => ({ ...p, image_url: '' }))}
                          className="ml-2 text-sm text-red-400 hover:text-red-600">
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nom */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nom *</label>
                    <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="ex: Chapiteau 5×5m"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Taille *</label>
                    <input value={formData.size_label} onChange={e => setFormData(p => ({ ...p, size_label: e.target.value }))}
                      placeholder="ex: 5×5m"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] outline-none" />
                  </div>
                </div>

                {/* Surface + Prix */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Surface (m²)</label>
                    <input type="number" min="0" value={formData.surface_m2}
                      onChange={e => setFormData(p => ({ ...p, surface_m2: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Prix/jour (MAD)</label>
                    <input type="number" min="0" value={formData.price_per_day}
                      onChange={e => setFormData(p => ({ ...p, price_per_day: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Devise</label>
                    <select value={formData.currency}
                      onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] outline-none">
                      <option>MAD</option><option>EUR</option><option>USD</option>
                    </select>
                  </div>
                </div>

                {/* Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stock total</label>
                    <input type="number" min="1" value={formData.stock_total}
                      onChange={e => setFormData(p => ({ ...p, stock_total: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stock disponible</label>
                    <input type="number" min="0" value={formData.stock_available}
                      onChange={e => setFormData(p => ({ ...p, stock_available: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] outline-none" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] outline-none resize-none" />
                </div>

                {/* Options */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.includes_installation}
                      onChange={e => setFormData(p => ({ ...p, includes_installation: e.target.checked }))}
                      className="w-4 h-4 accent-[#C9A84C]" />
                    <span className="text-sm text-gray-700">Installation incluse</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_active}
                      onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                      className="w-4 h-4 accent-[#C9A84C]" />
                    <span className="text-sm text-gray-700">Article actif</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  Annuler
                </button>
                <button onClick={handleSaveItem} disabled={isSaving || uploading}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
