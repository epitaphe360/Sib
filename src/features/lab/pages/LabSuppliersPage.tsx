import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { supplierSchema, type SupplierInput } from '../schemas';
import { LAB_ROUTES } from '../routes';

interface SupplierRow {
  id: string;
  name: string;
  email: string | null;
  city: string | null;
  country: string | null;
  is_active: boolean;
}

function splitList(value?: string) {
  return (value ?? '').split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
}

export default function LabSuppliersPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<SupplierRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    mode: 'onChange',
    defaultValues: { country: 'MA', is_active: true },
  });

  async function load() {
    if (!orgId) return;
    const { data, error: qErr } = await labSchema()
      .from('suppliers')
      .select('id,name,email,city,country,is_active')
      .eq('organization_id', orgId)
      .is('deleted_at', null)
      .order('name');
    if (qErr) setError(qErr.message);
    else setRows((data ?? []) as SupplierRow[]);
  }

  useEffect(() => { void load(); }, [orgId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Fournisseurs</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form
        className="rounded-xl border border-slate-200 bg-white p-5 grid sm:grid-cols-2 gap-3"
        onSubmit={form.handleSubmit(async (v) => {
          if (!orgId) return;
          setError(null);
          const { error: iErr } = await labSchema().from('suppliers').insert({
            organization_id: orgId,
            name: v.name,
            email: v.email || null,
            phone: v.phone || null,
            contact_name: v.contact_name || null,
            city: v.city || null,
            country: v.country,
            specialties: splitList(v.specialties),
            accreditations: splitList(v.accreditations),
            is_active: v.is_active,
          });
          if (iErr) { setError(iErr.message); return; }
          form.reset({ country: 'MA', is_active: true });
          await load();
        })}
      >
        <Input placeholder="Nom" {...form.register('name')} />
        <Input type="email" placeholder="Email" {...form.register('email')} />
        <Input placeholder="Téléphone" inputMode="numeric" {...form.register('phone')} />
        <Input placeholder="Contact" {...form.register('contact_name')} />
        <Input placeholder="Ville" {...form.register('city')} />
        <Input placeholder="Pays" {...form.register('country')} />
        <Input placeholder="Spécialités (virgules)" className="sm:col-span-2" {...form.register('specialties')} />
        <Input placeholder="Accréditations" className="sm:col-span-2" {...form.register('accreditations')} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register('is_active')} /> Actif
        </label>
        <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>Ajouter</Button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr><th className="px-4 py-2">Nom</th><th className="px-4 py-2">Ville</th><th className="px-4 py-2">Statut</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <Link className="text-cyan-700" to={LAB_ROUTES.ADMIN_SUPPLIER.replace(':id', r.id)}>{r.name}</Link>
                </td>
                <td className="px-4 py-2">{r.city ?? '—'}</td>
                <td className="px-4 py-2">{r.is_active ? 'Actif' : 'Inactif'}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="px-4 py-8 text-slate-400" colSpan={3}>Aucun fournisseur</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
