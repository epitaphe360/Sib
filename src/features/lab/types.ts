export const LAB_ROLES = [
  'SUPER_ADMIN',
  'DIRECTION',
  'RESPONSABLE_VALIDATION',
  'RESPONSABLE_TECHNIQUE',
  'ASSISTANTE',
  'TECHNICIEN',
  'FINANCE',
  'UTILISATEUR_STANDARD',
  'CLIENT',
] as const;

export type LabRole = (typeof LAB_ROLES)[number];

export const DOSSIER_STATUSES = [
  'NEW_REQUEST',
  'QUALIFICATION',
  'WAITING_SUPPLIER_QUOTES',
  'SUPPLIER_SELECTED',
  'CLIENT_QUOTE_DRAFT',
  'CLIENT_QUOTE_SENT',
  'WAITING_CLIENT_RESPONSE',
  'PURCHASE_ORDER_RECEIVED',
  'WAITING_SAMPLES',
  'SAMPLES_RECEIVED',
  'SAMPLES_CODED',
  'SENT_TO_SUPPLIER',
  'ANALYSIS_IN_PROGRESS',
  'RESULTS_RECEIVED',
  'AI_REVIEW',
  'TECHNICAL_REVIEW',
  'FINAL_REVIEW',
  'CORRECTION_REQUESTED',
  'APPROVED',
  'REPORT_GENERATION',
  'REPORT_SENT',
  'INVOICED',
  'CLOSED',
] as const;

export type DossierStatus = (typeof DOSSIER_STATUSES)[number];

export const ANALYSIS_KINDS = ['PHYSICO_CHIMIQUE', 'MICROBIOLOGIQUE', 'MIXTE'] as const;
export type AnalysisKind = (typeof ANALYSIS_KINDS)[number];

export const TASK_STATUSES = ['NOUVELLE', 'EN_COURS', 'EN_ATTENTE', 'A_VALIDER', 'TERMINEE'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const INVOICE_STATUSES = ['EN_ATTENTE', 'PARTIELLEMENT_PAYEE', 'PAYEE', 'IMPAYEE'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const ADMIN_ROLES: LabRole[] = LAB_ROLES.filter((r) => r !== 'CLIENT');

export interface LabOrganization {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface LabMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: LabRole;
  client_id: string | null;
  organization?: LabOrganization;
}

export interface LabClientRequest {
  id: string;
  organization_id: string;
  dossier_number: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  product_name: string;
  matrix: string | null;
  sample_type: string | null;
  sample_count: number;
  accreditation_required: boolean;
  notes: string | null;
  analysis_kind: AnalysisKind | null;
  execution_channel?: 'INTERNAL' | 'SUBCONTRACTED' | 'MIXTE' | null;
  status: DossierStatus;
  created_at: string;
  qualification?: Record<string, unknown> | null;
  ice_status?: string | null;
}
