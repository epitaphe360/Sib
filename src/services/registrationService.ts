/**
 * ✅ FIX P0-4: Service unifié d'inscription
 *
 * Centralise la logique commune entre:
 * - VisitorFreeRegistration
 * - VisitorVIPRegistration
 * - PartnerSignUpPage
 *
 * Élimine la duplication de code et standardise le processus d'inscription
 */

import { z } from 'zod';
import { supabase } from '../lib/supabase';

// ✅ Schéma de validation de mot de passe unifié (12 caractères minimum pour tous)
export const PASSWORD_SCHEMA = z.string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères")
  .max(128, "Le mot de passe ne doit pas dépasser 128 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Le mot de passe doit contenir au moins un caractère spécial");

// ✅ Schéma de validation de téléphone international unifié
export const PHONE_SCHEMA = z.string()
  .min(5, "Le numéro de téléphone est requis")
  .regex(/^\+?[1-9]\d{1,14}$/, "Format international invalide (ex: +237612345678)");

export type UserType = 'visitor' | 'partner' | 'exhibitor';
export type VisitorLevel = 'free' | 'premium' | 'vip';
export type PartnerTier = 'museum' | 'silver' | 'gold' | 'platinum';

export interface BaseRegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
}

export interface VisitorRegistrationData extends BaseRegistrationData {
  type: 'visitor';
  level: VisitorLevel;
  sector: string;
  position?: string;
  company?: string;
  password?: string; // Optional pour FREE, requis pour VIP
}

export interface PartnerRegistrationData extends BaseRegistrationData {
  type: 'partner';
  companyName: string;
  sector: string;
  website?: string;
  position: string;
  companyDescription: string;
  partnershipType: string;
  password: string;
}

export type RegistrationData = VisitorRegistrationData | PartnerRegistrationData;

export interface RegistrationOptions {
  skipEmailVerification?: boolean;
  autoGenerateBadge?: boolean;
}

export interface RegistrationResult {
  userId: string;
  email: string;
  userType: UserType;
  success: boolean;
  error?: Error;
}

/**
 * ✅ Valide un mot de passe selon les règles strictes
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("Minimum 12 caractères requis");
  }
  if (password.length > 128) {
    errors.push("Maximum 128 caractères");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Au moins une majuscule requise");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Au moins une minuscule requise");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Au moins un chiffre requis");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Au moins un caractère spécial requis");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * ✅ Génère un mot de passe temporaire sécurisé
 */
export function generateTemporaryPassword(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  return `Temp${timestamp}${random}${random2}!`;
}

/**
 * ✅ Crée un utilisateur dans Supabase Auth
 */
export async function createAuthUser(
  email: string,
  password: string,
  userData: {
    name: string;
    type: UserType;
    visitor_level?: VisitorLevel;
    partner_tier?: PartnerTier;
  }
): Promise<{ userId: string; error?: Error }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Échec création utilisateur');

    return { userId: authData.user.id };
  } catch (error) {
    console.error('Erreur createAuthUser:', error);
    return { userId: '', error: error as Error };
  }
}

/**
 * ✅ Crée le profil utilisateur dans la table users
 */
export async function createUserProfile(
  userId: string,
  data: RegistrationData
): Promise<{ success: boolean; error?: Error }> {
  try {
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    const baseProfile = {
      id: userId,
      email: data.email,
      name: fullName,
      type: data.type,
      status: 'pending' as const,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        country: data.country
      }
    };

    let userRecord: any;

    if (data.type === 'visitor') {
      userRecord = {
        ...baseProfile,
        visitor_level: data.level,
        profile: {
          ...baseProfile.profile,
          businessSector: data.sector,
          position: data.position || '',
          company: data.company || '',
          hasPassword: !!data.password
        }
      };
    } else if (data.type === 'partner') {
      userRecord = {
        ...baseProfile,
        profile: {
          ...baseProfile.profile,
          companyName: data.companyName,
          sector: data.sector,
          website: data.website || '',
          position: data.position,
          companyDescription: data.companyDescription,
          partnershipType: data.partnershipType
        }
      };
    }

    const { error: userError } = await supabase
      .from('users')
      .insert([userRecord]);

    if (userError) throw userError;

    return { success: true };
  } catch (error) {
    console.error('Erreur createUserProfile:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * ✅ Génère le badge visiteur
 */
export async function generateVisitorBadge(
  userId: string,
  email: string,
  name: string,
  level: VisitorLevel
): Promise<{ success: boolean; error?: Error }> {
  try {
    const { error: badgeError } = await supabase.functions.invoke('generate-visitor-badge', {
      body: {
        userId,
        email,
        name,
        level,
        includePhoto: level !== 'free'
      }
    });

    if (badgeError) {
      console.warn('Erreur génération badge:', badgeError);
      // Ne pas bloquer l'inscription
      return { success: false, error: badgeError };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur generateVisitorBadge:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * ✅ Envoie l'email de bienvenue visiteur
 */
export async function sendVisitorWelcomeEmail(
  userId: string,
  email: string,
  name: string,
  level: VisitorLevel
): Promise<{ success: boolean; error?: Error }> {
  try {
    const { error: emailError } = await supabase.functions.invoke('send-visitor-welcome-email', {
      body: {
        userId,
        email,
        name,
        level
      }
    });

    if (emailError) {
      console.warn('Erreur envoi email:', emailError);
      return { success: false, error: emailError };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur sendVisitorWelcomeEmail:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * ✅ Envoie un email pour définir le mot de passe
 */
export async function sendPasswordSetupEmail(
  email: string,
  isInitialSetup: boolean = true
): Promise<{ success: boolean; error?: Error }> {
  try {
    console.log('📧 Envoi email de définition de mot de passe...');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password?type=${isInitialSetup ? 'initial-setup' : 'reset'}`
      }
    );

    if (resetError) {
      console.warn('⚠️ Reset password email failed:', resetError);
      return { success: false, error: resetError };
    }

    console.log('✅ Email de définition de mot de passe envoyé');
    return { success: true };
  } catch (error) {
    console.error('Erreur sendPasswordSetupEmail:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * ✅ Fonction principale d'inscription unifiée
 */
export async function registerUser(
  data: RegistrationData,
  options: RegistrationOptions = {}
): Promise<RegistrationResult> {
  try {
    const {
      skipEmailVerification = false,
      autoGenerateBadge = true
    } = options;

    const fullName = `${data.firstName} ${data.lastName}`.trim();

    // Déterminer le mot de passe
    let password: string;
    let hasPassword: boolean;

    if (data.type === 'visitor' && data.level === 'free') {
      // Visiteur FREE: mot de passe temporaire
      password = generateTemporaryPassword();
      hasPassword = false;
    } else if (data.type === 'visitor' && data.password) {
      // Visiteur VIP: mot de passe fourni
      password = data.password;
      hasPassword = true;
    } else if (data.type === 'partner' && data.password) {
      // Partenaire: mot de passe fourni
      password = data.password;
      hasPassword = true;
    } else {
      throw new Error('Mot de passe requis pour ce type d\'inscription');
    }

    // 1. Créer l'utilisateur Auth
    const { userId, error: authError } = await createAuthUser(
      data.email,
      password,
      {
        name: fullName,
        type: data.type,
        visitor_level: data.type === 'visitor' ? data.level : undefined,
        partner_tier: undefined
      },
    );

    if (authError || !userId) {
      throw authError || new Error('Erreur création utilisateur');
    }

    // 2. Créer le profil utilisateur
    const { success: profileSuccess, error: profileError } = await createUserProfile(userId, data);

    if (!profileSuccess || profileError) {
      throw profileError || new Error('Erreur création profil');
    }

    // 3. Générer le badge pour les visiteurs
    if (data.type === 'visitor' && autoGenerateBadge) {
      await generateVisitorBadge(userId, data.email, fullName, data.level);
      await sendVisitorWelcomeEmail(userId, data.email, fullName, data.level);
    }

    // 4. Envoyer email pour définir mot de passe si nécessaire
    if (!hasPassword) {
      await sendPasswordSetupEmail(data.email, true);
    }

    // 5. Déconnecter immédiatement si pas de mot de passe défini
    if (!hasPassword) {
      await supabase.auth.signOut();
    }

    return {
      userId,
      email: data.email,
      userType: data.type,
      success: true
    };
  } catch (error) {
    console.error('Erreur registerUser:', error);
    return {
      userId: '',
      email: data.email,
      userType: data.type,
      success: false,
      error: error as Error
    };
  }
}
