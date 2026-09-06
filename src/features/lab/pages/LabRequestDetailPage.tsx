import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { qualifySchema, consultationSchema, quoteDraftSchema } from '../schemas';
import { applyMargin } from '../lib/pricing';
import { canTransition } from '../lib/status';
import type { LabClientRequest } from '../types';

export default function LabRequestDetailPage() {
  const { id } = useParams();
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const userId = useLabSessionStore((s) => s.userId);
  const [row, setRow] = useState<LabClientRequest | null>(null);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [margin, setMargin] = useState(30);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const qualify = useForm({ resolver: zodResolver(qualifySchema), mode: 'onChange' });
  const consult = useForm({ resolver: zodResolver(consultationSchema), mode: 'onChange', defaultValues: { recipient_mode: 'TOP_3' as const, supplier_ids: [] as string[] } });
  const quote = useForm({ resolver: zodResolver(quoteDraftSchema), mode: 'onChange' });

  useEffect(() => {
    if (!orgId || !id) return;
    let cancelled = false;
    (async () => {
      const req = await labSchema().from('client_requests').select('*').eq('id', id).eq('organization_id', orgId).maybeSingle();
      const sup = await labSchema().from('suppliers').select('id,name').eq('organization_id', orgId).eq('is_active', true).is('deleted_at', null);
      const rule = await labSchema().from('pricing_rules').select('margin_percent').eq('organization_id', orgId).eq('is_active', true).maybeSingle();
      if (cancelled) return;
      if (req.error) setError(req.error.message);
      else setRow(req.data as LabClientRequest);
      setSuppliers((sup.data ?? []) as { id: string; name: string }[]);
      if (rule.data?.margin_percent != null) setMargin(Number(rule.data.margin_percent));
    })();
    return () => { cancelled = true; };
  }, [orgId, id]);

  if (!row) return <p className="text-sm text-slate-500">{error ?? 'Chargement…'}</p>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-xs text-slate-500">{row.dossier_number}</p>
        <h1 className="text-2xl font-semibold text-[#0b1f3a]">{row.company_name}</h1>
        <p className="text-sm text-slate-500">{row.product_name} · {row.status}</p>
      </div>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="font-medium">Qualification</h2>
        <form
          className="space-y-3"
          onSubmit={qualify.handleSubmit(async (v) => {
            if (!canTransition(row.status, 'QUALIFICATION') && row.status !== 'NEW_REQUEST') {
              setError('Qualification déjà faite');
              return;
            }
            const next = row.status === 'NEW_REQUEST' ? 'QUALIFICATION' : row.status;
            const { error: uErr } = await labSchema()
              .from('client_requests')
              .update({ analysis_kind: v.analysis_kind, status: next === 'NEW_REQUEST' ? 'QUALIFICATION' : next, notes: v.internal_notes || row.notes })
              .eq('id', row.id);
            if (uErr) { setError(uErr.message); return; }
            setRow({ ...row, analysis_kind: v.analysis_kind, status: 'QUALIFICATION' });
            setMessage('Demande qualifiée');
          })}
        >
          <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" {...qualify.register('analysis_kind')}>
            <option value="PHYSICO_CHIMIQUE">Physico-chimique</option>
            <option value="MICROBIOLOGIQUE">Microbiologique</option>
            <option value="MIXTE">Mixte</option>
          </select>
          <Button type="submit" disabled={!qualify.formState.isValid}>Qualifier</Button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="font-medium">Consultation sous-traitants (EN)</h2>
        <form
          className="space-y-3"
          onSubmit={consult.handleSubmit(async (v) => {
            if (!orgId) return;
            const { data: consultation, error: cErr } = await labSchema()
              .from('supplier_consultations')
              .insert({ organization_id: orgId, request_id: row.id, language: 'en', recipient_mode: v.recipient_mode, created_by: userId })
              .select('id')
              .maybeSingle();
            if (cErr || !consultation) { setError(cErr?.message ?? 'Consultation impossible'); return; }
            const items = v.supplier_ids.map((supplier_id) => ({
              organization_id: orgId,
              consultation_id: consultation.id,
              supplier_id,
            }));
            const { error: iErr } = await labSchema().from('supplier_consultation_items').insert(items);
            if (iErr) { setError(iErr.message); return; }
            if (canTransition(row.status, 'WAITING_SUPPLIER_QUOTES')) {
              await labSchema().from('client_requests').update({ status: 'WAITING_SUPPLIER_QUOTES' }).eq('id', row.id);
              setRow({ ...row, status: 'WAITING_SUPPLIER_QUOTES' });
            }
            setMessage('Consultation enregistrée');
          })}
        >
          <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" {...consult.register('recipient_mode')}>
            <option value="TOP_3">TOP 3</option>
            <option value="TOP_5">TOP 5</option>
            <option value="ALL">Tous</option>
          </select>
          <div className="space-y-1">
            {suppliers.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={s.id}
                  {...consult.register('supplier_ids')}
                />
                {s.name}
              </label>
            ))}
            {suppliers.length === 0 && <p className="text-sm text-slate-400">Aucun fournisseur actif — créer dans Fournisseurs.</p>}
          </div>
          <Button type="submit" disabled={!consult.formState.isValid}>Envoyer (brouillon)</Button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="font-medium">Devis client</h2>
        <p className="text-xs text-slate-500">Marge active : {margin} % (règle admin, non figée).</p>
        <form
          className="space-y-3"
          onSubmit={quote.handleSubmit(async (v) => {
            if (!orgId) return;
            const clientAmount = applyMargin(v.supplier_amount, margin);
            const { error: qErr } = await labSchema().from('quotes').insert({
              organization_id: orgId,
              request_id: row.id,
              quote_number: `DEV-TEMP-${row.id.slice(0, 8)}`,
              amount: clientAmount,
              turnaround_days: v.turnaround_days,
              conditions: v.conditions || null,
              status: 'draft',
            });
            if (qErr) { setError(qErr.message); return; }
            if (canTransition(row.status, 'CLIENT_QUOTE_DRAFT') || canTransition(row.status, 'SUPPLIER_SELECTED')) {
              const next = canTransition(row.status, 'SUPPLIER_SELECTED') ? 'SUPPLIER_SELECTED' : 'CLIENT_QUOTE_DRAFT';
              await labSchema().from('client_requests').update({ status: next }).eq('id', row.id);
              setRow({ ...row, status: next });
            }
            setMessage(`Devis brouillon ${clientAmount.toFixed(2)}`);
          })}
        >
          <Input type="number" step="0.01" placeholder="Prix fournisseur" {...quote.register('supplier_amount')} />
          <Input type="number" placeholder="Délai (jours)" {...quote.register('turnaround_days')} />
          <Input placeholder="Conditions" {...quote.register('conditions')} />
          <Button type="submit" disabled={!quote.formState.isValid}>Générer le devis</Button>
        </form>
      </section>
    </div>
  );
}
