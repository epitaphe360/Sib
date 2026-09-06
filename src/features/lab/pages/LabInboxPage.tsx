import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { classifyInboundEmail } from '../lib/emailQueue';

export default function LabInboxPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<{ id: string; message_id: string; classification: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({ defaultValues: { message_id: '', subject: '', body: '' } });

  async function load() {
    if (!orgId) return;
    const { data } = await labSchema().from('processed_emails')
      .select('id,message_id,classification').eq('organization_id', orgId).order('processed_at', { ascending: false }).limit(50);
    setRows((data ?? []) as typeof rows);
  }
  useEffect(() => { void load(); }, [orgId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">E-mails entrants</h1>
      <p className="text-xs text-slate-500">Dédupliqués par message_id. Classification : BDC / devis / rapport / autre.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form className="rounded-xl border bg-white p-4 space-y-2" onSubmit={form.handleSubmit(async (v) => {
        if (!orgId) return;
        const classification = classifyInboundEmail(v.subject, v.body);
        const { error: iErr } = await labSchema().from('processed_emails').insert({
          organization_id: orgId, message_id: v.message_id, classification,
        });
        if (iErr) { setError(iErr.message); return; }
        form.reset();
        await load();
      })}>
        <Input placeholder="message_id" {...form.register('message_id', { required: true })} />
        <Input placeholder="Sujet" {...form.register('subject')} />
        <Input placeholder="Extrait" {...form.register('body')} />
        <Button type="submit">Classer (sans retraiter si déjà vu)</Button>
      </form>
      <ul className="rounded-xl border bg-white divide-y text-sm">
        {rows.map((r) => <li key={r.id} className="px-4 py-2">{r.classification} · {r.message_id}</li>)}
      </ul>
    </div>
  );
}
