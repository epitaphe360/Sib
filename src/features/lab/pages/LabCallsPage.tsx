import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { clientCallSchema } from '../schemas';

export default function LabCallsPage() {
  const { activeOrg, userId } = useLabSessionStore();
  const orgId = activeOrg?.id;
  const [rows, setRows] = useState<{ id: string; company_name: string; subject: string; created_at: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(clientCallSchema),
    defaultValues: { company_name: '', contact_name: '', phone: '', subject: '', notes: '', follow_up_at: '' },
  });

  async function load() {
    if (!orgId) return;
    const { data, error: qErr } = await labSchema()
      .from('client_calls')
      .select('id,company_name,subject,created_at')
      .eq('organization_id', orgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(80);
    if (qErr) setError(qErr.message);
    else setRows((data ?? []) as typeof rows);
  }
  useEffect(() => { void load(); }, [orgId]);

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-700">Remplace l’Excel Drive</p>
        <h1 className="lab-display text-3xl text-[#0b1f3a]">Suivi des appels</h1>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form
        className="rounded-2xl border bg-white p-5 space-y-2"
        onSubmit={form.handleSubmit(async (v) => {
          if (!orgId) return;
          const { error: iErr } = await labSchema().from('client_calls').insert({
            organization_id: orgId,
            company_name: v.company_name,
            contact_name: v.contact_name,
            phone: v.phone || null,
            subject: v.subject,
            notes: v.notes || null,
            follow_up_at: v.follow_up_at || null,
            outcome: 'INFO',
            created_by: userId,
          });
          if (iErr) { setError(iErr.message); return; }
          form.reset();
          await load();
        })}
      >
        <input className="h-10 w-full rounded-lg border px-3 text-sm" placeholder="Société" {...form.register('company_name')} />
        <input className="h-10 w-full rounded-lg border px-3 text-sm" placeholder="Contact" {...form.register('contact_name')} />
        <input className="h-10 w-full rounded-lg border px-3 text-sm" placeholder="Téléphone" {...form.register('phone')} />
        <input className="h-10 w-full rounded-lg border px-3 text-sm" placeholder="Objet" {...form.register('subject')} />
        <textarea className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Notes" {...form.register('notes')} />
        <button type="submit" className="rounded-lg bg-[#0b1f3a] px-4 py-2 text-sm text-white">Enregistrer l’appel</button>
      </form>
      <ul className="rounded-2xl border bg-white divide-y text-sm">
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-3">{r.created_at} · {r.company_name} · {r.subject}</li>
        ))}
        {rows.length === 0 && <li className="px-4 py-6 text-slate-400">Aucun appel. Table SQL requise : lab.client_calls.</li>}
      </ul>
    </div>
  );
}
