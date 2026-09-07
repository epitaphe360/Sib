import { DOSSIER_STATUSES, type DossierStatus } from '../types';

const TRANSITIONS: Record<DossierStatus, DossierStatus[]> = {
  NEW_REQUEST: ['QUALIFICATION'],
  QUALIFICATION: ['WAITING_SUPPLIER_QUOTES', 'CLIENT_QUOTE_DRAFT'],
  WAITING_SUPPLIER_QUOTES: ['SUPPLIER_SELECTED'],
  SUPPLIER_SELECTED: ['CLIENT_QUOTE_DRAFT'],
  CLIENT_QUOTE_DRAFT: ['CLIENT_QUOTE_SENT'],
  CLIENT_QUOTE_SENT: ['WAITING_CLIENT_RESPONSE', 'PURCHASE_ORDER_RECEIVED'],
  WAITING_CLIENT_RESPONSE: ['PURCHASE_ORDER_RECEIVED', 'CLIENT_QUOTE_SENT'],
  PURCHASE_ORDER_RECEIVED: ['WAITING_SAMPLES'],
  WAITING_SAMPLES: ['SAMPLES_RECEIVED'],
  SAMPLES_RECEIVED: ['SAMPLES_CODED'],
  SAMPLES_CODED: ['SENT_TO_SUPPLIER'],
  SENT_TO_SUPPLIER: ['ANALYSIS_IN_PROGRESS'],
  ANALYSIS_IN_PROGRESS: ['RESULTS_RECEIVED'],
  RESULTS_RECEIVED: ['AI_REVIEW'],
  AI_REVIEW: ['TECHNICAL_REVIEW'],
  TECHNICAL_REVIEW: ['FINAL_REVIEW', 'CORRECTION_REQUESTED'],
  FINAL_REVIEW: ['APPROVED', 'CORRECTION_REQUESTED'],
  CORRECTION_REQUESTED: ['RESULTS_RECEIVED'],
  APPROVED: ['REPORT_GENERATION'],
  REPORT_GENERATION: ['REPORT_SENT'],
  REPORT_SENT: ['INVOICED'],
  INVOICED: ['CLOSED'],
  CLOSED: [],
};

export function canTransition(from: DossierStatus, to: DossierStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: DossierStatus, to: DossierStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Transition interdite: ${from} → ${to}`);
  }
}

export function isDossierStatus(value: string): value is DossierStatus {
  return (DOSSIER_STATUSES as readonly string[]).includes(value);
}
