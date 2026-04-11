/**
 * Service d'authentification à deux facteurs (2FA)
 * Supporte TOTP (Google Authenticator), SMS et Email
 */

import { supabase } from '../lib/supabase';
import { auditService } from './auditService';

export interface TwoFactorAuth {
  id: string;
  user_id: string;
  totp_secret?: string;
  totp_enabled: boolean;
  totp_verified_at?: string;
  sms_phone?: string;
  sms_enabled: boolean;
  sms_verified_at?: string;
  email_enabled: boolean;
  email_verified_at?: string;
  backup_codes?: string[];
  backup_codes_generated_at?: string;
  recovery_email?: string;
  recovery_phone?: string;
  last_used_at?: string;
  failed_attempts: number;
  locked_until?: string;
}

interface TwoFactorAuthUpdate {
  failed_attempts: number;
  locked_until?: string;
}

class TwoFactorAuthService {
  /**
   * Générer un secret TOTP
   * Note: Utilise une Edge Function pour générer le secret de manière sécurisée
   */
  async generateTOTPSecret(userId: string): Promise<{
    secret: string;
    qrCode: string;
  } | null> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-totp-secret', {
        body: { userId },
      });

      if (error) throw error;

      // Sauvegarder le secret (non vérifié)
      await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: userId,
          totp_secret: data.secret,
          totp_enabled: false,
        });

      await auditService.log({
        userId,
        action: '2fa.totp_secret_generated',
        entityType: '2fa',
        entityId: userId,
        severity: 'info',
      });

      return {
        secret: data.secret,
        qrCode: data.qrCodeUrl,
      };
    } catch (error) {
      console.error('❌ Erreur generateTOTPSecret:', error);
      return null;
    }
  }

  /**
   * Vérifier et activer TOTP
   */
  async verifyAndEnableTOTP(
    userId: string,
    token: string
  ): Promise<{ success: boolean; backupCodes?: string[] }> {
    try {
      // Vérifier le token via Edge Function
      const { data, error } = await supabase.functions.invoke('verify-totp-token', {
        body: { userId, token },
      });

      if (error) throw error;

      if (!data.valid) {
        await this.incrementFailedAttempts(userId);
        return { success: false };
      }

      // Générer des backup codes
      const backupCodes = await this.generateBackupCodes(userId);

      // Activer TOTP
      await supabase
        .from('two_factor_auth')
        .update({
          totp_enabled: true,
          totp_verified_at: new Date().toISOString(),
          failed_attempts: 0,
        })
        .eq('user_id', userId);

      await auditService.log({
        userId,
        action: '2fa.totp_enabled',
        entityType: '2fa',
        entityId: userId,
        severity: 'info',
      });

      return { success: true, backupCodes };
    } catch (error) {
      console.error('❌ Erreur verifyAndEnableTOTP:', error);
      return { success: false };
    }
  }

  /**
   * Vérifier un token TOTP lors de la connexion
   */
  async verifyTOTP(userId: string, token: string): Promise<boolean> {
    try {
      // Vérifier si le compte est verrouillé
      const config = await this.get2FAConfig(userId);
      if (config?.locked_until && new Date(config.locked_until) > new Date()) {
        throw new Error('Account temporarily locked due to too many failed attempts');
      }

      // Vérifier le token
      const { data, error } = await supabase.functions.invoke('verify-totp-token', {
        body: { userId, token },
      });

      if (error) throw error;

      if (!data.valid) {
        await this.incrementFailedAttempts(userId);
        return false;
      }

      // Réinitialiser les tentatives échouées et mettre à jour last_used_at
      await supabase
        .from('two_factor_auth')
        .update({
          failed_attempts: 0,
          locked_until: null,
          last_used_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      await auditService.log({
        userId,
        action: '2fa.totp_verified',
        entityType: '2fa',
        entityId: userId,
        severity: 'info',
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur verifyTOTP:', error);
      return false;
    }
  }

  /**
   * Désactiver TOTP
   */
  async disableTOTP(userId: string): Promise<boolean> {
    try {
      await supabase
        .from('two_factor_auth')
        .update({
          totp_enabled: false,
          totp_secret: null,
          totp_verified_at: null,
        })
        .eq('user_id', userId);

      await auditService.log({
        userId,
        action: '2fa.totp_disabled',
        entityType: '2fa',
        entityId: userId,
        severity: 'warning',
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur disableTOTP:', error);
      return false;
    }
  }

  /**
   * Générer des codes de backup
   */
  private async generateBackupCodes(userId: string, count: number = 10): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-backup-codes', {
        body: { userId, count },
      });

      if (error) throw error;

      // Sauvegarder les codes hashés
      await supabase
        .from('two_factor_auth')
        .update({
          backup_codes: data.hashedCodes,
          backup_codes_generated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      return data.codes;
    } catch (error) {
      console.error('❌ Erreur generateBackupCodes:', error);
      return [];
    }
  }

  /**
   * Vérifier et utiliser un code de backup
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-backup-code', {
        body: { userId, code },
      });

      if (error) throw error;

      if (data.valid) {
        await auditService.log({
          userId,
          action: '2fa.backup_code_used',
          entityType: '2fa',
          entityId: userId,
          severity: 'warning',
        });
      }

      return data.valid;
    } catch (error) {
      console.error('❌ Erreur verifyBackupCode:', error);
      return false;
    }
  }

  /**
   * Envoyer un code 2FA par SMS
   */
  async sendSMSCode(userId: string, phone: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-2fa-sms', {
        body: { userId, phone },
      });

      if (error) throw error;

      await auditService.log({
        userId,
        action: '2fa.sms_sent',
        entityType: '2fa',
        entityId: userId,
        severity: 'info',
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur sendSMSCode:', error);
      return false;
    }
  }

  /**
   * Vérifier un code SMS
   */
  async verifySMSCode(userId: string, code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa-sms', {
        body: { userId, code },
      });

      if (error) throw error;

      if (!data.valid) {
        await this.incrementFailedAttempts(userId);
        return false;
      }

      await supabase
        .from('two_factor_auth')
        .update({
          failed_attempts: 0,
          locked_until: null,
          last_used_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      await auditService.log({
        userId,
        action: '2fa.sms_verified',
        entityType: '2fa',
        entityId: userId,
        severity: 'info',
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur verifySMSCode:', error);
      return false;
    }
  }

  /**
   * Activer 2FA par SMS
   */
  async enableSMS(userId: string, phone: string): Promise<boolean> {
    try {
      await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: userId,
          sms_phone: phone,
          sms_enabled: true,
          sms_verified_at: new Date().toISOString(),
        });

      await auditService.log({
        userId,
        action: '2fa.sms_enabled',
        entityType: '2fa',
        entityId: userId,
        severity: 'info',
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur enableSMS:', error);
      return false;
    }
  }

  /**
   * Désactiver 2FA par SMS
   */
  async disableSMS(userId: string): Promise<boolean> {
    try {
      await supabase
        .from('two_factor_auth')
        .update({
          sms_enabled: false,
          sms_phone: null,
          sms_verified_at: null,
        })
        .eq('user_id', userId);

      await auditService.log({
        userId,
        action: '2fa.sms_disabled',
        entityType: '2fa',
        entityId: userId,
        severity: 'warning',
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur disableSMS:', error);
      return false;
    }
  }

  /**
   * Envoyer un code 2FA par email
   */
  async sendEmailCode(userId: string, email: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-2fa-email', {
        body: { userId, email },
      });

      if (error) throw error;

      await auditService.log({
        userId,
        action: '2fa.email_sent',
        entityType: '2fa',
        entityId: userId,
        severity: 'info',
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur sendEmailCode:', error);
      return false;
    }
  }

  /**
   * Vérifier un code email
   */
  async verifyEmailCode(userId: string, code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa-email', {
        body: { userId, code },
      });

      if (error) throw error;

      if (!data.valid) {
        await this.incrementFailedAttempts(userId);
        return false;
      }

      await supabase
        .from('two_factor_auth')
        .update({
          failed_attempts: 0,
          locked_until: null,
          last_used_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      await auditService.log({
        userId,
        action: '2fa.email_verified',
        entityType: '2fa',
        entityId: userId,
        severity: 'info',
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur verifyEmailCode:', error);
      return false;
    }
  }

  /**
   * Récupérer la configuration 2FA d'un utilisateur
   */
  async get2FAConfig(userId: string): Promise<TwoFactorAuth | null> {
    try {
      const { data, error } = await supabase
        .from('two_factor_auth')
        .select('id, user_id, totp_secret, totp_enabled, totp_verified_at, sms_phone, sms_enabled, sms_verified_at, email_enabled, email_verified_at, backup_codes, backup_codes_generated_at, recovery_email, recovery_phone, last_used_at, failed_attempts, locked_until')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur get2FAConfig:', error);
      return null;
    }
  }

  /**
   * Vérifier si 2FA est activé pour un utilisateur
   */
  async is2FAEnabled(userId: string): Promise<boolean> {
    const config = await this.get2FAConfig(userId);
    return !!(
      config &&
      (config.totp_enabled || config.sms_enabled || config.email_enabled)
    );
  }

  /**
   * Incrémenter les tentatives échouées
   */
  private async incrementFailedAttempts(userId: string): Promise<void> {
    try {
      const config = await this.get2FAConfig(userId);
      const failedAttempts = (config?.failed_attempts || 0) + 1;

      const updates: TwoFactorAuthUpdate = {
        failed_attempts: failedAttempts,
      };

      // Verrouiller le compte après 5 tentatives échouées
      if (failedAttempts >= 5) {
        updates.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

        await auditService.log({
          userId,
          action: 'security.2fa_account_locked',
          entityType: 'security',
          metadata: { failed_attempts: failedAttempts },
          severity: 'critical',
        });
      }

      await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: userId,
          ...updates,
        });
    } catch (error) {
      console.error('❌ Erreur incrementFailedAttempts:', error);
    }
  }
}

export const twoFactorAuthService = new TwoFactorAuthService();
export default twoFactorAuthService;
