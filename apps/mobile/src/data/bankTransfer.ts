export const VIP_PASS = {
  currency: 'EUR',
  label: 'Pass Premium VIP',
};
export const BANK_TRANSFER = {
  bankName: 'Attijariwafa bank',
  accountHolder: 'URBACOM',
  iban: 'MA64 007 780 000413200000498 25',
  bic: 'BCMAMAMC',
  domiciliation: 'CASA MY IDRISS 1ER',
};

export function generatePaymentReference(userId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const userShort = userId.substring(0, 8).toUpperCase();
  return `VIP-${userShort}-${timestamp}`;
}
