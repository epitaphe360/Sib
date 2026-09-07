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
  const { activeOrg, userId, role } = useLabSessionStore();
  const orgId = activeOrg?.id;
  const [rows, setRows] = useState<{ id: string; role: LabRole; user_id: string }[]>([]);
  const [invites, setInvites] = useState<{ id: string; email: string; role: string }[]>([]);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<LabRole>('ASSISTANTE');
  const [error, setError] = useState<string | null>(null);
  async function load() {
    if (!orgId) return;
    const [mem, inv] = await Promise.all([
      labSchema().from('organization_members').select('id,role,user_id').eq('organization_id', orgId).is('deleted_at', null),
      labSchema().from('member_invites').select('id,email,role').eq('organization_id', orgId).is('accepted_at', null),
    ]);
    setRows((mem.data ?? []) as typeof rows);
    setInvites((inv.data ?? []) as typeof invites);
  }
  useEffect(() => { void load(); }, [orgId]);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Utilisateurs org</h1>
      <p className="text-xs text-slate-500">Rôles : {LAB_ROLES.join(', ')}. Premier compte sans membre devient SUPER_ADMIN.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {(role === 'SUPER_ADMIN' || role === 'DIRECTION') && (
        <form className="flex flex-wrap gap-2" onSubmit={async (e) => {
          e.preventDefault();
          if (!orgId || !email.includes('@')) return;
          const { error: iErr } = await labSchema().from('member_invites').insert({
            organization_id: orgId, email: email.trim().toLowerCase(), role: inviteRole, invited_by: userId,
          });
          if (iErr) { setError(iErr.message); return; }
          await labSchema().from('email_messages').insert({
            organization_id: orgId, template_key: 'otp', recipient: email.trim(),
            subject: 'Invitation Elitech Lab', body: 'Connectez-vous sur /lab/login pour accepter l’invitation.',
            status: 'queued', provider: 'resend',
          });
          setEmail('');
          await load();
        }}>
          <Input type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="h-10 rounded-lg border px-2 text-sm" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as LabRole)}>
            {LAB_ROLES.map((r) => <option key={r} value={r}>{r === 'RESPONSABLE_VALIDATION' ? 'Zineb / validation' : r}</option>)}
          </select>
          <Button type="submit">Inviter</Button>
        </form>
      )}
      <ul className="rounded-xl border bg-white divide-y">
        {rows.map((r) => <li key={r.id} className="px-4 py-2 text-sm">{r.role} · {r.user_id.slice(0, 8)}</li>)}
      </ul>
      {invites.length > 0 && (
        <p className="text-xs text-slate-500">Invitations : {invites.map((i) => `${i.email} (${i.role})`).join(', ')}</p>
      )}
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
      <h1 className="font-serif text-3xl font-semibold text-[#071422]">Tâches</h1>
      <p className="text-sm text-slate-500">À faire · en attente · en retard · à valider.</p>
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
        {rows.map((r) => {
          const overdue = r.due_date && r.status !== 'TERMINEE' && new Date(r.due_date) < new Date();
          return (
            <li key={r.id} className="px-4 py-2 text-sm flex justify-between">
              <span>{r.title}</span>
              <span className={overdue ? 'text-red-600' : 'text-slate-500'}>
                {overdue ? 'EN RETARD · ' : ''}{r.status}{r.due_date ? ` · ${r.due_date}` : ''}
              </span>
            </li>
          );
        })}
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
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<{ id: string; amount: number; paid_at: string | null; invoice_id: string }[]>([]);
  useEffect(() => {
    if (!orgId) return;
    void labSchema().from('client_payments').select('id,amount,paid_at,invoice_id').eq('organization_id', orgId)
      .order('paid_at', { ascending: false }).limit(80)
      .then(({ data }) => setRows((data ?? []) as typeof rows));
  }, [orgId]);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-[#0b1f3a]">Paiements client</h1>
      <p className="text-sm text-slate-500">Règlements multiples. Saisie sur Factures.</p>
      <ul className="rounded-xl border bg-white divide-y text-sm">
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-2">{r.amount} · {r.paid_at ?? '—'} · facture {r.invoice_id.slice(0, 8)}</li>
        ))}
        {rows.length === 0 && <li className="px-4 py-6 text-slate-400">Aucun paiement</li>}
      </ul>
    </div>
  );
}
