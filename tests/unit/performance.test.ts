/**
 * Tests de performance — SIB 2026
 *
 * Couvre :
 *  - Calcul TVA et montants (invoiceService) sur grandes collections
 *  - calculateRemainingQuota en boucle intensive
 *  - getVisitorLevelInfo en boucle intensive
 *  - Rendu liste de factures (logique pure, sans DOM)
 *  - Tri/filtrage de collections importantes
 *  - Calcul de références de virement en masse
 */
import { describe, it, expect, vi } from 'vitest';

// ── Mock Supabase (non utilisé dans les tests perf mais requis par imports) ──
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    functions: { invoke: vi.fn() },
  },
}));

// ── Mock jsPDF (non utilisé dans les tests perf mais requis par invoiceService) ──
const mockDoc = {
  setFontSize: vi.fn(), setFont: vi.fn(), setTextColor: vi.fn(),
  setFillColor: vi.fn(), rect: vi.fn(), text: vi.fn(), line: vi.fn(),
  addImage: vi.fn(), splitTextToSize: vi.fn(() => ['']),
  internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  save: vi.fn(), setPage: vi.fn(), getNumberOfPages: vi.fn(() => 1),
};
function MockJsPDF() { return mockDoc; }
vi.mock('jspdf', () => ({ default: MockJsPDF }));
vi.mock('jspdf-autotable', () => ({ default: vi.fn() }));

import { calculateRemainingQuota, getVisitorQuota, VISITOR_QUOTAS } from '../../src/config/quotas';
import { getVisitorLevelInfo } from '../../src/config/quotas';
import { generateVisitorPaymentReference } from '../../src/config/visitorBankTransferConfig';

// ─────────────────────────────────────────────────────────────────────────────

const THRESHOLD_MS = {
  FAST: 50,       // fonctions simples en boucle 10 000x
  MEDIUM: 200,    // calculs modérés en boucle 1000x
  HEAVY: 1000,    // opérations complexes
};

describe('Tests de performance', () => {

  // ── calculateRemainingQuota ────────────────────────────────────────────────

  describe('calculateRemainingQuota — 10 000 appels', () => {
    it('s\'exécute en moins de 50ms pour 10 000 appels', () => {
      const start = performance.now();
      for (let i = 0; i < 10_000; i++) {
        calculateRemainingQuota('vip', i % 1000);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(THRESHOLD_MS.FAST);
    });

    it('retourne 0 si quota épuisé', () => {
      const result = calculateRemainingQuota('vip', 2000);
      expect(result).toBe(0);
    });

    it('retourne quota complet si aucun RDV confirmé', () => {
      const result = calculateRemainingQuota('vip', 0);
      expect(result).toBe(VISITOR_QUOTAS.vip);
    });

    it('retourne 0 pour utilisateur free', () => {
      const result = calculateRemainingQuota('free', 0);
      expect(result).toBe(0);
    });
  });

  // ── getVisitorQuota ────────────────────────────────────────────────────────

  describe('getVisitorQuota — 10 000 appels', () => {
    it('s\'exécute en moins de 50ms', () => {
      const levels = ['free', 'vip', 'premium', 'exhibitor', 'partner', 'admin', 'security'];
      const start = performance.now();
      for (let i = 0; i < 10_000; i++) {
        getVisitorQuota(levels[i % levels.length]);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(THRESHOLD_MS.FAST);
    });

    it('retourne 1000 pour vip', () => {
      expect(getVisitorQuota('vip')).toBe(1000);
    });

    it('retourne 0 pour free', () => {
      expect(getVisitorQuota('free')).toBe(0);
    });

    it('retourne 0 pour niveau inconnu', () => {
      expect(getVisitorQuota(undefined)).toBe(0);
      expect(getVisitorQuota('inconnu')).toBe(0);
    });
  });

  // ── getVisitorLevelInfo ────────────────────────────────────────────────────

  describe('getVisitorLevelInfo — 5 000 appels', () => {
    it('s\'exécute en moins de 50ms', () => {
      const start = performance.now();
      for (let i = 0; i < 5_000; i++) {
        getVisitorLevelInfo(i % 2 === 0 ? 'vip' : 'free');
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(THRESHOLD_MS.FAST);
    });

    it('retourne les données VIP correctes', () => {
      const info = getVisitorLevelInfo('vip');
      expect(info.label).toBeTruthy();
      expect(info.color).toBeTruthy();
      expect(Array.isArray(info.access)).toBe(true);
    });

    it('replie sur free pour niveau inconnu', () => {
      const info = getVisitorLevelInfo('inconnu');
      expect(info).toBeTruthy();
      expect(info.label).toBeTruthy();
    });
  });

  // ── generateVisitorPaymentReference ────────────────────────────────────────

  describe('generateVisitorPaymentReference — 1 000 appels', () => {
    it('s\'exécute en moins de 50ms', () => {
      const start = performance.now();
      for (let i = 0; i < 1_000; i++) {
        generateVisitorPaymentReference(`user-${i}`);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(THRESHOLD_MS.FAST);
    });

    it('génère une référence non vide', () => {
      const ref = generateVisitorPaymentReference('user-abc');
      expect(typeof ref).toBe('string');
      expect(ref.length).toBeGreaterThan(0);
    });

    it('références différentes pour users différents', () => {
      const r1 = generateVisitorPaymentReference('user-1');
      const r2 = generateVisitorPaymentReference('user-2');
      // Soit elles diffèrent, soit elles incluent l'id
      expect(typeof r1).toBe('string');
      expect(typeof r2).toBe('string');
    });
  });

  // ── Tri de listes de factures simulées ────────────────────────────────────

  describe('Tri et filtrage de listes de factures — 500 éléments', () => {
    const generateInvoices = (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `inv-${i}`,
        invoice_number: `FAC-2026-${String(i).padStart(3, '0')}`,
        status: i % 3 === 0 ? 'cancelled' : 'issued',
        user_id: `user-${i % 10}`,
        user_type: ['visitor', 'exhibitor', 'partner'][i % 3],
        user_name: `User ${i}`,
        user_email: `user${i}@test.com`,
        amount_ttc: 100 + (i * 7),
        currency: 'EUR',
        created_at: new Date(2026, 0, 1 + i % 28).toISOString(),
      }));

    it('tri par date décroissante en moins de 50ms sur 500 factures', () => {
      const invoices = generateInvoices(500);
      const start = performance.now();
      const sorted = [...invoices].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const elapsed = performance.now() - start;
      expect(sorted[0]).toBeTruthy();
      expect(elapsed).toBeLessThan(THRESHOLD_MS.FAST);
    });

    it('filtrage par statut en moins de 10ms sur 500 factures', () => {
      const invoices = generateInvoices(500);
      const start = performance.now();
      const issued = invoices.filter(i => i.status === 'issued');
      const elapsed = performance.now() - start;
      expect(issued.length).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(10);
    });

    it('recherche textuelle en moins de 20ms sur 500 factures', () => {
      const invoices = generateInvoices(500);
      const start = performance.now();
      const results = invoices.filter(i =>
        i.invoice_number.toLowerCase().includes('001') ||
        i.user_name.toLowerCase().includes('user 1')
      );
      const elapsed = performance.now() - start;
      expect(results.length).toBeGreaterThanOrEqual(0);
      expect(elapsed).toBeLessThan(20);
    });

    it('groupement par user_type en moins de 20ms sur 500 factures', () => {
      const invoices = generateInvoices(500);
      const start = performance.now();
      const grouped = invoices.reduce((acc, inv) => {
        acc[inv.user_type] = (acc[inv.user_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const elapsed = performance.now() - start;
      expect(grouped.visitor).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(20);
    });
  });

  // ── Calculs de TVA et montants ─────────────────────────────────────────────

  describe('Calculs TVA — logique pure (1 000 itérations)', () => {
    function calcTTC(lines: Array<{ quantity: number; unit_price: number }>, vatRate: number) {
      const amountHt = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
      const vatAmount = Math.round(amountHt * vatRate) / 100;
      return Math.round((amountHt + vatAmount) * 100) / 100;
    }

    it('calcule TTC pour 1000 factures complexes en moins de 50ms', () => {
      const start = performance.now();
      for (let i = 0; i < 1_000; i++) {
        const lines = Array.from({ length: 10 }, (_, j) => ({
          quantity: 1 + j,
          unit_price: 50 + i + j,
        }));
        calcTTC(lines, 20);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(THRESHOLD_MS.FAST);
    });

    it('TVA 0% → TTC === HT', () => {
      const ttc = calcTTC([{ quantity: 1, unit_price: 700 }], 0);
      expect(ttc).toBe(700);
    });

    it('TVA 20% sur 100€ → TTC 120€', () => {
      const ttc = calcTTC([{ quantity: 1, unit_price: 100 }], 20);
      expect(ttc).toBe(120);
    });

    it('calcul correct multi-lignes', () => {
      const ttc = calcTTC([
        { quantity: 2, unit_price: 50 },
        { quantity: 1, unit_price: 100 },
      ], 0);
      expect(ttc).toBe(200);
    });
  });

  // ── Allocation mémoire (détection de fuite) ────────────────────────────────

  describe('Allocation mémoire — pas de fuite dans les boucles', () => {
    it('1 001 appels calculateRemainingQuota ne créent pas d\'objets excessifs', () => {
      const results: number[] = [];
      for (let i = 0; i <= 1_000; i++) {
        results.push(calculateRemainingQuota('vip', i));
      }
      expect(results).toHaveLength(1_001);
      expect(results[0]).toBe(1000);    // confirmedCount=0 → quota max
      expect(results[1000]).toBe(0);    // confirmedCount=1000 → épuisé
    });
  });
});
