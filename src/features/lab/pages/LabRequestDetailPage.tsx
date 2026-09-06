import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { qualifySchema, consultationSchema, quoteDraftSchema } from '../schemas';
import { applyMargin } from '../lib/pricing';
import { assessCompetitiveness } from '../lib/competitiveness';
import { canTransition } from '../lib/status';
import { nextStatusAfterQualify, supplierLanguage } from '../lib/executionChannel';
import { rankSuppliersForConsult } from '../lib/compareOffers';
import { LabJourneyRail } from '../components/LabJourney';
import type { LabClientRequest } from '../types';

export default function LabRequestDetailPage() {
  const { id } = useParams();
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const userId = useLabSessionStore((s) => s.userId);
  const [row, setRow] = useState<LabClientRequest | null>(null);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string; quality_score?: number | null; delay_score?: number | null; price_score?: number | null; accreditations?: string[] | null }[]>([]);
  const [margin, setMargin] = useState(30);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const qualify = useForm({ resolver: zodResolver(qualifySchema), mode: 'onChange', defaultValues: { execution_channel: 'SUBCONTRACTED' as const } });
  const consult = useForm({ resolver: zodResolver(consultationSchema), mode: 'onChange', defaultValues: { recipient_mode: 'TOP_3' as const, supplier_ids: [] as string[] } });
  const quote = useForm({ resolver: zodResolver(quoteDraftSchema), mode: 'onChange', defaultValues: { margin_percent: 30 } });
  const watchMargin = quote.watch('margin_percent');
  const watchSupplier = quote.watch('supplier_amount');
  const watchCeiling = quote.watch('market_ceiling');

  useEffect(() => {
    if (!orgId || !id) return;
    let cancelled = false;
    (async () => {
      const req = await labSchema().from('client_requests').select('*').eq('id', id).eq('organization_id', orgId).maybeSingle();
      const sup = await labSchema().from('suppliers').select('id,name,quality_score,delay_score,price_score,accreditations').eq('organization_id', orgId).eq('is_active', true).is('deleted_at', null);
      const rule = await labSchema().from('pricing_rules').select('margin_percent').eq('organization_id', orgId).eq('is_active', true).maybeSingle();
      if (cancelled) return;
      if (req.error) setError(req.error.message);
      else setRow(req.data as LabClientRequest);
      setSuppliers((sup.data ?? []) as typeof suppliers);
      if (rule.data?.margin_percent != null) {
        setMargin(Number(rule.data.margin_percent));
        quote.setValue('margin_percent', Number(rule.data.margin_percent));
      }
    })();
    return () => { cancelled = true; };
  }, [orgId, id]);

  const mode = consult.watch('recipient_mode');
  const suggested = useMemo(
    () => rankSuppliersForConsult(suppliers, mode, { accreditationRequired: !!row?.accreditation_required }),
    [suppliers, mode, row?.accreditation_required],
  );

  const competitiveness = useMemo(() => {
    const amount = Number(watchSupplier);
    const m = Number(watchMargin ?? margin);
    if (!Number.isFinite(amount) || amount < 0) return null;
    return assessCompetitiveness({
      supplierAmount: amount,
      marginPercent: Number.isFinite(m) ? m : margin,
      marketCeiling: watchCeiling ? Number(watchCeiling) : null,
    });
  }, [watchSupplier, watchMargin, watchCeiling, margin]);

  if (!row) return <p className="text-sm text-slate-500">{error ?? 'Chargement…'}</p>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-700">{row.dossier_number}</p>
        <h1 className="lab-display text-4xl text-[#0b1f3a]">{row.company_name}</h1>
        <p className="text-sm text-slate-500">{row.product_name} · {row.status} · {row.execution_channel ?? 'canal à qualifier'}</p>
      </div>
      <LabJourneyRail tone="light" status={row.status} />
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="lab-display text-2xl">Qualification · interne FR / sous-traité EN</h2>
        <form
          className="space-y-3"
          onSubmit={qualify.handleSubmit(async (v) => {
            const next = nextStatusAfterQualify(v.execution_channel);
            const notes = [
              v.internal_notes,
              v.internal_analyses ? `Interne: ${v.internal_analyses}` : '',
              v.subcontracted_analyses ? `Sous-traité: ${v.subcontracted_analyses}` : '',
            ].filter(Boolean).join('\n');
            const { error: uErr } = await labSchema()
              .from('client_requests')
              .update({
                analysis_kind: v.analysis_kind,
                execution_channel: v.execution_channel,
                status: canTransition(row.status, next) || row.status === 'NEW_REQUEST' || row.status === 'QUALIFICATION' ? next : row.status,
                notes: notes || row.notes,
              })
              .eq('id', row.id);
            if (uErr) { setError(uErr.message); return; }
            if (orgId && (v.internal_analyses || v.subcontracted_analyses)) {
              const items = [
                ...v.internal_analyses.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).map((analysis_name) => ({
                  organization_id: orgId, request_id: row.id, analysis_name, is_internal: true,
                })),
                ...v.subcontracted_analyses.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).map((analysis_name) => ({
                  organization_id: orgId, request_id: row.id, analysis_name, is_internal: false,
                })),
              ];
              if (items.length) await labSchema().from('request_items').insert(items);
            }
            setRow({ ...row, analysis_kind: v.analysis_kind, execution_channel: v.execution_channel, status: next });
            setMessage(`Qualifiée · ${v.execution_channel} · docs ${supplierLanguage(v.execution_channel).toUpperCase()}`);
          })}
        >
          <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" {...qualify.register('analysis_kind')}>
            <option value="PHYSICO_CHIMIQUE">Physico-chimique</option>
            <option value="MICROBIOLOGIQUE">Microbiologique</option>
            <option value="MIXTE">Mixte</option>
          </select>
          <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" {...qualify.register('execution_channel')}>
            <option value="SUBCONTRACTED">Sous-traité (documents EN)</option>
            <option value="INTERNAL">Interne (documents FR)</option>
            <option value="MIXTE">Mixte — dossier unique</option>
          </select>
          <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" placeholder="Analyses internes (FR)" {...qualify.register('internal_analyses')} />
          <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" placeholder="Analyses sous-traitées (EN)" {...qualify.register('subcontracted_analyses')} />
          <button type="submit" className="rounded-lg bg-[#0b1f3a] px-4 py-2 text-sm text-white" disabled={!qualify.formState.isValid}>Qualifier</button>
        </form>
      </section>

      {row.execution_channel !== 'INTERNAL' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="lab-display text-2xl">Consultation sous-traitants (EN)</h2>
          <p className="text-xs text-slate-500">Proposition Top {mode === 'ALL' ? 'tous' : mode === 'TOP_5' ? '5' : '3'} selon scores. Choix humain obligatoire.</p>
          <form
            className="space-y-3"
            onSubmit={consult.handleSubmit(async (v) => {
              if (!orgId) return;
              const { data: consultation, error: cErr } = await labSchema()
                .from('supplier_consultations')
                .insert({ organization_id: orgId, request_id: row.id, language: 'en', recipient_mode: v.recipient_mode, created_by: userId })
                .select('id')
                .maybeSingle();
              if (cErr || !consultation) { setError(cErr?.message ?? 'Consultation impossible'); return; }
              const items = v.supplier_ids.map((supplier_id) => ({
                organization_id: orgId,
                consultation_id: consultation.id,
                supplier_id,
              }));
              const { error: iErr } = await labSchema().from('supplier_consultation_items').insert(items);
              if (iErr) { setError(iErr.message); return; }
              if (canTransition(row.status, 'WAITING_SUPPLIER_QUOTES')) {
                await labSchema().from('client_requests').update({ status: 'WAITING_SUPPLIER_QUOTES' }).eq('id', row.id);
                setRow({ ...row, status: 'WAITING_SUPPLIER_QUOTES' });
              }
              setMessage('Consultation enregistrée');
            })}
          >
            <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" {...consult.register('recipient_mode')}>
              <option value="TOP_3">TOP 3</option>
              <option value="TOP_5">TOP 5</option>
              <option value="ALL">Tous</option>
            </select>
            <div className="space-y-1">
              {suggested.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" value={s.id} defaultChecked {...consult.register('supplier_ids')} />
                  {s.name}
                </label>
              ))}
              {suggested.length === 0 && <p className="text-sm text-slate-400">Aucun fournisseur actif.</p>}
            </div>
            <button type="submit" className="rounded-lg bg-[#0b1f3a] px-4 py-2 text-sm text-white" disabled={!consult.formState.isValid}>Envoyer (brouillon)</button>
          </form>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="lab-display text-2xl">Devis client</h2>
        <p className="text-xs text-slate-500">Marge active : {margin} %. Contrôle de compétitivité — aucun prix auto-modifié.</p>
        <form
          className="space-y-3"
          onSubmit={quote.handleSubmit(async (v) => {
            if (!orgId) return;
            const usedMargin = v.margin_percent ?? margin;
            const clientAmount = applyMargin(v.supplier_amount, usedMargin);
            const check = assessCompetitiveness({
              supplierAmount: v.supplier_amount,
              marginPercent: usedMargin,
              marketCeiling: v.market_ceiling,
            });
            const { error: qErr } = await labSchema().from('quotes').insert({
              organization_id: orgId,
              request_id: row.id,
              quote_number: `DEV-TEMP-${row.id.slice(0, 8)}`,
              amount: clientAmount,
              supplier_amount: v.supplier_amount,
              margin_percent: usedMargin,
              competitiveness_flag: check.flag,
              version: 1,
              turnaround_days: v.turnaround_days,
              conditions: v.conditions || null,
              status: 'draft',
            });
            if (qErr) { setError(qErr.message); return; }
            if (canTransition(row.status, 'CLIENT_QUOTE_DRAFT') || canTransition(row.status, 'SUPPLIER_SELECTED')) {
              const next = canTransition(row.status, 'SUPPLIER_SELECTED') ? 'SUPPLIER_SELECTED' : 'CLIENT_QUOTE_DRAFT';
              await labSchema().from('client_requests').update({ status: next }).eq('id', row.id);
              setRow({ ...row, status: next });
            }
            setMessage(`Devis brouillon ${clientAmount.toFixed(2)} · ${check.flag}`);
          })}
        >
          <input className="h-10 w-full rounded-lg border px-3 text-sm" type="number" step="0.01" placeholder="Prix fournisseur" {...quote.register('supplier_amount')} />
          <input className="h-10 w-full rounded-lg border px-3 text-sm" type="number" placeholder="Marge %" {...quote.register('margin_percent')} />
          <input className="h-10 w-full rounded-lg border px-3 text-sm" type="number" step="0.01" placeholder="Plafond marché (optionnel)" {...quote.register('market_ceiling')} />
          <input className="h-10 w-full rounded-lg border px-3 text-sm" type="number" placeholder="Délai (jours)" {...quote.register('turnaround_days')} />
          <input className="h-10 w-full rounded-lg border px-3 text-sm" placeholder="Conditions" {...quote.register('conditions')} />
          {competitiveness && (
            <p className={`text-sm ${competitiveness.flag === 'high' ? 'text-amber-700' : 'text-slate-500'}`}>
              Client {competitiveness.clientAmount.toFixed(2)} · {competitiveness.message}
              {competitiveness.suggestedMargin != null && ` Marge suggérée : ${competitiveness.suggestedMargin} %.`}
            </p>
          )}
          <button type="submit" className="rounded-lg bg-[#d4af37] px-4 py-2 text-sm text-[#071422]" disabled={!quote.formState.isValid}>
            Générer le devis
          </button>
        </form>
      </section>
    </div>
  );
}
