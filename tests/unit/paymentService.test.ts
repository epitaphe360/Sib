import { describe, it, expect, vi } from 'vitest';
import { PAYMENT_AMOUNTS } from '../../src/services/paymentService';

// Mock supabase
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe('paymentService', () => {
  describe('PAYMENT_AMOUNTS', () => {
    it('should define VIP pass amount in euros', () => {
      expect(PAYMENT_AMOUNTS.VIP_PASS).toBe(300);
    });

    it('should define VIP pass amount in cents', () => {
      expect(PAYMENT_AMOUNTS.VIP_PASS_CENTS).toBe(30000);
    });

    it('cents should be 100x euros', () => {
      expect(PAYMENT_AMOUNTS.VIP_PASS_CENTS).toBe(PAYMENT_AMOUNTS.VIP_PASS * 100);
    });
  });
});
