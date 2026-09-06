import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { canTransition } from '../lib/status';

interface SampleRow { id: string; code: string; request_id: string; product_name: string; supplier_id: string | null }

export default function LabAnalysesPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [samples, setSamples] = useState<SampleRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({ defaultValues: { turnaround_days: 7 } });

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      const { data, error: qErr } = await labSchema()
        .from('samples').select('id,code,request_id,product_name,supplier_id')
        .eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false });
      if (qErr) setError(qErr.message);
      else setSamples((data ?? []) as SampleRow[]);
    })();
  }, [orgId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Envoi sous-traitant</h1>
      <p className="text-xs text-slate-500">Le fournisseur déjà choisi au devis est réutilisé. Pas de re-sélection auto.</p>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr><th className="px-4 py-2">Échantillon</th><th className="px-4 py-2">Action</th></tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{s.code} · {s.product_name}</td>
                <td className="px-4 py-2">
                  <Button type="button" onClick={async () => {
                    if (!orgId) return;
                    const sel = await labSchema().from('supplier_selection')
                      .select('selected_supplier_id').eq('request_id', s.request_id).maybeSingle();
                    const supplierId = sel.data?.selected_supplier_id ?? s.supplier_id;
                    if (!supplierId) { setError('Aucun fournisseur historisé'); return; }
                    const days = Number(form.getValues('turnaround_days') || 7);
                    const expected = new Date();
                    expected.setDate(expected.getDate() + days);
                    const po = await labSchema().rpc('next_supplier_po');
                    const { error: oErr } = await labSchema().from('analysis_orders').insert({
                      organization_id: orgId,
                      request_id: s.request_id,
                      supplier_id: supplierId,
                      sample_id: s.id,
                      expected_date: expected.toISOString().slice(0, 10),
                      sent_at: new Date().toISOString(),
                      po_number: po.data ?? `PO-SUP-${s.code}`,
                      language: 'en',
                    });
                    if (oErr) { setError(oErr.message); return; }
                    await labSchema().from('supplier_deadlines').insert({
                      organization_id: orgId,
                      request_id: s.request_id,
                      supplier_id: supplierId,
                      expected_date: expected.toISOString().slice(0, 10),
                      penalty_rate: null,
                    });
                    await labSchema().from('email_messages').insert({
                      organization_id: orgId, template_key: 'supplier_po', recipient: 'supplier',
                      subject: `Purchase order ${s.code}`, status: 'queued', provider: 'resend',
                    });
                    const req = await labSchema().from('client_requests').select('status').eq('id', s.request_id).maybeSingle();
                    if (req.data?.status && canTransition(req.data.status as never, 'SENT_TO_SUPPLIER')) {
                      await labSchema().from('client_requests').update({ status: 'SENT_TO_SUPPLIER' }).eq('id', s.request_id);
                    }
                    if (canTransition('SENT_TO_SUPPLIER', 'ANALYSIS_IN_PROGRESS')) {
                      await labSchema().from('client_requests').update({ status: 'ANALYSIS_IN_PROGRESS' }).eq('id', s.request_id);
                    }
                    setMessage(`BDC sous-traitant envoyé pour ${s.code}`);
                  }}>Envoyer BDC</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label className="text-sm text-slate-600">Délai contractuel (j) <Input type="number" {...form.register('turnaround_days')} /></label>
    </div>
  );
}
