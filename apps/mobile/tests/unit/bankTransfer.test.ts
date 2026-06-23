import { describe, it, expect } from 'vitest';
import { VIP_PASS, BANK_TRANSFER, generatePaymentReference } from '../../src/data/bankTransfer';

describe('Mobile — bankTransfer', () => {
  it('constantes VIP', () => {
    expect(VIP_PASS.currency).toBe('EUR');
    expect(BANK_TRANSFER.accountHolder).toBe('URBACOM');
    expect(BANK_TRANSFER.iban).toMatch(/^MA/);
  });

  it('génère référence format VIP', () => {
    const ref = generatePaymentReference('abcdef12-3456-7890-abcd-ef1234567890');
    expect(ref).toMatch(/^VIP-ABCDEF12-/);
    const ref2 = generatePaymentReference('11111111-2222-3333-4444-555555555555');
    expect(ref2).toMatch(/^VIP-11111111-/);
  });
});
