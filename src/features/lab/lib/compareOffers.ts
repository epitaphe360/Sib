export interface SupplierOffer {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  currency: string;
  turnaroundDays: number;
  accreditation?: string | null;
}

export interface RankedOffer extends SupplierOffer {
  rank: number;
  recommended: boolean;
}

export function rankOffers(
  offers: SupplierOffer[],
  options?: { accreditationRequired?: boolean },
): RankedOffer[] {
  const required = options?.accreditationRequired ?? false;
  const eligible = required
    ? offers.filter((o) => !!o.accreditation && o.accreditation.trim().length > 0)
    : offers;
  const pool = eligible.length ? eligible : offers;
  const sorted = [...pool].sort((a, b) => {
    if (a.amount !== b.amount) return a.amount - b.amount;
    return a.turnaroundDays - b.turnaroundDays;
  });
  return sorted.map((offer, index) => ({
    ...offer,
    rank: index + 1,
    recommended: index === 0,
  }));
}

export function suggestRecipients<T extends { id: string }>(
  suppliers: T[],
  mode: 'TOP_3' | 'TOP_5' | 'ALL',
): T[] {
  if (mode === 'ALL') return suppliers;
  const n = mode === 'TOP_3' ? 3 : 5;
  return suppliers.slice(0, n);
}

export interface RankableSupplier {
  id: string;
  name?: string;
  quality_score?: number | null;
  delay_score?: number | null;
  price_score?: number | null;
  accreditations?: string[] | null;
}

export function scoreSupplier(s: RankableSupplier, accreditationRequired = false): number {
  const quality = Number(s.quality_score ?? 50);
  const delay = Number(s.delay_score ?? 50);
  const price = Number(s.price_score ?? 50);
  const accredited = (s.accreditations ?? []).some((a) => a.trim().length > 0);
  const bonus = accreditationRequired && accredited ? 25 : accredited ? 8 : 0;
  return quality + delay + price + bonus;
}

export function rankSuppliersForConsult<T extends RankableSupplier>(
  suppliers: T[],
  mode: 'TOP_3' | 'TOP_5' | 'ALL',
  options?: { accreditationRequired?: boolean },
): T[] {
  const required = options?.accreditationRequired ?? false;
  const eligible = required
    ? suppliers.filter((s) => (s.accreditations ?? []).some((a) => a.trim().length > 0))
    : suppliers;
  const pool = eligible.length ? eligible : suppliers;
  const ranked = [...pool].sort((a, b) => scoreSupplier(b, required) - scoreSupplier(a, required));
  return suggestRecipients(ranked, mode);
}
