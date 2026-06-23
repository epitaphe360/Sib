import type { ImageSourcePropType } from 'react-native';
import { APP_IMAGES, type ImageKey } from '../data/images';
import type { BannerKey } from '../config/banners';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const LOCAL_FALLBACK: Record<BannerKey, ImageKey> = {
  /** banner_default sib.ma (parc Mohammed VI) — voir download-app-images → banner.jpg */
  urbaevent: 'banner',
  ministry_egide: 'hero',
};

/** Sur mobile, la bannière accueil vient de sib.ma embarquée, pas de site_banners Supabase (ancien Trimble). */
export const USE_SIB_MA_LOCAL_BANNER = true;

function cacheBust(url: string, updatedAt?: string): string {
  const v = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  return `${url}${url.includes('?') ? '&' : '?'}v=${v}`;
}

export async function resolveBannerImageUrl(key: BannerKey): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('site_banners')
    .select('image_url, updated_at')
    .eq('key', key)
    .maybeSingle();

  if (error || !data?.image_url) return null;
  return cacheBust(data.image_url, data.updated_at);
}

export function getLocalBannerSource(key: BannerKey): ImageSourcePropType {
  return APP_IMAGES[LOCAL_FALLBACK[key]];
}
