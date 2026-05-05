import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Loader2, Plus, Edit2, Save, X, Trash2,
  TrendingUp, ShoppingBag, AlertTriangle, Search,
  CheckCircle2, CreditCard, Filter, RefreshCw, Image as ImageIcon,
  ChevronDown, Download, ArrowLeft,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';

interface RentalItem {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price_per_day: number;
  currency: string;
  stock_total: number;
  stock_available: number;
  image_url: string;
  is_active: boolean;
}

interface RentalOrder {
  id: string;
  item_id: string;
  customer_id: string;
  customer_type: string;
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
  created_at: string;
  customer_email: string | null;
  rental_items: { name: string; category: string } | null;
}

const CATEGORIES = ['mobilier', 'audiovisuel', 'structure', 'decoration', 'autre'];

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

const EMPTY_FORM = {
  name: '', description: '', category: 'mobilier', unit: 'unité',
  price_per_day: 0, currency: 'MAD', stock_total: 1, stock_available: 1,
  image_url: '', is_active: true,
};

const EMPTY_ORDER_FORM = {
  item_id: '',
  customer_email: '',
  customer_type: 'exhibitor',
  quantity: 1,
  rental_start: '',
  rental_end: '',
  payment_method: '',
  payment_ref: '',
  payment_status: 'pending',
  status: 'pending',
  notes: '',
};

const PAYMENT_METHODS = ['espèces', 'virement', 'carte bancaire', 'chèque', 'autre'];

const Pill: React.FC<Readonly<{ cfg: { label: string; color: string } }>> = ({ cfg }) => (
  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
    {cfg.label}
  </span>
);

export default function AdminRentalPage() {
  const [items, setItems]     = useState<RentalItem[]>([]);
  const [orders, setOrders]   = useState<RentalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab]         = useState<'items' | 'orders'>('items');

  /* item form */
  const [showForm, setShowForm]       = useState(false);
  const [editingItem, setEditingItem] = useState<RentalItem | null>(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [isSaving, setIsSaving]       = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);

  /* filters */
  const [itemSearch, setItemSearch]               = useState('');
  const [itemCatFilter, setItemCatFilter]         = useState('all');
  const [orderSearch, setOrderSearch]             = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPayFilter, setOrderPayFilter]       = useState('all');
  const [expandedOrder, setExpandedOrder]         = useState<string | null>(null);

  /* order form */
  const [showOrderForm, setShowOrderForm]     = useState(false);
  const [editingOrder, setEditingOrder]       = useState<RentalOrder | null>(null);
  const [orderForm, setOrderForm]             = useState(EMPTY_ORDER_FORM);
  const [isSavingOrder, setIsSavingOrder]     = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [payRefs, setPayRefs]                 = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage]   = useState(false);
  const fileInputRef                          = useRef<HTMLInputElement>(null);

  /* ── upload image article ── */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { return; }
    if (!file.type.startsWith('image/')) { toast.error('Fichier non supporté — choisissez une image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image trop lourde (max 5 Mo)'); return; }
    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `rental-items/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) {
        if (upErr.message?.includes('Bucket not found') || upErr.message?.includes('bucket')) {
          throw new Error('Bucket "media" introuvable — exécutez migrations/20260502_create_storage_buckets.sql dans Supabase Dashboard → SQL Editor');
        }
        throw upErr;
      }
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      setForm(f => ({ ...f, image_url: publicUrl }));
      toast.success('Image téléchargée');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) { fileInputRef.current.value = ''; }
    }
  };

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [{ data: itemsData, error: e1 }, { data: ordersData, error: e2 }] = await Promise.all([
        (supabase as any).from('rental_items').select('*').order('category').order('name'),
        (supabase as any)
          .from('rental_orders')
          .select('*, rental_items(name, category)')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);
      if (e1) { throw e1; }
      if (e2) { throw e2; }
      setItems(itemsData ?? []);
      setOrders(ordersData ?? []);
    } catch {
      toast.error('Erreur chargement données');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── save item ── */
  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Le nom est requis'); return; }
    if (form.price_per_day < 0) { toast.error('Le prix ne peut pas être négatif'); return; }
    if (form.stock_total < 0) { toast.error('Le stock ne peut pas être négatif'); return; }
    setIsSaving(true);
    try {
      if (editingItem) {
        const { error } = await (supabase as any).from('rental_items').update({ ...form }).eq('id', editingItem.id);
        if (error) { throw error; }
        toast.success('Article mis à jour');
      } else {
        const { error } = await (supabase as any).from('rental_items').insert({ ...form });
        if (error) { throw error; }
        toast.success('Article ajouté');
      }
      setShowForm(false);
      setEditingItem(null);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  /* ── delete item ── */
  const handleDelete = async (item: RentalItem) => {
    if (!globalThis.confirm(`Supprimer définitivement "${item.name}" ?`)) { return; }
    setDeletingId(item.id);
    try {
      const { error } = await (supabase as any).from('rental_items').delete().eq('id', item.id);
      if (error) { throw error; }
      toast.success('Article supprimé');
      fetchData();
    } catch (err: any) {
      toast.error(err?.message ?? 'Impossible de supprimer (commandes existantes ?)');
    } finally {
      setDeletingId(null);
    }
  };

  /* ── toggle active ── */
  const handleToggleActive = async (item: RentalItem) => {
    await (supabase as any).from('rental_items').update({ is_active: !item.is_active }).eq('id', item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
  };

  /* ── update order status ── */
  const handleOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await (supabase as any).from('rental_orders').update({ status }).eq('id', orderId);
      if (error) { throw error; }
      toast.success('Statut commande mis à jour');
      fetchData();
    } catch (err: any) { toast.error(err?.message ?? 'Erreur'); }
  };

  /* ── update payment status ── */
  const handlePaymentStatus = async (orderId: string, payment_status: string, ref?: string) => {
    try {
      const patch: Record<string, string | null> = { payment_status };
      if (payment_status === 'paid') {
        patch.paid_at = new Date().toISOString();
        if (ref) { patch.payment_ref = ref; }
      }
      const { error } = await (supabase as any).from('rental_orders').update(patch).eq('id', orderId);
      if (error) { throw error; }
      toast.success('Paiement mis à jour');
      fetchData();
    } catch (err: any) { toast.error(err?.message ?? 'Erreur'); }
  };

  /* ── create / update order ── */
  const handleSaveOrder = async () => {
    const { item_id, customer_email, quantity, rental_start, rental_end } = orderForm;
    if (!item_id) { toast.error('Sélectionnez un article'); return; }
    if (!customer_email.trim()) { toast.error('Email client requis'); return; }
    if (!rental_start || !rental_end) { toast.error('Dates de location requises'); return; }
    if (rental_end < rental_start) { toast.error('La date de fin doit être après le début'); return; }
    setIsSavingOrder(true);
    try {
      const { data: userData } = await (supabase as any)
        .from('users').select('id').eq('email', customer_email.trim().toLowerCase()).maybeSingle();
      const days = Math.max(1, Math.ceil(
        (new Date(rental_end).getTime() - new Date(rental_start).getTime()) / 86400000
      ) + 1);
      const item = items.find(i => i.id === item_id);
      const unitPrice = item?.price_per_day ?? 0;
      const totalAmount = unitPrice * quantity * days;
      const payload = {
        item_id,
        customer_id: userData?.id ?? null,
        customer_email: customer_email.trim(),
        customer_type: orderForm.customer_type,
        quantity,
        rental_start,
        rental_end,
        unit_price: unitPrice,
        total_amount: totalAmount,
        currency: item?.currency ?? 'MAD',
        payment_method: orderForm.payment_method || null,
        payment_ref: orderForm.payment_ref || null,
        payment_status: orderForm.payment_status,
        status: orderForm.status,
        notes: orderForm.notes || null,
      };
      if (editingOrder) {
        const { error } = await (supabase as any).from('rental_orders').update(payload).eq('id', editingOrder.id);
        if (error) { throw error; }
        toast.success('Commande mise à jour');
      } else {
        const { error } = await (supabase as any).from('rental_orders').insert(payload);
        if (error) { throw error; }
        toast.success('Commande créée');
        if (item) {
          await (supabase as any).from('rental_items')
            .update({ stock_available: Math.max(0, item.stock_available - quantity) })
            .eq('id', item_id);
        }
      }
      setShowOrderForm(false);
      setEditingOrder(null);
      setOrderForm(EMPTY_ORDER_FORM);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setIsSavingOrder(false);
    }
  };

  /* ── delete order ── */
  const handleDeleteOrder = async (orderId: string) => {
    if (!globalThis.confirm('Supprimer définitivement cette commande ?')) { return; }
    setDeletingOrderId(orderId);
    try {
      const { error } = await (supabase as any).from('rental_orders').delete().eq('id', orderId);
      if (error) { throw error; }
      toast.success('Commande supprimée');
      fetchData();
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur suppression');
    } finally {
      setDeletingOrderId(null);
    }
  };

  /* ── open order for edit ── */
  const openEditOrder = (order: RentalOrder) => {
    setEditingOrder(order);
    setOrderForm({
      item_id: order.item_id,
      customer_email: order.customer_email ?? '',
      customer_type: order.customer_type,
      quantity: order.quantity,
      rental_start: order.rental_start,
      rental_end: order.rental_end,
      payment_method: order.payment_method ?? '',
      payment_ref: order.payment_ref ?? '',
      payment_status: order.payment_status,
      status: order.status,
      notes: order.notes ?? '',
    });
    setShowOrderForm(true);
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── export CSV ── */
  const exportCSV = () => {
    const headers = ['ID','Article','Client','Email','Type','Qté','Début','Fin','Jours','Prix unit.','Total','Devise','Statut','Paiement','Méthode','Réf paiement','Date paiement','Notes','Créé le'];
    const rows = filteredOrders.map(o => [
      o.id.slice(0, 8),
      o.rental_items?.name ?? '',
      '',
      o.customer_email ?? '',
      o.customer_type,
      o.quantity,
      o.rental_start,
      o.rental_end,
      o.total_days,
      o.unit_price,
      o.total_amount,
      o.currency,
      ORDER_STATUS[o.status]?.label ?? o.status,
      PAYMENT_STATUS[o.payment_status]?.label ?? o.payment_status,
      o.payment_method ?? '',
      o.payment_ref ?? '',
      o.paid_at ? new Date(o.paid_at).toLocaleDateString('fr-FR') : '',
      (o.notes ?? '').replace(/\n/g, ' '),
      new Date(o.created_at).toLocaleDateString('fr-FR'),
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes_location_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── stats ── */
  const stats = useMemo(() => ({
    totalItems:    items.length,
    activeItems:   items.filter(i => i.is_active).length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    unpaidAmount:  orders
      .filter(o => o.payment_status === 'pending' && o.status !== 'cancelled')
      .reduce((s, o) => s + o.total_amount, 0),
    paidRevenue:   orders
      .filter(o => o.payment_status === 'paid')
      .reduce((s, o) => s + o.total_amount, 0),
    criticalStock: items.filter(i => i.is_active && i.stock_available < 2).length,
  }), [items, orders]);

  /* ── filtered lists ── */
  const filteredItems = useMemo(() => items.filter(i => {
    const q = itemSearch.toLowerCase();
    const matchQ = !q || i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q);
    const matchCat = itemCatFilter === 'all' || i.category === itemCatFilter;
    return matchQ && matchCat;
  }), [items, itemSearch, itemCatFilter]);

  const filteredOrders = useMemo(() => orders.filter(o => {
    const q = orderSearch.toLowerCase();
    const matchQ = !q
      || (o.rental_items?.name ?? '').toLowerCase().includes(q)
      || (o.customer_email ?? '').toLowerCase().includes(q);
    const matchS = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchP = orderPayFilter === 'all' || o.payment_status === orderPayFilter;
    return matchQ && matchS && matchP;
  }), [orders, orderSearch, orderStatusFilter, orderPayFilter]);

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Tableau de Bord
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-3 rounded-xl">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Location de matériel</h1>
            <p className="text-sm text-gray-500">Catalogue, stock, commandes et paiements</p>
          </div>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Articles actifs',      value: `${stats.activeItems} / ${stats.totalItems}`, icon: Package,       color: 'text-emerald-600' },
          { label: 'Commandes en attente', value: stats.pendingOrders,                          icon: ShoppingBag,   color: 'text-amber-600' },
          { label: 'Stock critique',       value: stats.criticalStock,                          icon: AlertTriangle, color: 'text-red-600' },
          { label: 'Revenus encaissés',    value: `${stats.paidRevenue.toLocaleString('fr-MA')} MAD`, icon: CreditCard, color: 'text-blue-600' },
          { label: 'En attente paiement',  value: `${stats.unpaidAmount.toLocaleString('fr-MA')} MAD`, icon: TrendingUp, color: 'text-violet-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <div className="text-lg font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['items', 'orders'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === t ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
            }`}>
            {t === 'items' ? '📦 Articles / Stock' : '🛍️ Commandes'}
          </button>
        ))}
        {tab === 'items' && (
          <button
            onClick={() => { setEditingItem(null); setForm(EMPTY_FORM); setShowForm(v => !v); }}
            className="ml-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nouvel article
          </button>
        )}
        {tab === 'orders' && (
          <button
            onClick={() => { setEditingOrder(null); setOrderForm(EMPTY_ORDER_FORM); setShowOrderForm(v => !v); }}
            className="ml-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nouvelle commande
          </button>
        )}
      </div>

      {/* ════════════════ ITEMS TAB ════════════════ */}
      {tab === 'items' && (
        <>
          {/* Formulaire */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-xl border border-emerald-100 p-5 mb-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{editingItem ? 'Modifier l\'article' : 'Nouvel article'}</h3>
                    <button onClick={() => { setShowForm(false); setEditingItem(null); setForm(EMPTY_FORM); }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label htmlFor="item-name" className="text-xs font-medium text-gray-600 mb-1 block">Nom *</label>
                      <input id="item-name" type="text" value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Ex: Télévision 55 pouces, Table pliante..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label htmlFor="item-desc" className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                      <textarea id="item-desc" value={form.description ?? ''}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        rows={2} placeholder="Caractéristiques, dimensions, marque..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                    </div>
                    <div>
                      <label htmlFor="item-cat" className="text-xs font-medium text-gray-600 mb-1 block">Catégorie</label>
                      <select id="item-cat" value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="item-unit" className="text-xs font-medium text-gray-600 mb-1 block">Unité</label>
                      <input id="item-unit" type="text" value={form.unit}
                        onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                        placeholder="unité, m², kit, jour..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label htmlFor="item-price" className="text-xs font-medium text-gray-600 mb-1 block">Prix / jour (MAD)</label>
                      <input id="item-price" type="number" min={0} step={0.01} value={form.price_per_day}
                        onChange={e => setForm(f => ({ ...f, price_per_day: Number.parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label htmlFor="item-stock-total" className="text-xs font-medium text-gray-600 mb-1 block">Stock total</label>
                      <input id="item-stock-total" type="number" min={0} value={form.stock_total}
                        onChange={e => {
                          const n = Number.parseInt(e.target.value, 10) || 0;
                          setForm(f => ({ ...f, stock_total: n, stock_available: Math.min(f.stock_available, n) }));
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label htmlFor="item-stock-avail" className="text-xs font-medium text-gray-600 mb-1 block">Stock disponible</label>
                      <input id="item-stock-avail" type="number" min={0} max={form.stock_total} value={form.stock_available}
                        onChange={e => setForm(f => ({ ...f, stock_available: Math.min(Number.parseInt(e.target.value, 10) || 0, f.stock_total) }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label htmlFor="item-image" className="text-xs font-medium text-gray-600 mb-1 block">
                        <ImageIcon className="inline h-3 w-3 mr-1" />Image article
                      </label>
                      <div className="flex flex-col gap-2">
                        {form.image_url && (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            <img src={form.image_url} alt="aperçu" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                              className="absolute top-0.5 right-0.5 bg-white/90 hover:bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2 items-center">
                          <input
                            ref={fileInputRef}
                            id="item-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                          >
                            {uploadingImage
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <ImageIcon className="h-3.5 w-3.5" />}
                            {uploadingImage ? 'Envoi...' : 'Choisir depuis le PC'}
                          </button>
                          <span className="text-xs text-gray-400">ou</span>
                          <input
                            type="url"
                            value={form.image_url ?? ''}
                            onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                            placeholder="https://..."
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="is_active" checked={form.is_active}
                        onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                        className="rounded border-gray-300 text-emerald-600" />
                      <label htmlFor="is_active" className="text-sm text-gray-700">Actif (visible catalogue)</label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                    <button onClick={() => { setShowForm(false); setEditingItem(null); setForm(EMPTY_FORM); }}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                      Annuler
                    </button>
                    <button onClick={handleSave} disabled={isSaving}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {editingItem ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filtres articles */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Rechercher un article..." value={itemSearch}
                onChange={e => setItemSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-gray-400" />
              <select value={itemCatFilter} onChange={e => setItemCatFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="all">Toutes catégories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Liste articles */}
          {isLoading && (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
          )}
          {!isLoading && filteredItems.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun article trouvé</p>
            </div>
          )}
          {!isLoading && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden transition ${
                    item.is_active ? 'border-gray-100 hover:border-emerald-200' : 'opacity-55 border-gray-100'
                  }`}>
                  <div className="relative w-full h-36 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <Package className="h-10 w-10 text-gray-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h3>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
                        {item.category}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-emerald-700">
                        {item.price_per_day.toLocaleString('fr-MA')} MAD
                        <span className="text-xs font-normal text-gray-400"> / {item.unit}</span>
                      </span>
                      <span className={`text-xs font-semibold ${item.stock_available < 2 ? 'text-red-600' : 'text-gray-600'}`}>
                        {item.stock_available}/{item.stock_total} dispo
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => { setEditingItem(item); setForm({ ...item, description: item.description ?? '', image_url: item.image_url ?? '' }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Modifier
                      </button>
                      <button onClick={() => handleToggleActive(item)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition ${
                          item.is_active
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                        }`}>
                        {item.is_active ? 'Actif' : 'Inactif'}
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="ml-auto p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        {deletingId === item.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════ ORDERS TAB ════════════════ */}
      {tab === 'orders' && (
        <>
          {/* Formulaire commande */}
          <AnimatePresence>
            {showOrderForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{editingOrder ? 'Modifier la commande' : 'Nouvelle commande'}</h3>
                    <button onClick={() => { setShowOrderForm(false); setEditingOrder(null); setOrderForm(EMPTY_ORDER_FORM); }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label htmlFor="of-item" className="text-xs font-medium text-gray-600 mb-1 block">Article *</label>
                      <select id="of-item" value={orderForm.item_id}
                        onChange={e => setOrderForm(f => ({ ...f, item_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
                        <option value="">-- Sélectionner un article --</option>
                        {items.filter(i => i.is_active).map(i => (
                          <option key={i.id} value={i.id}>{i.name} — {i.price_per_day} {i.currency}/{i.unit} (dispo : {i.stock_available})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="of-email" className="text-xs font-medium text-gray-600 mb-1 block">Email client *</label>
                      <input id="of-email" type="email" value={orderForm.customer_email}
                        onChange={e => setOrderForm(f => ({ ...f, customer_email: e.target.value }))}
                        placeholder="client@example.com"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label htmlFor="of-type" className="text-xs font-medium text-gray-600 mb-1 block">Type client</label>
                      <select id="of-type" value={orderForm.customer_type}
                        onChange={e => setOrderForm(f => ({ ...f, customer_type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
                        {['exhibitor','partner','visitor','autre'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="of-qty" className="text-xs font-medium text-gray-600 mb-1 block">Quantité *</label>
                      <input id="of-qty" type="number" min={1} value={orderForm.quantity}
                        onChange={e => setOrderForm(f => ({ ...f, quantity: Math.max(1, Number.parseInt(e.target.value, 10) || 1) }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label htmlFor="of-start" className="text-xs font-medium text-gray-600 mb-1 block">Date début *</label>
                      <input id="of-start" type="date" value={orderForm.rental_start}
                        onChange={e => setOrderForm(f => ({ ...f, rental_start: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label htmlFor="of-end" className="text-xs font-medium text-gray-600 mb-1 block">Date fin *</label>
                      <input id="of-end" type="date" value={orderForm.rental_end}
                        min={orderForm.rental_start}
                        onChange={e => setOrderForm(f => ({ ...f, rental_end: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    {orderForm.item_id && orderForm.rental_start && orderForm.rental_end && orderForm.rental_end >= orderForm.rental_start && (() => {
                      const it = items.find(i => i.id === orderForm.item_id);
                      const days = Math.max(1, Math.ceil((new Date(orderForm.rental_end).getTime() - new Date(orderForm.rental_start).getTime()) / 86400000) + 1);
                      const total = (it?.price_per_day ?? 0) * orderForm.quantity * days;
                      return it ? (
                        <div className="sm:col-span-2 lg:col-span-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">
                          <strong>{orderForm.quantity} × {it.price_per_day} MAD/jour × {days} jour(s) = </strong>
                          <span className="font-bold text-emerald-700">{total.toLocaleString('fr-MA')} {it.currency}</span>
                        </div>
                      ) : null;
                    })()}
                    <div>
                      <label htmlFor="of-paymethod" className="text-xs font-medium text-gray-600 mb-1 block">Méthode paiement</label>
                      <select id="of-paymethod" value={orderForm.payment_method}
                        onChange={e => setOrderForm(f => ({ ...f, payment_method: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
                        <option value="">-- Non définie --</option>
                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="of-payref" className="text-xs font-medium text-gray-600 mb-1 block">Référence paiement</label>
                      <input id="of-payref" type="text" value={orderForm.payment_ref}
                        onChange={e => setOrderForm(f => ({ ...f, payment_ref: e.target.value }))}
                        placeholder="N° virement, chèque..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label htmlFor="of-status" className="text-xs font-medium text-gray-600 mb-1 block">Statut commande</label>
                      <select id="of-status" value={orderForm.status}
                        onChange={e => setOrderForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
                        {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="of-paystatus" className="text-xs font-medium text-gray-600 mb-1 block">Statut paiement</label>
                      <select id="of-paystatus" value={orderForm.payment_status}
                        onChange={e => setOrderForm(f => ({ ...f, payment_status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
                        {Object.entries(PAYMENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label htmlFor="of-notes" className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
                      <textarea id="of-notes" value={orderForm.notes}
                        onChange={e => setOrderForm(f => ({ ...f, notes: e.target.value }))}
                        rows={2} placeholder="Instructions de livraison, remarques..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => { setShowOrderForm(false); setEditingOrder(null); setOrderForm(EMPTY_ORDER_FORM); }}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                    <button onClick={handleSaveOrder} disabled={isSavingOrder}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                      {isSavingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {editingOrder ? 'Mettre à jour' : 'Créer la commande'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filtres commandes */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Article, email client..." value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="all">Tous statuts</option>
              {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={orderPayFilter} onChange={e => setOrderPayFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="all">Tous paiements</option>
              {Object.entries(PAYMENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button onClick={exportCSV} title="Exporter en CSV"
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-emerald-300">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
          )}
          {!isLoading && filteredOrders.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune commande trouvée</p>
            </div>
          )}
          {!isLoading && filteredOrders.length > 0 && (
            <div className="space-y-3">
              {filteredOrders.map(order => {
                const isExpanded = expandedOrder === order.id;
                const oStatus = ORDER_STATUS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
                const pStatus = PAYMENT_STATUS[order.payment_status] ?? { label: order.payment_status, color: 'bg-gray-100 text-gray-600 border-gray-200' };

                return (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* row summary */}
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 flex-wrap text-left"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">
                          {order.rental_items?.name ?? '—'}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {order.customer_email ?? order.customer_id?.slice(0, 8) ?? '—'}
                          {' · '}{order.customer_type}
                          {' · '}{new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Pill cfg={oStatus} />
                        <Pill cfg={pStatus} />
                        <span className="text-sm font-bold text-gray-800 ml-1">
                          {order.total_amount.toLocaleString('fr-MA')} {order.currency}
                        </span>
                      </div>
                    </button>

                    {/* expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-gray-100"
                        >
                          <div className="p-4 bg-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div>
                              <div className="text-xs text-gray-400 mb-0.5">Article</div>
                              <div className="font-medium text-gray-800">{order.rental_items?.name}</div>
                              <div className="text-xs text-gray-400">{order.rental_items?.category}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-0.5">Période · Qté</div>
                              <div className="font-medium text-gray-800">{order.rental_start} → {order.rental_end}</div>
                              <div className="text-xs text-gray-400">{order.total_days} jour(s) · qté {order.quantity}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-0.5">Client</div>
                              <div className="font-medium text-gray-800 truncate">{order.customer_email ?? '—'}</div>
                              <div className="text-xs text-gray-400 truncate">{order.customer_type}</div>
                              <div className="text-xs text-gray-400">{order.customer_type}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-0.5">Paiement</div>
                              <div className="font-medium text-gray-800">{order.payment_method ?? '—'}</div>
                              {order.payment_ref && <div className="text-xs text-gray-400">Réf : {order.payment_ref}</div>}
                              {order.paid_at && (
                                <div className="text-xs text-emerald-600">
                                  Payé le {new Date(order.paid_at).toLocaleDateString('fr-FR')}
                                </div>
                              )}
                            </div>
                            {order.notes && (
                              <div className="col-span-2 sm:col-span-4">
                                <div className="text-xs text-gray-400 mb-0.5">Notes</div>
                                <div className="text-sm text-gray-600">{order.notes}</div>
                              </div>
                            )}
                          </div>

                          {/* actions */}
                          <div className="p-4 flex flex-col gap-3 border-t border-gray-100 bg-white">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-gray-500">Commande :</span>
                              {order.status === 'pending' && (
                                <>
                                  <button onClick={() => handleOrderStatus(order.id, 'confirmed')}
                                    className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-700">
                                    Confirmer
                                  </button>
                                  <button onClick={() => handleOrderStatus(order.id, 'cancelled')}
                                    className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600">
                                    Annuler
                                  </button>
                                </>
                              )}
                              {order.status === 'confirmed' && (
                                <button onClick={() => handleOrderStatus(order.id, 'delivered')}
                                  className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700">
                                  Marquer livrée
                                </button>
                              )}
                              {order.status === 'delivered' && (
                                <button onClick={() => handleOrderStatus(order.id, 'returned')}
                                  className="text-xs bg-purple-600 text-white px-2.5 py-1 rounded-lg hover:bg-purple-700">
                                  Matériel retourné
                                </button>
                              )}
                              <button onClick={() => openEditOrder(order)}
                                className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg hover:bg-gray-50 ml-auto">
                                <Edit2 className="h-3 w-3" /> Modifier
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                disabled={deletingOrderId === order.id}
                                className="flex items-center gap-1 text-xs border border-red-200 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-50">
                                {deletingOrderId === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                Supprimer
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
                              <span className="text-xs text-gray-500">Paiement :</span>
                              {order.payment_status !== 'paid' && (
                                <>
                                  <input
                                    type="text"
                                    value={payRefs[order.id] ?? ''}
                                    onChange={e => setPayRefs(r => ({ ...r, [order.id]: e.target.value }))}
                                    placeholder="Référence paiement (optionnel)"
                                    className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-400 outline-none w-44"
                                  />
                                  <button
                                    onClick={() => handlePaymentStatus(order.id, 'paid', payRefs[order.id])}
                                    className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-lg hover:bg-emerald-700">
                                    <CheckCircle2 className="h-3 w-3" /> Marquer payé
                                  </button>
                                </>
                              )}
                              {order.payment_status === 'paid' && (
                                <button onClick={() => handlePaymentStatus(order.id, 'refunded')}
                                  className="text-xs bg-violet-600 text-white px-2.5 py-1 rounded-lg hover:bg-violet-700">
                                  Rembourser
                                </button>
                              )}
                              {order.payment_status === 'pending' && (
                                <button onClick={() => handlePaymentStatus(order.id, 'failed')}
                                  className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600">
                                  Paiement échoué
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
