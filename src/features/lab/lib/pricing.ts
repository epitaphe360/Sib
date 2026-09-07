export function applyMargin(supplierAmount: number, marginPercent: number): number {
  if (!Number.isFinite(supplierAmount) || supplierAmount < 0) {
    throw new Error('Montant fournisseur invalide');
  }
  if (!Number.isFinite(marginPercent) || marginPercent < 0 || marginPercent > 100) {
    throw new Error('Marge invalide (0–100)');
  }
  return Math.round(supplierAmount * (1 + marginPercent / 100) * 100) / 100;
}

export function computePenalty(amount: number, delayDays: number, percentPerDay: number): number {
  if (delayDays <= 0) return 0;
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Montant invalide');
  if (!Number.isFinite(percentPerDay) || percentPerDay < 0) throw new Error('Taux invalide');
  return Math.round(amount * (percentPerDay / 100) * delayDays * 100) / 100;
}
