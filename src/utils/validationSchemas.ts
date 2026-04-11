/**
 * Schémas de validation Zod réutilisables
 * À utiliser côté client ET côté serveur
 */

import { z } from 'zod';

/**
 * Validation d'email
 */
export const emailSchema = z
  .string()
  .email('Adresse email invalide')
  .min(5, 'Email trop court')
  .max(255, 'Email trop long');

/**
 * Validation de mot de passe (sécurisé)
 */
export const passwordSchema = z
  .string()
  .min(12, 'Minimum 12 caractères')
  .max(128, 'Maximum 128 caractères')
  .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Doit contenir au moins un caractère spécial');

/**
 * Validation de numéro de téléphone (format international)
 */
export const phoneSchema = z
  .string()
  .regex(
    /^\+?[0-9\s\-()]{10,20}$/,
    'Format de téléphone invalide'
  )
  .min(10, 'Numéro trop court')
  .max(20, 'Numéro trop long');

/**
 * Validation d'URL
 */
export const urlSchema = z
  .string()
  .url('URL invalide')
  .regex(/^https?:\/\//, 'L\'URL doit commencer par http:// ou https://')
  .max(2048, 'URL trop longue');

/**
 * Validation de nom (prénom, nom, entreprise)
 */
export const nameSchema = z
  .string()
  .min(2, 'Minimum 2 caractères')
  .max(100, 'Maximum 100 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Caractères invalides dans le nom');

/**
 * Validation de description/bio
 */
export const descriptionSchema = z
  .string()
  .min(50, 'Minimum 50 caractères')
  .max(5000, 'Maximum 5000 caractères');

/**
 * Schéma pour création utilisateur
 */
export const userCreationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  type: z.enum(['admin', 'exhibitor', 'partner', 'visitor', 'security']),
  profile: z.object({
    company: z.string().max(200).optional(),
    position: z.string().max(200).optional(),
    phone: phoneSchema.optional(),
    linkedin: urlSchema.optional(),
    website: urlSchema.optional(),
    bio: descriptionSchema.optional(),
    country: z.string().min(2).max(100),
  })
});

/**
 * Schéma pour mise à jour utilisateur
 */
export const userUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  profile: z.object({
    company: z.string().max(200).optional(),
    position: z.string().max(200).optional(),
    phone: phoneSchema.optional(),
    linkedin: urlSchema.optional(),
    website: urlSchema.optional(),
    bio: descriptionSchema.optional(),
    country: z.string().min(2).max(100).optional(),
  }).optional()
});

/**
 * Schéma pour création produit
 */
export const productCreationSchema = z.object({
  name: z.string().min(3, 'Minimum 3 caractères').max(200, 'Maximum 200 caractères'),
  description: descriptionSchema,
  category: z.string().min(2, 'Catégorie requise'),
  price: z.number().min(0, 'Prix invalide').optional(),
  images: z.array(urlSchema).max(10, 'Maximum 10 images').optional(),
  specifications: z.record(z.string()).optional(),
});

/**
 * Schéma pour création événement
 */
export const eventCreationSchema = z.object({
  title: z.string().min(5, 'Minimum 5 caractères').max(200, 'Maximum 200 caractères'),
  description: descriptionSchema,
  date: z.string().datetime('Date invalide'),
  location: z.string().min(3, 'Lieu requis').max(200),
  capacity: z.number().int().min(1, 'Capacité minimum 1').optional(),
  category: z.string().min(2).optional(),
});

/**
 * Schéma pour création rendez-vous
 */
export const appointmentCreationSchema = z.object({
  exhibitorId: z.string().uuid('ID exposant invalide'),
  visitorId: z.string().uuid('ID visiteur invalide'),
  timeSlotId: z.string().uuid('ID créneau invalide'),
  date: z.string().datetime('Date invalide'),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
});

/**
 * Helper pour valider des données avec un schéma Zod
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  return { success: false, errors };
}

/**
 * Helper pour valider et throw si invalide
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = validateData(schema, data);

  if (!result.success) {
    throw new Error(`Validation failed:\n${result.errors.join('\n')}`);
  }

  return result.data;
}

export default {
  emailSchema,
  passwordSchema,
  phoneSchema,
  urlSchema,
  nameSchema,
  descriptionSchema,
  userCreationSchema,
  userUpdateSchema,
  productCreationSchema,
  eventCreationSchema,
  appointmentCreationSchema,
  validateData,
  validateOrThrow
};
