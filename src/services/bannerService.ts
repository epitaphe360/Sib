import { supabase, isSupabaseReady } from '../lib/supabase';

import { BANNER_DEFINITIONS, BannerKey, getBannerDefaultSrc, getBannerDefinition } from '../config/banners';



export interface SiteBannerRow {

  key: string;

  label: string;

  image_url: string | null;

  updated_at: string;

}



function withCacheBust(url: string, updatedAt?: string): string {

  const v = updatedAt ? new Date(updatedAt).getTime() : Date.now();

  const sep = url.includes('?') ? '&' : '?';

  return `${url}${sep}v=${v}`;

}



function mapStorageError(message: string): string {

  if (message.includes('row-level security') || message.includes('RLS')) {

    return 'Permission refusée : exécutez la migration stockage (20260601000004) et connectez-vous en admin.';

  }

  if (message.includes('Bucket not found')) {

    return 'Bucket Storage « images » introuvable — créez-le dans Supabase ou appliquez la migration stockage.';

  }

  return message;

}



/** Crée les lignes manquantes dans site_banners (sans écraser image_url). */

export async function ensureSiteBannerRows(): Promise<void> {

  if (!isSupabaseReady || !supabase) return;



  for (const def of BANNER_DEFINITIONS) {

    const { data: existing } = await supabase

      .from('site_banners')

      .select('key')

      .eq('key', def.key)

      .maybeSingle();



    if (existing) continue;



    const { error } = await supabase.from('site_banners').insert({

      key: def.key,

      label: def.label,

    });



    if (error && !error.message.includes('duplicate')) {

      console.warn('[bannerService] ensureSiteBannerRows:', def.key, error.message);

    }

  }

}



export async function fetchSiteBanners(): Promise<SiteBannerRow[]> {

  if (!isSupabaseReady || !supabase) return [];



  await ensureSiteBannerRows();



  const { data, error } = await supabase.from('site_banners').select('*').order('key');

  if (error) {

    console.warn('[bannerService] fetchSiteBanners:', error.message);

    return [];

  }

  return (data as SiteBannerRow[]) ?? [];

}



export async function resolveBannerSrc(key: BannerKey): Promise<string> {

  const fallback = getBannerDefaultSrc(key);

  if (!isSupabaseReady || !supabase) return fallback;



  const { data, error } = await supabase

    .from('site_banners')

    .select('image_url, updated_at')

    .eq('key', key)

    .maybeSingle();



  if (error || !data?.image_url) return fallback;

  return withCacheBust(data.image_url, data.updated_at);

}



export async function uploadBannerImage(key: BannerKey, file: File): Promise<string> {

  if (!isSupabaseReady || !supabase) {

    throw new Error('Supabase non configuré — vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');

  }



  await ensureSiteBannerRows();



  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';

  const storagePath = `banners/${key}.${ext}`;



  const { error: uploadError } = await supabase.storage

    .from('images')

    .upload(storagePath, file, {

      upsert: true,

      cacheControl: '3600',

      contentType: file.type || 'image/jpeg',

    });



  if (uploadError) {

    throw new Error(mapStorageError(uploadError.message));

  }



  const { data: urlData } = supabase.storage.from('images').getPublicUrl(storagePath);

  const imageUrl = urlData.publicUrl;

  const now = new Date().toISOString();

  const label = getBannerDefinition(key)?.label ?? key;



  const { error: dbError } = await supabase

    .from('site_banners')

    .upsert({ key, label, image_url: imageUrl, updated_at: now }, { onConflict: 'key' });



  if (dbError) {

    throw new Error(dbError.message);

  }



  return withCacheBust(imageUrl, now);

}



export async function resetBannerToDefault(key: BannerKey): Promise<void> {

  if (!isSupabaseReady || !supabase) {

    throw new Error('Supabase non configuré');

  }



  await ensureSiteBannerRows();



  const label = getBannerDefinition(key)?.label ?? key;

  const { error } = await supabase

    .from('site_banners')

    .upsert(

      { key, label, image_url: null, updated_at: new Date().toISOString() },

      { onConflict: 'key' }

    );



  if (error) throw new Error(error.message);

}

