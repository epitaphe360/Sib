import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { receiveSamplesSchema } from '../schemas';
import { formatSampleCode } from '../lib/sampleCode';
import { canTransition } from '../lib/status';
import { LAB_ROUTES } from '../routes';

interface Order {
  id: string;
  request_id: string;
  quote_id: string | null;
  reference: string | null;
  amount: number | null;
  review_status: string;
  review_reason: string | null;
  client_name: string | null;
}

export default function LabOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [product, setProduct] = useState('PRODUIT');
  const [pattern, setPattern] = useState('ECH-{seq}-{year}-{product}');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(receiveSamplesSchema),
    mode: 'onChange',
    defaultValues: { received_at: new Date().toISOString().slice(0, 16), quantity: 1 },
  });

  useEffect(() => {
    if (!orgId || !id) return;
    (async () => {
      const po = await labSchema().from('purchase_orders').select('*').eq('id', id).eq('organization_id', orgId).maybeSingle();
      if (po.error || !po.data) { setError(po.error?.message ?? 'Introuvable'); return; }
      setOrder(po.data as Order);
      const req = await labSchema().from('client_requests').select('product_name').eq('id', po.data.request_id).maybeSingle();
      if (req.data?.product_name) setProduct(req.data.product_name);
      const settings = await labSchema().from('settings').select('sample_code_pattern').eq('organization_id', orgId).maybeSingle();
      if (settings.data?.sample_code_pattern) setPattern(settings.data.sample_code_pattern);
    })();
  }, [orgId, id]);

  if (!order) return <p className="text-sm text-slate-500">{error ?? 'Chargement…'}</p>;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold text-[#0b1f3a]">{order.reference}</h1>
        <p className="text-sm text-slate-500">{order.review_status} · {order.client_name} · {order.amount}</p>
        {order.review_reason && <p className="text-sm text-amber-700 mt-1">{order.review_reason}</p>}
      </div>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {order.review_status === 'accepted' && (
        <form
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
          onSubmit={form.handleSubmit(async (v) => {
            if (!orgId) return;
            const { data: codes, error: cErr } = await labSchema().rpc('next_sample_codes', {
              p_org: orgId,
              p_product: product,
              p_count: v.quantity,
              p_pattern: pattern,
            });
            if (cErr || !codes) { setError(cErr?.message ?? 'Codification impossible'); return; }
            const rows = (codes as string[]).map((code, index) => ({
              organization_id: orgId,
              request_id: order.request_id,
              quote_id: order.quote_id,
              purchase_order_id: order.id,
              code: code || formatSampleCode({ sequence: index + 1, product, pattern }),
              product_name: product,
              received_at: new Date(v.received_at).toISOString(),
              carrier: v.carrier,
              received_by: v.received_by,
              condition_notes: v.condition_notes,
              temperature: v.temperature ?? null,
              quantity: 1,
              observation: v.observation || null,
            }));
            const { error: iErr } = await labSchema().from('samples').insert(rows);
            if (iErr) { setError(iErr.message); return; }
            const req = await labSchema().from('client_requests').select('status').eq('id', order.request_id).maybeSingle();
            const current = req.data?.status as string | undefined;
            if (current && canTransition(current as never, 'SAMPLES_RECEIVED')) {
              await labSchema().from('client_requests').update({ status: 'SAMPLES_RECEIVED' }).eq('id', order.request_id);
            }
            if (canTransition('SAMPLES_RECEIVED', 'SAMPLES_CODED')) {
              await labSchema().from('client_requests').update({ status: 'SAMPLES_CODED' }).eq('id', order.request_id);
            }
            setMessage(`${rows.length} échantillon(s) reçus et codés`);
            navigate(LAB_ROUTES.ADMIN_SAMPLES);
          })}
        >
          <h2 className="font-medium">Réception échantillons</h2>
          <Input type="datetime-local" {...form.register('received_at')} />
          <Input placeholder="Transporteur" {...form.register('carrier')} />
          <Input placeholder="Réceptionnaire" {...form.register('received_by')} />
          <Input placeholder="État" {...form.register('condition_notes')} />
          <Input type="number" step="0.1" placeholder="Température (°C)" {...form.register('temperature')} />
          <Input type="number" placeholder="Nombre" {...form.register('quantity')} />
          <Input placeholder="Observation" {...form.register('observation')} />
          <Button type="submit" disabled={!form.formState.isValid}>Échantillons reçus + coder</Button>
        </form>
      )}
    </div>
  );
}
