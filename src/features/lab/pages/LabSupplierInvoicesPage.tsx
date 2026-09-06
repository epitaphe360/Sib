import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { invoiceProgress } from '../lib/invoices';

interface Inv { id: string; supplier_id: string; invoice_number: string; amount_total: number; due_date: string | null; status: string }
interface Pay { invoice_id: string; amount: number }
interface Sup { id: string; name: string }

export default function LabSupplierInvoicesPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [invoices, setInvoices] = useState<Inv[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [suppliers, setSuppliers] = useState<Sup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({ defaultValues: { supplier_id: '', invoice_number: '', amount_total: 0, due_date: '' } });

  async function load() {
    if (!orgId) return;
    const [inv, pay, sup] = await Promise.all([
      labSchema().from('supplier_invoices').select('id,supplier_id,invoice_number,amount_total,due_date,status').eq('organization_id', orgId).is('deleted_at', null),
      labSchema().from('supplier_payments').select('invoice_id,amount').eq('organization_id', orgId),
      labSchema().from('suppliers').select('id,name').eq('organization_id', orgId).is('deleted_at', null),
    ]);
    setInvoices((inv.data ?? []) as Inv[]);
    setPays((pay.data ?? []) as Pay[]);
    setSuppliers((sup.data ?? []) as Sup[]);
  }
  useEffect(() => { void load(); }, [orgId]);

  const bySupplier = suppliers.map((s) => {
    const list = invoices.filter((i) => i.supplier_id === s.id);
    const paid = list.reduce((sum, inv) => sum + pays.filter((p) => p.invoice_id === inv.id).reduce((a, p) => a + Number(p.amount), 0), 0);
    const total = list.reduce((sum, inv) => sum + Number(inv.amount_total), 0);
    const unpaid = list.filter((inv) => {
      const p = pays.filter((x) => x.invoice_id === inv.id).reduce((a, x) => a + Number(x.amount), 0);
      return invoiceProgress(Number(inv.amount_total), p, inv.due_date).amountRemaining > 0;
    });
    return { ...s, count: list.length, total, paid, unpaidCount: unpaid.length, unpaidAmount: total - paid };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Factures fournisseurs</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form className="rounded-xl border bg-white p-4 grid sm:grid-cols-2 gap-3" onSubmit={form.handleSubmit(async (v) => {
        if (!orgId) return;
        const { error: iErr } = await labSchema().from('supplier_invoices').insert({
          organization_id: orgId, supplier_id: v.supplier_id, invoice_number: v.invoice_number,
          amount_total: Number(v.amount_total), due_date: v.due_date || null, status: 'EN_ATTENTE',
        });
        if (iErr) { setError(iErr.message); return; }
        form.reset();
        await load();
      })}>
        <select className="h-10 rounded-lg border px-3 text-sm" {...form.register('supplier_id', { required: true })}>
          <option value="">Fournisseur</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <Input placeholder="N° facture" {...form.register('invoice_number', { required: true })} />
        <Input type="number" step="0.01" placeholder="Montant" {...form.register('amount_total', { valueAsNumber: true })} />
        <Input type="date" {...form.register('due_date')} />
        <Button type="submit">Ajouter</Button>
      </form>
      <table className="min-w-full text-sm rounded-xl border bg-white">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2">Fournisseur</th>
            <th className="px-4 py-2">Nb</th>
            <th className="px-4 py-2">Facturé</th>
            <th className="px-4 py-2">Payé</th>
            <th className="px-4 py-2">Impayés</th>
          </tr>
        </thead>
        <tbody>
          {bySupplier.map((s) => (
            <tr key={s.id} className="border-t border-slate-100">
              <td className="px-4 py-2">{s.name}</td>
              <td className="px-4 py-2">{s.count}</td>
              <td className="px-4 py-2">{s.total}</td>
              <td className="px-4 py-2">{s.paid}</td>
              <td className="px-4 py-2">{s.unpaidCount} · {s.unpaidAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
