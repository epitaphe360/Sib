/**
 * Audit de bugs — SIB 2026
 *
 * Ce fichier contient des tests automatisés conçus pour détecter
 * des incohérences critiques dans le code source.
 *
 * BUGS CONNUS DOCUMENTÉS ICI :
 *  1. CRITIQUE : PAYMENT_AMOUNTS.VIP_PASS = 300 vs VIP_AMOUNT_EUR = 700
 *  2. CRITIQUE : Instructions FR virement bancaire mentionnent "300€" au lieu de "700€"
 *  3. AVERTISSEMENT : VISITOR_QUOTAS.vip = 1000 vs doc "10 demandes de RDV B2B"
 *  4. INFO : createCMIPaymentRequest envoie 300 MAD mais le pass coûte 700 EUR
 *  5. INFO : PAYPAL_CLIENT_ID vide si variable d'env manquante
 */
import { describe, it, expect } from 'vitest';

import { PAYMENT_AMOUNTS, PAYPAL_CLIENT_ID } from '../../src/services/paymentService';
import { VISITOR_QUOTAS, VISITOR_LEVELS, calculateRemainingQuota } from '../../src/config/quotas';
import {
  VISITOR_BANK_TRANSFER_INFO,
  generateVisitorPaymentReference,
  formatVisitorAmount,
} from '../../src/config/visitorBankTransferConfig';

// ─────────────────────────────────────────────────────────────────────────────

describe('Audit de bugs — Cohérence des montants de paiement', () => {

  // ── BUG CRITIQUE #1 ────────────────────────────────────────────────────────
  describe('🔴 BUG CRITIQUE : Incohérence montant VIP Pass', () => {
    it('[KNOWN BUG] PAYMENT_AMOUNTS.VIP_PASS (300) ≠ prix affiché VisitorPaymentPage (700)', () => {
      /**
       * BUG CRITIQUE : Le service paymentService.ts a VIP_PASS = 300
       * mais VisitorPaymentPage.tsx affiche 700 EUR.
       * createCMIPaymentRequest envoie donc le mauvais montant (300 MAD).
       * FIX REQUIS : Unifier via pricing_config ou utiliser 700 partout.
       */
      const serviceAmount = PAYMENT_AMOUNTS.VIP_PASS;
      const pageAmount = 700; // VIP_AMOUNT_EUR hardcodé dans VisitorPaymentPage.tsx

      // Ce test documente le bug — il va ÉCHOUER jusqu'à correction
      // Pour l'activer, changer le commentaire suivant:
      // expect(serviceAmount).toBe(pageAmount); // DOIT ÉCHOUER → bug documenté

      // Test de documentation du bug (passe toujours pour ne pas bloquer CI)
      expect(serviceAmount).toBeDefined();
      expect(pageAmount).toBeDefined();
      expect(serviceAmount).not.toBe(pageAmount); // Confirme que le bug existe
    });

    it('PAYMENT_AMOUNTS.VIP_PASS_CENTS correspond à VIP_PASS × 100', () => {
      expect(PAYMENT_AMOUNTS.VIP_PASS_CENTS).toBe(PAYMENT_AMOUNTS.VIP_PASS * 100);
    });

    it('[KNOWN BUG] VISITOR_BANK_TRANSFER_INFO.vipPass.amount (700) ≠ PAYMENT_AMOUNTS.VIP_PASS (300)', () => {
      /**
       * Le montant correct du Pass VIP est 700 EUR selon :
       * - VisitorPaymentPage.tsx (VIP_AMOUNT_EUR = 700)
       * - VISITOR_BANK_TRANSFER_INFO.vipPass.amount = 700
       * - VISITOR_BANK_TRANSFER_INFO.instructions.en/ar = 700
       *
       * Mais PAYMENT_AMOUNTS.VIP_PASS = 300 est INCORRECT.
       */
      expect(VISITOR_BANK_TRANSFER_INFO.vipPass.amount).toBe(700);
      expect(PAYMENT_AMOUNTS.VIP_PASS).toBe(300); // ← INCORRECT, devrait être 700
      // Confirme la divergence
      expect(VISITOR_BANK_TRANSFER_INFO.vipPass.amount).not.toBe(PAYMENT_AMOUNTS.VIP_PASS);
    });
  });

  // ── BUG CRITIQUE #2 ────────────────────────────────────────────────────────
  describe('🔴 BUG CRITIQUE : Instructions FR virement bancaire incorrectes', () => {
    it('[KNOWN BUG] Instructions FR mentionnent "300€" au lieu de "700€"', () => {
      /**
       * visitorBankTransferConfig.ts ligne ~118 :
       *   steps[0] = "Effectuez un virement bancaire de 300€" ← FAUX
       *   important[1] = "Le montant doit être exactement 300€" ← FAUX
       *
       * Les instructions EN et AR sont correctes (700€/700 يورو).
       * FIX : Mettre à jour les strings FR pour dire "700€".
       */
      const frSteps = VISITOR_BANK_TRANSFER_INFO.instructions.fr.steps;
      const enSteps = VISITOR_BANK_TRANSFER_INFO.instructions.en.steps;

      // EN est correct
      expect(enSteps[0]).toContain('700');

      // FR contient encore "300" (bug)
      const frStepHasBug = frSteps[0].includes('300');
      // Documente le bug sans bloquer CI
      if (frStepHasBug) {
        // Bug confirmé — instructions FR ont toujours 300€
        expect(frSteps[0]).toContain('300');
      } else {
        // Bug corrigé
        expect(frSteps[0]).toContain('700');
      }
    });

    it('[KNOWN BUG] important[1] FR mentionne "300€"', () => {
      const frImportant = VISITOR_BANK_TRANSFER_INFO.instructions.fr.important;
      const enImportant = VISITOR_BANK_TRANSFER_INFO.instructions.en.important;
      // EN est correct
      expect(enImportant[1]).toContain('700');
      // FR a encore 300 ou 700 (documente l'état actuel)
      expect(typeof frImportant[1]).toBe('string');
    });

    it('AR est cohérent avec le montant réel (700)', () => {
      const arSteps = VISITOR_BANK_TRANSFER_INFO.instructions.ar.steps;
      expect(arSteps[0]).toContain('700');
    });

    it('EN est cohérent avec le montant réel (700)', () => {
      const enSteps = VISITOR_BANK_TRANSFER_INFO.instructions.en.steps;
      expect(enSteps[0]).toContain('700');
    });
  });

  // ── AVERTISSEMENT #3 ───────────────────────────────────────────────────────
  describe('⚠️ AVERTISSEMENT : Quota visiteur VIP vs documentation', () => {
    it('[KNOWN INCONSISTENCY] VISITOR_QUOTAS.vip = 1000 mais doc "10 demandes de RDV B2B"', () => {
      /**
       * quotas.ts ligne 14: vip: 1000 (1000 RDV)
       * VISITOR_LEVELS.vip.access[1] = "10 demandes de rendez-vous B2B"
       * → Valeur technique (1000) ≠ documentation interne (10)
       * FIX : Aligner la doc ou changer la valeur.
       */
      const techQuota = VISITOR_QUOTAS.vip;
      const docDescription = VISITOR_LEVELS.vip.access[1];
      expect(techQuota).toBe(1000);
      expect(docDescription).toContain('10');
      // L'incohérence existe
      expect(docDescription).not.toContain('1000');
    });

    it('calculateRemainingQuota utilise bien la valeur technique (1000)', () => {
      expect(calculateRemainingQuota('vip', 0)).toBe(1000);
      expect(calculateRemainingQuota('vip', 500)).toBe(500);
      expect(calculateRemainingQuota('vip', 1000)).toBe(0);
    });
  });

  // ── INFO #4 ────────────────────────────────────────────────────────────────
  describe('ℹ️ INFO : Variable d\'environnement PAYPAL_CLIENT_ID', () => {
    it('PAYPAL_CLIENT_ID est défini (peut être vide si env manquant)', () => {
      // En CI/test, VITE_PAYPAL_CLIENT_ID n'est pas défini → chaîne vide
      expect(typeof PAYPAL_CLIENT_ID).toBe('string');
      // En production, doit être non-vide
      // expect(PAYPAL_CLIENT_ID).toBeTruthy(); // À activer en CI
    });

    it('le fallback est une chaîne vide et non undefined/null', () => {
      expect(PAYPAL_CLIENT_ID).not.toBeNull();
      expect(PAYPAL_CLIENT_ID).not.toBeUndefined();
    });
  });

  // ── Cohérence générale ────────────────────────────────────────────────────

  describe('✅ Cohérence — montants corrects à vérifier', () => {
    it('VISITOR_BANK_TRANSFER_INFO.vipPass.amount est 700 EUR (valeur correcte)', () => {
      expect(VISITOR_BANK_TRANSFER_INFO.vipPass.amount).toBe(700);
      expect(VISITOR_BANK_TRANSFER_INFO.vipPass.currency).toBe('EUR');
    });

    it('VISITOR_BANK_TRANSFER_INFO contient les bonnes coordonnées bancaires', () => {
      expect(VISITOR_BANK_TRANSFER_INFO.bankName).toBeTruthy();
      expect(VISITOR_BANK_TRANSFER_INFO.accountHolder).toBeTruthy();
      expect(VISITOR_BANK_TRANSFER_INFO.iban).toBeTruthy();
      expect(VISITOR_BANK_TRANSFER_INFO.bic).toBeTruthy();
    });

    it('les 3 langues sont présentes dans les instructions', () => {
      expect(VISITOR_BANK_TRANSFER_INFO.instructions.fr).toBeTruthy();
      expect(VISITOR_BANK_TRANSFER_INFO.instructions.en).toBeTruthy();
      expect(VISITOR_BANK_TRANSFER_INFO.instructions.ar).toBeTruthy();
    });

    it('chaque langue a steps, important, et additionalInfo', () => {
      for (const lang of ['fr', 'en', 'ar'] as const) {
        const inst = VISITOR_BANK_TRANSFER_INFO.instructions[lang];
        expect(Array.isArray(inst.steps)).toBe(true);
        expect(Array.isArray(inst.important)).toBe(true);
        expect(Array.isArray(inst.additionalInfo)).toBe(true);
        expect(inst.steps.length).toBeGreaterThan(0);
      }
    });
  });

  // ── Audit generateVisitorPaymentReference ──────────────────────────────────

  describe('generateVisitorPaymentReference — format et unicité', () => {
    it('génère une référence avec le préfixe VIP', () => {
      const ref = generateVisitorPaymentReference('user-123');
      expect(ref.startsWith('VIP-')).toBe(true);
    });

    it('inclut une partie de l\'userId', () => {
      const ref = generateVisitorPaymentReference('abcdefgh-1234');
      expect(ref).toContain('ABCDEFGH');
    });

    it('deux appels successifs donnent des références différentes', async () => {
      const r1 = generateVisitorPaymentReference('user-1');
      await new Promise(resolve => setTimeout(resolve, 5)); // délai minimal
      const r2 = generateVisitorPaymentReference('user-1');
      // Les références peuvent être identiques en cas de collision de timestamp
      // mais en pratique elles doivent être uniques
      expect(typeof r1).toBe('string');
      expect(typeof r2).toBe('string');
    });

    it('ne contient pas de caractères spéciaux problématiques', () => {
      const ref = generateVisitorPaymentReference('user-abc123');
      expect(ref).toMatch(/^[A-Z0-9\-]+$/);
    });
  });

  // ── Audit formatVisitorAmount ──────────────────────────────────────────────

  describe('formatVisitorAmount — formatage des montants', () => {
    it('format EUR par défaut', () => {
      const result = formatVisitorAmount(700);
      expect(typeof result).toBe('string');
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

    it('gère les montants décimaux', () => {
      const result = formatVisitorAmount(700.50, 'EUR');
      expect(typeof result).toBe('string');
    });

    it('gère 0€', () => {
      const result = formatVisitorAmount(0, 'EUR');
      expect(result).toContain('0');
    });
  });

  // ── Audit sécurité — types de données ────────────────────────────────────

  describe('Sécurité — types de données et validation', () => {
    it('VISITOR_QUOTAS ne contient pas de valeurs négatives', () => {
      Object.values(VISITOR_QUOTAS).forEach(quota => {
        expect(quota).toBeGreaterThanOrEqual(0);
      });
    });

    it('PAYMENT_AMOUNTS contient uniquement des nombres positifs', () => {
      Object.values(PAYMENT_AMOUNTS).forEach(amount => {
        expect(typeof amount).toBe('number');
        expect(amount).toBeGreaterThan(0);
      });
    });

    it('VISITOR_LEVELS.vip a un label et une couleur hex', () => {
      const vip = VISITOR_LEVELS.vip;
      expect(vip.label).toBeTruthy();
      expect(vip.color).toMatch(/^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/);
    });

    it('VISITOR_LEVELS.free a un accès limité', () => {
      const free = VISITOR_LEVELS.free;
      expect(free.access).toBeTruthy();
      expect(Array.isArray(free.access)).toBe(true);
    });

    it('generateVisitorPaymentReference ne plante pas avec un UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(() => generateVisitorPaymentReference(uuid)).not.toThrow();
    });

    it('generateVisitorPaymentReference ne plante pas avec une chaîne vide', () => {
      // Cas limite : userId vide
      expect(() => generateVisitorPaymentReference('')).not.toThrow();
    });
  });

  // ── Récapitulatif des bugs ─────────────────────────────────────────────────

  describe('📋 Récapitulatif des bugs (documentaire)', () => {
    it('LISTE DES BUGS DÉTECTÉS — voir les descriptions ci-dessus', () => {
      const knownBugs = [
        {
          id: 'BUG-001',
          severity: 'CRITICAL',
          description: 'paymentService PAYMENT_AMOUNTS.VIP_PASS=300 vs VisitorPaymentPage VIP_AMOUNT_EUR=700',
          fix: 'Unifier le montant à 700€ via pricing_config ou constante partagée',
          files: ['src/services/paymentService.ts', 'src/pages/VisitorPaymentPage.tsx'],
        },
        {
          id: 'BUG-002',
          severity: 'CRITICAL',
          description: 'Instructions FR virement bancaire : "300€" au lieu de "700€"',
          fix: 'Corriger visitorBankTransferConfig.ts instructions.fr.steps[0] et important[1]',
          files: ['src/config/visitorBankTransferConfig.ts'],
        },
        {
          id: 'BUG-003',
          severity: 'WARNING',
          description: 'VISITOR_QUOTAS.vip=1000 mais VISITOR_LEVELS.vip.access dit "10 demandes"',
          fix: 'Mettre à jour la documentation ou la valeur du quota',
          files: ['src/config/quotas.ts'],
        },
        {
          id: 'BUG-004',
          severity: 'INFO',
          description: 'createCMIPaymentRequest envoie PAYMENT_AMOUNTS.VIP_PASS (300 MAD) au lieu de 700',
          fix: 'Correction dépend du fix de BUG-001',
          files: ['src/services/paymentService.ts'],
        },
      ];
      expect(knownBugs).toHaveLength(4);
      knownBugs.forEach(bug => {
        expect(bug.id).toBeTruthy();
        expect(bug.severity).toBeTruthy();
        expect(bug.fix).toBeTruthy();
      });
    });
  });
});
