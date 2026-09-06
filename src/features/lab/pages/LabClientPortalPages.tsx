import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { LAB_ROUTES } from '../routes';

function useOrgId() {
  return useLabSessionStore((s) => s.activeOrg?.id);
}

export function LabClientHomePage() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {[
        { to: LAB_ROUTES.CLIENT_REQUESTS, label: 'Demandes' },
        { to: LAB_ROUTES.CLIENT_QUOTES, label: 'Devis' },
        { to: LAB_ROUTES.CLIENT_REPORTS, label: 'Rapports (1 an)' },
        { to: LAB_ROUTES.CLIENT_INVOICES, label: 'Factures' },
      ].map((l) => (
        <Link key={l.to} to={l.to} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-cyan-400">{l.label}</Link>
      ))}
    </div>
  );
}

export function LabClientRequestsPage() {
  const orgId = useOrgId();
  const [rows, setRows] = useState<{ id: string; dossier_number: string; status: string; product_name: string }[]>([]);
  useEffect(() => {
    if (!orgId) return;
    void labSchema().from('client_requests').select('id,dossier_number,status,product_name').eq('organization_id', orgId).is('deleted_at', null)
      .then(({ data }) => setRows((data ?? []) as typeof rows));
  }, [orgId]);
  return (
    <div>
      <h1 className="text-xl font-semibold text-[#0b1f3a] mb-3">Mes demandes</h1>
      <ul className="rounded-xl border bg-white divide-y">
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-3 text-sm">
            <Link className="text-cyan-700" to={LAB_ROUTES.CLIENT_REQUEST.replace(':id', r.id)}>{r.dossier_number}</Link>
            <span className="text-slate-500"> · {r.product_name} · {r.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LabClientRequestDetailPage() {
  const orgId = useOrgId();
  const [text, setText] = useState('Chargement…');
  useEffect(() => {
    const id = window.location.pathname.split('/').pop();
    if (!orgId || !id) return;
    void labSchema().from('client_requests').select('dossier_number,status,product_name,company_name').eq('id', id).eq('organization_id', orgId).maybeSingle()
      .then(({ data }) => setText(data ? `${data.dossier_number} · ${data.status} · ${data.product_name}` : 'Introuvable'));
  }, [orgId]);
  return <div className="rounded-xl border bg-white p-6">{text}</div>;
}

export function LabClientQuotesPage() {
  const orgId = useOrgId();
  const [rows, setRows] = useState<{ id: string; quote_number: string; amount: number; status: string }[]>([]);
  useEffect(() => {
    if (!orgId) return;
    void labSchema().from('quotes').select('id,quote_number,amount,status').eq('organization_id', orgId).is('deleted_at', null)
      .then(({ data }) => setRows((data ?? []) as typeof rows));
  }, [orgId]);
  return (
    <ul className="rounded-xl border bg-white divide-y">
      {rows.map((r) => <li key={r.id} className="px-4 py-3 text-sm">{r.quote_number} · {r.amount} · {r.status}</li>)}
    </ul>
  );
}

export function LabClientReportsPage() {
  const orgId = useOrgId();
  const [rows, setRows] = useState<{ id: string; sent_at: string | null; created_at: string }[]>([]);
  useEffect(() => {
    if (!orgId) return;
    void labSchema().from('reports').select('id,sent_at,created_at').eq('organization_id', orgId).is('deleted_at', null)
      .then(({ data }) => setRows((data ?? []) as typeof rows));
  }, [orgId]);
  return (
    <ul className="rounded-xl border bg-white divide-y">
      {rows.map((r) => <li key={r.id} className="px-4 py-3 text-sm">Rapport {r.id.slice(0, 8)} · {r.sent_at ?? r.created_at}</li>)}
    </ul>
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
    <ul className="rounded-xl border bg-white divide-y">
      {rows.map((r) => <li key={r.id} className="px-4 py-3 text-sm">{r.invoice_number} · {r.amount_total} · {r.status}</li>)}
    </ul>
  );
}

export function LabClientProfilePage() {
  const email = useLabSessionStore((s) => s.email);
  return <div className="rounded-xl border bg-white p-6 text-sm">{email}</div>;
}
