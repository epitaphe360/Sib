import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type {
  MediaItem,
  ArticleItem,
  MediaFilterType,
  MediaStatus,
  MediaStats,
  UploadableMediaType,
  UploadFormData,
} from '../components/marketing/types';

/**
 * Hook centralisant toute la logique métier du Marketing Dashboard.
 * Gère le CRUD médias + articles via Supabase et expose les données filtrées.
 */
export function useMarketingData() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<MediaFilterType>('all');
  const [filterStatus, setFilterStatus] = useState<MediaStatus>('all');

  const db = supabase!;

  // ─── Chargement initial ─────────────────────────────────────────────

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await db
        .from('media_contents')
        .select('id, type, title, description, thumbnail_url, status, created_at, category, views_count, likes_count, shares_count')
        .order('created_at', { ascending: false })
        .range(0, 49);

      if (error) throw error;
      setMediaItems((data as MediaItem[]) || []);
    } catch (err) {
      console.error('Erreur chargement médias:', err);
      toast.error('Erreur de chargement des médias');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadArticles = useCallback(async () => {
    try {
      const { data, error } = await db
        .from('news_articles')
        .select('id, title, content, excerpt, author, category, tags, image_url, published_at, created_at, published')
        .order('created_at', { ascending: false })
        .range(0, 49);

      if (error) throw error;

      const articlesWithShortcode: ArticleItem[] = (data || []).map((a: any) => ({
        ...a,
        shortcode: `[article id="${a.id}"]`,
      }));
      setArticles(articlesWithShortcode);
    } catch (err) {
      console.error('Erreur chargement articles:', err);
      toast.error('Erreur de chargement des articles');
    }
  }, []);

  useEffect(() => {
    loadMedia();
    loadArticles();
  }, [loadMedia, loadArticles]);

  // ─── Statistiques ───────────────────────────────────────────────────

  const stats: MediaStats = useMemo(
    () => ({
      total: mediaItems.length,
      webinars: mediaItems.filter((m) => m.type === 'webinar').length,
      capsules: mediaItems.filter((m) => m.type === 'capsule_inside').length,
      podcasts: mediaItems.filter((m) => m.type === 'podcast').length,
      lives: mediaItems.filter((m) => m.type === 'live_studio').length,
      bestMoments: mediaItems.filter((m) => m.type === 'best_moments').length,
      testimonials: mediaItems.filter((m) => m.type === 'testimonial').length,
      published: mediaItems.filter((m) => m.status === 'published').length,
      draft: mediaItems.filter((m) => m.status === 'draft').length,
    }),
    [mediaItems],
  );

  // ─── Filtrage ───────────────────────────────────────────────────────

  const filteredMedia = useMemo(
    () =>
      mediaItems.filter((item) => {
        if (filterType !== 'all' && item.type !== filterType) return false;
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        return true;
      }),
    [mediaItems, filterType, filterStatus],
  );

  // ─── CRUD Médias ────────────────────────────────────────────────────

  const toggleMediaPublish = useCallback(async (item: MediaItem) => {
    try {
      const newStatus = item.status === 'published' ? 'draft' : 'published';
      const { error } = await (db as any)
        .from('media_contents')
        .update({
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null,
        })
        .eq('id', item.id);

      if (error) throw error;

      setMediaItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, status: newStatus } : m)),
      );
      toast.success(
        newStatus === 'published' ? '✅ Média publié' : '📝 Média mis en brouillon',
      );
    } catch (err) {
      console.error('Erreur toggle publish:', err);
      toast.error('Erreur de mise à jour');
    }
  }, []);

  const deleteMedia = useCallback(async (item: MediaItem) => {
    if (!confirm(`Supprimer "${item.title}" ?`)) return;
    try {
      const { error } = await db
        .from('media_contents')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      setMediaItems((prev) => prev.filter((m) => m.id !== item.id));
      toast.success('🗑️ Média supprimé');
    } catch (err) {
      console.error('Erreur suppression:', err);
      toast.error('Erreur de suppression');
    }
  }, []);

  const addMedia = useCallback(
    async (type: UploadableMediaType, formData: UploadFormData) => {
      try {
        const newMedia: Record<string, unknown> = {
          type,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          status: 'draft',
          views_count: 0,
          likes_count: 0,
          shares_count: 0,
          tags: [],
        };

        if (type === 'podcast') {
          newMedia.audio_url = formData.url;
        } else {
          newMedia.video_url = formData.url;
        }

        const { data, error } = await (db as any)
          .from('media_contents')
          .insert(newMedia)
          .select()
          .single();

        if (error) throw error;

        setMediaItems((prev) => [data as MediaItem, ...prev]);
        toast.success('✅ Média ajouté');
        return true;
      } catch (err) {
        console.error('Erreur ajout:', err);
        toast.error("Erreur d'ajout");
        return false;
      }
    },
    [],
  );

  // ─── CRUD Articles ──────────────────────────────────────────────────

  const toggleArticlePublish = useCallback(async (article: ArticleItem) => {
    try {
      const newStatus = !article.published;
      const { error } = await (db as any)
        .from('news_articles')
        .update({
          published: newStatus,
          published_at: newStatus ? new Date().toISOString() : null,
        })
        .eq('id', article.id);

      if (error) throw error;

      setArticles((prev) =>
        prev.map((a) =>
          a.id === article.id ? { ...a, published: newStatus } : a,
        ),
      );
      toast.success(
        newStatus ? '✅ Article publié' : '📝 Article mis en brouillon',
      );
    } catch (err) {
      console.error('Erreur toggle publish:', err);
      toast.error('Erreur de mise à jour');
    }
  }, []);

  const deleteArticle = useCallback(async (article: ArticleItem) => {
    if (!confirm(`Supprimer "${article.title}" ?`)) return;
    try {
      const { error } = await db
        .from('news_articles')
        .delete()
        .eq('id', article.id);

      if (error) throw error;

      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      toast.success('🗑️ Article supprimé');
    } catch (err) {
      console.error('Erreur suppression:', err);
      toast.error('Erreur de suppression');
    }
  }, []);

  const copyShortcode = useCallback((shortcode: string) => {
    navigator.clipboard.writeText(shortcode);
    toast.success('📋 Shortcode copié !');
  }, []);

  return {
    // État
    loading,
    mediaItems,
    articles,
    stats,
    filteredMedia,
    filterType,
    filterStatus,

    // Setters filtres
    setFilterType,
    setFilterStatus,

    // Actions médias
    toggleMediaPublish,
    deleteMedia,
    addMedia,

    // Actions articles
    toggleArticlePublish,
    deleteArticle,
    copyShortcode,

    // Rechargement
    reloadArticles: loadArticles,
  };
}
