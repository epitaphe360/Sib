/**
 * Tests unitaires — paymentService.ts (étendu)
 * Couvre: capturePayPalOrder, createCMIPaymentRequest, checkPaymentStatus, createStripeCheckoutSession (désactivé)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Supabase ─────────────────────────────────────────────────────────────
const { mockInvoke, mockSingle, chainable } = vi.hoisted(() => {
  const mockInvoke = vi.fn();
  const mockSingle = vi.fn();
  const mockLimit = vi.fn();
  const mockOrder = vi.fn();
  const mockEq = vi.fn();
  const mockSelect = vi.fn();

  const chainable = {
    select: mockSelect,
    eq: mockEq,
    order: mockOrder,
    limit: mockLimit,
    single: mockSingle,
  };
  Object.values(chainable).forEach(fn => fn.mockReturnValue(chainable));
  return { mockInvoke, mockSingle, chainable };
});

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    functions: { invoke: mockInvoke },
    from: vi.fn(() => chainable),
  },
}));

// Montant VIP : source unique dynamique (visitor_levels). On fige les valeurs pour le test.
const VIP_PRICE_EUR = 700;
const VIP_PRICE_MAD = 7000;

vi.mock('../../src/services/visitorLevelService', () => ({
  fetchVipPassPricing: vi.fn().mockResolvedValue({
    level: 'premium',
    name: 'Pass Premium VIP',
    price: 700,
    currency: 'EUR',
  }),
}));

vi.mock('../../src/utils/currencyUtils', () => ({
  convertEURtoMAD: vi.fn().mockResolvedValue(7000),
  convertEURtoMADSync: vi.fn().mockReturnValue(7000),
}));

// Mock window.location.origin (jsdom)
Object.defineProperty(globalThis, 'location', {
  writable: true,
  value: { origin: 'http://localhost:9324', href: '' },
});

import {
  PAYPAL_CLIENT_ID,
  getVipPassAmount,
  capturePayPalOrder,
  createCMIPaymentRequest,
  checkPaymentStatus,
  createStripeCheckoutSession,
  redirectToStripeCheckout,
} from '../../src/services/paymentService';

// ─────────────────────────────────────────────────────────────────────────────

describe('paymentService — étendu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(chainable).forEach(fn => fn.mockReturnValue(chainable));
  });

  // ── Montant VIP (source unique dynamique) ─────────────────────────────────────
  describe('getVipPassAmount', () => {
    it('retourne le prix EUR issu de visitor_levels', async () => {
      await expect(getVipPassAmount()).resolves.toBe(VIP_PRICE_EUR);
    });
  });

  describe('PAYPAL_CLIENT_ID', () => {
    it('est une chaîne (vide en env test)', () => {
      expect(typeof PAYPAL_CLIENT_ID).toBe('string');
    });
  });

  // ── capturePayPalOrder ────────────────────────────────────────────────────────
  describe('capturePayPalOrder', () => {
    it('appelle la fonction Edge "capture-paypal-order" avec orderId et userId', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { success: true }, error: null });
      const result = await capturePayPalOrder('order-123', 'user-abc');
      expect(mockInvoke).toHaveBeenCalledWith('capture-paypal-order', {
        body: { orderId: 'order-123', userId: 'user-abc' },
      });
      expect(result).toEqual({ success: true });
    });

    it('lève une erreur si la fonction Edge échoue', async () => {
      mockInvoke.mockResolvedValueOnce({ data: null, error: new Error('Edge error') });
      await expect(capturePayPalOrder('order-fail', 'user-abc')).rejects.toThrow('Edge error');
    });

    it('retransmet le résultat de la capture', async () => {
      const response = { captureId: 'cap-456', status: 'COMPLETED' };
      mockInvoke.mockResolvedValueOnce({ data: response, error: null });
      const result = await capturePayPalOrder('order-789', 'user-abc');
      expect(result).toEqual(response);
    });
  });

  // ── createCMIPaymentRequest ───────────────────────────────────────────────────
  describe('createCMIPaymentRequest', () => {
    it('appelle la fonction Edge "create-cmi-payment"', async () => {
      const cmiResponse = { paymentUrl: 'https://cmi.ma/pay?token=abc123' };
      mockInvoke.mockResolvedValueOnce({ data: cmiResponse, error: null });
      const result = await createCMIPaymentRequest('user-abc', 'user@example.com');
      expect(mockInvoke).toHaveBeenCalledWith('create-cmi-payment', expect.objectContaining({
        body: expect.objectContaining({
          userId: 'user-abc',
          userEmail: 'user@example.com',
          currency: 'MAD',
        }),
      }));
      expect(result).toEqual(cmiResponse);
    });

    it('inclut les URLs de retour correctes', async () => {
      mockInvoke.mockResolvedValueOnce({ data: {}, error: null });
      await createCMIPaymentRequest('user-abc', 'user@example.com');
      const callArgs = mockInvoke.mock.calls[0][1].body;
      expect(callArgs.returnUrl).toContain('/visitor/payment-success');
      expect(callArgs.cancelUrl).toContain('/visitor/subscription');
    });

    it('envoie le montant VIP converti en MAD', async () => {
      mockInvoke.mockResolvedValueOnce({ data: {}, error: null });
      await createCMIPaymentRequest('user-abc', 'user@example.com');
      const callArgs = mockInvoke.mock.calls[0][1].body;
      expect(callArgs.amount).toBe(VIP_PRICE_MAD);
    });

    it('lève une erreur si la fonction Edge échoue', async () => {
      mockInvoke.mockResolvedValueOnce({ data: null, error: new Error('CMI unavailable') });
      await expect(createCMIPaymentRequest('user-abc', 'user@example.com')).rejects.toThrow();
    });
  });

  // ── checkPaymentStatus ────────────────────────────────────────────────────────
  describe('checkPaymentStatus', () => {
    it('retourne hasPaid=true si un paiement approuvé existe', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { payment_method: 'paypal', validated_at: '2026-05-09T10:00:00Z', status: 'approved' },
        error: null,
      });
      const result = await checkPaymentStatus('user-abc');
      expect(result.hasPaid).toBe(true);
      expect(result.paymentMethod).toBe('paypal');
    });

    it('retourne hasPaid=false si aucun paiement (PGRST116)', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows' },
      });
      const result = await checkPaymentStatus('user-new');
      expect(result.hasPaid).toBe(false);
    });

    it('retourne hasPaid=false si data est null', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: null });
      const result = await checkPaymentStatus('user-abc');
      expect(result.hasPaid).toBe(false);
    });

    it('retourne hasPaid=false en cas d\'erreur réseau', async () => {
      mockSingle.mockRejectedValueOnce(new Error('Network error'));
      const result = await checkPaymentStatus('user-abc');
      expect(result.hasPaid).toBe(false);
    });

    it('filtre par user_id et status=approved', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: null });
      await checkPaymentStatus('user-xyz');
      expect(chainable.eq).toHaveBeenCalledWith('user_id', 'user-xyz');
      expect(chainable.eq).toHaveBeenCalledWith('status', 'approved');
    });
  });

  // ── Stripe (désactivé) ────────────────────────────────────────────────────────
  describe('createStripeCheckoutSession (désactivé)', () => {
    it('lève une erreur indiquant que Stripe est désactivé', async () => {
      await expect(createStripeCheckoutSession('user', 'email')).rejects.toThrow(
        /Stripe est désactivé/i,
      );
    });
  });

  describe('redirectToStripeCheckout (désactivé)', () => {
    it('lève une erreur indiquant que Stripe est désactivé', async () => {
      await expect(redirectToStripeCheckout('session-id')).rejects.toThrow(
        /Stripe est désactivé/i,
      );
    });
  });
});
