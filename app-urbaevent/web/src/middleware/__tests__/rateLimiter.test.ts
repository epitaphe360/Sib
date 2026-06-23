/**
 * Tests unitaires pour rateLimiter
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import rateLimiter, { RATE_LIMITS, withRateLimit } from '../rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    // Reset rate limiter before each test
    rateLimiter.clearAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic rate limiting', () => {
    it('should allow requests under limit', () => {
      const config = { windowMs: 60000, maxRequests: 5 };

      for (let i = 0; i < 5; i++) {
        const allowed = rateLimiter.isAllowed('test-key', config);
        expect(allowed).toBe(true);
      }
    });

    it('should block requests over limit', () => {
      const config = { windowMs: 60000, maxRequests: 3 };

      // First 3 should pass
      expect(rateLimiter.isAllowed('test-key', config)).toBe(true);
      expect(rateLimiter.isAllowed('test-key', config)).toBe(true);
      expect(rateLimiter.isAllowed('test-key', config)).toBe(true);

      // 4th should fail
      expect(rateLimiter.isAllowed('test-key', config)).toBe(false);
    });

    it('should reset after window expires', () => {
      const config = { windowMs: 60000, maxRequests: 2 };

      // Use up limit
      rateLimiter.isAllowed('test-key', config);
      rateLimiter.isAllowed('test-key', config);

      // Should be blocked
      expect(rateLimiter.isAllowed('test-key', config)).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(61000);

      // Should be allowed again
      expect(rateLimiter.isAllowed('test-key', config)).toBe(true);
    });
  });

  describe('getRemaining', () => {
    it('should return correct remaining count', () => {
      const config = { windowMs: 60000, maxRequests: 5 };

      expect(rateLimiter.getRemaining('test-key', config)).toBe(5);

      rateLimiter.isAllowed('test-key', config);
      expect(rateLimiter.getRemaining('test-key', config)).toBe(4);

      rateLimiter.isAllowed('test-key', config);
      expect(rateLimiter.getRemaining('test-key', config)).toBe(3);
    });
  });

  describe('reset', () => {
    it('should reset limit for specific key', () => {
      const config = { windowMs: 60000, maxRequests: 2 };

      // Use up limit
      rateLimiter.isAllowed('test-key', config);
      rateLimiter.isAllowed('test-key', config);
      expect(rateLimiter.isAllowed('test-key', config)).toBe(false);

      // Reset
      rateLimiter.reset('test-key');

      // Should be allowed again
      expect(rateLimiter.isAllowed('test-key', config)).toBe(true);
    });
  });

  describe('Preset configs', () => {
    it('should have login preset with correct limits', () => {
      expect(RATE_LIMITS.LOGIN).toEqual({
        windowMs: 15 * 60 * 1000, // 15 min
        maxRequests: 5,
      });
    });

    it('should have registration preset', () => {
      expect(RATE_LIMITS.REGISTRATION).toEqual({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3,
      });
    });

    it('should have API preset', () => {
      expect(RATE_LIMITS.API.maxRequests).toBeGreaterThan(0);
    });
  });

  describe('withRateLimit wrapper', () => {
    it('should execute function when under limit', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const config = { windowMs: 60000, maxRequests: 5 };

      const result = await withRateLimit('test-key', config, mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalled();
    });

    it('should throw error when over limit', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const config = { windowMs: 60000, maxRequests: 1 };

      // Use up limit
      await withRateLimit('test-key', config, mockFn);

      // Should throw on second call
      await expect(withRateLimit('test-key', config, mockFn)).rejects.toThrow(
        'Rate limit exceeded'
      );
    });
  });

  describe('Multiple keys', () => {
    it('should track limits separately for different keys', () => {
      const config = { windowMs: 60000, maxRequests: 2 };

      // User 1
      rateLimiter.isAllowed('user1', config);
      rateLimiter.isAllowed('user1', config);
      expect(rateLimiter.isAllowed('user1', config)).toBe(false);

      // User 2 should still be allowed
      expect(rateLimiter.isAllowed('user2', config)).toBe(true);
      expect(rateLimiter.isAllowed('user2', config)).toBe(true);
    });
  });
});
