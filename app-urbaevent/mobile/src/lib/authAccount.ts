import { ACCOUNT_NOT_FOUND } from './errors';
import { supabase } from './supabase';

export { ACCOUNT_NOT_FOUND };

export function isAccountNotFoundError(e: unknown): boolean {
  return e instanceof Error && e.message === ACCOUNT_NOT_FOUND;
}

/** true si un profil existe pour cet email */
export async function checkEmailRegistered(email: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim();
  const { data, error } = await supabase.rpc('check_email_registered', {
    p_email: normalized,
  });

  if (error) {
    if (error.message.includes('Could not find the function')) {
      console.error('RPC check_email_registered manquante — exécutez la migration Supabase');
      return false;
    }
    throw error;
  }

  return Boolean(data);
}
