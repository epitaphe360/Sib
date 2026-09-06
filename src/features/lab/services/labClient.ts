import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

let labStandalone: SupabaseClient | null | undefined;

function labClient() {
  const url = import.meta.env.VITE_LAB_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_LAB_SUPABASE_ANON_KEY as string | undefined;
  if (url && key) {
    if (labStandalone === undefined) {
      labStandalone = createClient(url, key, { auth: { persistSession: true, storageKey: 'lab-auth' } });
    }
    return labStandalone;
  }
  return supabase;
}

export function getLabClient() {
  const client = labClient();
  if (!client) throw new Error('Supabase Lab non configuré');
  return client;
}

export function labSchema() {
  return getLabClient().schema('lab');
}

export async function getActiveOrgBySlug(slug: string) {
  const { data, error } = await labSchema()
    .from('organizations')
    .select('id,name,slug,is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
