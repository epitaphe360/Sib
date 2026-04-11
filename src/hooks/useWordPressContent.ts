/**
 * Hook personnalisé pour récupérer du contenu depuis WordPress REST API
 * Utilisé uniquement en phase de transition vers Supabase
 */

import { useState, useEffect } from 'react';

interface UseWordPressContentOptions {
  endpoint: string;
  enabled?: boolean;
  transform?: (data: any) => any;
}

interface UseWordPressContentReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const WP_BASE_URL = 'https://sib2026.ma/wp-json/wp/v2';

export function useWordPressContent<T = any>({
  endpoint,
  enabled = true,
  transform
}: UseWordPressContentOptions): UseWordPressContentReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchContent = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${WP_BASE_URL}${endpoint}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const processedData = transform ? transform(json) : json;
      
      setData(processedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('[useWordPressContent] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [endpoint, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchContent
  };
}

/**
 * Hook spécialisé pour récupérer les articles WordPress
 */
export function useWordPressArticles(limit = 3) {
  return useWordPressContent({
    endpoint: `/posts?per_page=${limit}&_embed`,
    transform: (data) => {
      return data.map((article: any) => ({
        id: article.id,
        title: article.title.rendered,
        excerpt: article.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        content: article.content.rendered,
        slug: article.slug,
        date: new Date(article.date).toLocaleDateString('fr-FR'),
        author: article._embedded?.author?.[0]?.name || 'SIB',
        featuredImage: article._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
        categories: article._embedded?.['wp:term']?.[0]?.map((cat: any) => cat.name) || []
      }));
    }
  });
}

/**
 * Hook spécialisé pour récupérer les médias WordPress
 */
export function useWordPressMedia(limit = 8, mediaType = 'image') {
  return useWordPressContent({
    endpoint: `/media?media_type=${mediaType}&per_page=${limit}`,
    transform: (data) => {
      return data.map((media: any) => ({
        id: media.id,
        title: media.title.rendered,
        url: media.source_url,
        thumbnail: media.media_details?.sizes?.medium?.source_url || media.source_url,
        alt: media.alt_text || media.title.rendered,
        caption: media.caption.rendered,
        date: new Date(media.date).toLocaleDateString('fr-FR')
      }));
    }
  });
}

/**
 * Hook spécialisé pour récupérer une page WordPress par slug
 */
export function useWordPressPage(slug: string) {
  return useWordPressContent({
    endpoint: `/pages?slug=${slug}`,
    enabled: !!slug,
    transform: (data) => {
      if (!data || data.length === 0) return null;
      const page = data[0];
      return {
        id: page.id,
        title: page.title.rendered,
        content: page.content.rendered,
        excerpt: page.excerpt.rendered,
        slug: page.slug,
        date: new Date(page.date).toLocaleDateString('fr-FR')
      };
    }
  });
}
