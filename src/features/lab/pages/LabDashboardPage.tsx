import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ArrowUpRight, Bell, CheckCircle2, Clock3, PackageSearch } from 'lucide-react';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { LAB_ROUTES } from '../routes';
import { LabJourneyGrid, LabJourneyRail } from '../components/LabJourney';
import { LabBtn } from '../components/LabUi';
import { LAB_THEME } from '../theme/tokens';
import {
  buildDashboardModel,
  demoDashboardSnapshot,
  hrefForJourneyStep,
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
  type TrackingItem,
} from '../lib/dashboardStats';

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

function TrackList({
  title,
  items,
  empty,
  href,
}: {
  title: string;
  items: TrackingItem[];
  empty: string;
  href: string;
}) {
  return (
    <section className="rounded-3xl border border-[#e8e2d4] bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(7,20,34,0.45)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="lab-display text-xl font-semibold text-[#0B1F33]">{title}</h2>
        <Link to={href} className="text-xs text-cyan-800 hover:underline">Ouvrir</Link>
      </div>
      <ul className="divide-y divide-[#f0eadb]">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={item.href} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-cyan-800">
              <span>
                <span className="font-medium text-[#0b1f3a]">{item.label}</span>
                <span className="mt-0.5 block text-xs text-[#3d4f63]">{item.meta}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-amber-600" />
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="py-6 text-center text-sm text-[#3d4f63]">{empty}</li>}
      </ul>
    </section>
  );
}

export default function LabDashboardPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [model, setModel] = useState<DashboardModel>(() => demoDashboardSnapshot());
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const [req, quotes, inv, pay, late, tasks, pos, reviews, samples, rule, settings] = await Promise.all([
          labSchema().from('client_requests').select('id,status,analysis_kind,company_name,dossier_number').eq('organization_id', orgId).is('deleted_at', null),
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
        const built = buildDashboardModel({
          requests: (req.data ?? []) as DashRequest[],
          quotes: (quotes.data ?? []) as DashQuote[],
          invoices: (inv.data ?? []) as DashInvoice[],
          payments: (pay.data ?? []) as DashPayment[],
          deadlines: (late.data ?? []) as DashDeadline[],
          tasks: (tasks.data ?? []) as DashTask[],
          purchaseOrders: (pos.data ?? []) as DashPo[],
          reviews: (reviews.data ?? []) as DashReview[],
          samples: (samples.data ?? []) as DashSample[],
          marginPercent: Number(rule.data?.margin_percent ?? 30),
          penaltyPercentPerDay: Number(settings.data?.penalty_percent_per_day ?? 1),
        });
        if (built.empty) {
          setModel({ ...demoDashboardSnapshot(), empty: true, demo: true });
          setLive(false);
        } else {
          setModel(built);
          setLive(true);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Chargement impossible');
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  const pie = useMemo(() => [
    { name: 'Réussis', value: model.successRate, fill: CHART.cyan },
    { name: 'Autres', value: Math.max(0, 100 - model.successRate), fill: 'rgba(255,255,255,0.12)' },
  ], [model.successRate]);

  const marginBars = useMemo(() => [
    { name: 'Réalisée', value: model.realizedMargin, fill: CHART.gold },
    { name: 'Cible 30%', value: model.targetMargin, fill: CHART.cyan },
  ], [model.realizedMargin, model.targetMargin]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-700">Étape 10 · Pilotage</p>
          <h1 className="lab-display text-4xl font-semibold text-[#0B1F33]">Tableau de bord</h1>
          <p className="mt-1 text-sm text-[#3d4f63]">
            {live
              ? 'Données Laboratoire — suivi, relances et KPI.'
              : 'Jeu de démo local (Laboratoire vide). Les graphes restent lisibles. Seed : npm run lab:seed'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={LAB_ROUTES.REQUEST_FORM}><LabBtn tone="gold">Nouvelle demande</LabBtn></Link>
          <Link to={LAB_ROUTES.ADMIN_QUOTES}><LabBtn tone="cyan">Relances devis</LabBtn></Link>
          <Link to={LAB_ROUTES.ADMIN_VALIDATIONS} className="inline-flex h-10 items-center rounded-xl border border-[#d4af37] bg-white px-4 text-sm text-[#071422]">Validations</Link>
          <Link to={LAB_ROUTES.ADMIN_TASKS} className="inline-flex h-10 items-center rounded-xl border border-[#d4af37] bg-white px-4 text-sm text-[#071422]">Tâches</Link>
        </div>
      </div>

      {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      <LabJourneyRail tone="light" status="NEW_REQUEST" hrefForStep={hrefForJourneyStep} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {model.kpis.map((k) => (
          <Link key={k.label} to={k.to} className="lab-kpi-tile rounded-2xl p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-300">{k.label}</p>
            <p className="lab-display mt-2 text-4xl text-white">{k.value}</p>
            {k.hint && <p className="mt-1 text-xs text-white/50">{k.hint}</p>}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {model.buckets.map((b) => (
          <Link key={b.key} to={b.href} className="rounded-2xl border border-[#d4af37]/40 bg-[#0b1f3a] p-4 text-white transition hover:border-cyan-300">
            <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-300">{b.label}</p>
            <p className="lab-display mt-2 text-3xl">{b.n}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Pipeline 12 étapes" hint="dossiers">
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
        <ChartCard title="Avancement par analyse" hint="lab / type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={model.progressByKind} layout="vertical">
              <CartesianGrid stroke={CHART.grid} horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" allowDecimals={false} fontSize={11} />
              <YAxis type="category" dataKey="kind" stroke="#94a3b8" width={120} fontSize={10} />
              <Tooltip contentStyle={{ background: '#071422', border: '1px solid rgba(34,211,238,0.3)', color: '#fff' }} />
              <Bar dataKey="count" fill={CHART.navy} radius={[0, 6, 6, 0]} />
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

      <div className="grid gap-4 lg:grid-cols-2">
        <TrackList title="Dossiers en cours" items={model.tracking.inProgress} empty="Aucun dossier ouvert" href={LAB_ROUTES.ADMIN_REQUESTS} />
        <TrackList title="Relances devis en retard" items={model.tracking.followupsOverdue} empty="Aucune relance due" href={LAB_ROUTES.ADMIN_QUOTES} />
        <TrackList title="BDC sans échantillons" items={model.tracking.poAwaitingSamples} empty="Aucun BDC en attente d’échantillons" href={LAB_ROUTES.ADMIN_ORDERS} />
        <TrackList title="Revues en attente" items={model.tracking.reviewsPending} empty="Aucune revue pendante" href={LAB_ROUTES.ADMIN_VALIDATIONS} />
        <TrackList title="Tâches en retard" items={model.tracking.tasksOverdue} empty="Aucune tâche en retard" href={LAB_ROUTES.ADMIN_TASKS} />
        <section className="rounded-3xl border border-[#e8e2d4] bg-[#071422] p-5 text-white">
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200">Actions rapides</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              { to: LAB_ROUTES.ADMIN_CALLS, label: 'Suivi appels', icon: Bell },
              { to: LAB_ROUTES.ADMIN_SAMPLES, label: 'Réception ECH', icon: PackageSearch },
              { to: LAB_ROUTES.ADMIN_DEADLINES, label: 'Délais / pénalités', icon: Clock3 },
              { to: LAB_ROUTES.ADMIN_INVOICES, label: 'Factures', icon: CheckCircle2 },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm hover:border-cyan-300">
                <a.icon className="h-4 w-4 text-cyan-300" />
                {a.label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="rounded-3xl bg-[#071422] p-6 text-white">
        <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200">Parcours officiel</p>
        <h2 className="lab-display mt-1 mb-4 text-3xl text-white">Les 12 étapes</h2>
        <LabJourneyGrid compact />
      </div>
    </div>
  );
}
