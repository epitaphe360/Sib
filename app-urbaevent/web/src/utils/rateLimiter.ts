/**
 * Rate Limiter pour prévenir les attaques par force brute
 *
 * SÉCURITÉ: Protection contre les tentatives de connexion multiples
 * - Max 5 tentatives par période de 15 minutes
 * - Backoff exponentiel après chaque échec
 * - Reset automatique après succès
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface AttemptRecord {
  count: number;
  lastAttemptTime: number;
  blockedUntil: number | null;
}

class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      maxAttempts: config?.maxAttempts || 5,
      windowMs: config?.windowMs || 15 * 60 * 1000, // 15 minutes
      blockDurationMs: config?.blockDurationMs || 15 * 60 * 1000 // 15 minutes
    };

    // Nettoyage périodique des anciennes entrées
    this.startCleanupInterval();
  }

  /**
   * Vérifie si une action est autorisée pour un identifiant donné
   */
  async isAllowed(identifier: string): Promise<{ allowed: boolean; remainingAttempts?: number; retryAfter?: number }> {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    // Pas d'historique = autorisé
    if (!record) {
      return { allowed: true, remainingAttempts: this.config.maxAttempts };
    }

    // Vérifier si bloqué
    if (record.blockedUntil && record.blockedUntil > now) {
      const retryAfterMs = record.blockedUntil - now;
      return {
        allowed: false,
        retryAfter: Math.ceil(retryAfterMs / 1000) // en secondes
      };
    }

    // Vérifier si la fenêtre est expirée
    const timeSinceLastAttempt = now - record.lastAttemptTime;
    if (timeSinceLastAttempt > this.config.windowMs) {
      // Reset la fenêtre
      this.attempts.delete(identifier);
      return { allowed: true, remainingAttempts: this.config.maxAttempts };
    }

    // Vérifier le nombre de tentatives
    const remainingAttempts = this.config.maxAttempts - record.count;
    if (remainingAttempts <= 0) {
      // Bloquer l'utilisateur
      const blockedUntil = now + this.config.blockDurationMs;
      this.attempts.set(identifier, {
        ...record,
        blockedUntil
      });

      return {
        allowed: false,
        retryAfter: Math.ceil(this.config.blockDurationMs / 1000)
      };
    }

    return {
      allowed: true,
      remainingAttempts
    };
  }

  /**
   * Enregistre une tentative échouée
   */
  recordFailure(identifier: string): void {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, {
        count: 1,
        lastAttemptTime: now,
        blockedUntil: null
      });
    } else {
      this.attempts.set(identifier, {
        count: record.count + 1,
        lastAttemptTime: now,
        blockedUntil: record.blockedUntil
      });
    }
  }

  /**
   * Enregistre un succès (reset les tentatives)
   */
  recordSuccess(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Reset manuel d'un identifiant
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Reset complet
   */
  resetAll(): void {
    this.attempts.clear();
  }

  /**
   * Obtenir les statistiques pour un identifiant
   */
  getStats(identifier: string): AttemptRecord | null {
    return this.attempts.get(identifier) || null;
  }

  /**
   * Nettoyage périodique des anciennes entrées (toutes les 30 minutes)
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredIdentifiers: string[] = [];

      this.attempts.forEach((record, identifier) => {
        const timeSinceLastAttempt = now - record.lastAttemptTime;
        // Supprimer les entrées plus vieilles que 2x la fenêtre
        if (timeSinceLastAttempt > this.config.windowMs * 2) {
          expiredIdentifiers.push(identifier);
        }
      });

      expiredIdentifiers.forEach(id => this.attempts.delete(id));
    }, 30 * 60 * 1000); // 30 minutes
  }
}

// Export singleton pour les connexions
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 15 * 60 * 1000 // 15 minutes
});

// Export singleton pour les réinitialisations de mot de passe
export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 heure
  blockDurationMs: 60 * 60 * 1000 // 1 heure
});

// Export de la classe pour créer des instances personnalisées
export default RateLimiter;
