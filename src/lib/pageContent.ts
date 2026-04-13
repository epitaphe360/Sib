import { supabase } from './supabase';

/**
 * Récupère le contenu éditable d'une page vitrine.
 * Retourne un objet vide si la page n'a pas encore été personnalisée.
 */
export async function getPageContent(pageSlug: string): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('page_contents')
    .select('content')
    .eq('page_slug', pageSlug)
    .single();

  if (error || !data) return {};
  return (data.content as Record<string, string>) ?? {};
}

/**
 * Sauvegarde le contenu d'une page vitrine.
 * Crée ou met à jour l'entrée selon le slug (upsert).
 */
export async function savePageContent(
  pageSlug: string,
  content: Record<string, string>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('page_contents')
    .upsert(
      { page_slug: pageSlug, content, updated_by: user?.id ?? null },
      { onConflict: 'page_slug' }
    );
  if (error) throw new Error(error.message);
}

/**
 * Charge les métadonnées (slug, updated_at) de toutes les pages.
 */
export async function getAllPageMeta(): Promise<Array<{ page_slug: string; content: Record<string, string>; updated_at: string }>> {
  const { data, error } = await supabase
    .from('page_contents')
    .select('page_slug, content, updated_at');
  if (error || !data) return [];
  return data as Array<{ page_slug: string; content: Record<string, string>; updated_at: string }>;
}
