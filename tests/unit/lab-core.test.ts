import { describe, expect, it } from 'vitest';
import { applyMargin, computePenalty } from '@/features/lab/lib/pricing';
import { formatSampleCode } from '@/features/lab/lib/sampleCode';
import { canTransition } from '@/features/lab/lib/status';
import { can } from '@/features/lab/rbac';
import { clientRequestSchema, moroccoPhoneSchema } from '@/features/lab/schemas';
import { isLabPath } from '@/features/lab/routes';

describe('lab pricing', () => {
  it('applies configurable margin', () => {
    expect(applyMargin(100, 30)).toBe(130);
    expect(applyMargin(99.99, 10)).toBe(109.99);
  });

  it('rejects hardcoded-unsafe inputs', () => {
    expect(() => applyMargin(-1, 30)).toThrow();
    expect(() => applyMargin(10, 101)).toThrow();
  });

  it('computes delay penalty from settings rate', () => {
    expect(computePenalty(1000, 3, 1)).toBe(30);
    expect(computePenalty(1000, 0, 1)).toBe(0);
  });
});

describe('lab sample code', () => {
  it('formats ECH-seq-year-product', () => {
    expect(formatSampleCode({ sequence: 123, year: 2026, product: 'Huile d’olive' }))
      .toBe('ECH-000123-2026-HUILE-D-OLIVE');
  });
});

describe('lab status machine', () => {
  it('allows the first workflow', () => {
    expect(canTransition('NEW_REQUEST', 'QUALIFICATION')).toBe(true);
    expect(canTransition('QUALIFICATION', 'WAITING_SUPPLIER_QUOTES')).toBe(true);
    expect(canTransition('SUPPLIER_SELECTED', 'CLIENT_QUOTE_DRAFT')).toBe(true);
    expect(canTransition('NEW_REQUEST', 'CLOSED')).toBe(false);
  });
});

describe('lab rbac', () => {
  it('keeps permissions out of UI defaults', () => {
    expect(can('CLIENT', 'quotes.validate')).toBe(false);
    expect(can('RESPONSABLE_VALIDATION', 'quotes.validate')).toBe(true);
    expect(can('FINANCE', 'requests.qualify')).toBe(false);
  });
});

describe('lab validators', () => {
  it('accepts morocco numeric phones', () => {
    expect(moroccoPhoneSchema.parse('612345678')).toBe('612345678');
    expect(() => moroccoPhoneSchema.parse('06-12-ab')).toThrow();
  });

  it('validates public request payload', () => {
    const parsed = clientRequestSchema.parse({
      company_name: 'Acme',
      contact_name: 'Sara',
      email: 'sara@acme.ma',
      country_code: '+212',
      phone: '661234567',
      product_name: 'Huile',
      sample_count: 2,
      analyses: 'pH, humidité',
      accreditation_required: false,
    });
    expect(parsed.phone).toBe('661234567');
  });
});

describe('lab routes', () => {
  it('isolates lab paths', () => {
    expect(isLabPath('/lab')).toBe(true);
    expect(isLabPath('/lab/admin/dashboard')).toBe(true);
    expect(isLabPath('/admin/dashboard')).toBe(false);
  });
});
