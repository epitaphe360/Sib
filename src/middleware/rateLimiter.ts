/**
 * Rate Limiter Middleware
 * Protection contre abus API
 */

import { logger } from '../lib/logger';

export interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en ms
  maxRequests: number; // Nombre max de requêtes
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (userId?: string) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    // No entry = allowed
    if (!entry) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Entry expired = reset
    if (now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Under limit = allowed
    if (entry.count < config.maxRequests) {
      entry.count++;
      return true;
    }

    // Over limit = blocked
    logger.warn('Rate limit exceeded', { key, count: entry.count });
    return false;
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string, config: RateLimitConfig): number {
    const entry = this.store.get(key);
    if (!entry) {return config.maxRequests;}

    const now = Date.now();
    if (now > entry.resetTime) {return config.maxRequests;}

    return Math.max(0, config.maxRequests - entry.count);
  }

  /**
   * Get reset time
   */
  getResetTime(key: string): number | null {
    const entry = this.store.get(key);
    return entry ? entry.resetTime : null;
  }

  /**
   * Reset limit for key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all rate limit entries (useful for testing)
   */
  clearAll(): void {
    this.store.clear();
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Rate limiter cleanup', { cleaned, remaining: this.store.size });
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Presets
export const RATE_LIMITS = {
  // API général - 100 req/min
  API: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },

  // Login - 5 tentatives/15min
  LOGIN: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },

  // Registration - 3 inscriptions/heure
  REGISTRATION: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
  },

  // Search - 30 req/min
  SEARCH: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },

  // File upload - 10 uploads/heure
  UPLOAD: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  },

  // Email - 5 emails/heure
  EMAIL: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
  },

  // Export - 3 exports/heure
  EXPORT: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
  },
};

/**
 * Hook pour utiliser rate limiter dans composants
 */
export function useRateLimit(userId: string | undefined, config: RateLimitConfig) {
  const key = userId || 'anonymous';

  const checkLimit = (): boolean => {
    return rateLimiter.isAllowed(key, config);
  };

  const getRemaining = (): number => {
    return rateLimiter.getRemaining(key, config);
  };

  const getResetTime = (): number | null => {
    return rateLimiter.getResetTime(key);
  };

  return {
    checkLimit,
    getRemaining,
    getResetTime,
    isLimited: !checkLimit(),
  };
}

/**
 * Wrapper pour fonctions async avec rate limiting
 */
export async function withRateLimit<T>(
  key: string,
  config: RateLimitConfig,
  fn: () => Promise<T>
): Promise<T> {
  if (!rateLimiter.isAllowed(key, config)) {
    const resetTime = rateLimiter.getResetTime(key);
    const waitTime = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 0;

    throw new Error(
      `Rate limit exceeded. Please try again in ${waitTime} seconds.`
    );
  }

  return fn();
}

export default rateLimiter;

