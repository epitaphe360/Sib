import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { supplierSchema, type SupplierInput } from '../schemas';
import { LAB_ROUTES } from '../routes';

function splitList(value?: string) {
  return (value ?? '').split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
}

export default function LabSupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<SupplierInput>({ resolver: zodResolver(supplierSchema), mode: 'onChange' });

  useEffect(() => {
    if (!orgId || !id) return;
    (async () => {
      const { data, error: qErr } = await labSchema()
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle();
      if (qErr || !data) { setError(qErr?.message ?? 'Introuvable'); return; }
      form.reset({
        name: data.name,
        email: data.email ?? '',
        phone: data.phone ?? '',
        contact_name: data.contact_name ?? '',
        city: data.city ?? '',
        country: data.country ?? 'MA',
        specialties: (data.specialties ?? []).join(', '),
        accreditations: (data.accreditations ?? []).join(', '),
        is_active: data.is_active,
      });
    })();
  }, [orgId, id]);

  return (
    <form
      className="max-w-xl space-y-3 rounded-xl border border-slate-200 bg-white p-5"
      onSubmit={form.handleSubmit(async (v) => {
        if (!orgId || !id) return;
        const { error: uErr } = await labSchema().from('suppliers').update({
          name: v.name,
          email: v.email || null,
          phone: v.phone || null,
          contact_name: v.contact_name || null,
          city: v.city || null,
          country: v.country,
          specialties: splitList(v.specialties),
          accreditations: splitList(v.accreditations),
          is_active: v.is_active,
        }).eq('id', id).eq('organization_id', orgId);
        if (uErr) { setError(uErr.message); return; }
        navigate(LAB_ROUTES.ADMIN_SUPPLIERS);
      })}
    >
      <h1 className="text-xl font-semibold text-[#0b1f3a]">Fournisseur</h1>
      <Input placeholder="Nom" {...form.register('name')} />
      <Input type="email" placeholder="Email" {...form.register('email')} />
      <Input placeholder="Téléphone" {...form.register('phone')} />
      <Input placeholder="Contact" {...form.register('contact_name')} />
      <Input placeholder="Ville" {...form.register('city')} />
      <Input placeholder="Pays" {...form.register('country')} />
      <Input placeholder="Spécialités" {...form.register('specialties')} />
      <Input placeholder="Accréditations" {...form.register('accreditations')} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register('is_active')} /> Actif
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={!form.formState.isValid}>Enregistrer</Button>
    </form>
  );
}
