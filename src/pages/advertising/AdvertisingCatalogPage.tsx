import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, ArrowLeft, Megaphone, Plus, Minus,
  CreditCard, Users, Loader2, CheckCircle, Tag,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';

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
  stock_available: number;
  image_url?: string;
}

interface CartItem extends AdSpaceType {
  quantity: number;
}

/* ── Icônes par catégorie ───────────────────────────────────────────────────── */
const CATEGORY_EMOJIS: Record<string, string> = {
  'banner-app': '🖥️',
  email:        '📧',
  push:         '🔔',
  featured:     '⭐',
  physique:     '🏷️',
  conference:   '🎤',
  autre:        '📢',
};

const CATEGORY_LABELS: Record<string, string> = {
  'banner-app': 'Bannière digitale',
  email:        'Email marketing',
  push:         'Notification push',
  featured:     'Featured listing',
  physique:     'Espace physique',
  conference:   'Sponsoring conférence',
  autre:        'Autre',
};

/* ── Helpers statut réservation ─────────────────────────────────────────────── */
function bookingStatusClass(status: string): string {
  if (status === 'active')    { return 'bg-green-100 text-green-700'; }
  if (status === 'approved')  { return 'bg-blue-100 text-blue-700'; }
  if (status === 'rejected')  { return 'bg-red-100 text-red-700'; }
  if (status === 'expired')   { return 'bg-gray-100 text-gray-600'; }
  return 'bg-yellow-100 text-yellow-700';
}

function bookingStatusLabel(status: string): string {
  if (status === 'active')    { return '✓ Actif'; }
  if (status === 'approved')  { return 'Approuvé'; }
  if (status === 'rejected')  { return 'Refusé'; }
  if (status === 'expired')   { return 'Expiré'; }
  return 'En attente';
}

/* ── Props ──────────────────────────────────────────────────────────────────── */
interface AdvertisingCatalogPageProps {
  userType: 'exhibitor' | 'partner';
}

export default function AdvertisingCatalogPage({ userType }: AdvertisingCatalogPageProps) {
  const { user }  = useAuthStore();
  const navigate  = useNavigate();

  const [items, setItems]         = useState<AdSpaceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart]           = useState<Record<string, CartItem>>({});
  const [showCart, setShowCart]   = useState(false);
  const [entityId, setEntityId]   = useState<string | null>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  const dashboardRoute = userType === 'exhibitor' ? ROUTES.EXHIBITOR_DASHBOARD : ROUTES.PARTNER_DASHBOARD;
  const checkoutRoute  = ROUTES.ADVERTISING_CHECKOUT;

  /* ── Fetch entity id ──────────────────────────────────────────────────────── */
  const fetchEntity = useCallback(async () => {
    if (!user?.id) { return; }
    const table = userType === 'exhibitor' ? 'exhibitors' : 'partners';
    const { data } = await (supabase as any).from(table).select('id').eq('user_id', user.id).maybeSingle();
    if (data) { setEntityId(data.id); }
  }, [user, userType]);

  /* ── Fetch catalogue ──────────────────────────────────────────────────────── */
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('ad_space_types')
        .select('*')
        .eq('is_active', true)
        .gt('stock_available', 0)
        .order('price');
      if (error) { throw error; }
      setItems(data || []);
    } catch {
      toast.error('Erreur lors du chargement des espaces publicitaires');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── Mes réservations ─────────────────────────────────────────────────────── */
  const fetchMyBookings = useCallback(async () => {
    if (!user?.id) { return; }
    const { data } = await (supabase as any)
      .from('ad_bookings')
      .select('*, ad_space_types(name, category)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });
    setMyBookings(data || []);
  }, [user]);

  useEffect(() => { fetchEntity(); fetchItems(); }, [fetchEntity, fetchItems]);
  useEffect(() => { if (user?.id) { fetchMyBookings(); } }, [user, fetchMyBookings]);

  /* ── Cart ──────────────────────────────────────────────────────────────────── */
  const addToCart = (item: AdSpaceType) => {
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

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s, ci) => s + ci.price * ci.quantity, 0);
  const cartCount = cartItems.reduce((s, ci) => s + ci.quantity, 0);

  const handleCheckout = () => {
    if (!user) { navigate(ROUTES.LOGIN); return; }
    if (!entityId) { toast.error('Profil introuvable'); return; }
    if (cartItems.length === 0) { toast.error('Panier vide'); return; }

    navigate(checkoutRoute, {
      state: {
        cartItems,
        userType,
        entityId,
      },
    });
  };

  /* ── Loader ──────────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#F39200]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8f7f4' }}>
      {/* ── Header sticky ─────────────────────────────────────────────────────── */}
      <div className="sticky top-16 sm:top-20 xl:top-28 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={dashboardRoute}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                <Megaphone className="w-4 h-4 text-[#F39200]" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">Espaces Publicitaires</h1>
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
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#F39200] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ── Hero ────────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden mb-8 relative"
          style={{ background: 'linear-gradient(135deg, #0B1C3D 0%, #1e3a5f 60%, #0B1C3D 100%)' }}>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cpath stroke='%232E5984' stroke-width='1' d='M30 0L60 30L30 60L0 30Z'/%3E%3C/g%3E%3C/svg%3E\")",
            }} />
          <div className="relative z-10 px-8 py-10 text-white">
            <div className="text-5xl mb-3">📢</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Maximisez votre visibilité à SIB 2026
            </h2>
            <p className="text-[#F39200]/80 max-w-xl mb-4">
              Bannières digitales, email marketing, notifications push, espaces physiques…
              Touchez des milliers de visiteurs et décideurs B2B présents au salon.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                { icon: <Users className="w-4 h-4" />, label: '+5 000 visiteurs attendus' },
                { icon: <CheckCircle className="w-4 h-4" />, label: 'Formats digitaux & physiques' },
                { icon: <CreditCard className="w-4 h-4" />, label: 'Paiement PayPal / CMI' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-1.5 text-[#F39200]">
                  {f.icon}
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grille espaces ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {items.map((item, idx) => {
            const qty   = cart[item.id]?.quantity ?? 0;
            const emoji = CATEGORY_EMOJIS[item.category] ?? '📢';
            const catLabel = CATEGORY_LABELS[item.category] ?? item.category;
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

                {/* Visuel */}
                <div className="relative h-40"
                  style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name}
                      className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <span className="text-5xl">{emoji}</span>
                      <span className="text-[#F39200]/80 text-xs font-semibold uppercase tracking-wide">
                        {catLabel}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/15 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-semibold border border-white/20">
                    {catLabel}
                  </div>
                  {item.stock_available <= 3 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      ⚡ {item.stock_available} restants
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-1">{item.name}</h3>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <Users className="w-3 h-3" />
                    <span>{item.audience}</span>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>

                  <div className="flex items-center gap-1.5 mb-4">
                    <Tag className="w-3 h-3 text-[#F39200]" />
                    <span className="text-xs text-gray-500">
                      {item.duration_days === 1 ? '1 jour' : `${item.duration_days} jours`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl font-bold text-[#F39200]">
                        {item.price.toLocaleString('fr-MA')}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">MAD</span>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      {item.stock_available} disponible{item.stock_available > 1 ? 's' : ''}
                    </div>
                  </div>

                  {qty === 0 ? (
                    <button onClick={() => addToCart(item)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
                      + Réserver cet espace
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
            <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Aucun espace disponible pour le moment</p>
            <p className="text-sm mt-2">Revenez bientôt ou contactez l'administration</p>
          </div>
        )}

        {/* ── Mes réservations ────────────────────────────────────────────────── */}
        {myBookings.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="font-bold text-[#0B1C3D] text-lg mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#F39200]" />
              Mes réservations
            </h2>
            <div className="space-y-3">
              {myBookings.map(b => (
                <div key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {b.ad_space_types?.name ?? '—'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {b.invoice_number ?? b.id.slice(0, 8)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#F39200]">
                      {b.total_amount?.toLocaleString('fr-MA')} MAD
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${bookingStatusClass(b.status)}`}>
                      {bookingStatusLabel(b.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Panier drawer ───────────────────────────────────────────────────────── */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Fermer le panier"
            className="flex-1 bg-black/40 backdrop-blur-sm cursor-default"
            onClick={() => setShowCart(false)}
            onKeyDown={e => e.key === 'Escape' && setShowCart(false)}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-sm bg-white shadow-2xl overflow-y-auto flex flex-col">

            <div className="p-6 border-b flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #0B1C3D, #1e3a5f)' }}>
              <div className="flex items-center gap-2 text-white">
                <ShoppingCart className="w-5 h-5" />
                <span className="font-bold text-lg">Votre sélection</span>
              </div>
              <button onClick={() => setShowCart(false)}
                className="text-white/70 hover:text-white transition text-xl font-bold">
                ×
              </button>
            </div>

            <div className="flex-1 p-6">
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Votre panier est vide</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(ci => (
                    <div key={ci.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-2xl">{CATEGORY_EMOJIS[ci.category] ?? '📢'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">{ci.name}</div>
                        <div className="text-xs text-gray-500">{ci.price.toLocaleString('fr-MA')} MAD × {ci.quantity}</div>
                        <div className="text-sm font-bold text-[#F39200]">
                          {(ci.price * ci.quantity).toLocaleString('fr-MA')} MAD
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => removeFromCart(ci.id)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold">{ci.quantity}</span>
                        <button onClick={() => addToCart(ci)}
                          disabled={ci.quantity >= ci.stock_available}
                          className="w-6 h-6 flex items-center justify-center bg-[#0B1C3D] rounded-lg text-white hover:bg-[#1e3a5f] transition disabled:opacity-40">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#F39200]">
                    {cartTotal.toLocaleString('fr-MA')} MAD
                  </span>
                </div>
                <button onClick={handleCheckout}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:opacity-90 transition"
                  style={{ background: 'linear-gradient(135deg, #F39200, #E07A00)' }}>
                  Procéder au paiement →
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
