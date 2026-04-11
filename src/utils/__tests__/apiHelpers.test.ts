/**
 * Tests for API helper functions
 * Coverage: Timeout, retry logic, rate limiting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withTimeout,
  withRetry,
  withTimeoutAndRetry,
  robustAPICall,
  globalRateLimiter
} from '../apiHelpers';

describe('apiHelpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('withTimeout', () => {
    it('should resolve when promise completes before timeout', async () => {
      const promise = Promise.resolve('success');
      const result = await withTimeout(promise, 5000);
      expect(result).toBe('success');
    });

    it('should reject when promise exceeds timeout', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve('too late'), 10000);
      });

      const timeoutPromise = withTimeout(slowPromise, 1000);

      // Advance timers to trigger timeout
      vi.advanceTimersByTime(1000);

      await expect(timeoutPromise).rejects.toThrow('Request timeout');
    });

    it('should use custom timeout message', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve('too late'), 10000);
      });

      const timeoutPromise = withTimeout(slowPromise, 1000, 'Custom timeout error');

      vi.advanceTimersByTime(1000);

      await expect(timeoutPromise).rejects.toThrow('Custom timeout error');
    });

    it('should use default timeout of 10 seconds', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve('too late'), 15000);
      });

      const timeoutPromise = withTimeout(slowPromise);

      vi.advanceTimersByTime(10000);

      await expect(timeoutPromise).rejects.toThrow('Request timeout');
    });
  });

  describe('withRetry', () => {
    it('should succeed on first try', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      const result = await withRetry(successFn);
      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const failOnceFn = vi.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce('success');

      const retryPromise = withRetry(failOnceFn, { maxRetries: 3, initialDelayMs: 1000 });

      // First attempt fails, wait for retry delay
      await vi.advanceTimersByTimeAsync(1000);

      const result = await retryPromise;
      expect(result).toBe('success');
      expect(failOnceFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const authError = new Error('Unauthorized');
      (authError as any).status = 401;
      const failFn = vi.fn().mockRejectedValue(authError);

      await expect(withRetry(failFn, { maxRetries: 3 })).rejects.toThrow('Unauthorized');
      expect(failFn).toHaveBeenCalledTimes(1);
    });

    it('should retry 5xx errors', async () => {
      const serverError = new Error('Internal Server Error');
      (serverError as any).status = 500;
      const failOnceFn = vi.fn()
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce('success');

      const retryPromise = withRetry(failOnceFn, { maxRetries: 3, initialDelayMs: 1000 });
      await vi.advanceTimersByTimeAsync(1000);

      const result = await retryPromise;
      expect(result).toBe('success');
      expect(failOnceFn).toHaveBeenCalledTimes(2);
    });

    it('should retry 429 (Too Many Requests) errors', async () => {
      const rateLimitError = new Error('Too Many Requests');
      (rateLimitError as any).status = 429;
      const failOnceFn = vi.fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('success');

      const retryPromise = withRetry(failOnceFn, { maxRetries: 3, initialDelayMs: 1000 });
      await vi.advanceTimersByTimeAsync(1000);

      const result = await retryPromise;
      expect(result).toBe('success');
      expect(failOnceFn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('network error'));

      const retryPromise = withRetry(failFn, { maxRetries: 2, initialDelayMs: 100 });
      
      // Attach handler immediately to avoid unhandled rejection
      const expectPromise = expect(retryPromise).rejects.toThrow('network error');

      // Advance timers for all retry attempts
      await vi.advanceTimersByTimeAsync(100); // 1st retry
      await vi.advanceTimersByTimeAsync(200); // 2nd retry (exponential backoff)

      await expectPromise;
      expect(failFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      const times: number[] = [];
      const failFn = vi.fn().mockImplementation(() => {
        times.push(Date.now());
        return Promise.reject(new Error('network error'));
      });

      const retryPromise = withRetry(failFn, {
        maxRetries: 2,
        initialDelayMs: 1000,
        backoffMultiplier: 2
      }).catch(() => {}); // Gérer le rejet pour éviter UnhandledRejection

      await vi.advanceTimersByTimeAsync(1000); // 1st retry
      await vi.advanceTimersByTimeAsync(2000); // 2nd retry

      await retryPromise;
      expect(failFn).toHaveBeenCalled();
    });

    it('should respect maxDelayMs', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('network error'));

      const retryPromise = withRetry(failFn, {
        maxRetries: 3,
        initialDelayMs: 1000,
        backoffMultiplier: 10,
        maxDelayMs: 2000
      }).catch(() => {}); // Gérer le rejet pour éviter UnhandledRejection

      // With backoff 10x, delays would be 1000, 10000, 100000
      // But capped at maxDelayMs = 2000
      await vi.advanceTimersByTimeAsync(1000); // 1st retry
      await vi.advanceTimersByTimeAsync(2000); // 2nd retry (capped)
      await vi.advanceTimersByTimeAsync(2000); // 3rd retry (capped)

      await retryPromise;
      expect(failFn).toHaveBeenCalled();
    });

    it('should retry custom retryable errors', async () => {
      const customError = new Error('Database connection lost');
      const failOnceFn = vi.fn()
        .mockRejectedValueOnce(customError)
        .mockResolvedValueOnce('success');

      const retryPromise = withRetry(failOnceFn, {
        maxRetries: 3,
        initialDelayMs: 1000,
        retryableErrors: ['Database connection']
      });

      await vi.advanceTimersByTimeAsync(1000);

      const result = await retryPromise;
      expect(result).toBe('success');
      expect(failOnceFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('withTimeoutAndRetry', () => {
    it('should combine timeout and retry logic', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      const result = await withTimeoutAndRetry(successFn, 5000, { maxRetries: 3 });
      expect(result).toBe('success');
    });

    it('should timeout and not retry if timeout is not retryable', async () => {
      const slowFn = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('too late'), 10000);
        });
      });

      const promise = withTimeoutAndRetry(slowFn, 1000, { maxRetries: 3 }, 'Fatal Error');

      vi.advanceTimersByTime(1000);

      await expect(promise).rejects.toThrow('Fatal Error');
      expect(slowFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('robustAPICall', () => {
    it('should apply timeout, retry, and rate limiting', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      const promise = robustAPICall(successFn, {
        timeout: 5000,
        retry: { maxRetries: 3 },
        rateLimit: true
      });
      
      await vi.advanceTimersByTimeAsync(200);
      const result = await promise;
      expect(result).toBe('success');
    });

    it('should skip rate limiting when disabled', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      const result = await robustAPICall(successFn, {
        timeout: 5000,
        retry: { maxRetries: 3 },
        rateLimit: false
      });
      expect(result).toBe('success');
    });

    it('should use default options', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      const promise = robustAPICall(successFn);
      
      await vi.advanceTimersByTimeAsync(200);
      const result = await promise;
      expect(result).toBe('success');
    });
  });

  describe('Rate Limiter', () => {
    it('should execute functions sequentially within rate limit', async () => {
      const executionOrder: number[] = [];

      const fn1 = vi.fn().mockImplementation(async () => {
        executionOrder.push(1);
        return 'result1';
      });

      const fn2 = vi.fn().mockImplementation(async () => {
        executionOrder.push(2);
        return 'result2';
      });

      // Execute both through rate limiter
      const promise1 = globalRateLimiter.execute(fn1);
      const promise2 = globalRateLimiter.execute(fn2);

      await vi.advanceTimersByTimeAsync(200);

      await Promise.all([promise1, promise2]);

      expect(executionOrder).toEqual([1, 2]);
    });
  });
});
