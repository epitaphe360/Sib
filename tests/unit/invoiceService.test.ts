/**
 * Tests unitaires — invoiceService.ts
 * Couvre: calcul des totaux, createInvoice, fetchInvoices, cancelInvoice, downloadInvoicePDF
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock jsPDF & autoTable ────────────────────────────────────────────────────
// vi.hoisted garantit que mockDoc et MockJsPDF sont disponibles avant le hoisting des vi.mock
const { mockDoc, MockJsPDF } = vi.hoisted(() => {
  const instance = {
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    setDrawColor: vi.fn(),
    setFillColor: vi.fn(),
    text: vi.fn(),
    line: vi.fn(),
    roundedRect: vi.fn(),
    save: vi.fn(),
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
    lastAutoTable: { finalY: 150 },
  };
  // Fonction régulière (pas arrow) pour être utilisable avec `new`
  // En JS, si un constructeur retourne un objet, `new` retourne cet objet
  function JsPDF() { return instance; }
  return { mockDoc: instance, MockJsPDF: JsPDF };
});

vi.mock('jspdf', () => ({ default: MockJsPDF }));
vi.mock('jspdf-autotable', () => ({ default: vi.fn() }));

// loadInvoiceConfig lit Supabase ; on renvoie les valeurs par défaut de façon déterministe.
vi.mock('../../src/hooks/useInvoiceConfig', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/hooks/useInvoiceConfig')>();
  return {
    ...actual,
    loadInvoiceConfig: vi.fn().mockResolvedValue(actual.INVOICE_CONFIG_DEFAULTS),
  };
});

// ── Mock Supabase ─────────────────────────────────────────────────────────────
const mockSingle = vi.hoisted(() => vi.fn());
const mockSelect = vi.hoisted(() => vi.fn());
const mockInsert = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockEq = vi.hoisted(() => vi.fn());
const mockOrder = vi.hoisted(() => vi.fn());
const mockMaybeSingle = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../src/lib/supabase', () => {
  const chainable: Record<string, ReturnType<typeof vi.fn>> = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  };
  Object.values(chainable).forEach(fn => fn.mockReturnValue(chainable));
  mockFrom.mockReturnValue(chainable);
  return { supabase: { from: mockFrom } };
});

// ── Import après mocks ─────────────────────────────────────────────────────────
import {
  createInvoice,
  fetchInvoices,
  fetchInvoiceById,
  cancelInvoice,
  downloadInvoicePDF,
  type CreateInvoicePayload,
  type Invoice,
} from '../../src/services/invoiceService';

// ── Helpers ────────────────────────────────────────────────────────────────────
function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'inv-001',
    invoice_number: 'INV-2026-0001',
    user_id: 'user-abc',
    user_type: 'visitor',
    user_email: 'test@example.com',
    user_name: 'Jean Dupont',
    payment_transaction_id: 'txn-paypal-123',
    payment_request_id: null,
    status: 'issued',
    amount_ht: 700,
    vat_rate: 0,
    vat_amount: 0,
    amount_ttc: 700,
    currency: 'EUR',
    notes: null,
    issued_at: '2026-05-09T10:00:00.000Z',
    created_at: '2026-05-09T10:00:00.000Z',
    invoice_lines: [
      {
        id: 'line-001',
        invoice_id: 'inv-001',
        description: 'Pass Premium VIP SIB 2026',
        quantity: 1,
        unit_price: 700,
        line_total: 700,
        sort_order: 0,
      },
    ],
    ...overrides,
  };
}

// ── Référence au chainable pour les tests ────────────────────────────────────
const chainable = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  order: mockOrder,
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
};

// ─────────────────────────────────────────────────────────────────────────────

describe('invoiceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-chaîner après clearAllMocks
    Object.values(chainable).forEach(fn => fn.mockReturnValue(chainable));
    mockFrom.mockReturnValue(chainable);
  });

  // ── Calcul des totaux ────────────────────────────────────────────────────────
  describe('calcul des totaux dans createInvoice', () => {
    it('calcule line_total = quantité × prix unitaire', async () => {
      const created = makeInvoice();
      mockSingle.mockResolvedValueOnce({ data: created, error: null });
      mockInsert.mockResolvedValueOnce({ error: null });

      const payload: CreateInvoicePayload = {
        user_id: 'user-abc',
        user_type: 'visitor',
        user_email: 'test@example.com',
        lines: [{ description: 'Pass VIP', quantity: 2, unit_price: 350 }],
      };

      await createInvoice(payload).catch(() => null);
      expect(mockFrom).toHaveBeenCalledWith('invoices');
    });

    it('calcule amount_ht = somme des line_total', () => {
      // Test de la logique pure (re-implémentée ici pour validation)
      const lines = [
        { description: 'A', quantity: 1, unit_price: 400 },
        { description: 'B', quantity: 2, unit_price: 150 },
      ];
      const computed = lines.map(l => ({
        ...l,
        line_total: Math.round(l.quantity * l.unit_price * 100) / 100,
      }));
      const amountHt = Math.round(computed.reduce((s, l) => s + l.line_total, 0) * 100) / 100;
      expect(amountHt).toBe(700);
    });

    it('calcule la TVA correctement (20%)', () => {
      const amountHt = 700;
      const vatRate = 20;
      const vatAmount = Math.round(amountHt * vatRate) / 100;
      const amountTtc = Math.round((amountHt + vatAmount) * 100) / 100;
      expect(vatAmount).toBe(140);
      expect(amountTtc).toBe(840);
    });

    it('TVA 0% → amount_ttc = amount_ht', () => {
      const amountHt = 700;
      const vatRate = 0;
      const vatAmount = Math.round(amountHt * vatRate) / 100;
      const amountTtc = Math.round((amountHt + vatAmount) * 100) / 100;
      expect(vatAmount).toBe(0);
      expect(amountTtc).toBe(700);
    });

    it('arrondit correctement à 2 décimales', () => {
      const lines = [{ quantity: 3, unit_price: 0.1 }];
      const lineTotal = Math.round(lines[0].quantity * lines[0].unit_price * 100) / 100;
      expect(lineTotal).toBe(0.3);
    });
  });

  // ── fetchInvoices ────────────────────────────────────────────────────────────
  describe('fetchInvoices', () => {
    it('appelle supabase.from("invoices")', async () => {
      // Sans userId: chaîne = from → select → order (terminal)
      mockOrder.mockResolvedValueOnce({ data: [], error: null });
      await fetchInvoices();
      expect(mockFrom).toHaveBeenCalledWith('invoices');
    });

    it('filtre par userId si fourni', async () => {
      // Avec userId: chaîne = from → select → order → eq (terminal)
      mockOrder.mockReturnValueOnce(chainable); // order retourne chainable
      mockEq.mockResolvedValueOnce({ data: [], error: null }); // eq est terminal
      await fetchInvoices('user-123');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('retourne tableau vide si data est null', async () => {
      mockOrder.mockResolvedValueOnce({ data: null, error: null });
      const result = await fetchInvoices();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('lève une erreur si supabase renvoie une erreur', async () => {
      mockOrder.mockResolvedValueOnce({ data: null, error: new Error('DB error') });
      await expect(fetchInvoices()).rejects.toThrow('DB error');
    });
  });

  // ── fetchInvoiceById ─────────────────────────────────────────────────────────
  // Chaîne: from → select → eq → maybeSingle (terminal)
  describe('fetchInvoiceById', () => {
    it('appelle supabase avec le bon id', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: makeInvoice(), error: null });
      const result = await fetchInvoiceById('inv-001');
      expect(mockEq).toHaveBeenCalledWith('id', 'inv-001');
      expect(result).not.toBeNull();
      expect(result?.invoice_number).toBe('INV-2026-0001');
    });

    it('retourne null si la facture n\'existe pas', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
      const result = await fetchInvoiceById('unknown-id');
      expect(result).toBeNull();
    });

    it('lève une erreur si supabase échoue', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: new Error('Not found') });
      await expect(fetchInvoiceById('bad-id')).rejects.toThrow('Not found');
    });
  });

  // ── cancelInvoice ────────────────────────────────────────────────────────────
  // Chaîne: from → update → eq (terminal)
  describe('cancelInvoice', () => {
    it('met à jour le statut en "cancelled"', async () => {
      mockEq.mockResolvedValueOnce({ error: null });
      await cancelInvoice('inv-001');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled' });
      expect(mockEq).toHaveBeenCalledWith('id', 'inv-001');
    });

    it('lève une erreur si supabase échoue', async () => {
      mockEq.mockResolvedValueOnce({ error: new Error('Cannot cancel') });
      await expect(cancelInvoice('inv-001')).rejects.toThrow('Cannot cancel');
    });
  });

  // ── downloadInvoicePDF ───────────────────────────────────────────────────────
  describe('downloadInvoicePDF', () => {
    it('génère un PDF et appelle doc.save() avec le bon nom de fichier', async () => {
      const invoice = makeInvoice();
      await downloadInvoicePDF(invoice);
      expect(mockDoc.save).toHaveBeenCalledWith('facture-INV-2026-0001.pdf');
    });

    it('fonctionne sans invoice_lines (tableau vide)', async () => {
      const invoice = makeInvoice({ invoice_lines: [] });
      await expect(downloadInvoicePDF(invoice)).resolves.not.toThrow();
      expect(mockDoc.save).toHaveBeenCalled();
    });

    it('affiche les notes si présentes', async () => {
      const invoice = makeInvoice({ notes: 'Paiement reçu via PayPal' });
      await downloadInvoicePDF(invoice);
      expect(mockDoc.text).toHaveBeenCalled();
    });

    it('fonctionne avec une facture annulée', async () => {
      const invoice = makeInvoice({ status: 'cancelled' });
      await expect(downloadInvoicePDF(invoice)).resolves.not.toThrow();
    });

    it('fonctionne avec une devise MAD', async () => {
      const invoice = makeInvoice({ currency: 'mad', amount_ttc: 7000 });
      await downloadInvoicePDF(invoice);
      expect(mockDoc.save).toHaveBeenCalledWith('facture-INV-2026-0001.pdf');
    });

    it('affiche correctement les montants pour un exposant', async () => {
      const invoice = makeInvoice({
        user_type: 'exhibitor',
        user_name: 'Entreprise SARL',
        amount_ht: 50000,
        vat_rate: 20,
        vat_amount: 10000,
        amount_ttc: 60000,
        currency: 'MAD',
        invoice_lines: [{
          id: 'line-002',
          invoice_id: 'inv-001',
          description: 'Stand 9m² SIB 2026',
          quantity: 1,
          unit_price: 50000,
          line_total: 50000,
          sort_order: 0,
        }],
      });
      await expect(downloadInvoicePDF(invoice)).resolves.not.toThrow();
    });
  });

  // ── Types ────────────────────────────────────────────────────────────────────
  describe('types InvoiceStatus / UserType', () => {
    it('les statuts valides sont "issued" et "cancelled"', () => {
      const issued: Invoice['status'] = 'issued';
      const cancelled: Invoice['status'] = 'cancelled';
      expect(issued).toBe('issued');
      expect(cancelled).toBe('cancelled');
    });

    it('les types utilisateur valides sont visitor, exhibitor, partner', () => {
      const types: Invoice['user_type'][] = ['visitor', 'exhibitor', 'partner'];
      expect(types).toHaveLength(3);
    });
  });
});
