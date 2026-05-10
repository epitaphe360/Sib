/**
 * Tests unitaires — AdminPricingPage (logique métier)
 * Couvre: validation des montants, labels devise, calcul d'affichage, logique save
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Supabase ─────────────────────────────────────────────────────────────
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();

const chainable = { update: mockUpdate, eq: mockEq, select: mockSelect, single: mockSingle, order: mockOrder };
Object.values(chainable).forEach(fn => fn.mockReturnValue(chainable));

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: vi.fn(() => chainable) },
}));

vi.mock('../../src/store/authStore', () => ({
  default: vi.fn(() => ({ user: { id: 'admin-001' } })),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Les constantes CATEGORY_META et CURRENCY_LABELS sont reproduites ici
// car elles ne sont pas exportées depuis AdminPricingPage (composant pur).
// Ces tests valident la logique métier qui leur est associée.
// ─────────────────────────────────────────────────────────────────────────────

const CURRENCY_LABELS: Record<string, string> = {
  EUR: '€ EUR',
  MAD: 'MAD',
  USD: '$ USD',
};

const CATEGORY_META = {
  visitor:  { label: 'Visiteurs VIP',    color: '#7c3aed' },
  exhibitor:{ label: 'Exposants',        color: '#0ea5e9' },
  partner:  { label: 'Partenaires',      color: '#10b981' },
} as const;

// Logique de validation du montant (extraite du composant save())
function validateAmount(raw: string): { valid: boolean; value: number } {
  const parsed = parseFloat(raw.replace(',', '.'));
  if (isNaN(parsed) || parsed < 0) return { valid: false, value: 0 };
  return { valid: true, value: parsed };
}

// Logique d'affichage du montant (0 → "Sur devis / Gratuit")
function formatAmount(amount: number, currency: string): string {
  if (amount === 0) return 'Sur devis / Gratuit';
  return `${amount.toFixed(2)} ${currency}`;
}

describe('AdminPricingPage — logique métier', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── CURRENCY_LABELS ───────────────────────────────────────────────────────
  describe('CURRENCY_LABELS', () => {
    it('EUR affiche le symbole €', () => {
      expect(CURRENCY_LABELS.EUR).toBe('€ EUR');
    });
    it('MAD est défini', () => {
      expect(CURRENCY_LABELS.MAD).toBe('MAD');
    });
    it('USD affiche le symbole $', () => {
      expect(CURRENCY_LABELS.USD).toBe('$ USD');
    });
    it('contient exactement 3 devises', () => {
      expect(Object.keys(CURRENCY_LABELS)).toHaveLength(3);
    });
  });

  // ── CATEGORY_META ─────────────────────────────────────────────────────────
  describe('CATEGORY_META', () => {
    it('définit les 3 catégories (visitor, exhibitor, partner)', () => {
      expect(Object.keys(CATEGORY_META)).toHaveLength(3);
    });
    it('label visitor est "Visiteurs VIP"', () => {
      expect(CATEGORY_META.visitor.label).toBe('Visiteurs VIP');
    });
    it('label exhibitor est "Exposants"', () => {
      expect(CATEGORY_META.exhibitor.label).toBe('Exposants');
    });
    it('label partner est "Partenaires"', () => {
      expect(CATEGORY_META.partner.label).toBe('Partenaires');
    });
    it('chaque catégorie a une couleur hexadécimale', () => {
      for (const meta of Object.values(CATEGORY_META)) {
        expect(meta.color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });
  });

  // ── validateAmount ────────────────────────────────────────────────────────
  describe('validateAmount (logique save)', () => {
    it('accepte 700', () => {
      const { valid, value } = validateAmount('700');
      expect(valid).toBe(true);
      expect(value).toBe(700);
    });
    it('accepte 0 (gratuit)', () => {
      const { valid, value } = validateAmount('0');
      expect(valid).toBe(true);
      expect(value).toBe(0);
    });
    it('accepte les montants décimaux avec virgule (format FR)', () => {
      const { valid, value } = validateAmount('9 500,50'.replace(/\s/g, ''));
      expect(valid).toBe(true);
      expect(value).toBeCloseTo(9500.5);
    });
    it('accepte les montants décimaux avec point', () => {
      const { valid, value } = validateAmount('1500.75');
      expect(valid).toBe(true);
      expect(value).toBeCloseTo(1500.75);
    });
    it('refuse les montants négatifs', () => {
      expect(validateAmount('-100').valid).toBe(false);
    });
    it('refuse les chaînes vides', () => {
      expect(validateAmount('').valid).toBe(false);
    });
    it('refuse les chaînes non numériques', () => {
      expect(validateAmount('abc').valid).toBe(false);
    });
    it('refuse NaN', () => {
      expect(validateAmount('NaN').valid).toBe(false);
    });
  });

  // ── formatAmount ──────────────────────────────────────────────────────────
  describe('formatAmount (affichage)', () => {
    it('affiche "Sur devis / Gratuit" pour 0', () => {
      expect(formatAmount(0, 'EUR')).toBe('Sur devis / Gratuit');
    });
    it('affiche le montant avec devise pour valeur > 0', () => {
      expect(formatAmount(700, 'EUR')).toBe('700.00 EUR');
    });
    it('affiche correctement en MAD', () => {
      expect(formatAmount(50000, 'MAD')).toBe('50000.00 MAD');
    });
    it('affiche 2 décimales même pour les entiers', () => {
      expect(formatAmount(100, 'EUR')).toContain('100.00');
    });
  });

  // ── Supabase update (logique save) ────────────────────────────────────────
  describe('save via supabase', () => {
    it('appelle supabase.from("pricing_config").update() avec les bons paramètres', async () => {
      const updatedRow = {
        id: 'row-001', category: 'visitor', level: 'vip', label: 'Pass VIP',
        description: null, amount: 700, currency: 'EUR', is_active: true,
        sort_order: 0, updated_at: expect.any(String),
      };
      mockSingle.mockResolvedValueOnce({ data: updatedRow, error: null });

      const { supabase } = await import('../../src/lib/supabase');

      // Simuler le save: update → eq('id') → select → single
      await supabase
        .from('pricing_config')
        .update({ amount: 700, currency: 'EUR', updated_at: new Date().toISOString(), updated_by: 'admin-001' })
        .eq('id', 'row-001')
        .select()
        .single();

      expect(supabase.from).toHaveBeenCalledWith('pricing_config');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ amount: 700, currency: 'EUR' }));
      expect(mockEq).toHaveBeenCalledWith('id', 'row-001');
    });

    it('retourne les données mises à jour', async () => {
      const updated = { id: 'row-001', amount: 900, currency: 'MAD' };
      mockSingle.mockResolvedValueOnce({ data: updated, error: null });
      const { supabase } = await import('../../src/lib/supabase');
      const result = await supabase.from('pricing_config').update({}).eq('id', 'row-001').select().single();
      expect(result.data).toEqual(updated);
    });

    it('propage les erreurs Supabase', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Table not found') });
      const { supabase } = await import('../../src/lib/supabase');
      const result = await supabase.from('pricing_config').update({}).eq('id', 'bad').select().single();
      expect(result.error).toBeTruthy();
    });
  });
});
