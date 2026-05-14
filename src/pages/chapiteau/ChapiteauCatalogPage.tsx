import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, ArrowLeft, Tent, Plus, Minus,
  CreditCard, Calendar, Loader2, Ruler, Maximize, CheckCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
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
  stock_available: number;
  image_url?: string;
}

interface CartItem extends ChapiteauItem {
  quantity: number;
}

const RENTAL_START = '2026-11-25';
const RENTAL_END   = '2026-11-29';
const RENTAL_DAYS  = 5;

interface ChapiteauCatalogPageProps {
  userType: 'exhibitor' | 'partner';
}

export default function ChapiteauCatalogPage({ userType }: ChapiteauCatalogPageProps) {
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  const { t }     = useTranslation();

  const [items, setItems]       = useState<ChapiteauItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart]           = useState<Record<string, CartItem>>({});
  const [showCart, setShowCart]   = useState(false);
  const [entityId, setEntityId]   = useState<string | null>(null);
  const [myOrders, setMyOrders]   = useState<any[]>([]);

  const dashboardRoute = userType === 'exhibitor' ? ROUTES.EXHIBITOR_DASHBOARD : ROUTES.PARTNER_DASHBOARD;

  const fetchEntity = useCallback(async () => {
    if (!user?.id) { return; }
    const table = userType === 'exhibitor' ? 'exhibitors' : 'partners';
    const { data } = await (supabase as any).from(table).select('id').eq('user_id', user.id).maybeSingle();
    if (data) { setEntityId(data.id); }
  }, [user, userType]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('chapiteau_items')
        .select('*')
        .eq('is_active', true)
        .gt('stock_available', 0)
        .order('price_per_day');
      if (error) { throw error; }
      setItems(data || []);
    } catch {
      toast.error('Erreur lors du chargement des chapiteaux');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyOrders = useCallback(async () => {
    if (!entityId) { return; }
    const { data } = await (supabase as any)
      .from('chapiteau_orders')
      .select('*, chapiteau_items(name, size_label)')
      .eq('customer_id', entityId)
      .order('created_at', { ascending: false });
    setMyOrders(data || []);
  }, [entityId]);

  useEffect(() => { fetchEntity(); fetchItems(); }, [fetchEntity, fetchItems]);
  useEffect(() => { if (entityId) { fetchMyOrders(); } }, [entityId, fetchMyOrders]);

  /* ── Cart ── */
  const addToCart = (item: ChapiteauItem) => {
    setCart(prev => {
      const cur = prev[item.id];
      if (cur && cur.quantity >= item.stock_available) {
        toast.error('Stock insuffisant'); return prev;
      }
      return { ...prev, [item.id]: { ...item, quantity: (cur?.quantity ?? 0) + 1 } };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const cur = prev[itemId];
      if (!cur || cur.quantity <= 1) {
        const { [itemId]: _, ...rest } = prev; return rest;
      }
      return { ...prev, [itemId]: { ...cur, quantity: cur.quantity - 1 } };
    });
  };

  const cartItems    = Object.values(cart);
  const cartTotal    = cartItems.reduce((s, ci) => s + ci.price_per_day * ci.quantity * RENTAL_DAYS, 0);
  const cartCount    = cartItems.reduce((s, ci) => s + ci.quantity, 0);

  const handleCheckout = () => {
    if (!user) { navigate(ROUTES.LOGIN); return; }
    if (!entityId) { toast.error('Profil introuvable'); return; }
    if (cartItems.length === 0) { toast.error('Panier vide'); return; }

    navigate(ROUTES.CHAPITEAU_CHECKOUT, {
      state: {
        cartItems,
        rentalStart: RENTAL_START,
        rentalEnd: RENTAL_END,
        totalDays: RENTAL_DAYS,
        userType,
        entityId,
      },
    });
  };

  /* ── Render ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8f7f4' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={dashboardRoute}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                <Tent className="w-4 h-4 text-[#C9A84C]" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">Location de Chapiteaux</h1>
                <p className="text-xs text-gray-500">SIB 2026 • 25–29 nov.</p>
              </div>
            </div>
          </div>
          <button onClick={() => setShowCart(!showCart)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow"
            style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
            <ShoppingCart className="w-4 h-4" />
            Panier
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#C9A84C] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="rounded-2xl overflow-hidden mb-8 relative"
          style={{ background: 'linear-gradient(135deg, #0B1C3D 0%, #1e3a5f 60%, #0B1C3D 100%)' }}>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cpath stroke='%23C9A84C' stroke-width='1' d='M30 0L60 30L30 60L0 30Z'/%3E%3C/g%3E%3C/svg%3E\")",
            }} />
          <div className="relative z-10 px-8 py-10 text-white">
            <div className="text-5xl mb-3">⛺</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Chapiteaux professionnels pour votre espace
            </h2>
            <p className="text-[#C9A84C]/80 max-w-xl mb-4">
              Du chapiteau 3×3m au géant 20×40m — installation et dépose assurées par notre équipe.
              Réservez votre espace dès maintenant pour SIB 2026.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                { icon: <Calendar className="w-4 h-4" />, label: '25 – 29 novembre 2026' },
                { icon: <CheckCircle className="w-4 h-4" />, label: 'Installation incluse' },
                { icon: <CreditCard className="w-4 h-4" />, label: 'Paiement PayPal / CMI' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-1.5 text-[#C9A84C]">
                  {f.icon}
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {items.map((item, idx) => {
            const qty = cart[item.id]?.quantity ?? 0;
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-44"
                  style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name}
                      className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <Tent className="w-16 h-16 text-[#C9A84C]/50" />
                      <span className="text-[#C9A84C]/70 font-bold text-lg">{item.size_label}</span>
                    </div>
                  )}
                  {item.includes_installation && (
                    <div className="absolute bottom-2 left-2 bg-[#C9A84C] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      Installation incluse ✓
                    </div>
                  )}
                  {item.stock_available <= 3 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      ⚡ {item.stock_available} restants
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Ruler className="w-3 h-3" /> {item.size_label}
                    </span>
                    {item.surface_m2 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Maximize className="w-3 h-3" /> {item.surface_m2} m²
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl font-bold text-[#C9A84C]">
                        {item.price_per_day.toLocaleString('fr-MA')}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">MAD/jour</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#0B1C3D]">
                        {(item.price_per_day * RENTAL_DAYS).toLocaleString('fr-MA')} MAD
                      </div>
                      <div className="text-xs text-gray-400">{RENTAL_DAYS} jours</div>
                    </div>
                  </div>

                  {qty === 0 ? (
                    <button onClick={() => addToCart(item)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition"
                      style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                      + Ajouter au panier
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-[#0B1C3D]/5 rounded-xl p-2">
                      <button onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 transition">
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="font-bold text-[#0B1C3D]">{qty}</span>
                      <button onClick={() => addToCart(item)}
                        disabled={qty >= item.stock_available}
                        className="w-8 h-8 flex items-center justify-center bg-[#0B1C3D] rounded-lg shadow-sm hover:bg-[#1e3a5f] transition disabled:opacity-40">
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Tent className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Aucun chapiteau disponible pour le moment</p>
          </div>
        )}

        {/* Mes commandes */}
        {myOrders.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mes réservations de chapiteaux</h3>
            <div className="space-y-3">
              {myOrders.slice(0, 5).map(order => (
                <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{order.chapiteau_items?.name}</div>
                    <div className="text-xs text-gray-500">{order.rental_start} → {order.rental_end} · {order.quantity} unité(s)</div>
                    {order.invoice_number && (
                      <div className="text-xs text-gray-400 font-mono">{order.invoice_number}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#C9A84C]">{order.total_amount.toLocaleString('fr-MA')} MAD</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.payment_status === 'paid' ? 'Payé ✓' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart sidebar */}
      {showCart && cartItems.length > 0 && (
        <motion.div
          initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
          className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#C9A84C]" /> Panier
            </h2>
            <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.map(ci => (
              <div key={ci.id} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-12 h-12 bg-[#0B1C3D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tent className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{ci.name}</div>
                  <div className="text-xs text-gray-400">{ci.size_label} · {ci.quantity} unité(s)</div>
                  <div className="text-xs font-bold text-[#C9A84C] mt-0.5">
                    {(ci.price_per_day * ci.quantity * RENTAL_DAYS).toLocaleString('fr-MA')} MAD
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => removeFromCart(ci.id)}
                    className="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold w-5 text-center">{ci.quantity}</span>
                  <button onClick={() => addToCart(ci)}
                    className="w-6 h-6 bg-[#0B1C3D] rounded flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Période</span>
              <span className="font-semibold">{RENTAL_START} → {RENTAL_END}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Durée</span>
              <span className="font-semibold">{RENTAL_DAYS} jours</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-3">
              <span>Total HT</span>
              <span className="text-[#C9A84C]">{cartTotal.toLocaleString('fr-MA')} MAD</span>
            </div>
            <button onClick={handleCheckout}
              className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
              <CreditCard className="w-4 h-4" /> Procéder au paiement
            </button>
          </div>
        </motion.div>
      )}
      {showCart && cartItems.length === 0 && (
        <motion.div
          initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg">Panier</h2>
            <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-3">
            <ShoppingCart className="w-12 h-12 opacity-20" />
            <p>Votre panier est vide</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
