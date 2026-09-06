import { describe, expect, it } from 'vitest';
import { applyMargin, computePenalty } from '@/features/lab/lib/pricing';
import { formatSampleCode } from '@/features/lab/lib/sampleCode';
import { canTransition } from '@/features/lab/lib/status';
import { can } from '@/features/lab/rbac';
import { clientRequestSchema, moroccoPhoneSchema } from '@/features/lab/schemas';
import { isLabPath } from '@/features/lab/routes';
import { rankOffers, rankSuppliersForConsult, suggestRecipients } from '@/features/lab/lib/compareOffers';
import { proposeRegulatedAnalyses, parseProductListCsv } from '@/features/lab/lib/regulatoryCatalog';
import { extractRequestDraftFromEmail } from '@/features/lab/lib/emailToRequest';
import { filterRetained, isWithinRetention } from '@/features/lab/lib/documentRetention';
import { isClientPriceTooHigh, proposedMarginPercent } from '@/features/lab/lib/competitiveness';
import { journeyStepForStatus, countByJourney, LAB_JOURNEY } from '@/features/lab/lib/journey';
import { followupDueAt, isFollowupDue, surveyCreatesPriceAlert } from '@/features/lab/lib/quoteFollowup';
import { reviewPurchaseOrder } from '@/features/lab/lib/reviewPurchaseOrder';
import { detectResultAnomalies, shouldEmailSupplierOnDoubleRefuse } from '@/features/lab/lib/resultReview';
import { invoiceProgress } from '@/features/lab/lib/invoices';
import { pickTemplateKind, reportReadiness } from '@/features/lab/lib/reportReadiness';
import { renderEmail } from '@/features/lab/lib/emailTemplates';
import { deadlineState, delayDays } from '@/features/lab/lib/deadlines';
import { pickQueuedEmails, nextEmailStatus, classifyInboundEmail } from '@/features/lab/lib/emailQueue';
import { buildBackupManifest, LAB_BACKUP_TABLES } from '@/features/lab/lib/backupManifest';
import { pickDueFollowups, pickDeadlineActions, pickUnpaidInvoices } from '@/features/lab/lib/cronJobs';
import { heuristicClassifyEmail, heuristicExtractQuoteRef, heuristicTranslateToEnglish } from '@/features/lab/lib/aiHeuristics';
import { assertLabFile } from '@/features/lab/lib/labStorage';
import { extractRequestFromEmail } from '@/features/lab/lib/extractRequest';
import { assessCompetitiveness } from '@/features/lab/lib/competitiveness';
import { parseProductList } from '@/features/lab/lib/regulationCatalog';
import { nextStatusAfterQualify, supplierLanguage } from '@/features/lab/lib/executionChannel';

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
    expect(canTransition('CLIENT_QUOTE_SENT', 'PURCHASE_ORDER_RECEIVED')).toBe(true);
    expect(canTransition('PURCHASE_ORDER_RECEIVED', 'WAITING_SAMPLES')).toBe(true);
    expect(canTransition('WAITING_SAMPLES', 'SAMPLES_RECEIVED')).toBe(true);
    expect(canTransition('NEW_REQUEST', 'CLOSED')).toBe(false);
  });
});

describe('lab purchase order review', () => {
  it('accepts a coherent client PO', () => {
    const review = reviewPurchaseOrder({
      quoteNumber: 'DEV-2026-000001',
      poQuoteRef: 'DEV-2026-000001',
      quoteClient: 'Acme',
      poClient: 'Acme',
      quoteAmount: 130,
      poAmount: 130,
    });
    expect(review.status).toBe('ACCEPTÉ');
  });

  it('flags amount and client mismatches without creating a PO', () => {
    const review = reviewPurchaseOrder({
      quoteNumber: 'DEV-2026-000001',
      poQuoteRef: 'BC-99',
      quoteClient: 'Acme',
      poClient: 'Other',
      quoteAmount: 130,
      poAmount: 80,
    });
    expect(review.status).toBe('À CORRIGER');
    expect(review.reasons.length).toBeGreaterThan(1);
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

describe('lab offer ranking', () => {
  it('ranks by price then delay and never auto-selects', () => {
    const ranked = rankOffers([
      { id: 'b', supplierId: '2', supplierName: 'B', amount: 120, currency: 'EUR', turnaroundDays: 2 },
      { id: 'a', supplierId: '1', supplierName: 'A', amount: 100, currency: 'EUR', turnaroundDays: 5 },
      { id: 'c', supplierId: '3', supplierName: 'C', amount: 100, currency: 'EUR', turnaroundDays: 3 },
    ]);
    expect(ranked[0].id).toBe('c');
    expect(ranked[0].recommended).toBe(true);
    expect(ranked[1].id).toBe('a');
  });

  it('filters to accredited offers when required', () => {
    const ranked = rankOffers([
      { id: 'cheap', supplierId: '1', supplierName: 'A', amount: 10, currency: 'EUR', turnaroundDays: 1 },
      { id: 'iso', supplierId: '2', supplierName: 'B', amount: 50, currency: 'EUR', turnaroundDays: 4, accreditation: 'ISO 17025' },
    ], { accreditationRequired: true });
    expect(ranked).toHaveLength(1);
    expect(ranked[0].id).toBe('iso');
  });

  it('suggests TOP_3 recipients', () => {
    expect(suggestRecipients([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }], 'TOP_3')).toHaveLength(3);
  });

  it('ranks suppliers by scores and accreditation', () => {
    const top = rankSuppliersForConsult([
      { id: 'a', quality_score: 10, delay_score: 10, price_score: 10, accreditations: [] },
      { id: 'b', quality_score: 90, delay_score: 80, price_score: 70, accreditations: ['ISO 17025'] },
      { id: 'c', quality_score: 40, delay_score: 40, price_score: 40, accreditations: [] },
    ], 'TOP_3', { accreditationRequired: true });
    expect(top[0].id).toBe('b');
  });
});

describe('lab regulatory catalog', () => {
  it('proposes named parameters with Moroccan references only', () => {
    const water = proposeRegulatedAnalyses('Eau minérale', 'eau potable');
    expect(water.some((p) => p.parameter === 'Plomb')).toBe(true);
    expect(water.every((p) => p.reference.length > 10 && p.legal)).toBe(true);
  });

  it('does not invent obligations for unknown matrices', () => {
    expect(proposeRegulatedAnalyses('Widget spatial', 'alliage inconnu')).toHaveLength(0);
  });

  it('parses a product CSV', () => {
    expect(parseProductListCsv('produit;matrice\nHuile;alimentaire')).toEqual([
      { product: 'Huile', matrix: 'alimentaire' },
    ]);
  });
});

describe('lab email to structured request', () => {
  it('extracts fields and lists missing ones', () => {
    const draft = extractRequestDraftFromEmail(
      'Demande analyse',
      'Société: Acme\nContact: Sara\nEmail: sara@acme.ma\nProduit: Huile\nAnalyses: pH',
    );
    expect(draft.company_name).toBe('Acme');
    expect(draft.origin).toBe('EMAIL');
    expect(draft.missing).toContain('téléphone');
  });
});

describe('lab document retention', () => {
  it('keeps documents within 365 days', () => {
    const now = new Date('2026-09-06');
    expect(isWithinRetention('2026-01-01', 365, now)).toBe(true);
    expect(isWithinRetention('2024-01-01', 365, now)).toBe(false);
    expect(filterRetained([{ created_at: '2026-08-01' }, { created_at: '2024-01-01' }], 365, now)).toHaveLength(1);
  });
});

describe('lab competitiveness', () => {
  it('flags high client price and proposes a margin without applying it', () => {
    expect(isClientPriceTooHigh(200, 100)).toBe(true);
    expect(proposedMarginPercent(100, 120)).toBe(20);
  });
});

describe('lab journey', () => {
  it('maps dossier statuses to the 12-step infographic', () => {
    expect(journeyStepForStatus('NEW_REQUEST')).toBe(1);
    expect(journeyStepForStatus('QUALIFICATION')).toBe(2);
    expect(journeyStepForStatus('WAITING_SUPPLIER_QUOTES')).toBe(3);
    expect(journeyStepForStatus('CLIENT_QUOTE_SENT')).toBe(4);
    expect(journeyStepForStatus('SAMPLES_RECEIVED')).toBe(5);
    expect(journeyStepForStatus('ANALYSIS_IN_PROGRESS')).toBe(6);
    expect(journeyStepForStatus('AI_REVIEW')).toBe(7);
    expect(journeyStepForStatus('REPORT_SENT')).toBe(8);
    expect(journeyStepForStatus('INVOICED')).toBe(11);
    expect(countByJourney({ NEW_REQUEST: 2, QUALIFICATION: 1 })[1]).toBe(2);
    expect(LAB_JOURNEY).toHaveLength(12);
  });
});

describe('lab quote followup', () => {
  it('schedules follow-up from settings days', () => {
    const due = followupDueAt(new Date('2026-01-01T00:00:00Z'), 3);
    expect(due.toISOString()).toBe('2026-01-04T00:00:00.000Z');
  });

  it('detects due follow-up and price alert without changing price', () => {
    expect(isFollowupDue({
      sentAt: '2026-01-01',
      followupDueAt: '2026-01-02',
      followupSentAt: null,
      now: new Date('2026-01-03'),
    })).toBe(true);
    expect(surveyCreatesPriceAlert({ received: true, priceOk: false, delayOk: true, priceTooHigh: false })).toBe(true);
  });
});

describe('lab results / billing / reports', () => {
  it('flags missing result fields and never treats AI as validation', () => {
    expect(detectResultAnomalies({ analysisName: '', value: '', unit: '', method: '' }).length).toBeGreaterThan(2);
    expect(shouldEmailSupplierOnDoubleRefuse('REFUSER', 'REFUSER')).toBe(true);
    expect(shouldEmailSupplierOnDoubleRefuse('ACCEPTER', 'REFUSER')).toBe(false);
  });

  it('computes invoice remaining and late status', () => {
    const late = invoiceProgress(100, 0, '2020-01-01', new Date('2020-01-10'));
    expect(late.status).toBe('IMPAYEE');
    expect(invoiceProgress(100, 100).status).toBe('PAYEE');
    expect(invoiceProgress(100, 40).status).toBe('PARTIELLEMENT_PAYEE');
  });

  it('blocks report if checklist incomplete and picks template by kind', () => {
    expect(pickTemplateKind('MICROBIOLOGIQUE')).toBe('MICROBIOLOGIQUE');
    expect(pickTemplateKind('MIXTE')).toBe('PHYSICO_CHIMIQUE');
    expect(reportReadiness({
      client: true, sample: true, sampleCode: true, methods: true,
      results: false, units: true, dates: true, validations: true,
    }).ok).toBe(false);
  });
});

describe('lab emails and deadlines', () => {
  it('renders centralized templates', () => {
    const mail = renderEmail('quote_followup', { quote: 'DEV-1', link: '/x' });
    expect(mail.subject).toContain('DEV-1');
    expect(mail.body).toContain('/x');
  });

  it('marks approaching and late supplier deadlines', () => {
    expect(delayDays('2026-01-01', '2026-01-04')).toBe(3);
    expect(deadlineState('2026-01-10', null, new Date('2026-01-09'))).toBe('due_soon');
    expect(deadlineState('2026-01-01', null, new Date('2026-01-03'))).toBe('late');
  });
});

describe('lab email queue', () => {
  it('picks queued with recipient and subject', () => {
    expect(pickQueuedEmails([
      { id: '1', status: 'sent', recipient: 'a@x', subject: 'ok' },
      { id: '2', status: 'queued', recipient: 'b@x', subject: 'hi' },
      { id: '3', status: 'queued', recipient: '', subject: 'hi' },
    ]).map((r) => r.id)).toEqual(['2']);
  });

  it('maps send result to status', () => {
    expect(nextEmailStatus(true)).toBe('sent');
    expect(nextEmailStatus(false)).toBe('failed');
  });

  it('classifies inbound subjects', () => {
    expect(classifyInboundEmail('Re: Quote EL-1')).toBe('QUOTE_REPLY');
    expect(classifyInboundEmail('BC-2026-009')).toBe('PURCHASE_ORDER');
    expect(classifyInboundEmail('Rapport final')).toBe('REPORT');
    expect(classifyInboundEmail('facture 12')).toBe('OTHER');
  });
});

describe('lab cron jobs', () => {
  const now = new Date('2026-01-10T00:00:00Z');

  it('picks due quote follow-ups only', () => {
    const due = pickDueFollowups([
      { id: '1', quote_number: 'A', organization_id: 'o', sent_at: '2026-01-01', followup_due_at: '2026-01-04', followup_sent_at: null, survey_token: 't' },
      { id: '2', quote_number: 'B', organization_id: 'o', sent_at: '2026-01-01', followup_due_at: '2026-01-04', followup_sent_at: '2026-01-05', survey_token: 't' },
      { id: '3', quote_number: 'C', organization_id: 'o', sent_at: '2026-01-09', followup_due_at: '2026-01-12', followup_sent_at: null, survey_token: 't' },
    ], now);
    expect(due.map((q) => q.id)).toEqual(['1']);
  });

  it('queues reminder then late, never twice', () => {
    const actions = pickDeadlineActions([
      { id: 'soon', organization_id: 'o', expected_date: '2026-01-11', actual_date: null, reminded_at: null, late_notified_at: null },
      { id: 'late', organization_id: 'o', expected_date: '2026-01-01', actual_date: null, reminded_at: 'x', late_notified_at: null },
      { id: 'done', organization_id: 'o', expected_date: '2026-01-01', actual_date: null, reminded_at: 'x', late_notified_at: 'y' },
    ], now);
    expect(actions).toEqual([
      expect.objectContaining({ id: 'soon', action: 'remind' }),
      expect.objectContaining({ id: 'late', action: 'late' }),
    ]);
  });
});

describe('lab unpaid invoices', () => {
  it('picks unpaid without reminder', () => {
    expect(pickUnpaidInvoices([
      { id: '1', status: 'IMPAYEE' },
      { id: '2', status: 'PAYEE' },
      { id: '3', status: 'EN_ATTENTE', reminder_sent_at: 'x' },
    ]).map((r) => r.id)).toEqual(['1']);
  });
});

describe('lab AI aid', () => {
  it('classifies and extracts without validating', () => {
    expect(heuristicClassifyEmail('Bon de commande BC-12')).toBe('PURCHASE_ORDER');
    expect(heuristicExtractQuoteRef('ref DEV-2026-000001')).toBe('DEV-2026-000001');
    expect(heuristicTranslateToEnglish('Bonjour devis')).toMatch(/hello/i);
  });
});

describe('lab storage guards', () => {
  it('rejects bad mime', () => {
    expect(() => assertLabFile({ type: 'application/x-msdownload', size: 10 } as File)).toThrow();
  });
});

describe('lab backup manifest', () => {
  it('lists lab entities and restore doc', () => {
    const m = buildBackupManifest({
      organizationId: 'org',
      tables: LAB_BACKUP_TABLES,
      buckets: ['lab-reports'],
      createdAt: '2026-09-06T00:00:00.000Z',
    });
    expect(m.postgres.schema).toBe('lab');
    expect(m.postgres.tables).toContain('quotes');
    expect(m.restore_doc).toBe('docs/RESTORE_TEST.md');
  });
});

describe('lab routes', () => {
  it('isolates lab paths', () => {
    expect(isLabPath('/lab')).toBe(true);
    expect(isLabPath('/lab/admin/dashboard')).toBe(true);
    expect(isLabPath('/admin/dashboard')).toBe(false);
  });
});

describe('lab execution channel', () => {
  it('allows internal qualification to skip consultation', () => {
    expect(canTransition('QUALIFICATION', 'CLIENT_QUOTE_DRAFT')).toBe(true);
    expect(nextStatusAfterQualify('INTERNAL')).toBe('CLIENT_QUOTE_DRAFT');
    expect(supplierLanguage('SUBCONTRACTED')).toBe('en');
  });
});

describe('lab email extract rules-v1', () => {
  it('pre-fills structured fields and lists missing ones', () => {
    const extracted = extractRequestFromEmail(`
      Société: Atlas Oils
      Contact: Sara Benali
      Email: sara@atlas.ma
      Tél: +212 661234567
      Produit: Huile d’olive
      Analyses: plomb, cadmium
    `);
    expect(extracted.source).toBe('rules-v1');
    expect(extracted.company_name).toMatch(/Atlas/i);
    expect(extracted.email).toBe('sara@atlas.ma');
    expect(extracted.missing).not.toContain('email');
  });
});

describe('lab competitiveness assess', () => {
  it('flags a high client price without changing it', () => {
    const check = assessCompetitiveness({ supplierAmount: 100, marginPercent: 80 });
    expect(check.flag).toBe('high');
    expect(check.clientAmount).toBe(180);
  });
});

describe('lab product list parse', () => {
  it('reads a simple product list', () => {
    expect(parseProductList('produit\nHuile d’olive\nEau').length).toBeGreaterThan(0);
  });
});
