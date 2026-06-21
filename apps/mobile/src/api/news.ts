import Constants from 'expo-constants';
import { PLATFORM } from '../config/platform';
import { supabase } from '../lib/supabase';
import { stripHtml } from '../lib/stripHtml';

export { stripHtml };

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
  readTime: number;
  slug?: string;
}

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  Constants.expoConfig?.extra?.supabaseUrl ??
  '';

function resolveImageUrl(featuredImage: string | null | undefined): string | undefined {
  if (!featuredImage) return undefined;
  if (featuredImage.startsWith('http')) return featuredImage;
  if (!SUPABASE_URL) return undefined;
  return `${SUPABASE_URL}/storage/v1/object/public/${featuredImage}`;
}

function mapRow(row: Record<string, unknown>): NewsArticle {
  const content = typeof row.content === 'string' ? row.content : '';
  const excerptRaw = typeof row.excerpt === 'string' ? row.excerpt : '';
  const plain = stripHtml(excerptRaw || content).slice(0, 280);
  const category = typeof row.category === 'string' ? row.category : 'Actualité';
  const publishedAt =
    typeof row.published_at === 'string'
      ? row.published_at
      : typeof row.created_at === 'string'
        ? row.created_at
        : new Date().toISOString();

  return {
    id: String(row.id),
    title: typeof row.title === 'string' ? row.title : 'Actualité',
    excerpt: plain,
    content,
    author: typeof row.author === 'string' ? row.author : PLATFORM.name,
    publishedAt,
    category,
    imageUrl: resolveImageUrl(typeof row.featured_image === 'string' ? row.featured_image : null),
    readTime: Math.max(1, Math.ceil(stripHtml(content).split(' ').filter(Boolean).length / 200)),
    slug: typeof row.slug === 'string' ? row.slug : undefined,
  };
}

function isPublished(row: Record<string, unknown>): boolean {
  return row.is_published === true || row.published === true;
}

async function queryPublished(limit: number) {
  const fields =
    'id, title, content, excerpt, author, category, featured_image, is_published, published, published_at, views, slug, created_at';

  let result = await supabase
    .from('news_articles')
    .select(fields)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (result.error?.message?.includes('is_published')) {
    result = await supabase
      .from('news_articles')
      .select(fields)
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    return result;
  }

  if (!result.error && (!result.data || result.data.length === 0)) {
    const legacy = await supabase
      .from('news_articles')
      .select(fields)
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    if (!legacy.error && legacy.data?.length) return legacy;
  }

  return result;
}

/** Articles publiés — données Supabase uniquement */
export async function fetchNewsArticles(limit = 20): Promise<NewsArticle[]> {
  const { data, error } = await queryPublished(limit);
  if (error) throw error;
  if (!data?.length) return [];
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function fetchNewsArticleById(id: string): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('id, title, content, excerpt, author, category, featured_image, published_at, slug, created_at, is_published, published')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  if (!isPublished(data as Record<string, unknown>)) return null;
  return mapRow(data as Record<string, unknown>);
}
