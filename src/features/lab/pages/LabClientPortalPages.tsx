import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { LAB_ROUTES } from '../routes';
import { journeyStepForStatus } from '../lib/journey';
import { LabDossierTrack } from '../components/LabJourney';
import { filterRetained } from '../lib/documentRetention';
import { LabBadge, LabCard, LabEmpty, LabPage } from '../components/LabUi';
import type { DossierStatus } from '../types';

function useOrgId() {
  return useLabSessionStore((s) => s.activeOrg?.id);
}

export function LabClientHomePage() {
  return (
    <LabPage kicker="Portail" title="Votre espace" subtitle="Devis, rapports (1 an), formulaires et suivi de dossier. OTP 10 minutes.">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { to: LAB_ROUTES.CLIENT_REQUESTS, label: 'Mes formulaires', hint: 'Demandes et suivi' },
          { to: LAB_ROUTES.CLIENT_QUOTES, label: 'Mes devis', hint: 'Versions et montants' },
          { to: LAB_ROUTES.CLIENT_REPORTS, label: 'Mes rapports', hint: 'Accessibles 12 mois' },
          { to: LAB_ROUTES.CLIENT_INVOICES, label: 'Mes factures', hint: 'Statuts et règlements' },
        ].map((l) => (
          <Link key={l.to} to={l.to}>
            <LabCard className="transition hover:border-[#c9a45c]">
              <p className="font-medium text-[#071422]">{l.label}</p>
              <p className="mt-1 text-sm text-[#3d4f63]">{l.hint}</p>
            </LabCard>
          </Link>
        ))}
      </div>
    </LabPage>
  );
}

export function LabClientRequestsPage() {
  const orgId = useOrgId();
  const [rows, setRows] = useState<{ id: string; dossier_number: string; status: DossierStatus; product_name: string }[]>([]);
  useEffect(() => {
    if (!orgId) return;
    void labSchema().from('client_requests').select('id,dossier_number,status,product_name').eq('organization_id', orgId).is('deleted_at', null)
      .then(({ data }) => setRows((data ?? []) as typeof rows));
  }, [orgId]);
  return (
    <LabPage title="Mes formulaires" subtitle="Demandes soumises et avancement du dossier maître.">
      <LabCard padding="none">
        <ul className="divide-y divide-[#f0eadb]">
          {rows.map((r) => (
            <li key={r.id} className="px-5 py-4">
              <Link className="font-medium text-cyan-800" to={LAB_ROUTES.CLIENT_REQUEST.replace(':id', r.id)}>{r.dossier_number}</Link>
              <p className="mt-1 text-sm text-[#3d4f63]">{r.product_name}</p>
              <div className="mt-3"><LabDossierTrack step={journeyStepForStatus(r.status)} /></div>
            </li>
          ))}
          {rows.length === 0 && <LabEmpty>Aucune demande</LabEmpty>}
        </ul>
      </LabCard>
    </LabPage>
  );
}

export function LabClientRequestDetailPage() {
  const orgId = useOrgId();
  const [row, setRow] = useState<{ dossier_number: string; status: DossierStatus; product_name: string } | null>(null);
  useEffect(() => {
    const id = window.location.pathname.split('/').pop();
    if (!orgId || !id) return;
    void labSchema().from('client_requests').select('dossier_number,status,product_name').eq('id', id).eq('organization_id', orgId).maybeSingle()
      .then(({ data }) => setRow(data as typeof row));
  }, [orgId]);
  if (!row) return <p className="text-sm text-slate-500">Chargement…</p>;
  return (
    <LabCard>
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9a45c]">{row.dossier_number}</p>
      <h1 className="mt-1 font-serif text-2xl font-semibold text-[#0B1F33]">{row.product_name}</h1>
      <LabBadge tone="gold">{row.status}</LabBadge>
      <div className="mt-5"><LabDossierTrack step={journeyStepForStatus(row.status)} /></div>
    </LabCard>
  );
}

export function LabClientQuotesPage() {
  const orgId = useOrgId();
  const [rows, setRows] = useState<{ id: string; quote_number: string; amount: number; status: string; created_at: string }[]>([]);
  const [days, setDays] = useState(365);
  useEffect(() => {
    if (!orgId) return;
    void Promise.all([
      labSchema().from('quotes').select('id,quote_number,amount,status,created_at').eq('organization_id', orgId).is('deleted_at', null),
      labSchema().from('settings').select('document_retention_days').eq('organization_id', orgId).maybeSingle(),
    ]).then(([q, s]) => {
      const retention = Number(s.data?.document_retention_days ?? 365);
      setDays(retention);
      setRows(filterRetained((q.data ?? []) as typeof rows, retention));
    });
  }, [orgId]);
  return (
    <LabPage title="Mes devis" subtitle={`Documents visibles ${days} jours.`}>
      <LabCard padding="none">
        <ul className="divide-y divide-[#f0eadb]">
          {rows.map((r) => <li key={r.id} className="px-5 py-3 text-sm">{r.quote_number} · {r.amount} · {r.status}</li>)}
          {rows.length === 0 && <LabEmpty>Aucun devis dans la période de conservation</LabEmpty>}
        </ul>
      </LabCard>
    </LabPage>
  );
}

export function LabClientReportsPage() {
  const orgId = useOrgId();
  const [rows, setRows] = useState<{ id: string; sent_at: string | null; created_at: string }[]>([]);
  const [days, setDays] = useState(365);
  useEffect(() => {
    if (!orgId) return;
    void Promise.all([
      labSchema().from('reports').select('id,sent_at,created_at').eq('organization_id', orgId).is('deleted_at', null),
      labSchema().from('settings').select('document_retention_days').eq('organization_id', orgId).maybeSingle(),
    ]).then(([r, s]) => {
      const retention = Number(s.data?.document_retention_days ?? 365);
      setDays(retention);
      setRows(filterRetained((r.data ?? []) as typeof rows, retention));
    });
  }, [orgId]);
  return (
    <LabPage title="Mes rapports" subtitle={`Accessibles ${days} jours après émission.`}>
      <LabCard padding="none">
        <ul className="divide-y divide-[#f0eadb]">
          {rows.map((r) => <li key={r.id} className="px-5 py-3 text-sm">Rapport {r.id.slice(0, 8)} · {r.sent_at ?? r.created_at}</li>)}
          {rows.length === 0 && <LabEmpty>Aucun rapport dans la période</LabEmpty>}
        </ul>
      </LabCard>
    </LabPage>
  );
}

export function LabClientInvoicesPage() {
  const orgId = useOrgId();
  const [rows, setRows] = useState<{ id: string; invoice_number: string; amount_total: number; status: string }[]>([]);
  useEffect(() => {
    if (!orgId) return;
    void labSchema().from('client_invoices').select('id,invoice_number,amount_total,status').eq('organization_id', orgId).is('deleted_at', null)
      .then(({ data }) => setRows((data ?? []) as typeof rows));
  }, [orgId]);
  return (
    <LabPage title="Mes factures">
      <LabCard padding="none">
        <ul className="divide-y divide-[#f0eadb]">
          {rows.map((r) => (
            <li key={r.id} className="flex justify-between px-5 py-3 text-sm">
              <span>{r.invoice_number}</span>
              <LabBadge tone={r.status === 'PAYEE' ? 'green' : r.status === 'IMPAYEE' ? 'rose' : 'amber'}>{r.status}</LabBadge>
            </li>
          ))}
          {rows.length === 0 && <LabEmpty>Aucune facture</LabEmpty>}
        </ul>
      </LabCard>
    </LabPage>
  );
}

export function LabClientProfilePage() {
  const email = useLabSessionStore((s) => s.email);
  return <LabCard><p className="text-sm">{email}</p></LabCard>;
}
