import type { DossierStatus } from '../types';
import { LAB_ROUTES } from '../routes';
import { LAB_JOURNEY } from './journey';

/** 10 case phases. Infographic steps 9 (portail) and 10 (dashboard) are places, not dossier states. */
export interface LabCasePhase {
  n: number;
  infographic: number;
  title: string;
  short: string;
  nextAction: string;
  statuses: DossierStatus[];
}

export const LAB_PLACE_INFOGRAPHIC_STEPS = [9, 10] as const;

export const LAB_CASE_PHASES: LabCasePhase[] = [
  {
    n: 1,
    infographic: 1,
    title: 'Demande reçue',
    short: 'Demande',
    nextAction: 'Prendre connaissance de la demande, puis passer à la qualification.',
    statuses: ['NEW_REQUEST'],
  },
  {
    n: 2,
    infographic: 2,
    title: 'Qualification',
    short: 'Qualification',
    nextAction: 'Enregistrer le canal Interne / Sous-traité et le type d’analyse.',
    statuses: ['QUALIFICATION'],
  },
  {
    n: 3,
    infographic: 3,
    title: 'Consultation ST',
    short: 'Consultation',
    nextAction: 'Choisir le sous-traitant (décision humaine) — canal Interne : saut automatique.',
    statuses: ['WAITING_SUPPLIER_QUOTES', 'SUPPLIER_SELECTED'],
  },
  {
    n: 4,
    infographic: 4,
    title: 'Devis + BDC',
    short: 'Devis / BDC',
    nextAction: 'Valider le devis, l’envoyer, puis rattacher le bon de commande accepté.',
    statuses: ['CLIENT_QUOTE_DRAFT', 'CLIENT_QUOTE_SENT', 'WAITING_CLIENT_RESPONSE', 'PURCHASE_ORDER_RECEIVED'],
  },
  {
    n: 5,
    infographic: 5,
    title: 'Réception ECH',
    short: 'Échantillons',
    nextAction: 'Réceptionner et coder au moins un échantillon.',
    statuses: ['WAITING_SAMPLES', 'SAMPLES_RECEIVED', 'SAMPLES_CODED'],
  },
  {
    n: 6,
    infographic: 6,
    title: 'Lancement analyses',
    short: 'Analyses',
    nextAction: 'Envoyer l’ordre d’analyse au sous-traitant.',
    statuses: ['SENT_TO_SUPPLIER', 'ANALYSIS_IN_PROGRESS'],
  },
  {
    n: 7,
    infographic: 7,
    title: 'Triple contrôle',
    short: 'Contrôle',
    nextAction: 'Valider les résultats : aide IA, responsable technique, puis Madame Zineb.',
    statuses: ['RESULTS_RECEIVED', 'AI_REVIEW', 'TECHNICAL_REVIEW', 'FINAL_REVIEW', 'CORRECTION_REQUESTED'],
  },
  {
    n: 8,
    infographic: 8,
    title: 'Rapport',
    short: 'Rapport',
    nextAction: 'Générer le PDF et l’envoyer au client.',
    statuses: ['APPROVED', 'REPORT_GENERATION', 'REPORT_SENT'],
  },
  {
    n: 9,
    infographic: 11,
    title: 'Facturation',
    short: 'Facturation',
    nextAction: 'Émettre la facture client. Les règlements restent une sous-étape.',
    statuses: ['INVOICED'],
  },
  {
    n: 10,
    infographic: 12,
    title: 'Archive',
    short: 'Archive',
    nextAction: 'Clôturer le dossier.',
    statuses: ['CLOSED'],
  },
];

export const STATUS_LABEL_FR: Record<DossierStatus, string> = {
  NEW_REQUEST: 'Nouvelle demande',
  QUALIFICATION: 'En qualification',
  WAITING_SUPPLIER_QUOTES: 'Attente offres ST',
  SUPPLIER_SELECTED: 'Sous-traitant choisi',
  CLIENT_QUOTE_DRAFT: 'Devis brouillon',
  CLIENT_QUOTE_SENT: 'Devis envoyé',
  WAITING_CLIENT_RESPONSE: 'Attente client',
  PURCHASE_ORDER_RECEIVED: 'BDC reçu',
  WAITING_SAMPLES: 'Attente échantillons',
  SAMPLES_RECEIVED: 'Échantillons reçus',
  SAMPLES_CODED: 'Échantillons codés',
  SENT_TO_SUPPLIER: 'Envoyé au ST',
  ANALYSIS_IN_PROGRESS: 'Analyses en cours',
  RESULTS_RECEIVED: 'Résultats reçus',
  AI_REVIEW: 'Revue IA (aide)',
  TECHNICAL_REVIEW: 'Revue technique',
  FINAL_REVIEW: 'Revue Zineb',
  CORRECTION_REQUESTED: 'Correction demandée',
  APPROVED: 'Validé',
  REPORT_GENERATION: 'Rapport en cours',
  REPORT_SENT: 'Rapport envoyé',
  INVOICED: 'Facturé',
  CLOSED: 'Clôturé',
};

export type PhaseRailState = 'done' | 'current' | 'locked';
export type QueueBucketKey = 'late' | 'todo' | 'wait' | 'validate';

export interface PhaseGateContext {
  status: DossierStatus | string;
  executionChannel?: string | null;
  acknowledgedRead?: boolean;
  analysisKind?: string | null;
  consultationStarted?: boolean;
  supplierSelected?: boolean;
  quoteReady?: boolean;
  poAccepted?: boolean;
  sampleCount?: number;
  analysisOrderSent?: boolean;
  finalApproved?: boolean;
  reportSent?: boolean;
  invoiced?: boolean;
  closed?: boolean;
}

const TODO_STATUSES = new Set([
  'NEW_REQUEST',
  'QUALIFICATION',
  'SUPPLIER_SELECTED',
  'CLIENT_QUOTE_DRAFT',
  'PURCHASE_ORDER_RECEIVED',
  'SAMPLES_RECEIVED',
  'SAMPLES_CODED',
  'RESULTS_RECEIVED',
  'APPROVED',
  'REPORT_GENERATION',
  'REPORT_SENT',
]);

const WAIT_STATUSES = new Set([
  'WAITING_SUPPLIER_QUOTES',
  'CLIENT_QUOTE_SENT',
  'WAITING_CLIENT_RESPONSE',
  'WAITING_SAMPLES',
  'SENT_TO_SUPPLIER',
  'ANALYSIS_IN_PROGRESS',
  'CORRECTION_REQUESTED',
]);

const VALIDATE_STATUSES = new Set(['AI_REVIEW', 'TECHNICAL_REVIEW', 'FINAL_REVIEW']);

export function dossierPhaseForStatus(status: DossierStatus | string | null | undefined): number {
  if (!status) return 1;
  const hit = LAB_CASE_PHASES.find((phase) => phase.statuses.includes(status as DossierStatus));
  return hit?.n ?? 1;
}

export function casePhaseByNumber(n: number): LabCasePhase | undefined {
  return LAB_CASE_PHASES.find((phase) => phase.n === n);
}

export function isInfographicPlace(step: number): boolean {
  return (LAB_PLACE_INFOGRAPHIC_STEPS as readonly number[]).includes(step);
}

export function infographicToCasePhase(step: number): number | null {
  if (isInfographicPlace(step)) return null;
  const hit = LAB_CASE_PHASES.find((phase) => phase.infographic === step);
  return hit?.n ?? null;
}

export function skipsConsultation(channel: string | null | undefined): boolean {
  return channel === 'INTERNAL';
}

export function phaseRailState(phase: number, current: number): PhaseRailState {
  if (phase < current) return 'done';
  if (phase === current) return 'current';
  return 'locked';
}

/** Rail jump: completed and current only. Future phases stay locked. */
export function canOpenPhase(phase: number, current: number): boolean {
  return phase >= 1 && phase <= current && phase <= LAB_CASE_PHASES.length;
}

export function statusLabelFr(status: DossierStatus | string | null | undefined): string {
  if (!status) return '—';
  return STATUS_LABEL_FR[status as DossierStatus] ?? status;
}

export function nextActionForStatus(
  status: DossierStatus | string | null | undefined,
  channel?: string | null,
): string {
  const phase = casePhaseByNumber(dossierPhaseForStatus(status));
  if (!phase) return 'Ouvrir le dossier.';
  if (phase.n === 3 && skipsConsultation(channel)) {
    return 'Canal interne : la consultation est sautée. Passer au devis.';
  }
  return phase.nextAction;
}

export function isCurrentPhaseReady(ctx: PhaseGateContext): boolean {
  const phase = dossierPhaseForStatus(ctx.status);
  switch (phase) {
    case 1:
      return !!ctx.acknowledgedRead;
    case 2:
      return !!ctx.analysisKind && !!ctx.executionChannel;
    case 3:
      if (skipsConsultation(ctx.executionChannel)) return true;
      return !!ctx.supplierSelected;
    case 4:
      return !!ctx.poAccepted;
    case 5:
      return (ctx.sampleCount ?? 0) > 0;
    case 6:
      return !!ctx.analysisOrderSent;
    case 7:
      return !!ctx.finalApproved;
    case 8:
      return !!ctx.reportSent;
    case 9:
      return !!ctx.invoiced || ctx.status === 'INVOICED';
    case 10:
      return !!ctx.closed || ctx.status === 'CLOSED';
    default:
      return false;
  }
}

export function wizardSuivantLabel(phase: number): string {
  if (phase >= 10) return 'Dossier clôturé';
  return 'Suivant';
}

export function requestWizardHref(id: string): string {
  return LAB_ROUTES.ADMIN_REQUEST.replace(':id', id);
}

export function queueBucketForStatus(status: string, late: boolean): QueueBucketKey {
  if (late) return 'late';
  if (VALIDATE_STATUSES.has(status)) return 'validate';
  if (WAIT_STATUSES.has(status)) return 'wait';
  if (status === 'INVOICED') return 'todo';
  if (TODO_STATUSES.has(status)) return 'todo';
  return 'todo';
}

export const QUEUE_BUCKETS: { key: QueueBucketKey; label: string; hint: string }[] = [
  { key: 'late', label: 'En retard', hint: 'Délai dépassé — traiter d’abord' },
  { key: 'todo', label: 'À faire', hint: 'Action opérateur maintenant' },
  { key: 'wait', label: 'En attente', hint: 'Client, ST ou échantillons' },
  { key: 'validate', label: 'À valider', hint: 'Revue technique / Zineb' },
];

export interface OperatorQueueItem {
  id: string;
  dossier: string;
  company: string;
  product?: string | null;
  status: string;
  phase: number;
  phaseTitle: string;
  nextAction: string;
  bucket: QueueBucketKey;
  href: string;
}

export function buildOperatorQueue(
  requests: Array<{
    id: string;
    status: string;
    dossier_number?: string | null;
    company_name?: string | null;
    product_name?: string | null;
    execution_channel?: string | null;
  }>,
  lateRequestIds: Iterable<string> = [],
): OperatorQueueItem[] {
  const late = new Set(lateRequestIds);
  return requests
    .filter((r) => r.status !== 'CLOSED')
    .map((r) => {
      const phase = dossierPhaseForStatus(r.status);
      const def = casePhaseByNumber(phase);
      return {
        id: r.id,
        dossier: r.dossier_number || r.id.slice(0, 8),
        company: r.company_name || 'Client',
        product: r.product_name,
        status: r.status,
        phase,
        phaseTitle: def?.title ?? `Phase ${phase}`,
        nextAction: nextActionForStatus(r.status, r.execution_channel),
        bucket: queueBucketForStatus(r.status, late.has(r.id)),
        href: requestWizardHref(r.id),
      };
    })
    .sort((a, b) => {
      const order: QueueBucketKey[] = ['late', 'todo', 'validate', 'wait'];
      const d = order.indexOf(a.bucket) - order.indexOf(b.bucket);
      if (d !== 0) return d;
      return a.phase - b.phase || a.dossier.localeCompare(b.dossier);
    });
}

export function groupQueueByPhase(items: OperatorQueueItem[]): Map<number, OperatorQueueItem[]> {
  const map = new Map<number, OperatorQueueItem[]>();
  for (const item of items) {
    const list = map.get(item.phase) ?? [];
    list.push(item);
    map.set(item.phase, list);
  }
  return map;
}

export function completedPhaseSummary(
  phase: number,
  row: {
    company_name?: string;
    product_name?: string;
    analysis_kind?: string | null;
    execution_channel?: string | null;
    notes?: string | null;
    status?: string;
  },
): string {
  switch (phase) {
    case 1:
      return [row.company_name, row.product_name].filter(Boolean).join(' · ') || 'Demande lue';
    case 2:
      return [row.analysis_kind, row.execution_channel].filter(Boolean).join(' · ') || 'Qualifiée';
    case 3:
      return skipsConsultation(row.execution_channel) ? 'Sautée (canal interne)' : 'Sous-traitant choisi';
    default:
      return statusLabelFr(row.status);
  }
}

export function journeyPlaces(): typeof LAB_JOURNEY {
  return LAB_JOURNEY.filter((step) => isInfographicPlace(step.n));
}
