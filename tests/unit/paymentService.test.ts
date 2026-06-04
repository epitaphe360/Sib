import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getVipPassAmount } from '../../src/services/paymentService';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          level: 'premium',
          name: 'Pass VIP Premium',
          price_annual: 850,
          price_monthly: 0,
        },
        error: null,
      }),
    })),
  },
}));

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getVipPassAmount', () => {
    it('returns VIP price from visitor_levels config', async () => {
      await expect(getVipPassAmount()).resolves.toBe(850);
    });
  });
});
