import { sanitizeIlikeTerm } from '../lib/sanitizeIlike';
import { supabase } from '../lib/supabase';

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  publishedAt: string | null;
  viewsCount: number;
}

export function getMediaTypeLabel(type: string, t: (key: string) => string): string {
  const key = `media.type.${type}`;
  const label = t(key);
  return label !== key ? label : type;
}

export async function fetchMediaById(id: string): Promise<MediaItem | null> {
  const { data, error } = await supabase
    .from('media_contents')
    .select('id, title, description, type, thumbnail_url, video_url, audio_url, published_at, views_count')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    if (error.code === '42P01') return null;
    throw error;
  }
  if (!data) return null;

  return {
    id: data.id as string,
    title: (data.title as string) ?? 'Média',
    description: (data.description as string) ?? '',
    type: (data.type as string) ?? 'video',
    thumbnailUrl: (data.thumbnail_url as string) ?? null,
    videoUrl: (data.video_url as string) ?? null,
    audioUrl: (data.audio_url as string) ?? null,
    publishedAt: (data.published_at as string) ?? null,
    viewsCount: Number(data.views_count ?? 0),
  };
}

export async function fetchPublishedMedia(search = '', type = ''): Promise<MediaItem[]> {
  let query = supabase
    .from('media_contents')
    .select('id, title, description, type, thumbnail_url, video_url, audio_url, published_at, views_count')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(40);

  if (search.trim()) {
    const safe = sanitizeIlikeTerm(search.trim());
    query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }
  if (type.trim()) {
    query = query.eq('type', type.trim());
  }

  const { data, error } = await query;
  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string) ?? 'Média',
    description: (row.description as string) ?? '',
    type: (row.type as string) ?? 'video',
    thumbnailUrl: (row.thumbnail_url as string) ?? null,
    videoUrl: (row.video_url as string) ?? null,
    audioUrl: (row.audio_url as string) ?? null,
    publishedAt: (row.published_at as string) ?? null,
    viewsCount: Number(row.views_count ?? 0),
  }));
}
