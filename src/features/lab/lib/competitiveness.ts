import { applyMargin } from './pricing';

export interface CompetitivenessInput {
  supplierAmount: number;
  marginPercent: number;
  /** Optional ceiling the client would still accept. */
  marketCeiling?: number | null;
  /** Soft flag when client price exceeds this multiple of supplier cost. */
  maxMultiple?: number;
}

export interface CompetitivenessResult {
  clientAmount: number;
  flag: 'ok' | 'high';
  suggestedMargin: number | null;
  message: string;
}

export function assessCompetitiveness(input: CompetitivenessInput): CompetitivenessResult {
  const clientAmount = applyMargin(input.supplierAmount, input.marginPercent);
  const maxMultiple = input.maxMultiple ?? 1.55;
  const tooHighVsCost = input.supplierAmount > 0 && clientAmount / input.supplierAmount > maxMultiple;
  const tooHighVsMarket = input.marketCeiling != null && clientAmount > input.marketCeiling;
  if (!tooHighVsCost && !tooHighVsMarket) {
    return { clientAmount, flag: 'ok', suggestedMargin: null, message: 'Prix client dans la fourchette.' };
  }
  let suggested = input.marginPercent;
  if (tooHighVsMarket && input.marketCeiling != null && input.supplierAmount > 0) {
    suggested = Math.max(0, Math.round(((input.marketCeiling / input.supplierAmount) - 1) * 10000) / 100);
  } else if (tooHighVsCost) {
    suggested = Math.max(0, Math.round((maxMultiple - 1) * 10000) / 100);
  }
  return {
    clientAmount,
    flag: 'high',
    suggestedMargin: suggested,
    message: 'Prix client trop élevé — réduire la marge ou renégocier le sous-traitant. Aucun prix n’est modifié automatiquement.',
  };
}

export function nextQuoteVersion(current: number | null | undefined): number {
  const n = Number(current);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) + 1 : 1;
}

export function isClientPriceTooHigh(clientAmount: number, referenceAmount?: number | null): boolean {
  if (!Number.isFinite(clientAmount) || clientAmount < 0) return false;
  if (referenceAmount == null || !Number.isFinite(referenceAmount) || referenceAmount <= 0) return false;
  return clientAmount > referenceAmount * 1.15;
}

export function proposedMarginPercent(supplierAmount: number, targetClientAmount: number): number {
  if (!Number.isFinite(supplierAmount) || supplierAmount <= 0) throw new Error('Montant fournisseur invalide');
  if (!Number.isFinite(targetClientAmount) || targetClientAmount < 0) throw new Error('Prix cible invalide');
  return Math.round(((targetClientAmount / supplierAmount) - 1) * 10000) / 100;
}
