import { z } from 'zod';

/**
 * Schémas de validation pour tous les formulaires
 * Utilise Zod pour la validation côté client et serveur
 */

// Secteurs d'activité
export const SECTORS = [
  'pharma',
  'banking',
  'industry',
  'transport',
  'administration',
  'other',
] as const;

export type Sector = (typeof SECTORS)[number];

// Types de besoins
export const NEED_TYPES = [
  'events',
  'brand_architecture',
  'production',
  'global_360',
] as const;

export type NeedType = (typeof NEED_TYPES)[number];

// Schéma du formulaire de brief stratégique
export const StrategicBriefSchema = z.object({
  // Étape 1 - Secteur
  sector: z.enum(SECTORS, {
    errorMap: () => ({ message: 'Veuillez sélectionner un secteur' }),
  }),

  // Étape 2 - Type de besoin
  needType: z.enum(NEED_TYPES, {
    errorMap: () => ({ message: 'Veuillez sélectionner un type de besoin' }),
  }),

  // Étape 3 - Détails du projet
  projectDescription: z
    .string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(2000, 'La description ne doit pas dépasser 2000 caractères'),

  budgetRange: z
    .enum(['under_50k', '50k_100k', '100k_250k', '250k_500k', 'above_500k'], {
      errorMap: () => ({ message: 'Veuillez sélectionner une plage budgétaire' }),
    })
    .optional(),

  // Étape 4 - Coordonnées
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),

  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères'),

  jobTitle: z
    .string()
    .min(2, 'Le poste doit contenir au moins 2 caractères')
    .max(100, 'Le poste ne doit pas dépasser 100 caractères'),

  company: z
    .string()
    .min(2, "L'entreprise doit contenir au moins 2 caractères")
    .max(100, "L'entreprise ne doit pas dépasser 100 caractères"),

  email: z
    .string()
    .email('Veuillez entrer une adresse email valide')
    .max(100, "L'email ne doit pas dépasser 100 caractères"),

  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-()]+$/, 'Veuillez entrer un numéro de téléphone valide')
    .max(20, 'Le téléphone ne doit pas dépasser 20 caractères'),

  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
});

export type StrategicBriefFormData = z.infer<typeof StrategicBriefSchema>;

// Schéma du formulaire de contact simple
export const ContactFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),

  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères'),

  email: z
    .string()
    .email('Veuillez entrer une adresse email valide')
    .max(100, "L'email ne doit pas dépasser 100 caractères"),

  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-()]+$/, 'Veuillez entrer un numéro de téléphone valide')
    .max(20, 'Le téléphone ne doit pas dépasser 20 caractères'),

  subject: z
    .string()
    .min(5, 'Le sujet doit contenir au moins 5 caractères')
    .max(100, 'Le sujet ne doit pas dépasser 100 caractères'),

  message: z
    .string()
    .min(20, 'Le message doit contenir au moins 20 caractères')
    .max(5000, 'Le message ne doit pas dépasser 5000 caractères'),

  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// Schéma pour l'outil d'auto-évaluation QHSE
export const QHSEScoreSchema = z.object({
  q1: z.number().min(1).max(5),
  q2: z.number().min(1).max(5),
  q3: z.number().min(1).max(5),
  q4: z.number().min(1).max(5),
  q5: z.number().min(1).max(5),
  email: z.string().email('Veuillez entrer une adresse email valide'),
});

export type QHSEScoreData = z.infer<typeof QHSEScoreSchema>;

// Schéma pour le calculateur d'optimisation Fabrique
export const FabriqueCalculatorSchema = z.object({
  numberOfSuppliers: z.number().min(1).max(20),
  monthlyProductionVolume: z.number().min(1).max(10000),
  averageCostPerUnit: z.number().min(1).max(10000),
  productionLeadTime: z.number().min(1).max(180),
});

export type FabriqueCalculatorData = z.infer<typeof FabriqueCalculatorSchema>;
