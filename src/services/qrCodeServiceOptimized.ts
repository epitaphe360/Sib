/**
 * QR Code Service Optimisé avec Cache Redis/Supabase
 * Résout TODO ligne 307 de qrCodeService.ts
 * Implémente cache pour nonces anti-replay
 */

import QRCode from 'qrcode';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export interface QRCodeData {
  userId: string;
  type: 'badge' | 'check-in' | 'appointment' | 'access';
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface QRCodeNonce {
  nonce: string;
  userId: string;
  type: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

class QRCodeServiceOptimized {
  private readonly NONCE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_TABLE = 'qr_nonces'; // Supabase table for caching

  /**
   * Générer nonce cryptographique
   */
  private generateNonce(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Créer et cacher nonce dans Supabase
   */
  private async cacheNonce(nonce: string, data: QRCodeData): Promise<void> {
    try {
      const expiresAt = data.expiresAt || new Date(Date.now() + this.NONCE_EXPIRY_MS);

      const { error } = await supabase.from(this.CACHE_TABLE).insert({
        nonce,
        user_id: data.userId,
        type: data.type,
        metadata: data.metadata,
        expires_at: expiresAt.toISOString(),
        used: false,
        created_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Failed to cache nonce', error);
        // Non-blocking - continue même si cache fail
      } else {
        logger.debug('Nonce cached', { nonce: nonce.substring(0, 8) });
      }
    } catch (error) {
      logger.error('Cache nonce error', error as Error);
    }
  }

  /**
   * Vérifier et marquer nonce comme utilisé (anti-replay)
   */
  async validateNonce(nonce: string): Promise<{
    valid: boolean;
    data?: QRCodeNonce;
    error?: string;
  }> {
    try {
      // Récupérer nonce du cache
      const { data, error } = await supabase
        .from(this.CACHE_TABLE)
        .select('nonce, user_id, type, metadata, expires_at, used, created_at')
        .eq('nonce', nonce)
        .single();

      if (error || !data) {
        return { valid: false, error: 'Nonce not found' };
      }

      // Vérifier expiration
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        logger.warn('Nonce expired', { nonce: nonce.substring(0, 8) });
        return { valid: false, error: 'Nonce expired' };
      }

      // Vérifier si déjà utilisé (anti-replay)
      if (data.used) {
        logger.warn('Nonce already used - Replay attack detected!', {
          nonce: nonce.substring(0, 8),
          userId: data.user_id,
        });
        return { valid: false, error: 'Nonce already used (replay attack)' };
      }

      // Marquer comme utilisé
      const { error: updateError } = await supabase
        .from(this.CACHE_TABLE)
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('nonce', nonce);

      if (updateError) {
        logger.error('Failed to mark nonce as used', updateError);
      }

      logger.info('Nonce validated successfully', {
        nonce: nonce.substring(0, 8),
        userId: data.user_id,
        type: data.type,
      });

      return {
        valid: true,
        data: {
          nonce: data.nonce,
          userId: data.user_id,
          type: data.type,
          createdAt: new Date(data.created_at),
          expiresAt: new Date(data.expires_at),
          used: true,
        },
      };
    } catch (error) {
      logger.error('Validate nonce error', error as Error);
      return { valid: false, error: 'Validation error' };
    }
  }

  /**
   * Générer QR Code avec nonce sécurisé
   */
  async generateQRCode(data: QRCodeData): Promise<string> {
    try {
      const nonce = this.generateNonce();

      // Cacher nonce pour validation future
      await this.cacheNonce(nonce, data);

      // Créer payload QR code
      const payload = {
        nonce,
        userId: data.userId,
        type: data.type,
        metadata: data.metadata,
        timestamp: Date.now(),
      };

      // Générer QR code image (base64)
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      logger.info('QR code generated', {
        userId: data.userId,
        type: data.type,
        nonce: nonce.substring(0, 8),
      });

      return qrCodeDataUrl;
    } catch (error) {
      logger.error('Failed to generate QR code', error as Error);
      throw new Error('QR code generation failed');
    }
  }

  /**
   * Scanner et valider QR Code
   */
  async scanQRCode(qrPayload: string): Promise<{
    success: boolean;
    data?: QRCodeNonce;
    error?: string;
  }> {
    try {
      // Parser payload
      const payload = JSON.parse(qrPayload);

      if (!payload.nonce || !payload.userId || !payload.type) {
        return { success: false, error: 'Invalid QR code format' };
      }

      // Vérifier timestamp (QR code pas trop vieux - 24h max)
      const qrAge = Date.now() - payload.timestamp;
      if (qrAge > 24 * 60 * 60 * 1000) {
        return { success: false, error: 'QR code too old (>24h)' };
      }

      // Valider nonce (anti-replay)
      const validation = await this.validateNonce(payload.nonce);

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      return {
        success: true,
        data: validation.data,
      };
    } catch (error) {
      logger.error('Scan QR code error', error as Error);
      return { success: false, error: 'Scan failed' };
    }
  }

  /**
   * Nettoyer nonces expirés (à appeler périodiquement via cron)
   */
  async cleanupExpiredNonces(): Promise<number> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.CACHE_TABLE)
        .delete()
        .lt('expires_at', now)
        .select('nonce');

      if (error) {
        logger.error('Cleanup expired nonces failed', error);
        return 0;
      }

      const count = data?.length || 0;
      logger.info('Expired nonces cleaned up', { count });

      return count;
    } catch (error) {
      logger.error('Cleanup error', error as Error);
      return 0;
    }
  }

  /**
   * Migration SQL pour créer table cache
   * À exécuter une fois dans Supabase
   */
  static getMigrationSQL(): string {
    return `
-- Créer table qr_nonces pour cache
CREATE TABLE IF NOT EXISTS public.qr_nonces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nonce VARCHAR(64) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at TIMESTAMPTZ,

  -- Index pour performance
  INDEX idx_qr_nonces_nonce (nonce),
  INDEX idx_qr_nonces_expires (expires_at),
  INDEX idx_qr_nonces_user (user_id)
);

-- RLS policies
ALTER TABLE public.qr_nonces ENABLE ROW LEVEL SECURITY;

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all nonces"
  ON public.qr_nonces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Users peuvent voir leurs propres nonces
CREATE POLICY "Users can view own nonces"
  ON public.qr_nonces FOR SELECT
  USING (user_id = auth.uid());

-- Service role peut insérer (backend only)
CREATE POLICY "Service can insert nonces"
  ON public.qr_nonces FOR INSERT
  WITH CHECK (true);

-- Service role peut update (backend only)
CREATE POLICY "Service can update nonces"
  ON public.qr_nonces FOR UPDATE
  USING (true);

-- Auto-cleanup des nonces expirés (optionnel - pg_cron)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-qr-nonces', '0 * * * *', $$
--   DELETE FROM public.qr_nonces WHERE expires_at < NOW();
-- $$);
    `;
  }
}

export const qrCodeServiceOptimized = new QRCodeServiceOptimized();
export default qrCodeServiceOptimized;
