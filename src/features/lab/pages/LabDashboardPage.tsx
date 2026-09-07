import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { LAB_ROUTES } from '../routes';
import { LabBtn } from '../components/LabUi';
import { LAB_THEME } from '../theme/tokens';
import {
  buildDashboardModel,
  demoDashboardSnapshot,
  type DashDeadline,
  type DashInvoice,
  type DashPayment,
  type DashPo,
  type DashQuote,
  type DashRequest,
  type DashReview,
  type DashSample,
  type DashTask,
  type DashboardModel,
} from '../lib/dashboardStats';
import {
  QUEUE_BUCKETS,
  buildOperatorQueue,
  type QueueBucketKey,
} from '../lib/dossierPhases';

const CHART = {
  gold: LAB_THEME.gold,
  cyan: LAB_THEME.cyan,
  navy: '#8eb4d8',
  rose: '#fb7185',
  grid: 'rgba(255,255,255,0.08)',
};

function ChartCard({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="lab-dash-panel rounded-3xl p-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="lab-display text-2xl text-white">{title}</h2>
        {hint && <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-300">{hint}</p>}
      </div>
      <div className="h-64">{children}</div>
    </section>
  );
}

function secondsAgo(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 5) return 'à l’instant';
  return `il y a ${s} s`;
}

export default function LabDashboardPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [model, setModel] = useState<DashboardModel>(() => demoDashboardSnapshot());
  const [queueSource, setQueueSource] = useState<DashRequest[]>([]);
  const [lateIds, setLateIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(() => Date.now());
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<QueueBucketKey | 'all'>('all');

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;

    async function load() {
      try {
        const [req, quotes, inv, pay, late, tasks, pos, reviews, samples, rule, settings] = await Promise.all([
          labSchema().from('client_requests').select('id,status,analysis_kind,company_name,dossier_number,product_name,execution_channel').eq('organization_id', orgId).is('deleted_at', null),
          labSchema().from('quotes').select('id,amount,status,sent_at,followup_due_at,followup_sent_at,created_at,quote_number').eq('organization_id', orgId).is('deleted_at', null),
          labSchema().from('client_invoices').select('id,amount_total,status,invoice_date,invoice_number').eq('organization_id', orgId).is('deleted_at', null),
          labSchema().from('client_payments').select('amount,paid_at').eq('organization_id', orgId),
          labSchema().from('supplier_deadlines').select('expected_date,actual_date,penalty_amount,penalty_rate,request_id').eq('organization_id', orgId),
          labSchema().from('tasks').select('id,title,status,due_date').eq('organization_id', orgId).is('deleted_at', null),
          labSchema().from('purchase_orders').select('id,request_id,review_status,reference').eq('organization_id', orgId).is('deleted_at', null),
          labSchema().from('result_reviews').select('id,level,decision,result_id').eq('organization_id', orgId),
          labSchema().from('samples').select('id,code,request_id,received_at').eq('organization_id', orgId).is('deleted_at', null),
          labSchema().from('pricing_rules').select('margin_percent').eq('organization_id', orgId).eq('is_active', true).maybeSingle(),
          labSchema().from('settings').select('penalty_percent_per_day').eq('organization_id', orgId).maybeSingle(),
        ]);
        if (cancelled) return;
        const firstErr = [req, quotes, inv, late].find((q) => q.error)?.error;
        if (firstErr) throw firstErr;
        const requests = (req.data ?? []) as DashRequest[];
        const deadlines = (late.data ?? []) as DashDeadline[];
        const now = new Date();
        const built = buildDashboardModel({
          requests,
          quotes: (quotes.data ?? []) as DashQuote[],
          invoices: (inv.data ?? []) as DashInvoice[],
          payments: (pay.data ?? []) as DashPayment[],
          deadlines,
          tasks: (tasks.data ?? []) as DashTask[],
          purchaseOrders: (pos.data ?? []) as DashPo[],
          reviews: (reviews.data ?? []) as DashReview[],
          samples: (samples.data ?? []) as DashSample[],
          marginPercent: Number(rule.data?.margin_percent ?? 30),
          penaltyPercentPerDay: Number(settings.data?.penalty_percent_per_day ?? 1),
        });
        const lateRequestIds = deadlines
          .filter((d) => !d.actual_date && d.request_id && new Date(d.expected_date) < now)
          .map((d) => d.request_id as string);
        if (built.empty) {
          const demo = demoDashboardSnapshot();
          setModel({ ...demo, empty: true, demo: true });
          setQueueSource(demo.tracking.inProgress.map((t) => ({
            id: t.id,
            status: 'NEW_REQUEST',
            dossier_number: t.label,
            company_name: t.meta,
          })));
          setLateIds([]);
          setLive(false);
        } else {
          setModel(built);
          setQueueSource(requests);
          setLateIds(lateRequestIds);
          setLive(true);
        }
        setFetchedAt(Date.now());
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Chargement impossible');
      }
    }

    void load();
    const poll = window.setInterval(() => { void load(); }, 15_000);
    const clock = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, [orgId]);

  const queue = useMemo(() => {
    if (live) return buildOperatorQueue(queueSource, lateIds);
    return buildOperatorQueue(
      (model.tracking.inProgress.length
        ? model.tracking.inProgress.map((t) => ({
          id: t.href.split('/').pop() || t.id,
          status: t.meta.includes('NEW_REQUEST') ? 'NEW_REQUEST' : 'QUALIFICATION',
          dossier_number: t.label,
          company_name: t.meta,
        }))
        : [
          { id: 'demo-1', status: 'NEW_REQUEST', dossier_number: 'DEM-SEED-01', company_name: 'Atlas Oils', product_name: 'Huile d’argan' },
          { id: 'demo-2', status: 'QUALIFICATION', dossier_number: 'DEM-SEED-02', company_name: 'Oasis Food' },
          { id: 'demo-5', status: 'CLIENT_QUOTE_SENT', dossier_number: 'DEM-SEED-05', company_name: 'Oasis Food' },
          { id: 'demo-6', status: 'WAITING_SAMPLES', dossier_number: 'DEM-SEED-06', company_name: 'Coopérative Souss' },
          { id: 'demo-9', status: 'FINAL_REVIEW', dossier_number: 'DEM-SEED-09', company_name: 'Coopérative Souss' },
        ]),
      ['demo-6'],
    );
  }, [live, queueSource, lateIds, model.tracking.inProgress]);

  const counts = useMemo(() => {
    const n = { late: 0, todo: 0, wait: 0, validate: 0 };
    for (const item of queue) n[item.bucket] += 1;
    return n;
  }, [queue]);

  const visible = filter === 'all' ? queue : queue.filter((q) => q.bucket === filter);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof visible>();
    for (const item of visible) {
      const key = `${item.bucket}-${item.phase}`;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [visible]);

  const pie = useMemo(() => [
    { name: 'Réussis', value: model.successRate, fill: CHART.cyan },
    { name: 'Autres', value: Math.max(0, 100 - model.successRate), fill: 'rgba(255,255,255,0.12)' },
  ], [model.successRate]);

  const marginBars = useMemo(() => [
    { name: 'Réalisée', value: model.realizedMargin, fill: CHART.gold },
    { name: 'Cible 30%', value: model.targetMargin, fill: CHART.cyan },
  ], [model.realizedMargin, model.targetMargin]);

  void tick;

  return (
    <div className="lab-editorial space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="lab-live-dot">{live ? `Temps réel · ${secondsAgo(fetchedAt)}` : 'Jeu de démo local'}</p>
          <Link to={LAB_ROUTES.REQUEST_FORM}><LabBtn tone="gold">Nouvelle demande</LabBtn></Link>
        </div>
        <h1 className="lab-display text-4xl font-semibold text-[#0B1F33] sm:text-5xl">File d’attente</h1>
        <p className="max-w-xl text-sm leading-relaxed text-[#3d4f63]">
          Un dossier, une phase, une action. Ouvrir envoie au wizard — pas à une liste satellite.
        </p>
        <div className="lab-hairline" />
      </header>

      {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {QUEUE_BUCKETS.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => setFilter((cur) => (cur === b.key ? 'all' : b.key))}
            className={`min-h-16 rounded-2xl border px-3 py-3 text-left ${
              filter === b.key ? 'border-[#d4af37] bg-white' : 'border-[#c9bea8] bg-[#fffdf8]'
            }`}
          >
            <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${b.key === 'late' ? 'lab-bucket-late' : 'text-[#3d4f63]'}`}>
              {b.label}
            </p>
            <p className={`lab-display mt-1 text-3xl ${b.key === 'late' ? 'lab-bucket-late' : 'text-[#0B1F33]'}`}>{counts[b.key]}</p>
          </button>
        ))}
      </div>

      <section>
        {grouped.map(([key, items]) => (
          <div key={key} className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b4e0b]">
              Phase {items[0].phase} · {items[0].phaseTitle}
            </p>
            {items.map((item) => (
              <Link key={item.id} to={item.href} className="lab-queue-card">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0e5f73]">{item.dossier}</p>
                  <span className="lab-queue-open text-xs font-semibold text-[#6b4e0b]">Ouvrir</span>
                </div>
                <p className="lab-display mt-1 text-2xl text-[#0B1F33]">{item.company}</p>
                {item.product && <p className="text-sm text-[#3d4f63]">{item.product}</p>}
                <p className="mt-2 text-sm leading-relaxed text-[#0B1F33]">{item.nextAction}</p>
              </Link>
            ))}
          </div>
        ))}
        {visible.length === 0 && (
          <p className="py-10 text-center text-sm text-[#3d4f63]">Rien dans ce seau.</p>
        )}
      </section>

      <details className="lab-pilotage border-t border-[#d4af37]/40 pt-2">
        <summary>Pilotage direction</summary>
        <p className="mb-4 text-sm text-[#3d4f63]">KPI et graphes — repliés pour laisser la file d’abord.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {model.kpis.slice(0, 4).map((k) => (
            <Link key={k.label} to={k.to} className="lab-kpi-tile rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-300">{k.label}</p>
              <p className="lab-display mt-2 text-4xl text-white">{k.value}</p>
            </Link>
          ))}
        </div>
        <div className="mt-4 grid gap-4">
          <ChartCard title="Pipeline 12 étapes" hint="infographie">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={model.pipeline.map((s) => ({ ...s, label: String(s.n).padStart(2, '0') }))}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" allowDecimals={false} fontSize={11} />
                <Tooltip contentStyle={{ background: '#071422', border: '1px solid rgba(212,175,55,0.3)', color: '#fff' }} />
                <Bar dataKey="count" fill={CHART.gold} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Devis" hint="montant · mois">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={model.quotesByMonth}>
                <CartesianGrid stroke={CHART.grid} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#071422', border: '1px solid rgba(34,211,238,0.3)', color: '#fff' }} />
                <Area type="monotone" dataKey="amount" stroke={CHART.cyan} fill="rgba(34,211,238,0.25)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Transactions" hint="facturé / encaissé">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={model.transactionsByMonth}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#071422', border: '1px solid rgba(212,175,55,0.3)', color: '#fff' }} />
                <Legend />
                <Bar dataKey="invoiced" name="Facturé" fill={CHART.gold} radius={[6, 6, 0, 0]} />
                <Bar dataKey="paid" name="Encaissé" fill={CHART.cyan} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Taux de succès" hint={`${model.successRate} %`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Legend />
                <Tooltip contentStyle={{ background: '#071422', border: '1px solid rgba(34,211,238,0.3)', color: '#fff' }} />
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                  {pie.map((p) => <Cell key={p.name} fill={p.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Marge & pénalités" hint={`retards ${model.lateCount}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...marginBars, { name: 'Pénalités', value: model.penaltyTotal, fill: CHART.rose }]}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#071422', border: '1px solid rgba(251,113,133,0.3)', color: '#fff' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {[...marginBars, { fill: CHART.rose }].map((c, i) => <Cell key={i} fill={c.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </details>
    </div>
  );
}
