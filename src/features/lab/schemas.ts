import { z } from 'zod';
import { ANALYSIS_KINDS } from './types';
import { LAB_COUNTRY_CODES } from './theme/tokens';

export const moroccoPhoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{8,15}$/, 'Chiffres uniquement (8 à 15)');

export const clientRequestSchema = z.object({
  company_name: z.string().trim().min(2, 'Société requise'),
  contact_name: z.string().trim().min(2, 'Contact requis'),
  email: z.string().trim().email('Email invalide'),
  country_code: z.enum(LAB_COUNTRY_CODES),
  phone: moroccoPhoneSchema,
  product_name: z.string().trim().min(2, 'Produit requis'),
  matrix: z.string().trim().optional().or(z.literal('')),
  sample_type: z.string().trim().optional().or(z.literal('')),
  sample_count: z.coerce.number().int().positive('Nombre > 0'),
  urgency: z.string().trim().optional().or(z.literal('')),
  deadline: z.string().optional().or(z.literal('')),
  accreditation_required: z.boolean().default(false),
  notes: z.string().max(4000).optional().or(z.literal('')),
  analyses: z.string().trim().min(2, 'Analyses requises'),
});

export type ClientRequestInput = z.infer<typeof clientRequestSchema>;

export const EXECUTION_CHANNELS = ['INTERNAL', 'SUBCONTRACTED', 'MIXTE'] as const;

export const qualifySchema = z.object({
  analysis_kind: z.enum(ANALYSIS_KINDS),
  execution_channel: z.enum(EXECUTION_CHANNELS),
  internal_notes: z.string().max(2000).optional().or(z.literal('')),
  internal_analyses: z.string().max(4000).optional().or(z.literal('')),
  subcontracted_analyses: z.string().max(4000).optional().or(z.literal('')),
});

export const consultationSchema = z.object({
  recipient_mode: z.enum(['TOP_3', 'TOP_5', 'ALL']),
  supplier_ids: z.array(z.string().uuid()).min(1, 'Choisir au moins un fournisseur'),
});

export const quoteDraftSchema = z.object({
  supplier_amount: z.coerce.number().nonnegative('Montant ≥ 0'),
  turnaround_days: z.coerce.number().int().positive('Délai > 0'),
  conditions: z.string().max(2000).optional().or(z.literal('')),
  margin_percent: z.coerce.number().min(0).max(100).optional(),
  market_ceiling: z.coerce.number().optional(),
});

export const otpEmailSchema = z.object({
  email: z.string().trim().email('Email invalide'),
});

export const otpCodeSchema = z.object({
  email: z.string().trim().email(),
  token: z.string().trim().min(6).max(8),
});

export const supplierSchema = z.object({
  name: z.string().trim().min(2, 'Nom requis'),
  email: z.string().trim().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().trim().regex(/^[0-9]*$/, 'Chiffres uniquement').optional().or(z.literal('')),
  contact_name: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().optional().or(z.literal('')),
  country: z.string().trim().min(2, 'Pays requis'),
  specialties: z.string().trim().optional().or(z.literal('')),
  accreditations: z.string().trim().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

export const supplierOfferSchema = z.object({
  amount: z.coerce.number().nonnegative('Montant ≥ 0'),
  currency: z.string().trim().min(3).max(3).default('EUR'),
  pricing_type: z.enum(['unit', 'forfait']),
  turnaround_days: z.coerce.number().int().positive('Délai > 0'),
  method: z.string().trim().optional().or(z.literal('')),
  accreditation: z.string().trim().optional().or(z.literal('')),
  quantity: z.coerce.number().positive().optional(),
  conditions: z.string().max(2000).optional().or(z.literal('')),
  valid_until: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const quoteSurveySchema = z.object({
  received: z.boolean(),
  priceOk: z.boolean(),
  delayOk: z.boolean(),
  priceTooHigh: z.boolean(),
  comment: z.string().max(2000).optional().or(z.literal('')),
});

export const ingestPurchaseOrderSchema = z.object({
  quote_id: z.string().uuid('Devis requis'),
  reference: z.string().trim().min(2, 'Référence BDC requise'),
  client_name: z.string().trim().min(2, 'Client requis'),
  amount: z.coerce.number().nonnegative('Montant ≥ 0'),
  analyses: z.string().trim().optional().or(z.literal('')),
});

export const receiveSamplesSchema = z.object({
  received_at: z.string().min(1, 'Date/heure requise'),
  carrier: z.string().trim().min(1, 'Transporteur requis'),
  received_by: z.string().trim().min(2, 'Réceptionnaire requis'),
  condition_notes: z.string().trim().min(1, 'État requis'),
  temperature: z.coerce.number().optional(),
  quantity: z.coerce.number().int().positive('Nombre > 0'),
  observation: z.string().max(2000).optional().or(z.literal('')),
});

export const resultSchema = z.object({
  request_id: z.string().uuid(),
  sample_id: z.string().uuid().optional().or(z.literal('')),
  analysis_name: z.string().trim().min(2),
  value: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  method: z.string().trim().min(1),
  uncertainty: z.string().optional().or(z.literal('')),
  accreditation: z.string().optional().or(z.literal('')),
});

export const reviewSchema = z.object({
  decision: z.enum(['ACCEPTER', 'REFUSER']),
  comment: z.string().max(2000).optional().or(z.literal('')),
});

export const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  paid_at: z.string().min(1),
});

export const settingsSchema = z.object({
  penalty_percent_per_day: z.coerce.number().min(0).max(100),
  quote_followup_days: z.coerce.number().int().min(1).max(30),
  document_retention_days: z.coerce.number().int().min(30),
  sample_code_pattern: z.string().min(3),
  correction_hours: z.coerce.number().int().min(1).max(72),
});

export const taskSchema = z.object({
  title: z.string().trim().min(2),
  priority: z.enum(['low', 'normal', 'high']),
  due_date: z.string().optional().or(z.literal('')),
});

export const clientCallSchema = z.object({
  company_name: z.string().trim().min(2, 'Société requise'),
  contact_name: z.string().trim().min(2, 'Contact requis'),
  phone: z.string().trim().regex(/^[0-9]*$/, 'Chiffres uniquement').optional().or(z.literal('')),
  subject: z.string().trim().min(2, 'Objet requis'),
  notes: z.string().max(4000).optional().or(z.literal('')),
  follow_up_at: z.string().optional().or(z.literal('')),
});

export const quoteVersionSchema = z.object({
  supplier_amount: z.coerce.number().nonnegative(),
  margin_percent: z.coerce.number().min(0).max(100),
  reason: z.string().trim().min(2, 'Motif requis'),
});



