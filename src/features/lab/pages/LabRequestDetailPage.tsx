import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { qualifySchema, consultationSchema, quoteDraftSchema, receiveSamplesSchema, ingestPurchaseOrderSchema, resultSchema } from '../schemas';
import { applyMargin } from '../lib/pricing';
import { assessCompetitiveness } from '../lib/competitiveness';
import { canTransition } from '../lib/status';
import { nextStatusAfterQualify, supplierLanguage } from '../lib/executionChannel';
import { rankSuppliersForConsult } from '../lib/compareOffers';
import { formatSampleCode } from '../lib/sampleCode';
import { reviewPurchaseOrder } from '../lib/reviewPurchaseOrder';
import { followupDueAt } from '../lib/quoteFollowup';
import { pickTemplateKind, reportReadiness } from '../lib/reportReadiness';
import { buildLabReportPdf, downloadBlob } from '../lib/reportPdf';
import { queueEmailPayload } from '../lib/emailTemplates';
import { can } from '../rbac';
import { LabCaseRail } from '../components/LabJourney';
import { LabBtn, LabField, labControlClass, confirmLabAction } from '../components/LabUi';
import {
  LAB_CASE_PHASES,
  canOpenPhase,
  casePhaseByNumber,
  completedPhaseSummary,
  dossierPhaseForStatus,
  isCurrentPhaseReady,
  nextActionForStatus,
  phaseRailState,
  skipsConsultation,
  statusLabelFr,
  wizardSuivantLabel,
} from '../lib/dossierPhases';
import type { DossierStatus, LabClientRequest } from '../types';

interface SupplierRow {
  id: string;
  name: string;
  quality_score?: number | null;
  delay_score?: number | null;
  price_score?: number | null;
  accreditations?: string[] | null;
}

interface QuoteRow {
  id: string;
  quote_number: string;
  amount: number;
  status: string;
  validated_by: string | null;
  supplier_amount: number | null;
}

interface PoRow {
  id: string;
  reference: string | null;
  review_status: string;
  amount: number | null;
}

export default function LabRequestDetailPage() {
  const { id } = useParams();
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const userId = useLabSessionStore((s) => s.userId);
  const role = useLabSessionStore((s) => s.role);
  const [row, setRow] = useState<LabClientRequest | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [margin, setMargin] = useState(30);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgedRead, setAcknowledgedRead] = useState(false);
  const [viewPhase, setViewPhase] = useState<number | null>(null);
  const [fetchedAt, setFetchedAt] = useState(Date.now());
  const [tick, setTick] = useState(0);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [supplierSelected, setSupplierSelected] = useState(false);
  const [quote, setQuote] = useState<QuoteRow | null>(null);
  const [po, setPo] = useState<PoRow | null>(null);
  const [sampleCount, setSampleCount] = useState(0);
  const [sampleCodes, setSampleCodes] = useState<string[]>([]);
  const [analysisOrderSent, setAnalysisOrderSent] = useState(false);
  const [finalApproved, setFinalApproved] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [invoiced, setInvoiced] = useState(false);
  const [pattern, setPattern] = useState('ECH-{seq}-{year}-{product}');
  const [followupDays, setFollowupDays] = useState(3);

  const qualify = useForm({
    resolver: zodResolver(qualifySchema),
    mode: 'onChange',
    defaultValues: { analysis_kind: 'PHYSICO_CHIMIQUE' as const, execution_channel: 'SUBCONTRACTED' as const },
  });
  const consult = useForm({ resolver: zodResolver(consultationSchema), mode: 'onChange', defaultValues: { recipient_mode: 'TOP_3' as const, supplier_ids: [] as string[] } });
  const quoteForm = useForm({ resolver: zodResolver(quoteDraftSchema), mode: 'onChange', defaultValues: { margin_percent: 30 } });
  const poForm = useForm({ resolver: zodResolver(ingestPurchaseOrderSchema), mode: 'onChange' });
  const sampleForm = useForm({
    resolver: zodResolver(receiveSamplesSchema),
    mode: 'onChange',
    defaultValues: { received_at: new Date().toISOString().slice(0, 16), quantity: 1 },
  });
  const resultForm = useForm({ resolver: zodResolver(resultSchema), mode: 'onChange' });
  const watchMargin = quoteForm.watch('margin_percent');
  const watchSupplier = quoteForm.watch('supplier_amount');
  const watchCeiling = quoteForm.watch('market_ceiling');

  async function load() {
    if (!orgId || !id) return;
    const [req, sup, rule, consultRow, sel, q, order, samples, ao, reviews, reports, inv, settings] = await Promise.all([
      labSchema().from('client_requests').select('*').eq('id', id).eq('organization_id', orgId).maybeSingle(),
      labSchema().from('suppliers').select('id,name,quality_score,delay_score,price_score,accreditations').eq('organization_id', orgId).eq('is_active', true).is('deleted_at', null),
      labSchema().from('pricing_rules').select('margin_percent').eq('organization_id', orgId).eq('is_active', true).maybeSingle(),
      labSchema().from('supplier_consultations').select('id').eq('request_id', id).eq('organization_id', orgId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      labSchema().from('supplier_selection').select('id').eq('request_id', id).limit(1).maybeSingle(),
      labSchema().from('quotes').select('id,quote_number,amount,status,validated_by,supplier_amount').eq('request_id', id).eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      labSchema().from('purchase_orders').select('id,reference,review_status,amount').eq('request_id', id).eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      labSchema().from('samples').select('code').eq('request_id', id).eq('organization_id', orgId).is('deleted_at', null),
      labSchema().from('analysis_orders').select('id').eq('request_id', id).limit(1).maybeSingle(),
      labSchema().from('result_reviews').select('level,decision').eq('organization_id', orgId),
      labSchema().from('reports').select('sent_at').eq('request_id', id).eq('organization_id', orgId).is('deleted_at', null),
      labSchema().from('client_invoices').select('id').eq('request_id', id).eq('organization_id', orgId).is('deleted_at', null).limit(1).maybeSingle(),
      labSchema().from('settings').select('sample_code_pattern,quote_followup_days').eq('organization_id', orgId).maybeSingle(),
    ]);
    if (req.error) { setError(req.error.message); return; }
    const next = req.data as LabClientRequest | null;
    setRow(next);
    setSuppliers((sup.data ?? []) as SupplierRow[]);
    if (rule.data?.margin_percent != null) {
      setMargin(Number(rule.data.margin_percent));
      quoteForm.setValue('margin_percent', Number(rule.data.margin_percent));
    }
    setConsultationId(consultRow.data?.id ?? null);
    setSupplierSelected(!!sel.data);
    setQuote((q.data as QuoteRow | null) ?? null);
    if (q.data?.id) poForm.setValue('quote_id', q.data.id);
    setPo((order.data as PoRow | null) ?? null);
    const codes = (samples.data ?? []).map((s) => s.code as string);
    setSampleCodes(codes);
    setSampleCount(codes.length);
    setAnalysisOrderSent(!!ao.data);
    setFinalApproved((reviews.data ?? []).some((r) => r.level === 'FINAL' && (r.decision === 'ACCEPTER' || r.decision === 'accept')));
    setReportSent((reports.data ?? []).some((r) => !!r.sent_at));
    setInvoiced(!!inv.data || next?.status === 'INVOICED');
    if (settings.data?.sample_code_pattern) setPattern(settings.data.sample_code_pattern);
    if (settings.data?.quote_followup_days) setFollowupDays(Number(settings.data.quote_followup_days));
    if (next?.analysis_kind) qualify.setValue('analysis_kind', next.analysis_kind);
    if (next?.execution_channel) qualify.setValue('execution_channel', next.execution_channel);
    if (next?.id) resultForm.setValue('request_id', next.id);
    setFetchedAt(Date.now());
  }

  useEffect(() => {
    if (!orgId || !id) return;
    let cancelled = false;
    (async () => {
      await load();
      if (cancelled) return;
    })();
    const poll = window.setInterval(() => { void load(); }, 15_000);
    const clock = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, [orgId, id]);

  const current = dossierPhaseForStatus(row?.status);
  const viewing = viewPhase ?? current;
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

  const gate = {
    status: (row?.status ?? 'NEW_REQUEST') as DossierStatus,
    executionChannel: row?.execution_channel ?? qualify.watch('execution_channel'),
    acknowledgedRead: acknowledgedRead || current > 1,
    analysisKind: row?.analysis_kind ?? qualify.watch('analysis_kind'),
    executionChannelReady: row?.execution_channel ?? qualify.watch('execution_channel'),
    consultationStarted: !!consultationId,
    supplierSelected,
    quoteReady: !!quote,
    poAccepted: po?.review_status === 'accepted' || po?.review_status === 'ACCEPTÉ',
    sampleCount,
    analysisOrderSent,
    finalApproved,
    reportSent,
    invoiced,
    closed: row?.status === 'CLOSED',
  };

  const ready = isCurrentPhaseReady({
    ...gate,
    executionChannel: gate.executionChannel,
  });

  const qualifyWatchOk = qualify.formState.isValid;
  const suivantEnabled = viewing === current && (
    current === 2 ? qualifyWatchOk : ready
  );

  void tick;

  async function setStatus(next: DossierStatus) {
    if (!row) return;
    if (canTransition(row.status, next) || row.status === next) {
      await labSchema().from('client_requests').update({ status: next }).eq('id', row.id);
      setRow({ ...row, status: next });
      setViewPhase(null);
    }
  }

  async function onSuivant() {
    if (!row || viewing !== current) {
      setViewPhase(current);
      return;
    }
    if (current === 1 && acknowledgedRead) {
      await setStatus('QUALIFICATION');
      return;
    }
    if (current === 2) {
      await qualify.handleSubmit(submitQualify)();
      return;
    }
    if (current === 3 && (supplierSelected || skipsConsultation(row.execution_channel))) {
      if (canTransition(row.status, 'CLIENT_QUOTE_DRAFT')) await setStatus('CLIENT_QUOTE_DRAFT');
      else setViewPhase(null);
      return;
    }
    if (current === 4 && gate.poAccepted) {
      if (canTransition(row.status, 'WAITING_SAMPLES')) await setStatus('WAITING_SAMPLES');
      return;
    }
    if (current === 5 && sampleCount > 0) {
      if (canTransition(row.status, 'SAMPLES_CODED')) await setStatus('SAMPLES_CODED');
      else if (canTransition(row.status, 'SENT_TO_SUPPLIER')) await setStatus('SENT_TO_SUPPLIER');
      return;
    }
    if (current === 6 && analysisOrderSent) {
      if (canTransition(row.status, 'ANALYSIS_IN_PROGRESS')) await setStatus('ANALYSIS_IN_PROGRESS');
      return;
    }
    if (current === 7 && finalApproved) {
      if (canTransition(row.status, 'APPROVED')) await setStatus('APPROVED');
      return;
    }
    if (current === 8 && reportSent) {
      if (canTransition(row.status, 'INVOICED')) await setStatus('INVOICED');
      return;
    }
    if (current === 9 && (invoiced || row.status === 'INVOICED')) {
      await setStatus('CLOSED');
    }
  }

  async function submitQualify(v: { analysis_kind: LabClientRequest['analysis_kind']; execution_channel: NonNullable<LabClientRequest['execution_channel']>; internal_notes?: string; internal_analyses?: string; subcontracted_analyses?: string }) {
    if (!row || !orgId) return;
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
    if (v.internal_analyses || v.subcontracted_analyses) {
      const items = [
        ...(v.internal_analyses ?? '').split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).map((analysis_name) => ({
          organization_id: orgId, request_id: row.id, analysis_name, is_internal: true,
        })),
        ...(v.subcontracted_analyses ?? '').split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).map((analysis_name) => ({
          organization_id: orgId, request_id: row.id, analysis_name, is_internal: false,
        })),
      ];
      if (items.length) await labSchema().from('request_items').insert(items);
    }
    setRow({ ...row, analysis_kind: v.analysis_kind, execution_channel: v.execution_channel, status: next });
    setViewPhase(null);
    setMessage(`Qualifiée · ${v.execution_channel} · docs ${supplierLanguage(v.execution_channel).toUpperCase()}`);
  }

  if (!row) return <p className="text-sm text-[#3d4f63]">{error ?? 'Chargement…'}</p>;

  const phaseDef = casePhaseByNumber(current);
  const seconds = Math.max(0, Math.round((Date.now() - fetchedAt) / 1000));

  return (
    <div className="lab-editorial space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0e5f73]">{row.dossier_number}</p>
          <span className="lab-phase-badge">Phase {current} / 10 · {phaseDef?.short}</span>
        </div>
        <h1 className="lab-display text-4xl font-semibold text-[#0B1F33] sm:text-5xl">{row.company_name}</h1>
        <p className="text-sm font-medium text-[#3d4f63]">
          {row.product_name} · {statusLabelFr(row.status)}
          {row.execution_channel ? ` · ${row.execution_channel}` : ''}
        </p>
        <div className="lab-hairline" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b4e0b]">Prochaine action</p>
        <p className="lab-next-action">{nextActionForStatus(row.status, row.execution_channel)}</p>
        <p className="lab-live-dot">Mis à jour {seconds < 5 ? 'à l’instant' : `il y a ${seconds} s`}</p>
      </header>

      <LabCaseRail status={row.status} viewPhase={viewing} onOpen={(n) => setViewPhase(n)} />

      {message && <p className="text-sm font-medium text-emerald-800">{message}</p>}
      {error && <p className="text-sm font-medium text-red-700">{error}</p>}

      <div>
        {LAB_CASE_PHASES.map((phase) => {
          const state = phaseRailState(phase.n, current);
          const openable = canOpenPhase(phase.n, current);
          const expanded = viewing === phase.n && openable;
          const skipped = phase.n === 3 && skipsConsultation(row.execution_channel) && current > 3;
          return (
            <div key={phase.n}>
              <button
                type="button"
                className="lab-phase-row"
                disabled={!openable}
                onClick={() => openable && setViewPhase(phase.n)}
              >
                <span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b4e0b]">
                    Phase {phase.n}
                  </span>
                  <span className="mt-0.5 block font-medium text-[#0B1F33]">{phase.title}</span>
                  {state === 'done' && !expanded && (
                    <span className="mt-0.5 block text-xs text-[#3d4f63]">
                      {skipped ? 'Sautée (canal interne)' : completedPhaseSummary(phase.n, row)}
                    </span>
                  )}
                </span>
                {state === 'locked' && <Lock className="h-4 w-4 text-[#3d4f63]" aria-label="Verrouillée" />}
                {state === 'current' && <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0e5f73]">Actuel</span>}
                {state === 'done' && <span className="text-[11px] uppercase tracking-[0.12em] text-[#6b4e0b]">Fait</span>}
              </button>
              {expanded && (
                <div className="lab-phase-current space-y-4">
                  {phase.n !== current && (
                    <p className="text-sm text-[#3d4f63]">Phase achevée — lecture seule.</p>
                  )}
                  {phase.n === 1 && (
                    <div className="space-y-4">
                      <dl className="space-y-2 text-sm text-[#0B1F33]">
                        <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">Contact</dt><dd>{row.contact_name} · {row.email} · {row.phone}</dd></div>
                        <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">Produit</dt><dd>{row.product_name}{row.matrix ? ` · ${row.matrix}` : ''}</dd></div>
                        <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">Échantillons</dt><dd>{row.sample_count} · {row.accreditation_required ? 'Accréditation requise' : 'Sans accréditation'}</dd></div>
                        {row.notes && <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">Notes</dt><dd>{row.notes}</dd></div>}
                      </dl>
                      {current === 1 && (
                        <label className="flex min-h-12 items-start gap-3 text-sm font-medium text-[#0B1F33]">
                          <input type="checkbox" className="mt-1 accent-[#0e5f73]" checked={acknowledgedRead} onChange={(e) => setAcknowledgedRead(e.target.checked)} />
                          J’ai pris connaissance de la demande.
                        </label>
                      )}
                    </div>
                  )}
                  {phase.n === 2 && current === 2 && (
                    <form id="lab-wizard-form" className="space-y-3" onSubmit={qualify.handleSubmit(submitQualify)}>
                      <LabField label="Type d’analyse" tone="light">
                        <select className={labControlClass()} {...qualify.register('analysis_kind')}>
                          <option value="PHYSICO_CHIMIQUE">Physico-chimique</option>
                          <option value="MICROBIOLOGIQUE">Microbiologique</option>
                          <option value="MIXTE">Mixte</option>
                        </select>
                      </LabField>
                      <LabField label="Canal d’exécution" tone="light">
                        <select className={labControlClass()} {...qualify.register('execution_channel')}>
                          <option value="SUBCONTRACTED">Sous-traité (documents EN)</option>
                          <option value="INTERNAL">Interne (documents FR)</option>
                          <option value="MIXTE">Mixte — dossier unique</option>
                        </select>
                      </LabField>
                      <LabField label="Analyses internes (FR)" tone="light">
                        <input className={labControlClass()} placeholder="pH, acidité…" {...qualify.register('internal_analyses')} />
                      </LabField>
                      <LabField label="Analyses sous-traitées (EN)" tone="light">
                        <input className={labControlClass()} placeholder="Heavy metals, pesticides…" {...qualify.register('subcontracted_analyses')} />
                      </LabField>
                    </form>
                  )}
                  {phase.n === 2 && current !== 2 && (
                    <p className="text-sm text-[#0B1F33]">{row.analysis_kind} · {row.execution_channel}</p>
                  )}
                  {phase.n === 3 && current === 3 && (
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
                        setConsultationId(consultation.id);
                        setMessage('Consultation enregistrée — le choix ST reste humain.');
                      })}
                    >
                      <LabField label="Destinataires" tone="light">
                        <select className={labControlClass()} {...consult.register('recipient_mode')}>
                          <option value="TOP_3">TOP 3</option>
                          <option value="TOP_5">TOP 5</option>
                          <option value="ALL">Tous</option>
                        </select>
                      </LabField>
                      <div className="space-y-2 rounded-xl border border-[#c9bea8] bg-white p-3">
                        {suggested.map((s) => (
                          <label key={s.id} className="flex min-h-11 items-center gap-2 text-sm font-medium text-[#0B1F33]">
                            <input type="checkbox" className="accent-[#0e5f73]" value={s.id} defaultChecked {...consult.register('supplier_ids')} />
                            {s.name}
                          </label>
                        ))}
                        {suggested.length === 0 && <p className="text-sm text-[#3d4f63]">Aucun fournisseur actif.</p>}
                      </div>
                      <LabBtn type="submit" tone="navy" disabled={!consult.formState.isValid}>Envoyer la consultation</LabBtn>
                      {consultationId && suggested[0] && (
                        <LabBtn
                          tone="gold"
                          onClick={async () => {
                            if (!confirmLabAction(`Choisir ${suggested[0].name} ? Décision humaine.`)) return;
                            await labSchema().from('supplier_selection').insert({
                              organization_id: orgId,
                              request_id: row.id,
                              consultation_id: consultationId,
                              selected_supplier_id: suggested[0].id,
                              selected_by: userId,
                              reason: 'Choix humain après comparaison',
                            });
                            if (canTransition(row.status, 'SUPPLIER_SELECTED')) {
                              await labSchema().from('client_requests').update({ status: 'SUPPLIER_SELECTED' }).eq('id', row.id);
                              setRow({ ...row, status: 'SUPPLIER_SELECTED' });
                            }
                            setSupplierSelected(true);
                            setMessage(`Sélection : ${suggested[0].name}`);
                          }}
                        >
                          Choisir {suggested[0].name}
                        </LabBtn>
                      )}
                    </form>
                  )}
                  {phase.n === 4 && current === 4 && (
                    <div className="space-y-5">
                      {!quote && (
                        <form
                          className="space-y-3"
                          onSubmit={quoteForm.handleSubmit(async (v) => {
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
                            await load();
                          })}
                        >
                          <LabField label="Prix fournisseur" tone="light">
                            <input className={labControlClass()} type="number" step="0.01" placeholder="0.00" {...quoteForm.register('supplier_amount')} />
                          </LabField>
                          <LabField label="Marge %" tone="light">
                            <input className={labControlClass()} type="number" placeholder="30" {...quoteForm.register('margin_percent')} />
                          </LabField>
                          <LabField label="Plafond marché (optionnel)" tone="light">
                            <input className={labControlClass()} type="number" step="0.01" placeholder="Optionnel" {...quoteForm.register('market_ceiling')} />
                          </LabField>
                          <LabField label="Délai (jours)" tone="light">
                            <input className={labControlClass()} type="number" placeholder="10" {...quoteForm.register('turnaround_days')} />
                          </LabField>
                          {competitiveness && (
                            <p className="text-sm font-medium text-[#3d4f63]">
                              Client {competitiveness.clientAmount.toFixed(2)} · {competitiveness.message}
                            </p>
                          )}
                          <LabBtn type="submit" tone="gold" disabled={!quoteForm.formState.isValid}>Générer le devis</LabBtn>
                        </form>
                      )}
                      {quote && quote.status === 'draft' && (
                        <LabBtn
                          tone="navy"
                          onClick={async () => {
                            if (!can(role, 'quotes.validate')) { setError('Seule Madame Zineb peut valider'); return; }
                            if (!confirmLabAction(`Valider ${quote.quote_number} ?`)) return;
                            await labSchema().from('quotes').update({ status: 'validated', validated_by: userId }).eq('id', quote.id);
                            setQuote({ ...quote, status: 'validated', validated_by: userId ?? null });
                            setMessage('Devis validé');
                          }}
                        >
                          Valider le devis
                        </LabBtn>
                      )}
                      {quote && (quote.status === 'validated' || quote.validated_by) && quote.status !== 'sent' && (
                        <LabBtn
                          tone="gold"
                          onClick={async () => {
                            if (!orgId) return;
                            if (!confirmLabAction(`Envoyer ${quote.quote_number} ?`)) return;
                            const sentAt = new Date();
                            await labSchema().from('quotes').update({
                              status: 'sent',
                              sent_at: sentAt.toISOString(),
                              followup_due_at: followupDueAt(sentAt, followupDays).toISOString(),
                            }).eq('id', quote.id);
                            await labSchema().from('email_messages').insert(queueEmailPayload(orgId, 'client_quote', 'client', {
                              quote: quote.quote_number,
                              amount: String(quote.amount),
                            }));
                            if (canTransition(row.status, 'CLIENT_QUOTE_SENT')) await setStatus('CLIENT_QUOTE_SENT');
                            setQuote({ ...quote, status: 'sent' });
                            setMessage('Devis envoyé');
                          }}
                        >
                          Envoyer au client
                        </LabBtn>
                      )}
                      {quote && !po && (
                        <form
                          className="space-y-3"
                          onSubmit={poForm.handleSubmit(async (v) => {
                            if (!orgId || !quote) return;
                            const review = reviewPurchaseOrder({
                              quoteNumber: quote.quote_number,
                              poQuoteRef: v.reference,
                              quoteClient: row.company_name,
                              poClient: v.client_name,
                              quoteAmount: Number(quote.amount),
                              poAmount: v.amount,
                            });
                            const { data, error: iErr } = await labSchema().from('purchase_orders').insert({
                              organization_id: orgId,
                              request_id: row.id,
                              quote_id: quote.id,
                              reference: v.reference,
                              client_name: v.client_name,
                              amount: v.amount,
                              review_status: review.status === 'ACCEPTÉ' ? 'accepted' : 'to_correct',
                              review_reason: review.reasons.join(' · ') || null,
                            }).select('id,reference,review_status,amount').maybeSingle();
                            if (iErr || !data) { setError(iErr?.message ?? 'BDC impossible'); return; }
                            if (review.status === 'ACCEPTÉ' && canTransition(row.status, 'PURCHASE_ORDER_RECEIVED')) {
                              await setStatus('PURCHASE_ORDER_RECEIVED');
                            }
                            setPo(data as PoRow);
                            setMessage(review.status === 'ACCEPTÉ' ? 'BDC accepté' : `BDC à corriger : ${review.reasons.join(', ')}`);
                          })}
                        >
                          <p className="text-sm font-medium text-[#0B1F33]">Rattacher le bon de commande client</p>
                          <input type="hidden" value={quote.id} {...poForm.register('quote_id')} />
                          <LabField label="Référence BDC" tone="light"><input className={labControlClass()} {...poForm.register('reference')} /></LabField>
                          <LabField label="Client sur le BDC" tone="light"><input className={labControlClass()} defaultValue={row.company_name} {...poForm.register('client_name')} /></LabField>
                          <LabField label="Montant" tone="light"><input className={labControlClass()} type="number" step="0.01" {...poForm.register('amount')} /></LabField>
                          <LabBtn type="submit" tone="navy" disabled={!poForm.formState.isValid}>Enregistrer le BDC</LabBtn>
                        </form>
                      )}
                      {po && <p className="text-sm text-[#0B1F33]">{po.reference} · {po.review_status}</p>}
                    </div>
                  )}
                  {phase.n === 5 && current === 5 && (
                    <form
                      className="space-y-3"
                      onSubmit={sampleForm.handleSubmit(async (v) => {
                        if (!orgId) return;
                        const { data: codes, error: cErr } = await labSchema().rpc('next_sample_codes', {
                          p_org: orgId,
                          p_product: row.product_name,
                          p_count: v.quantity,
                          p_pattern: pattern,
                        });
                        if (cErr || !codes) { setError(cErr?.message ?? 'Codification impossible'); return; }
                        const rows = (codes as string[]).map((code, index) => ({
                          organization_id: orgId,
                          request_id: row.id,
                          quote_id: quote?.id ?? null,
                          purchase_order_id: po?.id ?? null,
                          code: code || formatSampleCode({ sequence: index + 1, product: row.product_name, pattern }),
                          product_name: row.product_name,
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
                        if (canTransition(row.status, 'SAMPLES_RECEIVED')) await setStatus('SAMPLES_RECEIVED');
                        if (canTransition('SAMPLES_RECEIVED', 'SAMPLES_CODED')) {
                          await labSchema().from('client_requests').update({ status: 'SAMPLES_CODED' }).eq('id', row.id);
                          setRow({ ...row, status: 'SAMPLES_CODED' });
                        }
                        setSampleCount(rows.length);
                        setSampleCodes(rows.map((r) => r.code));
                        setMessage(`${rows.length} échantillon(s) reçus et codés`);
                      })}
                    >
                      {sampleCodes.length > 0 && <p className="text-sm text-[#0B1F33]">{sampleCodes.join(' · ')}</p>}
                      <LabField label="Date de réception" tone="light"><input className={labControlClass()} type="datetime-local" {...sampleForm.register('received_at')} /></LabField>
                      <LabField label="Transporteur" tone="light"><input className={labControlClass()} {...sampleForm.register('carrier')} /></LabField>
                      <LabField label="Réceptionnaire" tone="light"><input className={labControlClass()} {...sampleForm.register('received_by')} /></LabField>
                      <LabField label="État" tone="light"><input className={labControlClass()} {...sampleForm.register('condition_notes')} /></LabField>
                      <LabField label="Nombre" tone="light"><input className={labControlClass()} type="number" {...sampleForm.register('quantity')} /></LabField>
                      <LabBtn type="submit" tone="gold" disabled={!sampleForm.formState.isValid}>Réceptionner et coder</LabBtn>
                    </form>
                  )}
                  {phase.n === 6 && current === 6 && (
                    <div className="space-y-3">
                      {sampleCodes.map((code) => <p key={code} className="text-sm text-[#0B1F33]">{code}</p>)}
                      <LabBtn
                        tone="gold"
                        disabled={analysisOrderSent}
                        onClick={async () => {
                          if (!orgId) return;
                          const sel = await labSchema().from('supplier_selection').select('selected_supplier_id').eq('request_id', row.id).maybeSingle();
                          const supplierId = sel.data?.selected_supplier_id;
                          if (!supplierId) { setError('Aucun fournisseur historisé'); return; }
                          const expected = new Date();
                          expected.setDate(expected.getDate() + 7);
                          const poNum = await labSchema().rpc('next_supplier_po');
                          const sample = await labSchema().from('samples').select('id,code').eq('request_id', row.id).limit(1).maybeSingle();
                          const { error: oErr } = await labSchema().from('analysis_orders').insert({
                            organization_id: orgId,
                            request_id: row.id,
                            supplier_id: supplierId,
                            sample_id: sample.data?.id,
                            expected_date: expected.toISOString().slice(0, 10),
                            sent_at: new Date().toISOString(),
                            po_number: poNum.data ?? `PO-SUP-${row.dossier_number}`,
                            language: 'en',
                          });
                          if (oErr) { setError(oErr.message); return; }
                          await labSchema().from('supplier_deadlines').insert({
                            organization_id: orgId, request_id: row.id, supplier_id: supplierId,
                            expected_date: expected.toISOString().slice(0, 10), penalty_rate: null,
                          });
                          if (canTransition(row.status, 'SENT_TO_SUPPLIER')) await setStatus('SENT_TO_SUPPLIER');
                          setAnalysisOrderSent(true);
                          setMessage('Ordre ST envoyé');
                        }}
                      >
                        Envoyer l’ordre d’analyse
                      </LabBtn>
                    </div>
                  )}
                  {phase.n === 7 && current === 7 && (
                    <div className="space-y-4">
                      <form
                        className="space-y-3"
                        onSubmit={resultForm.handleSubmit(async (v) => {
                          if (!orgId) return;
                          const { error: iErr } = await labSchema().from('analysis_results').insert({
                            organization_id: orgId,
                            request_id: row.id,
                            analysis_name: v.analysis_name,
                            value: v.value,
                            unit: v.unit,
                            method: v.method,
                            ai_summary: 'IA (aide) — non validante',
                          });
                          if (iErr) { setError(iErr.message); return; }
                          if (canTransition(row.status, 'RESULTS_RECEIVED')) await setStatus('RESULTS_RECEIVED');
                          if (canTransition('RESULTS_RECEIVED', 'AI_REVIEW')) {
                            await labSchema().from('client_requests').update({ status: 'AI_REVIEW' }).eq('id', row.id);
                            setRow({ ...row, status: 'AI_REVIEW' });
                          }
                          setMessage('Résultat enregistré — l’IA n’a pas validé');
                        })}
                      >
                        <input type="hidden" value={row.id} {...resultForm.register('request_id')} />
                        <LabField label="Analyse" tone="light"><input className={labControlClass()} {...resultForm.register('analysis_name')} /></LabField>
                        <LabField label="Valeur" tone="light"><input className={labControlClass()} {...resultForm.register('value')} /></LabField>
                        <LabField label="Unité" tone="light"><input className={labControlClass()} {...resultForm.register('unit')} /></LabField>
                        <LabField label="Méthode" tone="light"><input className={labControlClass()} {...resultForm.register('method')} /></LabField>
                        <LabBtn type="submit" tone="navy" disabled={!resultForm.formState.isValid}>Enregistrer le résultat</LabBtn>
                      </form>
                      {can(role, 'results.review.final') && (
                        <LabBtn
                          tone="gold"
                          onClick={async () => {
                            if (!confirmLabAction('Validation finale Zineb ?')) return;
                            const res = await labSchema().from('analysis_results').select('id').eq('request_id', row.id).limit(1).maybeSingle();
                            if (res.data?.id) {
                              await labSchema().from('result_reviews').insert({
                                organization_id: orgId, result_id: res.data.id, level: 'FINAL', decision: 'ACCEPTER', reviewer_id: userId,
                              });
                            }
                            await setStatus('APPROVED');
                            setFinalApproved(true);
                            setMessage('Validation Zineb enregistrée');
                          }}
                        >
                          Zineb — valider
                        </LabBtn>
                      )}
                    </div>
                  )}
                  {phase.n === 8 && current === 8 && (
                    <LabBtn
                      tone="gold"
                      onClick={async () => {
                        if (!orgId) return;
                        const samples = await labSchema().from('samples').select('code').eq('request_id', row.id);
                        const results = await labSchema().from('analysis_results').select('analysis_name,value,unit,method').eq('request_id', row.id);
                        const reviews = await labSchema().from('result_reviews').select('decision,level').eq('organization_id', orgId);
                        const check = reportReadiness({
                          client: !!row.company_name,
                          sample: (samples.data ?? []).length > 0,
                          sampleCode: (samples.data ?? []).every((s) => !!s.code),
                          methods: (results.data ?? []).every((x) => !!x.method),
                          results: (results.data ?? []).length > 0,
                          units: (results.data ?? []).every((x) => !!x.unit),
                          dates: true,
                          validations: (reviews.data ?? []).some((v) => v.level === 'FINAL' && (v.decision === 'ACCEPTER' || v.decision === 'accept')),
                        });
                        if (!check.ok) { setError(`Mentions manquantes: ${check.missing.join(', ')}`); return; }
                        const blob = buildLabReportPdf({
                          kind: pickTemplateKind(row.analysis_kind),
                          dossier: row.dossier_number,
                          client: row.company_name,
                          sampleCodes: (samples.data ?? []).map((s) => s.code),
                          results: (results.data ?? []).map((x) => ({
                            analysis_name: x.analysis_name, value: x.value, unit: x.unit, method: x.method,
                          })),
                        });
                        downloadBlob(blob, `${row.dossier_number}.pdf`);
                        const { data, error: iErr } = await labSchema().from('reports').insert({
                          organization_id: orgId, request_id: row.id, delivery_status: 'queued', storage_path: `${row.dossier_number}.pdf`,
                          sent_at: new Date().toISOString(), recipient: row.company_name,
                        }).select('id').maybeSingle();
                        if (iErr || !data) { setError(iErr?.message ?? 'Génération impossible'); return; }
                        await labSchema().from('email_messages').insert(queueEmailPayload(orgId, 'report_ready', row.company_name, {
                          dossier: row.dossier_number,
                        }));
                        if (canTransition(row.status, 'REPORT_GENERATION')) await setStatus('REPORT_GENERATION');
                        if (canTransition(row.status, 'REPORT_SENT') || canTransition('REPORT_GENERATION', 'REPORT_SENT')) {
                          await labSchema().from('client_requests').update({ status: 'REPORT_SENT' }).eq('id', row.id);
                          setRow({ ...row, status: 'REPORT_SENT' });
                        }
                        setReportSent(true);
                        setMessage('PDF généré et notifié');
                      }}
                    >
                      Générer et envoyer le PDF
                    </LabBtn>
                  )}
                  {phase.n === 9 && current === 9 && (
                    <LabBtn
                      tone="gold"
                      disabled={invoiced}
                      onClick={async () => {
                        if (!orgId) return;
                        const qrow = await labSchema().from('quotes').select('amount').eq('request_id', row.id).maybeSingle();
                        const num = await labSchema().rpc('next_invoice_number');
                        const { error: iErr } = await labSchema().from('client_invoices').insert({
                          organization_id: orgId, request_id: row.id, invoice_number: num.data ?? `FAC-${row.dossier_number}`,
                          amount_total: qrow.data?.amount ?? 0,
                          due_date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
                          status: 'EN_ATTENTE',
                        });
                        if (iErr) { setError(iErr.message); return; }
                        setInvoiced(true);
                        if (canTransition(row.status, 'INVOICED')) await setStatus('INVOICED');
                        setMessage('Facture émise');
                      }}
                    >
                      Émettre la facture
                    </LabBtn>
                  )}
                  {phase.n === 10 && (
                    <p className="text-sm leading-relaxed text-[#0B1F33]">
                      {row.status === 'CLOSED' ? 'Dossier archivé.' : 'Clôture après facturation. Audit et sauvegardes restent dans Référentiels.'}
                    </p>
                  )}
                  {phase.n === current && (
                    <LabBtn
                      type="button"
                      tone="gold"
                      className="lab-suivant"
                      disabled={!suivantEnabled}
                      onClick={() => void onSuivant()}
                    >
                      {wizardSuivantLabel(current)}
                    </LabBtn>
                  )}
                  {phase.n !== current && (
                    <LabBtn tone="navy" className="lab-suivant" onClick={() => setViewPhase(current)}>
                      Revenir à la phase en cours
                    </LabBtn>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
