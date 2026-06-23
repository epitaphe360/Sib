/**
 * CMS — service images du site.
 * Pattern identique à bannerService : table `site_images` + bucket `images`.
 */
import { supabase, isSupabaseReady } from '../lib/supabase';
import { getSiteImageDefault, SITE_IMAGE_DEFINITIONS, type SiteImageKey } from '../config/siteImagesConfig';

export interface SiteImageRow {
  key: string;
  label: string;
  category: string;
  image_url: string | null;
  updated_at: string;
}

export interface SiteTextRow {
  key: string;
  label: string;
  page: string;
  value_fr: string | null;
  value_en: string | null;
  value_ar: string | null;
  updated_at: string;
}

function withCacheBust(url: string, updatedAt?: string): string {
  const v = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  return `${url}${url.includes('?') ? '&' : '?'}v=${v}`;
}

function mapStorageError(message: string): string {
  if (message.includes('row-level security') || message.includes('RLS'))
    return 'Permission refusée — connectez-vous en admin et appliquez la migration 20260611000003.';
  if (message.includes('Bucket not found'))
    return 'Bucket Storage « images » introuvable — créez-le dans Supabase.';
  return message;
}

/** Insère les lignes manquantes sans écraser image_url. */
async function ensureRows(): Promise<void> {
  if (!isSupabaseReady || !supabase) return;
  for (const def of SITE_IMAGE_DEFINITIONS) {
    const { data: existing } = await supabase
      .from('cms_images')
      .select('key')
      .eq('key', def.key)
      .maybeSingle();
    if (existing) continue;
    const { error } = await supabase
      .from('cms_images')
      .insert({ key: def.key, label: def.label, category: def.category });
    if (error && !error.message.includes('duplicate'))
      console.warn('[siteImagesService] ensureRows:', def.key, error.message);
  }
}

/** Charge toutes les lignes site_images. */
export async function fetchSiteImages(): Promise<SiteImageRow[]> {
  if (!isSupabaseReady || !supabase) return [];
  await ensureRows();
  const { data, error } = await supabase
    .from('cms_images')
    .select('*')
    .order('category')
    .order('key');
  if (error) { console.warn('[siteImagesService]', error.message); return []; }
  return data ?? [];
}

/** Résout une image : Supabase custom URL → CDN défaut. */
export async function resolveSiteImage(key: SiteImageKey): Promise<string> {
  const fallback = getSiteImageDefault(key);
  if (!isSupabaseReady || !supabase) return fallback;
  const { data, error } = await supabase
    .from('cms_images')
    .select('image_url, updated_at')
    .eq('key', key)
    .maybeSingle();
  if (error || !data?.image_url) return fallback;
  return withCacheBust(data.image_url, data.updated_at);
}

/** Upload + upsert en base. */
export async function uploadSiteImage(key: SiteImageKey, file: File): Promise<string> {
  if (!isSupabaseReady || !supabase)
    throw new Error('Supabase non configuré — vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');

  await ensureRows();
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const storagePath = `site-images/${key}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(storagePath, file, { upsert: true, cacheControl: '3600', contentType: file.type || 'image/jpeg' });
  if (uploadError) throw new Error(mapStorageError(uploadError.message));

  const { data: urlData } = supabase.storage.from('images').getPublicUrl(storagePath);
  const imageUrl = urlData.publicUrl;
  const now = new Date().toISOString();
  const def = SITE_IMAGE_DEFINITIONS.find(d => d.key === key);

  const { error: dbError } = await supabase
    .from('cms_images')
    .upsert(
      { key, label: def?.label ?? key, category: def?.category ?? 'general', image_url: imageUrl, updated_at: now },
      { onConflict: 'key' }
    );
  if (dbError) throw new Error(dbError.message);
  return withCacheBust(imageUrl, now);
}

/** Remet l'image CDN par défaut (null en base). */
export async function resetSiteImage(key: SiteImageKey): Promise<void> {
  if (!isSupabaseReady || !supabase) throw new Error('Supabase non configuré');
  await ensureRows();
  const def = SITE_IMAGE_DEFINITIONS.find(d => d.key === key);
  const { error } = await supabase
    .from('cms_images')
    .upsert(
      { key, label: def?.label ?? key, category: def?.category ?? 'general', image_url: null, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  if (error) throw new Error(error.message);
}

// ─── Text Content ────────────────────────────────────────────────────────────

export async function fetchSiteTextContent(): Promise<SiteTextRow[]> {
  if (!isSupabaseReady || !supabase) return [];
  const { data, error } = await supabase
    .from('cms_text_content')
    .select('*')
    .order('page')
    .order('key');
  if (error) { console.warn('[siteImagesService] text:', error.message); return []; }
  return data ?? [];
}

export async function upsertSiteText(
  key: string,
  fields: { value_fr?: string; value_en?: string; value_ar?: string }
): Promise<void> {
  if (!isSupabaseReady || !supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase
    .from('cms_text_content')
    .upsert({ key, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}
