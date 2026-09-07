import { countByJourney, LAB_JOURNEY, journeyStepForStatus } from './journey';
import { isFollowupDue } from './quoteFollowup';
import { invoiceProgress } from './invoices';
import { computePenalty } from './pricing';
import { LAB_ROUTES } from '../routes';
import { LAB_SEED_DOSSIERS } from './seedCatalog';
import type { DossierStatus } from '../types';

export const TASK_BUCKETS = [
  { key: 'todo', label: 'À faire', href: LAB_ROUTES.ADMIN_REQUESTS },
  { key: 'wait', label: 'En attente', href: LAB_ROUTES.ADMIN_ORDERS },
  { key: 'late', label: 'En retard', href: LAB_ROUTES.ADMIN_DEADLINES },
  { key: 'validate', label: 'À valider', href: LAB_ROUTES.ADMIN_VALIDATIONS },
] as const;

const TODO = new Set(['NEW_REQUEST', 'QUALIFICATION', 'CLIENT_QUOTE_DRAFT']);
const WAIT = new Set([
  'WAITING_SUPPLIER_QUOTES',
  'WAITING_CLIENT_RESPONSE',
  'WAITING_SAMPLES',
  'ANALYSIS_IN_PROGRESS',
]);
const VALIDATE = new Set(['AI_REVIEW', 'TECHNICAL_REVIEW', 'FINAL_REVIEW']);
const SUCCESS = new Set(['APPROVED', 'REPORT_GENERATION', 'REPORT_SENT', 'INVOICED', 'CLOSED']);
const REVIEWED = new Set([
  'RESULTS_RECEIVED', 'AI_REVIEW', 'TECHNICAL_REVIEW', 'FINAL_REVIEW',
  'CORRECTION_REQUESTED', 'APPROVED', 'REPORT_GENERATION', 'REPORT_SENT', 'INVOICED', 'CLOSED',
]);

export interface DashRequest {
  id: string;
  status: string;
  analysis_kind?: string | null;
  company_name?: string;
  dossier_number?: string;
  product_name?: string | null;
  execution_channel?: string | null;
}

export interface DashQuote {
  id: string;
  amount: number;
  status: string;
  sent_at: string | null;
  followup_due_at: string | null;
  followup_sent_at: string | null;
  created_at: string;
  supplier_amount?: number | null;
  margin_percent?: number | null;
  quote_number?: string;
}

export interface DashInvoice {
  id: string;
  amount_total: number;
  status: string;
  invoice_date: string;
  invoice_number?: string;
}

export interface DashPayment {
  amount: number;
  paid_at: string;
}

export interface DashDeadline {
  expected_date: string;
  actual_date: string | null;
  penalty_amount?: number | null;
  penalty_rate?: number | null;
  request_id?: string;
}

export interface DashTask {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
}

export interface DashPo {
  id: string;
  request_id: string;
  review_status: string;
  reference?: string | null;
}

export interface DashReview {
  id: string;
  level: string;
  decision: string;
  result_id: string;
}

export interface DashSample {
  id: string;
  code: string;
  request_id: string;
  received_at: string | null;
}

export interface DashboardInput {
  requests: DashRequest[];
  quotes: DashQuote[];
  invoices: DashInvoice[];
  payments: DashPayment[];
  deadlines: DashDeadline[];
  tasks: DashTask[];
  purchaseOrders: DashPo[];
  reviews: DashReview[];
  samples: DashSample[];
  marginPercent: number;
  penaltyPercentPerDay: number;
  now?: Date;
}

export interface TrackingItem {
  id: string;
  label: string;
  meta: string;
  href: string;
}

export interface DashboardModel {
  empty: boolean;
  demo: boolean;
  kpis: { label: string; value: number | string; to: string; hint?: string }[];
  buckets: { key: string; label: string; n: number; href: string }[];
  pipeline: { n: number; title: string; count: number; href?: string }[];
  quotesByMonth: { month: string; amount: number; count: number }[];
  transactionsByMonth: { month: string; invoiced: number; paid: number }[];
  progressByKind: { kind: string; count: number }[];
  successRate: number;
  realizedMargin: number;
  targetMargin: number;
  lateCount: number;
  penaltyTotal: number;
  tracking: {
    inProgress: TrackingItem[];
    followupsOverdue: TrackingItem[];
    poAwaitingSamples: TrackingItem[];
    reviewsPending: TrackingItem[];
    tasksOverdue: TrackingItem[];
  };
}

export function hrefForJourneyStep(n: number): string | undefined {
  if (n === 1 || n === 2) return LAB_ROUTES.ADMIN_REQUESTS;
  if (n === 3) return LAB_ROUTES.ADMIN_CONSULTATIONS;
  if (n === 4) return LAB_ROUTES.ADMIN_QUOTES;
  if (n === 5) return LAB_ROUTES.ADMIN_SAMPLES;
  if (n === 6) return LAB_ROUTES.ADMIN_ANALYSES;
  if (n === 7) return LAB_ROUTES.ADMIN_VALIDATIONS;
  if (n === 8) return LAB_ROUTES.ADMIN_REPORTS;
  if (n === 9) return LAB_ROUTES.CLIENT_LOGIN;
  if (n === 10) return LAB_ROUTES.ADMIN_DASHBOARD;
  if (n === 11) return LAB_ROUTES.ADMIN_INVOICES;
  if (n === 12) return LAB_ROUTES.ADMIN_BACKUPS;
  return undefined;
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function requestHref(id: string): string {
  return LAB_ROUTES.ADMIN_REQUEST.replace(':id', id);
}

export function bucketCounts(requests: DashRequest[], lateCount: number): Record<string, number> {
  return {
    todo: requests.filter((r) => TODO.has(r.status)).length,
    wait: requests.filter((r) => WAIT.has(r.status)).length,
    late: lateCount,
    validate: requests.filter((r) => VALIDATE.has(r.status)).length,
  };
}

export function lateDeadlineCount(deadlines: DashDeadline[], now = new Date()): number {
  return deadlines.filter((d) => !d.actual_date && new Date(d.expected_date) < now).length;
}

export function penaltyTotal(deadlines: DashDeadline[], fallbackRate: number, now = new Date()): number {
  return deadlines.reduce((sum, d) => {
    if (d.actual_date) return sum + num(d.penalty_amount);
    if (new Date(d.expected_date) >= now) return sum + num(d.penalty_amount);
    if (d.penalty_amount != null) return sum + num(d.penalty_amount);
    const days = Math.max(0, Math.ceil((now.getTime() - new Date(d.expected_date).getTime()) / 86_400_000));
    return sum + computePenalty(1000, days, num(d.penalty_rate) || fallbackRate);
  }, 0);
}

export function realizedMarginPercent(quotes: DashQuote[], fallback: number): number {
  const usable = quotes.filter((q) => num(q.supplier_amount) > 0 && num(q.amount) > 0);
  if (!usable.length) {
    const tagged = quotes.map((q) => num(q.margin_percent)).filter((n) => n > 0);
    return tagged.length ? Math.round((tagged.reduce((a, b) => a + b, 0) / tagged.length) * 10) / 10 : fallback;
  }
  const supplier = usable.reduce((s, q) => s + num(q.supplier_amount), 0);
  const client = usable.reduce((s, q) => s + num(q.amount), 0);
  if (supplier <= 0) return fallback;
  return Math.round(((client - supplier) / supplier) * 1000) / 10;
}

export function successRate(requests: DashRequest[]): number {
  const reviewed = requests.filter((r) => REVIEWED.has(r.status));
  if (!reviewed.length) return 0;
  const ok = reviewed.filter((r) => SUCCESS.has(r.status)).length;
  return Math.round((ok / reviewed.length) * 1000) / 10;
}

export function groupQuotesByMonth(quotes: DashQuote[]): { month: string; amount: number; count: number }[] {
  const map = new Map<string, { amount: number; count: number }>();
  for (const q of quotes) {
    const key = monthKey(q.created_at || q.sent_at || new Date().toISOString());
    const prev = map.get(key) ?? { amount: 0, count: 0 };
    prev.amount += num(q.amount);
    prev.count += 1;
    map.set(key, prev);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, amount: Math.round(v.amount * 100) / 100, count: v.count }));
}

export function groupTransactionsByMonth(
  invoices: DashInvoice[],
  payments: DashPayment[],
): { month: string; invoiced: number; paid: number }[] {
  const map = new Map<string, { invoiced: number; paid: number }>();
  for (const inv of invoices) {
    const key = monthKey(inv.invoice_date || new Date().toISOString());
    const prev = map.get(key) ?? { invoiced: 0, paid: 0 };
    prev.invoiced += num(inv.amount_total);
    map.set(key, prev);
  }
  for (const p of payments) {
    const key = monthKey(p.paid_at || new Date().toISOString());
    const prev = map.get(key) ?? { invoiced: 0, paid: 0 };
    prev.paid += num(p.amount);
    map.set(key, prev);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      invoiced: Math.round(v.invoiced * 100) / 100,
      paid: Math.round(v.paid * 100) / 100,
    }));
}

export function progressByAnalysis(requests: DashRequest[]): { kind: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of requests) {
    const kind = r.analysis_kind || 'NON_QUALIFIÉ';
    map.set(kind, (map.get(kind) ?? 0) + 1);
  }
  return [...map.entries()].map(([kind, count]) => ({ kind, count })).sort((a, b) => b.count - a.count);
}

export function buildDashboardModel(input: DashboardInput): DashboardModel {
  const now = input.now ?? new Date();
  const late = lateDeadlineCount(input.deadlines, now);
  const buckets = bucketCounts(input.requests, late);
  const statusCounts: Record<string, number> = {};
  for (const r of input.requests) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
  const journey = countByJourney(statusCounts);
  const unpaid = input.invoices.filter((i) => i.status !== 'PAYEE').length;
  const margin = realizedMarginPercent(input.quotes, input.marginPercent);
  const penalties = Math.round(penaltyTotal(input.deadlines, input.penaltyPercentPerDay, now) * 100) / 100;
  const sampleByRequest = new Set(input.samples.map((s) => s.request_id));
  const acceptedPos = input.purchaseOrders.filter((p) => p.review_status === 'accepted' || p.review_status === 'ACCEPTÉ');

  const reviewsByResult = new Map<string, DashReview[]>();
  for (const rev of input.reviews) {
    const list = reviewsByResult.get(rev.result_id) ?? [];
    list.push(rev);
    reviewsByResult.set(rev.result_id, list);
  }

  const pendingReviews: TrackingItem[] = [];
  for (const [resultId, revs] of reviewsByResult) {
    const hasFinal = revs.some((r) => r.level === 'final' && (r.decision === 'accept' || r.decision === 'ACCEPTE'));
    if (!hasFinal) {
      pendingReviews.push({
        id: resultId,
        label: `Revue ${revs[revs.length - 1]?.level ?? 'en cours'}`,
        meta: revs.map((r) => `${r.level}:${r.decision}`).join(' · '),
        href: LAB_ROUTES.ADMIN_VALIDATIONS,
      });
    }
  }
  for (const r of input.requests.filter((x) => VALIDATE.has(x.status))) {
    if (!pendingReviews.some((p) => p.id === r.id)) {
      pendingReviews.push({
        id: r.id,
        label: r.dossier_number || r.company_name || 'Dossier',
        meta: r.status,
        href: requestHref(r.id),
      });
    }
  }

  return {
    empty: input.requests.length === 0,
    demo: false,
    kpis: [
      { label: 'Dossiers', value: input.requests.length, to: LAB_ROUTES.ADMIN_REQUESTS },
      { label: 'Devis', value: input.quotes.length, to: LAB_ROUTES.ADMIN_QUOTES },
      { label: 'Analyses en cours', value: statusCounts.ANALYSIS_IN_PROGRESS ?? 0, to: LAB_ROUTES.ADMIN_ANALYSES },
      { label: 'Rapports', value: (statusCounts.REPORT_SENT ?? 0) + (statusCounts.REPORT_GENERATION ?? 0), to: LAB_ROUTES.ADMIN_REPORTS },
      { label: 'Factures', value: input.invoices.length, to: LAB_ROUTES.ADMIN_INVOICES },
      { label: 'Impayés', value: unpaid, to: LAB_ROUTES.ADMIN_PAYMENTS, hint: 'hors PAYEE' },
      { label: 'Marge %', value: margin, to: LAB_ROUTES.ADMIN_SETTINGS, hint: `cible ${input.marginPercent}` },
      { label: 'Retards', value: late, to: LAB_ROUTES.ADMIN_DEADLINES, hint: penalties ? `pénalités ${penalties}` : undefined },
    ],
    buckets: TASK_BUCKETS.map((b) => ({ ...b, n: buckets[b.key] ?? 0 })),
    pipeline: LAB_JOURNEY.map((step) => ({
      n: step.n,
      title: step.title,
      count: journey[step.n] ?? 0,
      href: hrefForJourneyStep(step.n),
    })),
    quotesByMonth: groupQuotesByMonth(input.quotes),
    transactionsByMonth: groupTransactionsByMonth(input.invoices, input.payments),
    progressByKind: progressByAnalysis(input.requests),
    successRate: successRate(input.requests),
    realizedMargin: margin,
    targetMargin: input.marginPercent,
    lateCount: late,
    penaltyTotal: penalties,
    tracking: {
      inProgress: input.requests
        .filter((r) => !['CLOSED', 'INVOICED', 'REPORT_SENT'].includes(r.status))
        .slice(0, 8)
        .map((r) => ({
          id: r.id,
          label: r.dossier_number || r.company_name || r.id.slice(0, 8),
          meta: `Étape ${journeyStepForStatus(r.status as DossierStatus)} · ${r.status}`,
          href: requestHref(r.id),
        })),
      followupsOverdue: input.quotes
        .filter((q) => isFollowupDue({
          sentAt: q.sent_at,
          followupDueAt: q.followup_due_at,
          followupSentAt: q.followup_sent_at,
          now,
        }))
        .map((q) => ({
          id: q.id,
          label: q.quote_number || q.id.slice(0, 8),
          meta: q.followup_due_at ? `relance due ${q.followup_due_at.slice(0, 10)}` : 'relance due',
          href: LAB_ROUTES.ADMIN_QUOTES,
        })),
      poAwaitingSamples: acceptedPos
        .filter((p) => !sampleByRequest.has(p.request_id))
        .map((p) => ({
          id: p.id,
          label: p.reference || p.id.slice(0, 8),
          meta: 'BDC accepté · échantillons absents',
          href: LAB_ROUTES.ADMIN_SAMPLES,
        })),
      reviewsPending: pendingReviews.slice(0, 8),
      tasksOverdue: input.tasks
        .filter((t) => t.status !== 'TERMINEE' && t.due_date && new Date(t.due_date) < now)
        .map((t) => ({
          id: t.id,
          label: t.title,
          meta: `${t.status} · ${t.due_date}`,
          href: LAB_ROUTES.ADMIN_TASKS,
        })),
    },
  };
}

/** Local chart snapshot when Laboratoire is empty. Not live data. */
export function demoDashboardSnapshot(now = new Date()): DashboardModel {
  const iso = now.toISOString();
  const month = iso.slice(0, 7);
  const prev = new Date(now);
  prev.setMonth(prev.getMonth() - 1);
  const prevMonth = prev.toISOString().slice(0, 7);
  const model = buildDashboardModel({
    requests: LAB_SEED_DOSSIERS.map((d, i) => ({
      id: `demo-${i + 1}`,
      status: d.status,
      analysis_kind: d.kind,
      company_name: d.company,
      dossier_number: d.dossier,
    })),
    quotes: [
      { id: 'q1', amount: 3900, status: 'sent', sent_at: iso, followup_due_at: iso, followup_sent_at: null, created_at: `${prevMonth}-04T10:00:00Z`, supplier_amount: 3000, margin_percent: 30, quote_number: 'DEV-SEED-05' },
      { id: 'q2', amount: 2600, status: 'accepted', sent_at: `${prevMonth}-10T10:00:00Z`, followup_due_at: `${prevMonth}-13T10:00:00Z`, followup_sent_at: `${prevMonth}-13T10:00:00Z`, created_at: `${prevMonth}-10T10:00:00Z`, supplier_amount: 2000, margin_percent: 30, quote_number: 'DEV-SEED-11' },
      { id: 'q3', amount: 1950, status: 'draft', sent_at: null, followup_due_at: null, followup_sent_at: null, created_at: iso, supplier_amount: 1500, margin_percent: 30, quote_number: 'DEV-SEED-04' },
    ],
    invoices: [
      { id: 'i1', amount_total: 2600, status: 'PARTIELLEMENT_PAYEE', invoice_date: `${month}-02`, invoice_number: 'FAC-SEED-11' },
      { id: 'i2', amount_total: 1800, status: 'PAYEE', invoice_date: `${prevMonth}-20`, invoice_number: 'FAC-SEED-12' },
    ],
    payments: [
      { amount: 800, paid_at: `${month}-03` },
      { amount: 1800, paid_at: `${prevMonth}-22` },
    ],
    deadlines: [
      { expected_date: `${prevMonth}-01`, actual_date: null, penalty_rate: 1, penalty_amount: 30 },
    ],
    tasks: [
      { id: 't1', title: 'Relancer devis miel', status: 'EN_COURS', due_date: `${prevMonth}-28` },
    ],
    purchaseOrders: [
      { id: 'po1', request_id: 'demo-6', review_status: 'accepted', reference: 'BDC-SEED-06' },
    ],
    reviews: [
      { id: 'rv1', level: 'ai', decision: 'accept', result_id: 'res-9' },
      { id: 'rv2', level: 'technical', decision: 'accept', result_id: 'res-9' },
    ],
    samples: [
      { id: 's1', code: 'ECH-000901-2026-HUILE-D-ARGAN', request_id: 'demo-7', received_at: iso },
    ],
    marginPercent: 30,
    penaltyPercentPerDay: 1,
    now,
  });
  return { ...model, demo: true, empty: true };
}

export function unpaidInvoiceCount(invoices: DashInvoice[]): number {
  return invoices.filter((i) => invoiceProgress(num(i.amount_total), 0).status !== 'PAYEE' && i.status !== 'PAYEE').length;
}
