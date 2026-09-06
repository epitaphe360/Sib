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
