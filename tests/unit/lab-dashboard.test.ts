import { describe, expect, it } from 'vitest';
import {
  bucketCounts,
  buildDashboardModel,
  demoDashboardSnapshot,
  groupQuotesByMonth,
  hrefForJourneyStep,
  lateDeadlineCount,
  realizedMarginPercent,
  successRate,
} from '@/features/lab/lib/dashboardStats';
import { defaultSeedPassword, seedUsersFromEnv, summarizeSeed } from '@/features/lab/lib/seedApply';
import { expectedSeedRequestCount, LAB_SEED_ACCOUNTS, seedAccountEmails } from '@/features/lab/lib/seedCatalog';
import { LAB_ROUTES } from '@/features/lab/routes';

describe('lab seed catalog', () => {
  it('covers 12 workflow dossiers and 4 DEV accounts', () => {
    expect(expectedSeedRequestCount()).toBe(12);
    expect(seedAccountEmails()).toEqual([
      'admin@elitech.dev',
      'zineb@elitech.dev',
      'tech@elitech.dev',
      'client@elitech.dev',
    ]);
    expect(LAB_SEED_ACCOUNTS.map((a) => a.role)).toContain('RESPONSABLE_VALIDATION');
  });

  it('resolves documented DEV passwords without inventing prod secrets', () => {
    expect(defaultSeedPassword('admin')).toBe('LabDev!2026Admin');
    expect(defaultSeedPassword('zineb', { LAB_SEED_PASSWORD_ZINEB: 'Override!1' })).toBe('Override!1');
    expect(seedUsersFromEnv().every((u) => u.password.length >= 8)).toBe(true);
  });

  it('summarizes a live seed as ok only with 12 dossiers', () => {
    expect(summarizeSeed({
      live: true, usersCreated: 4, usersExisting: 0, requests: 12, quotes: 9,
      samples: 6, invoices: 2, tasks: 4, migration07: true,
    }).ok).toBe(true);
    expect(summarizeSeed({
      live: false, usersCreated: 0, usersExisting: 0, requests: 0, quotes: 0,
      samples: 0, invoices: 0, tasks: 0, migration07: false, error: 'missing_token',
    }).ok).toBe(false);
  });
});

describe('lab dashboard aggregations', () => {
  const now = new Date('2026-09-06T12:00:00.000Z');

  it('counts buckets, late deadlines and ~30% margin', () => {
    const requests = [
      { id: '1', status: 'NEW_REQUEST' },
      { id: '2', status: 'ANALYSIS_IN_PROGRESS' },
      { id: '3', status: 'FINAL_REVIEW' },
    ];
    const late = lateDeadlineCount([
      { expected_date: '2026-09-01', actual_date: null },
      { expected_date: '2026-09-10', actual_date: null },
    ], now);
    expect(late).toBe(1);
    expect(bucketCounts(requests, late)).toEqual({ todo: 1, wait: 1, late: 1, validate: 1 });
    expect(realizedMarginPercent([
      { id: 'q', amount: 130, status: 'sent', sent_at: null, followup_due_at: null, followup_sent_at: null, created_at: '2026-08-01', supplier_amount: 100 },
    ], 30)).toBe(30);
  });

  it('computes success rate and groups quotes by month', () => {
    expect(successRate([
      { id: 'a', status: 'REPORT_SENT' },
      { id: 'b', status: 'FINAL_REVIEW' },
    ])).toBe(50);
    expect(groupQuotesByMonth([
      { id: '1', amount: 100, status: 'sent', sent_at: null, followup_due_at: null, followup_sent_at: null, created_at: '2026-08-10T00:00:00Z' },
      { id: '2', amount: 50, status: 'draft', sent_at: null, followup_due_at: null, followup_sent_at: null, created_at: '2026-08-20T00:00:00Z' },
    ])).toEqual([{ month: '2026-08', amount: 150, count: 2 }]);
  });

  it('builds tracking links for follow-ups, PO without samples, overdue tasks', () => {
    const model = buildDashboardModel({
      requests: [
        { id: 'r6', status: 'WAITING_SAMPLES', dossier_number: 'DEM-SEED-06', company_name: 'Souss' },
        { id: 'r9', status: 'FINAL_REVIEW', dossier_number: 'DEM-SEED-09', company_name: 'Souss', analysis_kind: 'PHYSICO_CHIMIQUE' },
      ],
      quotes: [{
        id: 'q5', amount: 3900, status: 'sent', quote_number: 'DEV-SEED-05',
        sent_at: '2026-08-28T00:00:00Z', followup_due_at: '2026-08-31T00:00:00Z',
        followup_sent_at: null, created_at: '2026-08-28T00:00:00Z',
      }],
      invoices: [{ id: 'i', amount_total: 2600, status: 'PARTIELLEMENT_PAYEE', invoice_date: '2026-09-02' }],
      payments: [{ amount: 800, paid_at: '2026-09-03' }],
      deadlines: [{ expected_date: '2026-09-01', actual_date: null, penalty_amount: 30 }],
      tasks: [{ id: 't1', title: 'Relancer miel', status: 'EN_COURS', due_date: '2026-09-01' }],
      purchaseOrders: [{ id: 'po6', request_id: 'r6', review_status: 'accepted', reference: 'BDC-SEED-06' }],
      reviews: [
        { id: 'v1', level: 'ai', decision: 'accept', result_id: 'res9' },
        { id: 'v2', level: 'technical', decision: 'accept', result_id: 'res9' },
      ],
      samples: [],
      marginPercent: 30,
      penaltyPercentPerDay: 1,
      now,
    });
    expect(model.empty).toBe(false);
    expect(model.tracking.followupsOverdue[0]?.href).toBe(LAB_ROUTES.ADMIN_QUOTES);
    expect(model.tracking.poAwaitingSamples[0]?.label).toBe('BDC-SEED-06');
    expect(model.tracking.tasksOverdue).toHaveLength(1);
    expect(model.tracking.reviewsPending.length).toBeGreaterThan(0);
    expect(hrefForJourneyStep(4)).toBe(LAB_ROUTES.ADMIN_QUOTES);
    expect(hrefForJourneyStep(7)).toBe(LAB_ROUTES.ADMIN_VALIDATIONS);
  });

  it('keeps a labeled demo snapshot when live data is empty', () => {
    const demo = demoDashboardSnapshot(now);
    expect(demo.demo).toBe(true);
    expect(demo.empty).toBe(true);
    expect(demo.pipeline.some((p) => p.count > 0)).toBe(true);
    expect(demo.quotesByMonth.length).toBeGreaterThan(0);
  });
});
