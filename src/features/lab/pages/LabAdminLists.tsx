import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { taskSchema } from '../schemas';
import { LAB_ROLES, type LabRole } from '../types';

export function LabClientsPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<{ id: string; company_name: string; email: string | null }[]>([]);
  const [name, setName] = useState('');
  useEffect(() => {
    if (!orgId) return;
    void labSchema().from('clients').select('id,company_name,email').eq('organization_id', orgId).is('deleted_at', null)
      .then(({ data }) => setRows((data ?? []) as typeof rows));
  }, [orgId]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Clients</h1>
      <form className="flex gap-2" onSubmit={async (e) => {
        e.preventDefault();
        if (!orgId || name.trim().length < 2) return;
        await labSchema().from('clients').insert({ organization_id: orgId, company_name: name.trim() });
        setName('');
        const { data } = await labSchema().from('clients').select('id,company_name,email').eq('organization_id', orgId).is('deleted_at', null);
        setRows((data ?? []) as typeof rows);
      }}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Société" />
        <Button type="submit">Ajouter</Button>
      </form>
      <ul className="rounded-xl border bg-white divide-y">{rows.map((r) => <li key={r.id} className="px-4 py-2 text-sm">{r.company_name}</li>)}</ul>
    </div>
  );
}

export function LabUsersPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<{ id: string; role: LabRole; user_id: string }[]>([]);
  useEffect(() => {
    if (!orgId) return;
    void labSchema().from('organization_members').select('id,role,user_id').eq('organization_id', orgId).is('deleted_at', null)
      .then(({ data }) => setRows((data ?? []) as typeof rows));
  }, [orgId]);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Utilisateurs org</h1>
      <p className="text-xs text-slate-500">Rôles : {LAB_ROLES.join(', ')}</p>
      <ul className="rounded-xl border bg-white divide-y">
        {rows.map((r) => <li key={r.id} className="px-4 py-2 text-sm">{r.role} · {r.user_id.slice(0, 8)}</li>)}
      </ul>
    </div>
  );
}

export function LabTasksPage() {
  const { activeOrg, userId } = useLabSessionStore();
  const orgId = activeOrg?.id;
  const form = useForm({ defaultValues: { title: '', priority: 'normal', due_date: '' } });
  const [rows, setRows] = useState<{ id: string; title: string; status: string; due_date: string | null }[]>([]);
  async function load() {
    if (!orgId) return;
    const { data } = await labSchema().from('tasks').select('id,title,status,due_date').eq('organization_id', orgId).is('deleted_at', null);
    setRows((data ?? []) as typeof rows);
  }
  useEffect(() => { void load(); }, [orgId]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Tâches</h1>
      <form className="flex gap-2" onSubmit={form.handleSubmit(async (v) => {
        if (!orgId) return;
        const parsed = taskSchema.safeParse(v);
        if (!parsed.success) return;
        await labSchema().from('tasks').insert({
          organization_id: orgId, title: parsed.data.title, priority: parsed.data.priority,
          due_date: parsed.data.due_date || null, created_by: userId, assigned_to: userId, status: 'NOUVELLE',
        });
        form.reset();
        await load();
      })}>
        <Input placeholder="Titre" {...form.register('title')} />
        <Button type="submit">Créer</Button>
      </form>
      <ul className="rounded-xl border bg-white divide-y">
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-2 text-sm flex justify-between">
            <span>{r.title}</span>
            <span className="text-slate-500">{r.status}{r.due_date ? ` · ${r.due_date}` : ''}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LabAuditPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<{ id: string; action: string; entity_type: string; created_at: string }[]>([]);
  useEffect(() => {
    if (!orgId) return;
    void labSchema().from('audit_logs').select('id,action,entity_type,created_at').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => setRows((data ?? []) as typeof rows));
  }, [orgId]);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Audit</h1>
      <ul className="rounded-xl border bg-white divide-y text-sm">
        {rows.map((r) => <li key={r.id} className="px-4 py-2">{r.created_at} · {r.action} · {r.entity_type}</li>)}
      </ul>
    </div>
  );
}

export function LabBackupsPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<{ id: string; kind: string; status: string; created_at: string }[]>([]);
  async function load() {
    if (!orgId) return;
    const { data } = await labSchema().from('backup_runs').select('id,kind,status,created_at').eq('organization_id', orgId).order('created_at', { ascending: false });
    setRows((data ?? []) as typeof rows);
  }
  useEffect(() => { void load(); }, [orgId]);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Sauvegardes</h1>
      <p className="text-sm text-slate-500">Supabase natif + Drive hebdo. Procédure : docs/RESTORE_TEST.md</p>
      <Button type="button" onClick={async () => {
        if (!orgId) return;
        await labSchema().from('backup_runs').insert({ organization_id: orgId, kind: 'weekly_drive', status: 'planned', notes: 'Restore test requis' });
        await load();
      }}>Planifier backup Drive</Button>
      <ul className="rounded-xl border bg-white divide-y text-sm">
        {rows.map((r) => <li key={r.id} className="px-4 py-2">{r.created_at} · {r.kind} · {r.status}</li>)}
      </ul>
    </div>
  );
}

export function LabReportTemplatesPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<{ id: string; name: string; analysis_kind: string }[]>([]);
  useEffect(() => {
    if (!orgId) return;
    void labSchema().from('report_templates').select('id,name,analysis_kind').eq('organization_id', orgId).is('deleted_at', null)
      .then(({ data }) => setRows((data ?? []) as typeof rows));
  }, [orgId]);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Gabarits</h1>
      <ul className="rounded-xl border bg-white divide-y text-sm">
        {rows.map((r) => <li key={r.id} className="px-4 py-2">{r.analysis_kind} · {r.name}</li>)}
      </ul>
    </div>
  );
}

export function LabPaymentsPage() {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="text-xl font-semibold text-[#0b1f3a]">Paiements</h1>
      <p className="text-sm text-slate-500 mt-2">Saisie des règlements sur la page Factures (paiements multiples).</p>
    </div>
  );
}
