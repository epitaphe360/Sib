/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizePartnerTierDb, partnerTierForNetworking } from '../../../../apps/mobile/src/lib/partnerTier';
import { avatarColor, avatarInitials } from '../../../../apps/mobile/src/lib/avatarColor';
import { getErrorMessage, isNetworkError, ACCOUNT_NOT_FOUND } from '../../../../apps/mobile/src/lib/errors';
import { sanitizeIlikeTerm } from '../../../../apps/mobile/src/lib/sanitizeIlike';
import { localeCode } from '../../../../apps/mobile/src/lib/locale';
import { isQuickLoginEnabled, DEMO_QUICK_LOGIN_ACCOUNTS } from '../../../../apps/mobile/src/lib/demoQuickLogin';
import { supabaseErrorMessage } from '../../../../apps/mobile/src/lib/supabaseError';
import { withTimeout } from '../../../../apps/mobile/src/lib/withTimeout';
import { withRetry } from '../../../../apps/mobile/src/lib/withRetry';

describe('Mobile — lib core', () => {
  describe('partnerTier', () => {
    it('normalise les tiers partenaires', () => {
      expect(normalizePartnerTierDb('bronze')).toBe('museum');
      expect(normalizePartnerTierDb('platinum')).toBe('platinium');
      expect(normalizePartnerTierDb('gold')).toBe('gold');
      expect(normalizePartnerTierDb(null)).toBe('museum');
      expect(normalizePartnerTierDb('unknown')).toBe('museum');
    });
    it('mappe vers tiers réseautage', () => {
      expect(partnerTierForNetworking('museum')).toBe('bronze');
      expect(partnerTierForNetworking('platinium')).toBe('platinum');
      expect(partnerTierForNetworking('silver')).toBe('silver');
    });
  });

  describe('avatarColor', () => {
    it('couleur déterministe', () => {
      expect(avatarColor('a@test.com')).toBe(avatarColor('a@test.com'));
      expect(avatarColor('a@test.com')).not.toBe(avatarColor('b@test.com'));
    });
    it('initiales', () => {
      expect(avatarInitials('Jean Dupont')).toBe('JD');
      expect(avatarInitials('Solo')).toBe('SO');
    });
  });

  describe('errors', () => {
    it('extrait les messages', () => {
      expect(getErrorMessage(new Error('boom'))).toBe('boom');
      expect(getErrorMessage('text')).toBe('text');
      expect(getErrorMessage({ message: 'obj' })).toBe('obj');
      expect(getErrorMessage(null)).toBe('Une erreur est survenue');
      expect(getErrorMessage(null, 'fallback')).toBe('fallback');
    });
    it('détecte erreurs réseau', () => {
      expect(isNetworkError(new Error('Network request failed'))).toBe(true);
      expect(isNetworkError(new Error('timeout'))).toBe(true);
      expect(isNetworkError(new Error('connexion perdue'))).toBe(true);
      expect(isNetworkError(new Error('validation'))).toBe(false);
    });
    it('constante ACCOUNT_NOT_FOUND', () => {
      expect(ACCOUNT_NOT_FOUND).toBe('ACCOUNT_NOT_FOUND');
    });
  });

  describe('sanitizeIlikeTerm', () => {
    it('échappe % _ \\', () => {
      expect(sanitizeIlikeTerm('  foo%_\\  ')).toBe('foo\\%\\_\\\\');
    });
  });

  describe('localeCode', () => {
    it('mappe fr/en/ar', () => {
      expect(localeCode('fr')).toBe('fr-FR');
      expect(localeCode('ar')).toBe('ar-MA');
      expect(localeCode('en')).toBe('en-US');
      expect(localeCode('xx')).toBe('fr-FR');
    });
  });

  describe('demoQuickLogin', () => {
    it('5 comptes démo', () => {
      expect(DEMO_QUICK_LOGIN_ACCOUNTS).toHaveLength(5);
    });
    it('désactivé par défaut (store prod)', () => {
      delete process.env.EXPO_PUBLIC_ENABLE_QUICK_LOGIN;
      expect(isQuickLoginEnabled()).toBe(false);
    });
    it('activable en dev/preview', () => {
      process.env.EXPO_PUBLIC_ENABLE_QUICK_LOGIN = 'true';
      expect(isQuickLoginEnabled()).toBe(true);
      delete process.env.EXPO_PUBLIC_ENABLE_QUICK_LOGIN;
    });
    it('désactivable explicitement', () => {
      process.env.EXPO_PUBLIC_ENABLE_QUICK_LOGIN = 'false';
      expect(isQuickLoginEnabled()).toBe(false);
      delete process.env.EXPO_PUBLIC_ENABLE_QUICK_LOGIN;
    });
  });

  describe('supabaseErrorMessage', () => {
    it('codes Postgres connus', () => {
      expect(supabaseErrorMessage({ code: '42P01', message: 'x' }, 'fb')).toMatch(/migrations/);
      expect(supabaseErrorMessage({ code: '42P17', message: 'x' }, 'fb')).toMatch(/RLS/);
      expect(supabaseErrorMessage({ code: '42501', message: 'x' }, 'fb')).toMatch(/Droits/);
      expect(supabaseErrorMessage({ code: 'PGRST301', message: 'x' }, 'fb')).toMatch(/Droits/);
      expect(supabaseErrorMessage({ code: '23505', message: 'x' }, 'fb')).toMatch(/existant/);
      expect(supabaseErrorMessage({ code: 'PGRST116', message: 'x' }, 'fb')).toBe('fb');
    });
    it('message objet vide → fallback', () => {
      expect(supabaseErrorMessage({ message: '  err  ' }, 'fb')).toBe('err');
      expect(supabaseErrorMessage({ message: '   ' }, 'fb')).toBe('fb');
      expect(supabaseErrorMessage(new Error('e'), 'fb')).toBe('e');
      expect(supabaseErrorMessage(new Error('  '), 'fb')).toBe('fb');
      expect(supabaseErrorMessage({ code: '99999' }, 'fb')).toBe('fb');
      expect(supabaseErrorMessage({ message: 42 }, 'fb')).toBe('fb');
      expect(supabaseErrorMessage(new Error('ok'), 'fb')).toBe('ok');
      expect(supabaseErrorMessage({}, 'fb')).toBe('fb');
      expect(supabaseErrorMessage(null, 'fb')).toBe('fb');
    });
  });

  describe('withTimeout', () => {
    it('résout avant timeout', async () => {
      await expect(withTimeout(Promise.resolve(42), 500)).resolves.toBe(42);
    });
    it('rejette après timeout', async () => {
      await expect(
        withTimeout(new Promise((r) => setTimeout(() => r(1), 200)), 50, 'test'),
      ).rejects.toThrow('test timeout');
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('réussit au premier essai', async () => {
      const fn = vi.fn().mockResolvedValue('ok');
      await expect(withRetry(fn)).resolves.toBe('ok');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retente sur erreur réseau', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-expect-error test __DEV__
      globalThis.__DEV__ = true;
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('network failed'))
        .mockResolvedValue('ok');
      const p = withRetry(fn, { baseDelayMs: 100, context: 'testCtx' });
      await vi.advanceTimersByTimeAsync(100);
      await expect(p).resolves.toBe('ok');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it('échoue si pas erreur réseau', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('validation'));
      await expect(withRetry(fn)).rejects.toThrow('validation');
      expect(fn).toHaveBeenCalledTimes(1);
    });
    it('retente sans __DEV__', async () => {
      // @ts-expect-error test
      delete globalThis.__DEV__;
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('network failed'))
        .mockResolvedValue('ok');
      const p = withRetry(fn, { baseDelayMs: 50 });
      await vi.advanceTimersByTimeAsync(50);
      await expect(p).resolves.toBe('ok');
    });

    it('échoue après max tentatives réseau', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('network failed'));
      const p = withRetry(fn, { maxAttempts: 2, baseDelayMs: 10 });
      const expectP = expect(p).rejects.toThrow('network failed');
      await vi.advanceTimersByTimeAsync(10);
      await expectP;
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
