import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { supplierOfferSchema } from '../schemas';

export default function LabSupplierOfferPage() {
  const { token } = useParams();
  const [meta, setMeta] = useState<{ supplier_name?: string } | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(supplierOfferSchema),
    mode: 'onChange',
    defaultValues: { currency: 'EUR', pricing_type: 'unit' as const },
  });

  useEffect(() => {
    if (!token || !supabase) return;
    (async () => {
      const { data, error: qErr } = await supabase.schema('lab').rpc('get_consultation_invite', { p_token: token });
      if (qErr) setError(qErr.message);
      else setMeta(data as { supplier_name?: string });
    })();
  }, [token]);

  if (done) {
    return <div className="min-h-screen grid place-items-center text-green-700">Offer received. Thank you.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <form
        className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-white p-6 space-y-3"
        onSubmit={form.handleSubmit(async (v) => {
          if (!supabase || !token) return;
          const { error: rpcErr } = await supabase.schema('lab').rpc('submit_supplier_offer', {
            p_token: token,
            p_amount: v.amount,
            p_currency: v.currency,
            p_pricing_type: v.pricing_type,
            p_turnaround_days: v.turnaround_days,
            p_method: v.method || null,
            p_accreditation: v.accreditation || null,
            p_quantity: v.quantity ?? null,
            p_conditions: v.conditions || null,
            p_valid_until: v.valid_until || null,
            p_notes: v.notes || null,
          });
          if (rpcErr) { setError(rpcErr.message); return; }
          setDone(true);
        })}
      >
        <h1 className="text-xl font-semibold text-[#0b1f3a]">Supplier quotation</h1>
        <p className="text-sm text-slate-500">{meta?.supplier_name ?? 'Secure form'} — English only.</p>
        <Input type="number" step="0.01" placeholder="Price" {...form.register('amount')} />
        <Input placeholder="Currency" {...form.register('currency')} />
        <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" {...form.register('pricing_type')}>
          <option value="unit">Unit price</option>
          <option value="forfait">Lump sum</option>
        </select>
        <Input type="number" placeholder="Lead time (days)" {...form.register('turnaround_days')} />
        <Input placeholder="Method" {...form.register('method')} />
        <Input placeholder="Accreditation" {...form.register('accreditation')} />
        <Input placeholder="Conditions" {...form.register('conditions')} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={!form.formState.isValid}>Submit offer</Button>
      </form>
    </div>
  );
}
