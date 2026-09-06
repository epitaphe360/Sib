import { supabase } from '@/lib/supabase';

export function labSchema() {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase.schema('lab');
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
