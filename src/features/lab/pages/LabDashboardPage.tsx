import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { LAB_ROUTES } from '../routes';
import { LAB_JOURNEY, journeyStepForStatus } from '../lib/journey';
import { LabJourneyGrid, LabJourneyRail } from '../components/LabJourney';
import type { DossierStatus } from '../types';

const TASK_BUCKETS = [
  { key: 'todo', label: 'À faire', match: (s: string) => ['NEW_REQUEST', 'QUALIFICATION', 'CLIENT_QUOTE_DRAFT'].includes(s) },
  { key: 'wait', label: 'En attente', match: (s: string) => ['WAITING_SUPPLIER_QUOTES', 'WAITING_CLIENT_RESPONSE', 'WAITING_SAMPLES', 'ANALYSIS_IN_PROGRESS'].includes(s) },
  { key: 'late', label: 'En retard', match: (_s: string, late: boolean) => late },
  { key: 'validate', label: 'À valider', match: (s: string) => ['AI_REVIEW', 'TECHNICAL_REVIEW', 'FINAL_REVIEW'].includes(s) },
];

export default function LabDashboardPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<{ status: string; id: string }[]>([]);
  const [finance, setFinance] = useState({ unpaid: 0, margin: 30, quotes: 0, invoices: 0 });
  const [lateCount, setLateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const [{ data, error: qErr }, inv, rule, quotes, late] = await Promise.all([
          labSchema().from('client_requests').select('id,status').eq('organization_id', orgId).is('deleted_at', null),
          labSchema().from('client_invoices').select('status').eq('organization_id', orgId).is('deleted_at', null),
          labSchema().from('pricing_rules').select('margin_percent').eq('organization_id', orgId).eq('is_active', true).maybeSingle(),
          labSchema().from('quotes').select('id').eq('organization_id', orgId).is('deleted_at', null),
          labSchema().from('supplier_deadlines').select('id,expected_date,actual_date').eq('organization_id', orgId).is('deleted_at', null),
        ]);
        if (qErr) throw qErr;
        if (cancelled) return;
        setRows((data ?? []) as { status: string; id: string }[]);
        const unpaid = (inv.data ?? []).filter((i) => i.status !== 'PAYEE').length;
        const lateN = (late.data ?? []).filter((d) => !d.actual_date && new Date(d.expected_date) < new Date()).length;
        setLateCount(lateN);
        setFinance({
          unpaid,
          margin: Number(rule.data?.margin_percent ?? 30),
          quotes: quotes.data?.length ?? 0,
          invoices: inv.data?.length ?? 0,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Chargement impossible');
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: rows.length };
    for (const row of rows) next[row.status] = (next[row.status] ?? 0) + 1;
    return next;
  }, [rows]);

  const buckets = TASK_BUCKETS.map((b) => ({
    ...b,
    n: rows.filter((r) => b.match(r.status, false)).length + (b.key === 'late' ? lateCount : 0),
  }));

  const stepCounts = LAB_JOURNEY.map((step) => ({
    n: step.n,
    title: step.title,
    count: rows.filter((r) => journeyStepForStatus(r.status as DossierStatus) === step.n).length,
  }));

  const kpis = [
    { label: 'Dossiers', value: counts.all ?? 0, to: LAB_ROUTES.ADMIN_REQUESTS },
    { label: 'Devis', value: finance.quotes, to: LAB_ROUTES.ADMIN_QUOTES },
    { label: 'Analyses en cours', value: counts.ANALYSIS_IN_PROGRESS ?? 0, to: LAB_ROUTES.ADMIN_ANALYSES },
    { label: 'Rapports', value: counts.REPORT_SENT ?? 0, to: LAB_ROUTES.ADMIN_REPORTS },
    { label: 'Factures', value: finance.invoices, to: LAB_ROUTES.ADMIN_INVOICES },
    { label: 'Impayés', value: finance.unpaid, to: LAB_ROUTES.ADMIN_INVOICES },
    { label: 'Marge %', value: finance.margin, to: LAB_ROUTES.ADMIN_SETTINGS },
    { label: 'Retards', value: lateCount, to: LAB_ROUTES.ADMIN_DEADLINES },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-700">Étape 10 · Pilotage</p>
        <h1 className="lab-display text-4xl text-[#0b1f3a]">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">Situation du laboratoire en quelques secondes.</p>
      </div>
      {error && <p className="text-sm text-amber-700">{error}</p>}
      <LabJourneyRail tone="light" status="NEW_REQUEST" hrefForStep={(n) => {
        if (n === 1 || n === 2) return LAB_ROUTES.ADMIN_REQUESTS;
        if (n === 3) return LAB_ROUTES.ADMIN_CONSULTATIONS;
        if (n === 4) return LAB_ROUTES.ADMIN_QUOTES;
        if (n === 5) return LAB_ROUTES.ADMIN_SAMPLES;
        if (n === 6) return LAB_ROUTES.ADMIN_ANALYSES;
        if (n === 7) return LAB_ROUTES.ADMIN_VALIDATIONS;
        if (n === 8) return LAB_ROUTES.ADMIN_REPORTS;
        if (n === 11) return LAB_ROUTES.ADMIN_INVOICES;
        if (n === 12) return LAB_ROUTES.ADMIN_BACKUPS;
        return undefined;
      }} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} to={k.to} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-cyan-400">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{k.label}</p>
            <p className="lab-display mt-2 text-4xl text-[#0b1f3a]">{k.value}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {buckets.map((b) => (
          <div key={b.key} className="rounded-2xl border border-slate-200 bg-[#0b1f3a] p-4 text-white">
            <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-300">{b.label}</p>
            <p className="lab-display mt-2 text-3xl">{b.n}</p>
          </div>
        ))}
      </div>
      <div>
        <h2 className="lab-display mb-3 text-2xl text-[#0b1f3a]">Avancement par étape</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {stepCounts.map((s) => (
            <div key={s.n} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="text-sm text-slate-600">{String(s.n).padStart(2, '0')} · {s.title}</span>
              <span className="text-lg font-semibold text-[#0b1f3a]">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl bg-[#071422] p-6 text-white">
        <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200">Parcours officiel</p>
        <h2 className="lab-display mt-1 mb-4 text-3xl">Les 12 étapes</h2>
        <LabJourneyGrid compact />
      </div>
    </div>
  );
}
