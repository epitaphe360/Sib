/**
 * Audit de cohérence — SIB 2026
 *
 * Historique : ce fichier documentait des bugs de montants VIP (300 vs 700)
 * et d'instructions de virement incohérentes. Ces bugs sont désormais RÉSOLUS
 * par l'architecture « single source of truth » :
 *  - Le montant du Pass VIP est lu dynamiquement depuis visitor_levels
 *    (getVipPassAmount / fetchVipPassPricing) — plus de constante 300 codée en dur.
 *  - Les instructions de virement sont générées par getVisitorBankTransferInstructions
 *    avec le montant interpolé de façon identique en fr/en/ar.
 *
 * Ce fichier vérifie maintenant que la cohérence est bien maintenue.
 */
import { describe, it, expect } from 'vitest';

import { PAYPAL_CLIENT_ID } from '../../src/services/paymentService';
import { VISITOR_QUOTAS, VISITOR_LEVELS, calculateRemainingQuota } from '../../src/config/quotas';
import {
  VISITOR_BANK_TRANSFER_INFO,
  getVisitorBankTransferInstructions,
  generateVisitorPaymentReference,
  formatVisitorAmount,
} from '../../src/config/visitorBankTransferConfig';

// ─────────────────────────────────────────────────────────────────────────────

describe('Audit de cohérence — montants de paiement VIP', () => {
  describe('Single source of truth : aucun montant VIP codé en dur', () => {
    it('VISITOR_BANK_TRANSFER_INFO.vipPass ne contient plus de montant statique', () => {
      // Le montant vient de visitor_levels (config admin), pas d'une constante figée.
      expect(VISITOR_BANK_TRANSFER_INFO.vipPass).toBeDefined();
      expect(VISITOR_BANK_TRANSFER_INFO.vipPass).not.toHaveProperty('amount');
      expect(VISITOR_BANK_TRANSFER_INFO.vipPass.currency).toBe('EUR');
    });

    it('les coordonnées bancaires sont présentes', () => {
      expect(VISITOR_BANK_TRANSFER_INFO.bankName).toBeTruthy();
      expect(VISITOR_BANK_TRANSFER_INFO.accountHolder).toBeTruthy();
      expect(VISITOR_BANK_TRANSFER_INFO.iban).toBeTruthy();
      expect(VISITOR_BANK_TRANSFER_INFO.bic).toBeTruthy();
    });
  });

  describe('Instructions de virement — montant interpolé cohérent (fr/en/ar)', () => {
    it('le montant fourni apparaît dans les 3 langues, à l\'identique', () => {
      const amount = 700;
      const formatted = formatVisitorAmount(amount, 'EUR');

      for (const lang of ['fr', 'en', 'ar'] as const) {
        const inst = getVisitorBankTransferInstructions(amount, lang, 'EUR');
        expect(inst.steps[0]).toContain(formatted);
        expect(inst.important[1]).toContain(formatted);
      }
    });

    it('un montant différent est répercuté partout (pas de 300 codé en dur)', () => {
      const inst = getVisitorBankTransferInstructions(500, 'fr', 'EUR');
      expect(inst.steps[0]).toContain('500');
      expect(inst.steps[0]).not.toContain('300');
    });

    it('chaque langue a steps, important et additionalInfo', () => {
      for (const lang of ['fr', 'en', 'ar'] as const) {
        const inst = getVisitorBankTransferInstructions(700, lang, 'EUR');
        expect(Array.isArray(inst.steps)).toBe(true);
        expect(Array.isArray(inst.important)).toBe(true);
        expect(Array.isArray(inst.additionalInfo)).toBe(true);
        expect(inst.steps.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Quota visiteur VIP', () => {
    it('calculateRemainingQuota utilise bien la valeur technique', () => {
      const vipQuota = VISITOR_QUOTAS.vip;
      expect(calculateRemainingQuota('vip', 0)).toBe(vipQuota);
      expect(calculateRemainingQuota('vip', vipQuota)).toBe(0);
    });

    it('VISITOR_QUOTAS ne contient pas de valeurs négatives', () => {
      Object.values(VISITOR_QUOTAS).forEach((quota) => {
        expect(quota).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('PAYPAL_CLIENT_ID', () => {
    it('est une chaîne (vide si variable d\'env manquante en test)', () => {
      expect(typeof PAYPAL_CLIENT_ID).toBe('string');
      expect(PAYPAL_CLIENT_ID).not.toBeNull();
      expect(PAYPAL_CLIENT_ID).not.toBeUndefined();
    });
  });

  describe('generateVisitorPaymentReference — format et unicité', () => {
    it('génère une référence avec le préfixe VIP', () => {
      const ref = generateVisitorPaymentReference('user-123');
      expect(ref.startsWith('VIP-')).toBe(true);
    });

    it('inclut une partie de l\'userId', () => {
      const ref = generateVisitorPaymentReference('abcdefgh-1234');
      expect(ref).toContain('ABCDEFGH');
    });

    it('ne contient pas de caractères spéciaux problématiques', () => {
      const ref = generateVisitorPaymentReference('user-abc123');
      expect(ref).toMatch(/^[A-Z0-9-]+$/);
    });

    it('ne plante pas avec un UUID ou une chaîne vide', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(() => generateVisitorPaymentReference(uuid)).not.toThrow();
      expect(() => generateVisitorPaymentReference('')).not.toThrow();
    });
  });

  describe('formatVisitorAmount — formatage des montants', () => {
    it('format EUR par défaut', () => {
      const result = formatVisitorAmount(700);
      expect(result).toContain('700');
      expect(result).toContain('€');
    });

    it('format MAD', () => {
      const result = formatVisitorAmount(7000, 'MAD');
      expect(result).toContain('7');
      expect(result).toContain('DH');
    });

    it('format USD', () => {
      const result = formatVisitorAmount(500, 'USD');
      expect(result).toContain('500');
      expect(result).toContain('$');
    });

    it('gère les montants décimaux et 0', () => {
      expect(typeof formatVisitorAmount(700.5, 'EUR')).toBe('string');
      expect(formatVisitorAmount(0, 'EUR')).toContain('0');
    });
  });

  describe('VISITOR_LEVELS — structure', () => {
    it('vip a un label et une couleur hex', () => {
      const vip = VISITOR_LEVELS.vip;
      expect(vip.label).toBeTruthy();
      expect(vip.color).toMatch(/^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/);
    });

    it('free a un accès limité (liste)', () => {
      const free = VISITOR_LEVELS.free;
      expect(Array.isArray(free.access)).toBe(true);
    });
  });
});
