import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { paymentSchema } from '../schemas';
import { invoiceProgress } from '../lib/invoices';
import { canTransition } from '../lib/status';

interface Inv {
  id: string;
  invoice_number: string;
  amount_total: number;
  due_date: string | null;
  status: string;
  request_id: string | null;
}
interface Pay { invoice_id: string; amount: number }

export default function LabInvoicesPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [invoices, setInvoices] = useState<Inv[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [requests, setRequests] = useState<{ id: string; dossier_number: string; company_name: string; status: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const payForm = useForm({ resolver: zodResolver(paymentSchema), mode: 'onChange', defaultValues: { paid_at: new Date().toISOString().slice(0, 10) } });

  async function load() {
    if (!orgId) return;
    const [inv, pay, req] = await Promise.all([
      labSchema().from('client_invoices').select('id,invoice_number,amount_total,due_date,status,request_id').eq('organization_id', orgId).is('deleted_at', null),
      labSchema().from('client_payments').select('invoice_id,amount').eq('organization_id', orgId),
      labSchema().from('client_requests').select('id,dossier_number,company_name,status').eq('organization_id', orgId).is('deleted_at', null),
    ]);
    setInvoices((inv.data ?? []) as Inv[]);
    setPays((pay.data ?? []) as Pay[]);
    setRequests((req.data ?? []) as typeof requests);
  }
  useEffect(() => { void load(); }, [orgId]);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold text-[#071422]">Facturation client</h1>
      <p className="text-sm text-slate-500">Étape 11 — client, règlements, marge. Statuts : payé / attente / retard.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 flex-wrap">
        {requests.filter((r) => r.status === 'REPORT_SENT').map((r) => (
          <Button key={r.id} type="button" onClick={async () => {
            if (!orgId) return;
            const quote = await labSchema().from('quotes').select('amount').eq('request_id', r.id).maybeSingle();
            const num = await labSchema().rpc('next_invoice_number');
            const { error: iErr } = await labSchema().from('client_invoices').insert({
              organization_id: orgId, request_id: r.id, invoice_number: num.data ?? `FAC-${r.dossier_number}`,
              amount_total: quote.data?.amount ?? 0, due_date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
              status: 'EN_ATTENTE',
            });
            if (iErr) { setError(iErr.message); return; }
            if (canTransition('REPORT_SENT', 'INVOICED')) {
              await labSchema().from('client_requests').update({ status: 'INVOICED' }).eq('id', r.id);
            }
            await load();
          }}>Facturer {r.dossier_number}</Button>
        ))}
      </div>
      <table className="min-w-full text-sm rounded-xl border border-slate-200 bg-white">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr><th className="px-4 py-2">N°</th><th className="px-4 py-2">Restant</th><th className="px-4 py-2">Statut</th></tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const paid = pays.filter((p) => p.invoice_id === inv.id).reduce((s, p) => s + Number(p.amount), 0);
            const prog = invoiceProgress(Number(inv.amount_total), paid, inv.due_date);
            return (
              <tr key={inv.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{inv.invoice_number}</td>
                <td className="px-4 py-2">{prog.amountRemaining} ({prog.daysLate} j)</td>
                <td className="px-4 py-2">{prog.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <form className="rounded-xl border border-slate-200 bg-white p-4 grid sm:grid-cols-3 gap-3" onSubmit={payForm.handleSubmit(async (v) => {
        if (!orgId) return;
        const { error: pErr } = await labSchema().from('client_payments').insert({
          organization_id: orgId, invoice_id: v.invoice_id, amount: v.amount, paid_at: v.paid_at,
        });
        if (pErr) { setError(pErr.message); return; }
        await load();
      })}>
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" {...payForm.register('invoice_id')}>
          <option value="">Facture</option>
          {invoices.map((i) => <option key={i.id} value={i.id}>{i.invoice_number}</option>)}
        </select>
        <Input type="number" step="0.01" placeholder="Montant" {...payForm.register('amount')} />
        <Input type="date" {...payForm.register('paid_at')} />
        <Button type="submit" disabled={!payForm.formState.isValid}>Enregistrer paiement</Button>
      </form>
    </div>
  );
}
