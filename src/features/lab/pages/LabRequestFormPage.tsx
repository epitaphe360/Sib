import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { clientRequestSchema, type ClientRequestInput } from '../schemas';

const DEFAULT_ORG = 'elitech';

export default function LabRequestFormPage() {
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<ClientRequestInput>({
    resolver: zodResolver(clientRequestSchema),
    mode: 'onChange',
    defaultValues: { country_code: '+212', sample_count: 1, accreditation_required: false },
  });

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl bg-white border border-slate-200 p-6">
          <p className="text-sm text-green-700">Demande enregistrée</p>
          <p className="mt-2 text-[#0b1f3a] font-medium">Référence interne : {done}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <form
        className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          setError(null);
          if (!supabase) {
            setError('Service indisponible');
            return;
          }
          const analyses = values.analyses.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
          const { data, error: rpcError } = await supabase.schema('lab').rpc('submit_public_request', {
            p_org_slug: DEFAULT_ORG,
            p_company_name: values.company_name,
            p_contact_name: values.contact_name,
            p_email: values.email,
            p_phone: values.phone,
            p_country_code: values.country_code,
            p_product_name: values.product_name,
            p_matrix: values.matrix || null,
            p_sample_type: values.sample_type || null,
            p_sample_count: values.sample_count,
            p_urgency: values.urgency || null,
            p_deadline: values.deadline || null,
            p_accreditation_required: values.accreditation_required,
            p_notes: values.notes || null,
            p_analyses: analyses,
          });
          if (rpcError) {
            setError(rpcError.message);
            return;
          }
          setDone(String(data));
        })}
      >
        <h1 className="text-xl font-semibold text-[#0b1f3a]">Demande d’analyse</h1>
        <Field label="Société" error={errors.company_name?.message}><Input {...register('company_name')} /></Field>
        <Field label="Contact" error={errors.contact_name?.message}><Input {...register('contact_name')} /></Field>
        <Field label="Email" error={errors.email?.message}><Input type="email" {...register('email')} /></Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Indicatif" error={errors.country_code?.message}>
            <Input {...register('country_code')} readOnly />
          </Field>
          <div className="col-span-2">
            <Field label="Téléphone" error={errors.phone?.message}>
              <Input inputMode="numeric" placeholder="612345678" {...register('phone')} />
            </Field>
          </div>
        </div>
        <Field label="Produit" error={errors.product_name?.message}><Input {...register('product_name')} /></Field>
        <Field label="Matrice" error={errors.matrix?.message}><Input {...register('matrix')} /></Field>
        <Field label="Type d’échantillon" error={errors.sample_type?.message}><Input {...register('sample_type')} /></Field>
        <Field label="Nombre d’échantillons" error={errors.sample_count?.message}>
          <Input type="number" min={1} {...register('sample_count')} />
        </Field>
        <Field label="Analyses demandées" error={errors.analyses?.message}>
          <Input placeholder="pH, métaux lourds…" {...register('analyses')} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('accreditation_required')} />
          Accréditation requise
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Envoi…' : 'Envoyer la demande'}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-slate-600">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </label>
  );
}
