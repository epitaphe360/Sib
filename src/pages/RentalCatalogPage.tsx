import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, ArrowLeft, Package, Plus, Minus,
  CreditCard, Calendar, Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../lib/routes';
import { toast } from 'sonner';

interface RentalItem {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price_per_day: number;
  currency: string;
  stock_available: number;
  image_url?: string;
}

interface CartItem extends RentalItem {
  quantity: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  mobilier: '🪑 Mobilier',
  audiovisuel: '📺 Audiovisuel',
  structure: '⛺ Structure',
  decoration: '🌿 Décoration',
  autre: '📦 Autre',
};

const RENTAL_START = '2026-11-25';
const RENTAL_END   = '2026-11-29';
const RENTAL_DAYS  = 5;

interface RentalCatalogPageProps {
  userType: 'exhibitor' | 'partner';
}

export default function RentalCatalogPage({ userType }: RentalCatalogPageProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [items, setItems] = useState<RentalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCart, setShowCart] = useState(false);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [myOrders, setMyOrders] = useState<any[]>([]);

  const dashboardRoute = userType === 'exhibitor' ? ROUTES.EXHIBITOR_DASHBOARD : ROUTES.PARTNER_DASHBOARD;

  const fetchEntity = useCallback(async () => {
    if (!user?.id) {return;}
    const table = userType === 'exhibitor' ? 'exhibitors' : 'partners';
    const { data } = await (supabase as any).from(table).select('id').eq('user_id', user.id).maybeSingle();
    if (data) {setEntityId(data.id);}
  }, [user, userType]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('rental_items')
        .select('*')
        .eq('is_active', true)
        .gt('stock_available', 0)
        .order('category');
      if (error) {throw error;}
      setItems(data || []);
    } catch {
      toast.error('Erreur lors du chargement du catalogue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyOrders = useCallback(async () => {
    if (!user?.id) {return;}
    const { data } = await (supabase as any)
      .from('rental_orders')
      .select('*, rental_items(name)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });
    setMyOrders(data || []);
  }, [user]);

  useEffect(() => {
    fetchEntity();
    fetchItems();
    fetchMyOrders();
  }, [fetchEntity, fetchItems, fetchMyOrders]);

  const updateCart = (item: RentalItem, delta: number) => {
    setCart(prev => {
      const current = prev[item.id]?.quantity || 0;
      const newQty = Math.max(0, Math.min(item.stock_available, current + delta));
      if (newQty === 0) {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: { ...item, quantity: newQty } };
    });
  };

  const cartItems = Object.values(cart);
  const totalDays = RENTAL_DAYS;
  const totalAmount = cartItems.reduce((sum, ci) => sum + ci.price_per_day * ci.quantity * totalDays, 0);

  const filteredItems = categoryFilter === 'all' ? items : items.filter(i => i.category === categoryFilter);

  const handleCheckout = () => {
    if (!user?.id || cartItems.length === 0) { return; }
    if (!entityId) {
      toast.error('Impossible de récupérer vos informations. Veuillez recharger la page.');
      return;
    }
    navigate(ROUTES.RENTAL_CHECKOUT, {
      state: {
        cartItems,
        rentalStart: RENTAL_START,
        rentalEnd: RENTAL_END,
        totalDays,
        userType,
        entityId,
      },
    });
  };

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <Link to={dashboardRoute} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour au tableau de bord
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-3 rounded-xl">
                <Package className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Location de Matériel</h1>
                <p className="text-sm text-gray-500">Mobilier, audiovisuel, structure — livré à votre stand</p>
              </div>
            </div>
            <button
              onClick={() => setShowCart(v => !v)}
              className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition"
            >
              <ShoppingCart className="h-4 w-4" />
              Mon panier
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Période de location fixe */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-3">
          <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium text-gray-700">Période de location :</span>
          <span className="text-sm text-gray-900 font-semibold">Mercredi 25 Nov. → Dimanche 29 Nov. 2026</span>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium ml-auto">
            5 jours
          </span>
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
              }`}
            >
              {cat === 'all' ? '🏪 Tout' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* Panier */}
        {showCart && cartItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-emerald-100 shadow-lg p-6 mb-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mon Panier</h3>
            <div className="space-y-3 mb-4">
              {cartItems.map(ci => (
                <div key={ci.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800">{ci.name} × {ci.quantity}</span>
                  <span className="font-semibold text-gray-900">
                    {(ci.price_per_day * ci.quantity * totalDays).toLocaleString()} {ci.currency}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">{totalDays} jour{totalDays > 1 ? 's' : ''}</div>
                <div className="text-xl font-bold text-emerald-700">{totalAmount.toLocaleString()} MAD</div>
              </div>
              <button
                onClick={handleCheckout}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition"
              >
                <CreditCard className="h-4 w-4" />
                Procéder au paiement
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">* TVA 20% incluse · Paiement sécurisé par PayPal ou CMI</p>
          </motion.div>
        )}

        {/* Catalogue */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {filteredItems.map(item => {
              const qty = cart[item.id]?.quantity || 0;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  <div className="bg-gray-50 h-36 flex items-center justify-center text-4xl">
                    {CATEGORY_LABELS[item.category]?.split(' ')[0] || '📦'}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {item.stock_available} dispo
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-emerald-700">{item.price_per_day}</span>
                        <span className="text-xs text-gray-500 ml-1">{item.currency}/{item.unit}/jour</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {qty > 0 && (
                          <button onClick={() => updateCart(item, -1)}
                            className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {qty > 0 && (
                          <span className="w-6 text-center font-bold text-sm text-emerald-700">{qty}</span>
                        )}
                        <button onClick={() => updateCart(item, 1)}
                          disabled={qty >= item.stock_available}
                          className="w-7 h-7 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white rounded-lg flex items-center justify-center transition">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Mes commandes */}
        {myOrders.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">Mes Commandes</h2>
            <div className="space-y-3">
              {myOrders.map((order: any) => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{order.rental_items?.name}</div>
                    <div className="text-xs text-gray-500">Qté: {order.quantity} — {order.total_amount} {order.currency}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    order.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {order.status === 'confirmed' ? 'Confirmée' : order.status === 'cancelled' ? 'Annulée' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
