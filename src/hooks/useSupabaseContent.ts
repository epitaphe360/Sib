/**
 * Hook personnalisé pour récupérer du contenu depuis Supabase
 * Remplace progressivement WordPress comme source de contenu
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UseSupabaseContentOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
}

export function useSupabaseContent<T = any>({
  table,
  select = '*',
  filters = {},
  orderBy,
  limit,
  enabled = true
}: UseSupabaseContentOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchContent = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      let query = supabase.from(table).select(select);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('[useSupabaseContent] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [table, JSON.stringify(filters), enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchContent
  };
}

/**
 * Hook pour récupérer les articles depuis Supabase
 */
export function useSupabaseArticles(limit = 3) {
  return useSupabaseContent({
    table: 'news_articles',
    filters: { is_published: true },
    orderBy: { column: 'published_at', ascending: false },
    limit
  });
}

/**
 * Hook pour récupérer les témoignages depuis Supabase
 */
export function useSupabaseTestimonials(limit = 3) {
  return useSupabaseContent({
    table: 'testimonials',
    filters: { is_published: true, is_featured: true },
    limit
  });
}

/**
 * Hook pour récupérer les médias depuis Supabase
 * Map les colonnes de la BDD vers une structure standardisée
 */
export function useSupabaseMedia(limit = 8, mediaType?: string) {
  const { data, loading, error, refetch } = useSupabaseContent({
    table: 'media_library',
    filters: {
      is_public: true,
      ...(mediaType && { media_type: mediaType })
    },
    limit
  });

  // Mapper les données vers l'interface MediaItem attendue par les composants
  const mappedData = data?.map((item: any) => ({
    id: item.id,
    title: item.title,
    url: item.file_url,  // file_url -> url
    thumbnail: item.thumbnail_url,  // thumbnail_url -> thumbnail
    alt: item.alt_text,  // alt_text -> alt
    media_type: item.media_type,
    category: item.category,
    is_featured: item.is_featured
  }));

  return {
    data: mappedData,
    loading,
    error,
    refetch
  };
}

/**
 * Hook pour récupérer une page statique depuis Supabase
 */
export function useSupabasePage(slug: string) {
  const { data, loading, error, refetch } = useSupabaseContent({
    table: 'static_pages',
    filters: { slug, is_published: true },
    limit: 1,
    enabled: !!slug
  });

  return {
    data: data?.[0] || null,
    loading,
    error,
    refetch
  };
}
