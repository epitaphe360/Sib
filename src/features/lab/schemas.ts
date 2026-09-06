import { z } from 'zod';
import { ANALYSIS_KINDS } from './types';

export const moroccoPhoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{8,15}$/, 'Chiffres uniquement (8 à 15)');

export const clientRequestSchema = z.object({
  company_name: z.string().trim().min(2, 'Société requise'),
  contact_name: z.string().trim().min(2, 'Contact requis'),
  email: z.string().trim().email('Email invalide'),
  country_code: z.literal('+212'),
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

export const qualifySchema = z.object({
  analysis_kind: z.enum(ANALYSIS_KINDS),
  internal_notes: z.string().max(2000).optional().or(z.literal('')),
});

export const consultationSchema = z.object({
  recipient_mode: z.enum(['TOP_3', 'TOP_5', 'ALL']),
  supplier_ids: z.array(z.string().uuid()).min(1, 'Choisir au moins un fournisseur'),
});

export const quoteDraftSchema = z.object({
  supplier_amount: z.coerce.number().nonnegative('Montant ≥ 0'),
  turnaround_days: z.coerce.number().int().positive('Délai > 0'),
  conditions: z.string().max(2000).optional().or(z.literal('')),
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

