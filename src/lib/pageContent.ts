import { supabase } from './supabase';

/**
 * Récupère le contenu éditable d'une page vitrine.
 * Retourne un objet vide si la page n'a pas encore été personnalisée.
 */
export async function getPageContent(pageSlug: string, salonId?: string | null): Promise<Record<string, string>> {
  let query = supabase
    .from('page_contents')
    .select('content')
    .eq('page_slug', pageSlug);

  if (salonId) {
    query = query.eq('salon_id', salonId);
  } else {
    query = query.is('salon_id', null);
  }

  const { data, error } = await query.single();
  if (error || !data) return {};
  return (data.content as Record<string, string>) ?? {};
}

/**
 * Sauvegarde le contenu d'une page vitrine.
 * Crée ou met à jour l'entrée selon le slug (upsert).
 */
export async function savePageContent(
  pageSlug: string,
  content: Record<string, string>,
  salonId?: string | null
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const payload: Record<string, unknown> = { page_slug: pageSlug, content, updated_by: user?.id ?? null };
  if (salonId) payload.salon_id = salonId;
  const conflictCol = salonId ? 'page_slug,salon_id' : 'page_slug';
  const { error } = await supabase
    .from('page_contents')
    .upsert(payload, { onConflict: conflictCol });
  if (error) throw new Error(error.message);
}

/**
 * Charge les métadonnées (slug, updated_at) de toutes les pages.
 */
export async function getAllPageMeta(salonId?: string | null): Promise<Array<{ page_slug: string; content: Record<string, string>; updated_at: string }>> {
  let query = supabase
    .from('page_contents')
    .select('page_slug, content, updated_at');
  if (salonId) {
    query = query.eq('salon_id', salonId);
  } else {
    query = query.is('salon_id', null);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return data as Array<{ page_slug: string; content: Record<string, string>; updated_at: string }>;
}
