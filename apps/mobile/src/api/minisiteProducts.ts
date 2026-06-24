import { supabase } from '../lib/supabase';
import { supabaseErrorMessage } from '../lib/supabaseError';
import type { MiniSiteProduct } from '../types/minisite';

type ProductRow = Record<string, unknown>;

export interface ProductDraft {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: string;
  specifications: string;
  featured: boolean;
}

export const PRODUCT_CATEGORIES = [
  'Matériaux de construction',
  'Carrelage & Revêtements de Sol',
  'Peinture & Revêtements',
  'Enduits & Mortiers',
  'Menuiserie & Fenêtres',
  'Électricité & Éclairage',
  'Plomberie & Sanitaires',
  'Toiture & Étanchéité',
  'Isolation & Acoustique',
  'Équipements & Outillage',
  'Serrurerie & Métallerie',
  'Béton & Préfabriqué',
  'Aménagement Intérieur',
  'Logiciels & Numérique',
  'Services & Conseil',
  'Autre',
] as const;

function mapProduct(row: ProductRow): MiniSiteProduct {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    category: typeof row.category === 'string' ? row.category : undefined,
    images: Array.isArray(row.images) ? row.images.filter((value): value is string => typeof value === 'string') : [],
    price: row.price as string | number | undefined,
    specifications: typeof row.specifications === 'string' ? row.specifications : undefined,
    featured: row.featured === true,
  };
}

export async function fetchMiniSiteProducts(exhibitorId: string): Promise<MiniSiteProduct[]> {
  const { data, error } = await supabase.from('products').select('*').eq('exhibitor_id', exhibitorId).order('created_at');
  if (error) throw new Error(supabaseErrorMessage(error, 'Impossible de charger les produits'));
  return (data ?? []).map((row) => mapProduct(row as ProductRow));
}

export async function saveMiniSiteProduct(exhibitorId: string, draft: ProductDraft, productId?: string): Promise<void> {
  const price = draft.price.trim() ? Number(draft.price.replace(',', '.')) : null;
  const payload = {
    exhibitor_id: exhibitorId,
    name: draft.name.trim(),
    description: draft.description.trim(),
    category: draft.category.trim() || 'Général',
    images: draft.imageUrl.trim() ? [draft.imageUrl.trim()] : [],
    price: Number.isFinite(price) ? price : null,
    specifications: draft.specifications.trim() || null,
    featured: draft.featured,
  };
  const query = productId
    ? supabase.from('products').update(payload).eq('id', productId).eq('exhibitor_id', exhibitorId)
    : supabase.from('products').insert(payload);
  const { error } = await query;
  if (error) throw new Error(supabaseErrorMessage(error, 'Enregistrement du produit impossible'));
}

export async function deleteMiniSiteProduct(exhibitorId: string, productId: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', productId).eq('exhibitor_id', exhibitorId);
  if (error) throw new Error(supabaseErrorMessage(error, 'Suppression du produit impossible'));
}
