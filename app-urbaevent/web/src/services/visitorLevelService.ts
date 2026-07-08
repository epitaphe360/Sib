import { supabase } from '../lib/supabase';

export interface VipPassPricing {
  level: string;
  name: string;
  price: number;
  currency: 'EUR' | 'MAD' | 'USD';
}

let cachedPricing: { data: VipPassPricing; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

function resolvePrice(priceAnnual: number | null | undefined, priceMonthly: number | null | undefined): number {
  const annual = Number(priceAnnual ?? 0);
  if (annual > 0) return annual;
  const monthly = Number(priceMonthly ?? 0);
  if (monthly > 0) return monthly;
  return 0;
}

/**
 * Prix Pass VIP configuré par l'admin dans visitor_levels (niveau premium ou vip).
 */
export async function fetchVipPassPricing(forceRefresh = false): Promise<VipPassPricing> {
  if (!forceRefresh && cachedPricing && Date.now() - cachedPricing.fetchedAt < CACHE_TTL_MS) {
    return cachedPricing.data;
  }

  const levels = ['premium', 'vip'] as const;

  for (const level of levels) {
    const { data, error } = await supabase
      .from('visitor_levels')
      .select('level, name, price_annual, price_monthly')
      .eq('level', level)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.warn(`fetchVipPassPricing(${level}):`, error.message);
      continue;
    }

    const price = resolvePrice(data?.price_annual, data?.price_monthly);
    if (data && price > 0) {
      const result: VipPassPricing = {
        level: data.level,
        name: data.name ?? 'Pass Premium VIP',
        price,
        currency: 'EUR',
      };
      cachedPricing = { data: result, fetchedAt: Date.now() };
      return result;
    }
  }

  throw new Error('Tarif Pass VIP introuvable — configurez visitor_levels (premium/vip) dans l’admin.');
}

export function clearVipPassPricingCache(): void {
  cachedPricing = null;
}

export interface VisitorLevelRow {
  id: string;
  level: string;
  name: string;
  description: string | null;
  price_annual: number | null;
  price_monthly: number | null;
  is_active: boolean;
  updated_at?: string;
}

/** Liste des niveaux visiteur (admin). */
export async function fetchVisitorLevelsForAdmin(): Promise<VisitorLevelRow[]> {
  const { data, error } = await supabase
    .from('visitor_levels')
    .select('id, level, name, description, price_annual, price_monthly, is_active, updated_at')
    .in('level', ['free', 'premium', 'vip'])
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as VisitorLevelRow[];
}

/** Met à jour le tarif Pass VIP (niveaux premium + vip) — montant en EUR. */
export async function updateVipPassPrice(priceEur: number): Promise<void> {
  if (!Number.isFinite(priceEur) || priceEur <= 0) {
    throw new Error('Le prix doit être un montant positif en EUR.');
  }

  const levels = ['premium', 'vip'] as const;
  for (const level of levels) {
    const { error } = await supabase
      .from('visitor_levels')
      .update({
        price_annual: priceEur,
        price_monthly: priceEur,
        updated_at: new Date().toISOString(),
      })
      .eq('level', level);

    if (error) throw error;
  }

  clearVipPassPricingCache();
}
