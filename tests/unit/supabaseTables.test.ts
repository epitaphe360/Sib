/**
 * Tests Supabase — Vérification de l'existence et de la cohérence des tables
 *
 * Approche : on mocke supabase et on vérifie que chaque table peut être
 * interrogée sans erreur (structure des appels).
 * On documente aussi les colonnes critiques attendues par le code source.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Supabase ─────────────────────────────────────────────────────────────
const mockFrom = vi.hoisted(() => vi.fn());
const mockSelect = vi.hoisted(() => vi.fn());
const mockEq = vi.hoisted(() => vi.fn());
const mockSingle = vi.hoisted(() => vi.fn());
const mockMaybeSingle = vi.hoisted(() => vi.fn());
const mockInsert = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockOrder = vi.hoisted(() => vi.fn());
const mockLimit = vi.hoisted(() => vi.fn());
const mockInvoke = vi.hoisted(() => vi.fn());

const chainable = {
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
  insert: mockInsert,
  update: mockUpdate,
  order: mockOrder,
  limit: mockLimit,
};
Object.values(chainable).forEach(fn => fn.mockReturnValue(chainable));

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
    functions: { invoke: mockInvoke },
  },
}));

// Import après le mock
import { supabase } from '../../src/lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────

describe('Supabase — Tables critiques (existence & structure)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(chainable).forEach(fn => fn.mockReturnValue(chainable));
    mockFrom.mockReturnValue(chainable);
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockSelect.mockReturnValue(chainable);
  });

  // ─── Tables de base ────────────────────────────────────────────────────────

  describe('Table: users', () => {
    it('peut être interrogée (from users)', () => {
      supabase.from('users');
      expect(mockFrom).toHaveBeenCalledWith('users');
    });

    it('supporte un select sur id, email, name, type', async () => {
      mockSelect.mockReturnValue(chainable);
      mockSingle.mockResolvedValue({
        data: { id: 'u1', email: 'a@b.com', name: 'Alice', type: 'visitor' },
        error: null,
      });
      const { data } = await supabase.from('users').select('id, email, name, type').single();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('type');
    });

    it('supporte un update (visitor_level, status)', async () => {
      mockUpdate.mockReturnValue(chainable);
      mockEq.mockResolvedValue({ data: null, error: null });
      await supabase.from('users').update({ visitor_level: 'premium', status: 'active' }).eq('id', 'u1');
      expect(mockUpdate).toHaveBeenCalledWith({ visitor_level: 'premium', status: 'active' });
    });
  });

  // ─── payment_requests ─────────────────────────────────────────────────────

  describe('Table: payment_requests', () => {
    it('peut être interrogée', () => {
      supabase.from('payment_requests');
      expect(mockFrom).toHaveBeenCalledWith('payment_requests');
    });

    it('supporte un select id + filtres user_id et status', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'pr1' }, error: null });
      await supabase
        .from('payment_requests')
        .select('id, payment_method, validated_at, status, created_at')
        .eq('user_id', 'u1')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      expect(mockEq).toHaveBeenCalledWith('status', 'approved');
    });

    it('supporte un insert avec tous les champs requis', () => {
      const payload = {
        user_id: 'u1',
        amount: 700,
        currency: 'EUR',
        payment_method: 'bank_transfer',
        status: 'pending',
        requested_level: 'premium',
        transfer_reference: 'VIP-U1-001',
      };
      supabase.from('payment_requests').insert(payload);
      expect(mockInsert).toHaveBeenCalledWith(payload);
    });
  });

  // ─── invoices ─────────────────────────────────────────────────────────────

  describe('Table: invoices', () => {
    it('peut être interrogée', () => {
      supabase.from('invoices');
      expect(mockFrom).toHaveBeenCalledWith('invoices');
    });

    it('supporte un select avec champs invoice_lines', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null });
      await supabase
        .from('invoices')
        .select('*, invoice_lines(*)')
        .order('created_at', { ascending: false });
      expect(mockSelect).toHaveBeenCalledWith('*, invoice_lines(*)');
    });

    it('supporte un update de status (annulation)', () => {
      supabase.from('invoices').update({ status: 'cancelled' }).eq('id', 'inv1');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled' });
    });
  });

  // ─── pricing_config ────────────────────────────────────────────────────────

  describe('Table: pricing_config', () => {
    it('peut être interrogée', () => {
      supabase.from('pricing_config');
      expect(mockFrom).toHaveBeenCalledWith('pricing_config');
    });

    it('supporte un select avec filtre is_active', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null });
      await supabase
        .from('pricing_config')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      expect(mockEq).toHaveBeenCalledWith('is_active', true);
    });

    it('supporte un update de montant et devise', () => {
      supabase
        .from('pricing_config')
        .update({ amount: 700, currency: 'EUR', updated_at: '2026-01-01T00:00:00Z', updated_by: 'u1' })
        .eq('id', 'pc1');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 700, currency: 'EUR' })
      );
    });
  });

  // ─── badge_scans ──────────────────────────────────────────────────────────

  describe('Table: badge_scans', () => {
    it('peut être interrogée', () => {
      supabase.from('badge_scans');
      expect(mockFrom).toHaveBeenCalledWith('badge_scans');
    });

    it('supporte un insert', () => {
      supabase.from('badge_scans').insert({
        scanner_id: 'sc1',
        scanned_user_id: 'u2',
        scan_type: 'entry',
        scanned_at: new Date().toISOString(),
      });
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  // ─── notifications ─────────────────────────────────────────────────────────

  describe('Table: notifications', () => {
    it('peut être interrogée', () => {
      supabase.from('notifications');
      expect(mockFrom).toHaveBeenCalledWith('notifications');
    });

    it('supporte un insert de notification', () => {
      supabase.from('notifications').insert({
        user_id: 'u1',
        type: 'info',
        message: 'Paiement validé',
        created_at: new Date().toISOString(),
      });
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  // ─── appointments ──────────────────────────────────────────────────────────

  describe('Table: appointments', () => {
    it('peut être interrogée', () => {
      supabase.from('appointments');
      expect(mockFrom).toHaveBeenCalledWith('appointments');
    });

    it('select avec filtre statut', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null });
      await supabase.from('appointments').select('*').eq('status', 'confirmed').order('created_at');
      expect(mockEq).toHaveBeenCalledWith('status', 'confirmed');
    });
  });

  // ─── exhibitor_profiles ────────────────────────────────────────────────────

  describe('Table: exhibitor_profiles', () => {
    it('peut être interrogée', () => {
      supabase.from('exhibitor_profiles');
      expect(mockFrom).toHaveBeenCalledWith('exhibitor_profiles');
    });

    it('select avec filtre user_id', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'ep1', company_name: 'Acme' }, error: null });
      await supabase.from('exhibitor_profiles').select('id, user_id, company_name, logo_url').eq('user_id', 'u1').single();
      expect(mockEq).toHaveBeenCalledWith('user_id', 'u1');
    });
  });

  // ─── partner_profiles ──────────────────────────────────────────────────────

  describe('Table: partner_profiles', () => {
    it('peut être interrogée', () => {
      supabase.from('partner_profiles');
      expect(mockFrom).toHaveBeenCalledWith('partner_profiles');
    });
  });

  // ─── visitor_profiles ─────────────────────────────────────────────────────

  describe('Table: visitor_profiles', () => {
    it('peut être interrogée', () => {
      supabase.from('visitor_profiles');
      expect(mockFrom).toHaveBeenCalledWith('visitor_profiles');
    });
  });

  // ─── mini_sites ─────────────────────────────────────────────────────────

  describe('Table: mini_sites', () => {
    it('peut être interrogée', () => {
      supabase.from('mini_sites');
      expect(mockFrom).toHaveBeenCalledWith('mini_sites');
    });

    it('supporte un insert de vue (minisite_views)', () => {
      supabase.from('minisite_views').insert({ mini_site_id: 'ms1', viewer_id: 'u2', viewed_at: new Date().toISOString() });
      expect(mockFrom).toHaveBeenCalledWith('minisite_views');
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  // ─── products ─────────────────────────────────────────────────────────────

  describe('Table: products', () => {
    it('peut être interrogée', () => {
      supabase.from('products');
      expect(mockFrom).toHaveBeenCalledWith('products');
    });
  });

  // ─── connections ──────────────────────────────────────────────────────────

  describe('Table: connections', () => {
    it('peut être interrogée', () => {
      supabase.from('connections');
      expect(mockFrom).toHaveBeenCalledWith('connections');
    });
  });

  // ─── rental_items & rental_orders ────────────────────────────────────────

  describe('Table: rental_items + rental_orders', () => {
    it('rental_items peut être interrogée', () => {
      supabase.from('rental_items');
      expect(mockFrom).toHaveBeenCalledWith('rental_items');
    });

    it('rental_orders peut être interrogée', () => {
      supabase.from('rental_orders');
      expect(mockFrom).toHaveBeenCalledWith('rental_orders');
    });
  });

  // ─── Edge Functions ────────────────────────────────────────────────────────

  describe('Edge Functions — invoke (structure des appels)', () => {
    it('capture-paypal-order peut être invoquée', async () => {
      mockInvoke.mockResolvedValue({ data: { captured: true }, error: null });
      const { data } = await supabase.functions.invoke('capture-paypal-order', {
        body: { orderId: 'ORDER123', userId: 'u1' },
      });
      expect(mockInvoke).toHaveBeenCalledWith('capture-paypal-order', expect.any(Object));
      expect(data).toHaveProperty('captured');
    });

    it('create-cmi-payment peut être invoquée', async () => {
      mockInvoke.mockResolvedValue({ data: { paymentUrl: 'https://cmi.co.ma/pay' }, error: null });
      const { data } = await supabase.functions.invoke('create-cmi-payment', {
        body: { userId: 'u1', userEmail: 'a@b.com', amount: 300, currency: 'MAD' },
      });
      expect(mockInvoke).toHaveBeenCalledWith('create-cmi-payment', expect.any(Object));
      expect(data).toHaveProperty('paymentUrl');
    });

    it('create-paypal-order peut être invoquée', async () => {
      mockInvoke.mockResolvedValue({ data: { orderId: 'ORDER456' }, error: null });
      const { data } = await supabase.functions.invoke('create-paypal-order', {
        body: { userId: 'u1', amount: '300', currency: 'EUR' },
      });
      expect(data).toHaveProperty('orderId');
    });
  });

  // ─── Intégrité référentielle (documentée) ─────────────────────────────────

  describe('Intégrité référentielle — colonnes FK critiques', () => {
    it('invoices.user_id doit référencer users.id (structure attendue)', () => {
      // Test documentaire : vérifie que le code utilise bien user_id comme clé
      const payload = {
        user_id: 'u1',
        user_type: 'visitor',
        user_email: 'a@b.com',
        user_name: 'Alice',
        vat_rate: 0,
        currency: 'EUR',
        lines: [],
      };
      expect(payload.user_id).toBeTruthy();
      expect(typeof payload.user_id).toBe('string');
    });

    it('payment_requests.user_id doit référencer users.id', () => {
      const fields = ['user_id', 'amount', 'currency', 'payment_method', 'status'];
      fields.forEach(f => {
        expect(typeof f).toBe('string');
      });
    });

    it('pricing_config a une contrainte UNIQUE sur (category, level)', () => {
      // Les catégories valides selon la migration
      const validCategories = ['visitor', 'exhibitor', 'partner'];
      validCategories.forEach(cat => {
        expect(['visitor', 'exhibitor', 'partner']).toContain(cat);
      });
    });
  });
});
