import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { labSchema } from '../services/labClient';
import { clientRequestSchema, type ClientRequestInput } from '../schemas';
import { extractRequestFromEmail } from '../lib/extractRequest';
import { LAB_COUNTRY_CODES } from '../theme/tokens';
import { LabBtn, LabField, LabPublicFrame, labInputClass } from '../components/LabUi';
import { LAB_ROUTES } from '../routes';

const DEFAULT_ORG = 'elitech';

export default function LabRequestFormPage() {
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawEmail, setRawEmail] = useState('');
  const [missing, setMissing] = useState<string[]>([]);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting, isValid } } = useForm<ClientRequestInput>({
    resolver: zodResolver(clientRequestSchema),
    mode: 'onChange',
    defaultValues: { country_code: '+212', sample_count: 1, accreditation_required: false },
  });

  if (done) {
    return (
      <LabPublicFrame>
        <div className="mx-auto max-w-lg py-20">
          <div className="lab-glass rounded-3xl p-8 text-center">
            <p className="text-sm text-emerald-300">Demande enregistrée</p>
            <p className="lab-display mt-3 text-3xl text-white">Référence interne : {done}</p>
            <Link className="mt-6 inline-block text-sm text-cyan-300" to={LAB_ROUTES.ROOT}>Retour au portail</Link>
          </div>
        </div>
      </LabPublicFrame>
    );
  }

  return (
    <LabPublicFrame>
      <div className="mx-auto grid max-w-5xl gap-6 py-4 lg:grid-cols-[1fr_0.85fr]">
        <form
          className="lab-glass space-y-4 rounded-3xl p-6"
          onSubmit={handleSubmit(async (values) => {
            setError(null);
            const analyses = values.analyses.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
            const { data, error: rpcError } = await labSchema().rpc('submit_public_request', {
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
          <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Étape 01</p>
          <h1 className="lab-display text-4xl text-white">Demande d’analyse</h1>
          <p className="text-sm text-white/55">La fiche structurée est la seule source opérationnelle.</p>
          <LabField label="Société" error={errors.company_name?.message}>
            <input className={labInputClass()} {...register('company_name')} />
          </LabField>
          <LabField label="Contact" error={errors.contact_name?.message}>
            <input className={labInputClass()} {...register('contact_name')} />
          </LabField>
          <LabField label="Email" error={errors.email?.message}>
            <input className={labInputClass()} type="email" {...register('email')} />
          </LabField>
          <div className="grid grid-cols-3 gap-2">
            <LabField label="Indicatif" error={errors.country_code?.message}>
              <select className={labInputClass()} {...register('country_code')}>
                {LAB_COUNTRY_CODES.map((c) => <option key={c} value={c} className="text-slate-900">{c}</option>)}
              </select>
            </LabField>
            <div className="col-span-2">
              <LabField label="Téléphone" error={errors.phone?.message}>
                <input className={labInputClass()} inputMode="numeric" placeholder="612345678" {...register('phone')} />
              </LabField>
            </div>
          </div>
          <LabField label="Produit" error={errors.product_name?.message}>
            <input className={labInputClass()} {...register('product_name')} />
          </LabField>
          <LabField label="Analyses demandées" error={errors.analyses?.message}>
            <input className={labInputClass()} placeholder="pH, métaux lourds…" {...register('analyses')} />
          </LabField>
          <LabField label="Nombre d’échantillons" error={errors.sample_count?.message}>
            <input className={labInputClass()} type="number" min={1} {...register('sample_count')} />
          </LabField>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" {...register('accreditation_required')} />
            Accréditation requise
          </label>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <LabBtn type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'Envoi…' : 'Envoyer la demande'}
          </LabBtn>
        </form>

        <aside className="lab-glass space-y-3 rounded-3xl p-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200">Canal de secours</p>
          <h2 className="lab-display text-2xl text-white">Coller un e-mail libre</h2>
          <p className="text-xs text-white/55">Aide rules-v1 — pré-remplit, signale les champs manquants. Jamais un traitement aval sur le brut.</p>
          <textarea
            className={`${labInputClass()} h-40 py-3`}
            value={rawEmail}
            onChange={(e) => setRawEmail(e.target.value)}
            placeholder="Coller le message du client…"
          />
          <LabBtn
            tone="cyan"
            onClick={() => {
              const extracted = extractRequestFromEmail(rawEmail);
              if (extracted.company_name) setValue('company_name', extracted.company_name, { shouldValidate: true });
              if (extracted.contact_name) setValue('contact_name', extracted.contact_name, { shouldValidate: true });
              if (extracted.email) setValue('email', extracted.email, { shouldValidate: true });
              if (extracted.country_code) setValue('country_code', extracted.country_code as ClientRequestInput['country_code'], { shouldValidate: true });
              if (extracted.phone) setValue('phone', extracted.phone, { shouldValidate: true });
              if (extracted.product_name) setValue('product_name', extracted.product_name, { shouldValidate: true });
              if (extracted.analyses) setValue('analyses', extracted.analyses, { shouldValidate: true });
              if (extracted.sample_count) setValue('sample_count', extracted.sample_count, { shouldValidate: true });
              setMissing(extracted.missing);
            }}
          >
            Extraire vers le formulaire
          </LabBtn>
          {missing.length > 0 && (
            <p className="text-xs text-amber-200">Manquant : {missing.join(', ')}</p>
          )}
        </aside>
      </div>
    </LabPublicFrame>
  );
}
