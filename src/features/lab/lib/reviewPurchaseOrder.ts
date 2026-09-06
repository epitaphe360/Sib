export type PoReviewStatus = 'ACCEPTÉ' | 'À CORRIGER';

export interface PurchaseOrderReviewInput {
  quoteNumber?: string | null;
  poQuoteRef?: string | null;
  quoteClient?: string | null;
  poClient?: string | null;
  quoteAmount?: number | null;
  poAmount?: number | null;
  quoteAnalyses?: string[];
  poAnalyses?: string[];
  amountTolerance?: number;
}

export interface PurchaseOrderReview {
  status: PoReviewStatus;
  reasons: string[];
}

function norm(value?: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

function normList(values?: string[]): string[] {
  return (values ?? []).map((v) => norm(v)).filter(Boolean).sort();
}

export function reviewPurchaseOrder(input: PurchaseOrderReviewInput): PurchaseOrderReview {
  const reasons: string[] = [];
  const quoteRef = norm(input.poQuoteRef);
  const quoteNumber = norm(input.quoteNumber);

  if (!quoteRef) reasons.push('Référence devis absente');
  else if (quoteNumber && quoteRef !== quoteNumber && !quoteRef.includes(quoteNumber)) {
    reasons.push('Référence devis incohérente');
  }

  if (input.quoteClient && input.poClient && norm(input.quoteClient) !== norm(input.poClient)) {
    reasons.push('Client différent du devis');
  }

  if (input.quoteAmount != null && input.poAmount != null) {
    const tolerance = input.amountTolerance ?? 0.01;
    const delta = Math.abs(input.quoteAmount - input.poAmount);
    const allowed = input.quoteAmount * tolerance;
    if (delta > allowed && delta > 0.01) reasons.push('Montant différent du devis');
  }

  const expected = normList(input.quoteAnalyses);
  const actual = normList(input.poAnalyses);
  if (expected.length && actual.length) {
    const missing = expected.filter((a) => !actual.includes(a));
    if (missing.length) reasons.push(`Analyses manquantes: ${missing.join(', ')}`);
  }

  return {
    status: reasons.length ? 'À CORRIGER' : 'ACCEPTÉ',
    reasons,
  };
}
