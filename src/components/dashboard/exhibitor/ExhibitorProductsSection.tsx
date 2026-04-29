import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Pencil, Trash2, AlertCircle, CheckCircle,
  X, Info, Tag, Truck, Video, FileText, ChevronRight, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../ui/Button';
import ProductDetailModal from '../../products/ProductDetailModal';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TechSpec { name: string; value: string; unit?: string; }

interface ProductRow {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  original_price?: number;
  images?: string[];
  featured?: boolean;
  is_new?: boolean;
  in_stock?: boolean;
  certified?: boolean;
  delivery_time?: string;
  specifications?: string;
  video_url?: string;
  brochure?: string;
  documents?: Array<{ name: string; url: string; type?: string }>;
  technical_specs?: TechSpec[];
}

interface Props { exhibitorDbId: string | null; exhibitorName?: string; }

// ─── Catégories Bâtiment ──────────────────────────────────────────────────────
const CATEGORIES = [
  'Matériaux de construction', 'Carrelage & Revêtements de Sol',
  'Peinture & Revêtements', 'Enduits & Mortiers', 'Menuiserie & Fenêtres',
  'Électricité & Éclairage', 'Plomberie & Sanitaires', 'Toiture & Étanchéité',
  'Isolation & Acoustique', 'Équipements & Outillage', 'Serrurerie & Métallerie',
  'Béton & Préfabriqué', 'Aménagement Intérieur', 'Logiciels & Numérique',
  'Services & Conseil', 'Autre',
];

// ─── Formulaire enrichi ───────────────────────────────────────────────────────
interface ProductFormState {
  name: string; description: string; category: string;
  price: string; original_price: string; delivery_time: string;
  featured: boolean; is_new: boolean; in_stock: boolean; certified: boolean;
  specifications: string; technical_specs: TechSpec[];
  video_url: string; brochure: string;
}

const EMPTY_FORM: ProductFormState = {
  name: '', description: '', category: '',
  price: '', original_price: '', delivery_time: '',
  featured: false, is_new: false, in_stock: true, certified: false,
  specifications: '', technical_specs: [],
  video_url: '', brochure: '',
};

const INPUT_CLS = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-sm';
const LABEL_CLS = 'block text-sm font-medium text-gray-700 mb-1';

type FormTab = 'general' | 'details' | 'medias';

function ProductForm({
  initial, onSave, onCancel, isSaving,
}: {
  initial: ProductFormState;
  onSave: (data: ProductFormState) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ProductFormState>(initial);
  const [tab, setTab] = useState<FormTab>('general');

  const set = (field: keyof ProductFormState, value: string | boolean | TechSpec[]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addSpec = () => set('technical_specs', [...form.technical_specs, { name: '', value: '', unit: '' }]);
  const removeSpec = (i: number) => set('technical_specs', form.technical_specs.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: keyof TechSpec, value: string) => {
    const updated = form.technical_specs.map((s, idx) => idx === i ? { ...s, [field]: value } : s);
    set('technical_specs', updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Le nom du produit est requis'); setTab('general'); return; }
    if (!form.category) { toast.error('La catégorie est requise'); setTab('general'); return; }
    onSave(form);
  };

  const TABS: { id: FormTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'Général', icon: <Info className="h-3.5 w-3.5" /> },
    { id: 'details', label: 'Fiche détaillée', icon: <Tag className="h-3.5 w-3.5" /> },
    { id: 'medias', label: 'Médias', icon: <Video className="h-3.5 w-3.5" /> },
  ];

  return (
    <form onSubmit={handleSubmit}>
      {/* Onglets internes */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Onglet Général ── */}
      {tab === 'general' && (
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLS}>Nom du produit *</label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
              className={INPUT_CLS} placeholder="ex: Carrelage Grande Format 60x60" maxLength={200} />
          </div>
          <div>
            <label className={LABEL_CLS}>Catégorie *</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}
              className={INPUT_CLS + ' bg-white'}>
              <option value="">-- Choisir une catégorie --</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Description courte</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              rows={3} className={INPUT_CLS + ' resize-none'}
              placeholder="Description affichée sur la carte produit..." maxLength={1000} />
            <p className="text-xs text-gray-400 text-right mt-0.5">{form.description.length}/1000</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL_CLS}>Prix (MAD)</label>
              <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)}
                className={INPUT_CLS} placeholder="350" min={0} />
            </div>
            <div>
              <label className={LABEL_CLS}>Prix barré (MAD)</label>
              <input type="number" value={form.original_price} onChange={(e) => set('original_price', e.target.value)}
                className={INPUT_CLS} placeholder="450" min={0} />
            </div>
            <div>
              <label className={LABEL_CLS}>Délai livraison</label>
              <input type="text" value={form.delivery_time} onChange={(e) => set('delivery_time', e.target.value)}
                className={INPUT_CLS} placeholder="3-5 jours" maxLength={50} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {([
              { field: 'featured' as keyof ProductFormState, label: '⭐ Vedette' },
              { field: 'is_new' as keyof ProductFormState, label: '🆕 Nouveau' },
              { field: 'in_stock' as keyof ProductFormState, label: '✅ En stock' },
              { field: 'certified' as keyof ProductFormState, label: '🏅 Certifié' },
            ]).map(({ field, label }) => (
              <label key={field} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                form[field] ? 'bg-[#1e3a5f]/10 border-[#1e3a5f]/30 text-[#1e3a5f]' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}>
                <input type="checkbox" checked={form[field] as boolean} onChange={(e) => set(field, e.target.checked)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Onglet Fiche détaillée ── */}
      {tab === 'details' && (
        <div className="space-y-5">
          <div>
            <label className={LABEL_CLS}>Description complète / Spécifications textuelles</label>
            <p className="text-xs text-gray-400 mb-1.5">Contenu affiché dans la fiche produit (détails techniques, avantages, usages...).</p>
            <textarea value={form.specifications} onChange={(e) => set('specifications', e.target.value)}
              rows={6} className={INPUT_CLS + ' resize-none'}
              placeholder={'Ex:\nDimensions: 60×60 cm\nÉpaisseur: 10 mm\nRésistance au glissement: R10\nHydrofuge: Oui\nDomaine: Sol et mur intérieur'} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={LABEL_CLS + ' mb-0'}>Fiche technique (tableau structuré)</label>
              <button type="button" onClick={addSpec}
                className="text-xs text-[#1e3a5f] font-semibold flex items-center gap-1 hover:underline">
                <Plus className="h-3.5 w-3.5" /> Ajouter une ligne
              </button>
            </div>
            {form.technical_specs.length === 0 && (
              <p className="text-xs text-gray-400 italic py-4 text-center border border-dashed border-gray-200 rounded-lg">
                Aucune spécification. Cliquez sur "Ajouter une ligne".
              </p>
            )}
            <div className="space-y-2">
              {form.technical_specs.map((spec, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" value={spec.name} onChange={(e) => updateSpec(i, 'name', e.target.value)}
                    className={INPUT_CLS} placeholder="Propriété (ex: Poids)" />
                  <input type="text" value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)}
                    className={INPUT_CLS} placeholder="Valeur (ex: 2.5)" />
                  <input type="text" value={spec.unit || ''} onChange={(e) => updateSpec(i, 'unit', e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-sm shrink-0" placeholder="kg" />
                  <button type="button" onClick={() => removeSpec(i)}
                    className="p-2 text-gray-400 hover:text-red-500 shrink-0 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Onglet Médias ── */}
      {tab === 'medias' && (
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLS}>URL de la vidéo produit</label>
            <p className="text-xs text-gray-400 mb-1.5">YouTube, Vimeo ou lien vidéo direct.</p>
            <input type="url" value={form.video_url} onChange={(e) => set('video_url', e.target.value)}
              className={INPUT_CLS} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div>
            <label className={LABEL_CLS}>URL de la brochure (PDF)</label>
            <p className="text-xs text-gray-400 mb-1.5">Lien direct vers un fichier PDF ou document en ligne.</p>
            <input type="url" value={form.brochure} onChange={(e) => set('brochure', e.target.value)}
              className={INPUT_CLS} placeholder="https://..." />
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Note sur les images produit
            </p>
            Pour ajouter des images, utilisez une URL image (Unsplash, CDN, etc.) — l'upload direct sera disponible prochainement.
          </div>
        </div>
      )}

      {/* Boutons navigation + save */}
      <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100">
        <div>
          {tab !== 'general' && (
            <button type="button" onClick={() => setTab(tab === 'medias' ? 'details' : 'general')}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors">
              ← Précédent
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} className="text-sm">Annuler</Button>
          {tab !== 'medias' && (
            <Button type="button" onClick={() => setTab(tab === 'general' ? 'details' : 'medias')}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm flex items-center gap-1.5">
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <Button type="submit" disabled={isSaving}
            className="bg-[#1e3a5f] text-white hover:bg-[#1e4976] text-sm">
            {isSaving
              ? <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Enregistrement...</span>
              : <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Enregistrer</span>}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── Section principale ───────────────────────────────────────────────────────
export default function ExhibitorProductsSection({ exhibitorDbId, exhibitorName }: Props) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<ProductRow | null>(null);

  const loadProducts = useCallback(async () => {
    if (!exhibitorDbId) { setIsLoading(false); return; }
    setIsLoading(true);
    const { data, error } = await supabase!
      .from('products')
      .select('id, name, description, category, price, original_price, images, featured, is_new, in_stock, certified, delivery_time, specifications, technical_specs, video_url, brochure, documents')
      .eq('exhibitor_id', exhibitorDbId)
      .order('created_at', { ascending: false });
    if (error) { toast.error('Impossible de charger les produits'); }
    else { setProducts(data || []); }
    setIsLoading(false);
  }, [exhibitorDbId]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleSave = async (form: ProductFormState) => {
    if (!exhibitorDbId) return;
    setIsSaving(true);
    const payload: Record<string, unknown> = {
      exhibitor_id: exhibitorDbId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category,
      price: form.price ? parseFloat(form.price) : null,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      delivery_time: form.delivery_time.trim() || null,
      is_new: form.is_new, in_stock: form.in_stock,
      certified: form.certified, featured: form.featured,
      specifications: form.specifications.trim() || null,
      technical_specs: form.technical_specs.filter((s) => s.name && s.value).length > 0
        ? form.technical_specs.filter((s) => s.name && s.value) : null,
      video_url: form.video_url.trim() || null,
      brochure: form.brochure.trim() || null,
    };

    if (editingProduct) {
      const { error } = await supabase!.from('products').update(payload).eq('id', editingProduct.id);
      if (error) { toast.error('Erreur lors de la mise à jour'); }
      else { toast.success('Produit mis à jour !'); }
    } else {
      const { error } = await supabase!.from('products').insert(payload);
      if (error) { toast.error('Erreur lors de la création'); }
      else { toast.success('Produit ajouté !'); }
    }
    setIsSaving(false);
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase!.from('products').delete().eq('id', id);
    if (error) { toast.error('Erreur lors de la suppression'); }
    else { toast.success('Produit supprimé'); setProducts((p) => p.filter((x) => x.id !== id)); }
    setDeletingId(null);
  };

  const openEdit = (product: ProductRow) => { setEditingProduct(product); setShowForm(true); };
  const openAdd = () => { setEditingProduct(null); setShowForm(true); };

  const toForm = (p: ProductRow | null): ProductFormState => ({
    name: p?.name || '', description: p?.description || '',
    category: p?.category || '',
    price: p?.price != null ? String(p.price) : '',
    original_price: p?.original_price != null ? String(p.original_price) : '',
    delivery_time: p?.delivery_time || '',
    is_new: p?.is_new ?? false, in_stock: p?.in_stock ?? true,
    certified: p?.certified ?? false, featured: p?.featured ?? false,
    specifications: p?.specifications || '',
    technical_specs: p?.technical_specs || [],
    video_url: p?.video_url || '', brochure: p?.brochure || '',
  });

  const toModalProduct = (p: ProductRow) => ({
    id: p.id, name: p.name, description: p.description,
    category: p.category, images: p.images,
    price: p.price, originalPrice: p.original_price,
    specifications: p.specifications,
    technicalSpecs: p.technical_specs || [],
    featured: p.featured, isNew: p.is_new, inStock: p.in_stock,
    certified: p.certified, deliveryTime: p.delivery_time,
    videoUrl: p.video_url, documents: p.documents, brochure: p.brochure,
  });

  return (
    <section className="mt-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1e3a5f]/10 rounded-xl">
            <Package className="h-5 w-5 text-[#1e3a5f]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Mes Produits</h2>
            <p className="text-sm text-gray-500">
              {products.length} produit{products.length !== 1 ? 's' : ''} dans votre catalogue
            </p>
          </div>
        </div>
        {!showForm && (
          <Button onClick={openAdd} className="bg-[#1e3a5f] text-white hover:bg-[#1e4976] flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Ajouter un produit
          </Button>
        )}
      </div>

      {/* Formulaire */}
      <AnimatePresence>
        {showForm && (
          <motion.div key="form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-[#1e3a5f]/20 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-base">
                {editingProduct ? `Modifier — ${editingProduct.name}` : 'Nouveau produit'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingProduct(null); }}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ProductForm initial={toForm(editingProduct)} onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingProduct(null); }} isSaving={isSaving} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Squelette chargement */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {/* Vide */}
      {!isLoading && products.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucun produit dans votre catalogue</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Ajoutez vos produits et services pour les afficher sur votre profil public</p>
          <Button onClick={openAdd} className="bg-[#1e3a5f] text-white hover:bg-[#1e4976]">
            <Plus className="h-4 w-4 mr-2" /> Ajouter mon premier produit
          </Button>
        </div>
      )}

      {/* Grille */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden group hover:shadow-md hover:border-blue-200 transition-all">
              {/* Image */}
              <div className="relative h-40 bg-gradient-to-br from-[#1e3a5f]/5 to-blue-50 overflow-hidden">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-10 w-10 text-[#1e3a5f]/20" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {product.featured && <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-semibold">⭐</span>}
                  {product.is_new && <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-semibold">Nouveau</span>}
                  {product.in_stock === false && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-semibold">Rupture</span>}
                  {(product.specifications || (product.technical_specs && product.technical_specs.length > 0)) && (
                    <span className="text-xs bg-[#1e3a5f] text-white px-1.5 py-0.5 rounded-full font-semibold">Fiche</span>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setPreviewProduct(product)}
                    className="p-1.5 bg-white/90 rounded-lg shadow-sm text-gray-600 hover:text-[#1e3a5f] hover:bg-white transition-colors" title="Aperçu fiche">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openEdit(product)}
                    className="p-1.5 bg-white/90 rounded-lg shadow-sm text-gray-600 hover:text-[#1e3a5f] hover:bg-white transition-colors" title="Modifier">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}
                    className="p-1.5 bg-white/90 rounded-lg shadow-sm text-gray-600 hover:text-red-600 hover:bg-white transition-colors disabled:opacity-50" title="Supprimer">
                    {deletingId === product.id
                      ? <span className="animate-spin h-3.5 w-3.5 border-2 border-red-400 border-t-transparent rounded-full inline-block" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Infos */}
              <div className="p-4 space-y-1.5">
                {product.category && <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">{product.category}</p>}
                <p className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</p>
                {product.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline gap-2">
                    {product.price != null && (
                      <p className="text-sm font-bold text-[#1e3a5f]">{product.price.toLocaleString('fr-MA')} MAD</p>
                    )}
                    {product.original_price && product.price && product.original_price > product.price && (
                      <p className="text-xs text-gray-400 line-through">{product.original_price.toLocaleString('fr-MA')}</p>
                    )}
                  </div>
                  {product.certified && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                      <CheckCircle className="h-3 w-3" /> Certifié
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  {product.delivery_time && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <Truck className="h-3 w-3" /> {product.delivery_time}
                    </span>
                  )}
                  {product.video_url && <span className="text-xs text-blue-400 font-medium">● Vidéo</span>}
                  {product.brochure && <span className="text-xs text-purple-400 font-medium">● Brochure</span>}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Carte "Ajouter" */}
          {!showForm && (
            <motion.button layout onClick={openAdd}
              className="min-h-[220px] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#1e3a5f]/40 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-all">
              <Plus className="h-8 w-8" />
              <span className="text-sm font-medium">Ajouter un produit</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Avertissement */}
      {!exhibitorDbId && !isLoading && (
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Impossible de charger les produits — profil exposant introuvable.
        </div>
      )}

      {/* Modal fiche produit */}
      {previewProduct && (
        <ProductDetailModal
          product={toModalProduct(previewProduct)}
          exhibitorName={exhibitorName}
          onClose={() => setPreviewProduct(null)}
        />
      )}
    </section>
  );
}
