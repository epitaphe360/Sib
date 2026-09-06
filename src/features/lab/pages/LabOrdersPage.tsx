import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { ingestPurchaseOrderSchema } from '../schemas';
import { reviewPurchaseOrder } from '../lib/reviewPurchaseOrder';
import { canTransition } from '../lib/status';
import { LAB_ROUTES } from '../routes';

interface QuoteOpt { id: string; quote_number: string; amount: number; request_id: string; client_id: string | null }
interface OrderRow {
  id: string;
  reference: string | null;
  amount: number | null;
  review_status: string;
  request_id: string;
}

export default function LabOrdersPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [quotes, setQuotes] = useState<QuoteOpt[]>([]);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm({ resolver: zodResolver(ingestPurchaseOrderSchema), mode: 'onChange' });

  async function load() {
    if (!orgId) return;
    const [po, qs] = await Promise.all([
      labSchema().from('purchase_orders').select('id,reference,amount,review_status,request_id')
        .eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }),
      labSchema().from('quotes').select('id,quote_number,amount,request_id,client_id')
        .eq('organization_id', orgId).is('deleted_at', null),
    ]);
    if (po.error) setError(po.error.message);
    else setRows((po.data ?? []) as OrderRow[]);
    setQuotes((qs.data ?? []) as QuoteOpt[]);
  }

  useEffect(() => { void load(); }, [orgId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Bons de commande clients</h1>
      <p className="text-xs text-slate-500">Le BDC vient du client. L’app ne le crée pas : elle l’analyse et le rattache au devis.</p>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form
        className="rounded-xl border border-slate-200 bg-white p-5 grid sm:grid-cols-2 gap-3"
        onSubmit={form.handleSubmit(async (v) => {
          if (!orgId) return;
          const quote = quotes.find((q) => q.id === v.quote_id);
          if (!quote) { setError('Devis introuvable'); return; }
          const req = await labSchema().from('client_requests')
            .select('company_name,status').eq('id', quote.request_id).maybeSingle();
          const review = reviewPurchaseOrder({
            quoteNumber: quote.quote_number,
            poQuoteRef: v.reference,
            quoteClient: req.data?.company_name,
            poClient: v.client_name,
            quoteAmount: Number(quote.amount),
            poAmount: v.amount,
            quoteAnalyses: [],
            poAnalyses: v.analyses ? v.analyses.split(/[,;\n]/).map((s) => s.trim()) : [],
          });
          const { data, error: iErr } = await labSchema().from('purchase_orders').insert({
            organization_id: orgId,
            request_id: quote.request_id,
            quote_id: quote.id,
            client_id: quote.client_id,
            reference: v.reference,
            client_name: v.client_name,
            amount: v.amount,
            analyses: v.analyses ? v.analyses.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean) : [],
            review_status: review.status === 'ACCEPTÉ' ? 'accepted' : 'to_correct',
            review_reason: review.reasons.join(' · ') || null,
            mismatch_details: review.reasons,
          }).select('id').maybeSingle();
          if (iErr || !data) { setError(iErr?.message ?? 'Enregistrement impossible'); return; }

          if (review.status === 'ACCEPTÉ') {
            const current = req.data?.status as string | undefined;
            if (current && canTransition(current as never, 'PURCHASE_ORDER_RECEIVED')) {
              await labSchema().from('client_requests').update({ status: 'PURCHASE_ORDER_RECEIVED' }).eq('id', quote.request_id);
            }
            if (current && canTransition('PURCHASE_ORDER_RECEIVED', 'WAITING_SAMPLES')) {
              await labSchema().from('client_requests').update({ status: 'WAITING_SAMPLES' }).eq('id', quote.request_id);
            }
            setMessage('ACCEPTÉ — en attente des échantillons');
          } else {
            await labSchema().from('email_messages').insert({
              organization_id: orgId,
              template_key: 'po_correction',
              recipient: 'client',
              subject: `Correction BDC ${v.reference}`,
              status: 'queued',
              provider: 'resend',
            });
            await labSchema().from('purchase_orders').update({ correction_sent_at: new Date().toISOString() }).eq('id', data.id);
            setMessage(`À CORRIGER — ${review.reasons.join(' · ')}`);
          }
          form.reset();
          await load();
        })}
      >
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" {...form.register('quote_id')}>
          <option value="">Devis lié</option>
          {quotes.map((q) => <option key={q.id} value={q.id}>{q.quote_number} · {q.amount}</option>)}
        </select>
        <Input placeholder="Référence BDC / n° devis" {...form.register('reference')} />
        <Input placeholder="Client (document)" {...form.register('client_name')} />
        <Input type="number" step="0.01" placeholder="Montant" {...form.register('amount')} />
        <Input className="sm:col-span-2" placeholder="Analyses mentionnées (optionnel)" {...form.register('analyses')} />
        <Button type="submit" disabled={!form.formState.isValid}>Analyser le BDC</Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr><th className="px-4 py-2">Réf.</th><th className="px-4 py-2">Montant</th><th className="px-4 py-2">Revue</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <Link className="text-cyan-700" to={LAB_ROUTES.ADMIN_ORDER.replace(':id', r.id)}>{r.reference}</Link>
                </td>
                <td className="px-4 py-2">{r.amount ?? '—'}</td>
                <td className="px-4 py-2">{r.review_status}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="px-4 py-8 text-slate-400" colSpan={3}>Aucun BDC</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
