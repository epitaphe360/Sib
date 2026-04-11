/**
 * Service de recherche full-text
 * Recherche avancée dans tous les contenus de la plateforme
 */

import { supabase } from '../lib/supabase';

export interface SearchResult {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  content?: string;
  rank: number;
}

export interface SearchFilters {
  entity_types?: string[];
  limit?: number;
  offset?: number;
}

class SearchService {
  /**
   * Rechercher dans tous les contenus
   */
  async search(
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResult[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const { data, error } = await supabase.rpc('search_content', {
        search_query: query,
        entity_types: filters?.entity_types || null,
        limit_results: filters?.limit || 20,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur search:', error);
      return [];
    }
  }

  /**
   * Indexer un contenu pour la recherche
   */
  async indexContent(params: {
    entityType: string;
    entityId: string;
    title: string;
    content?: string;
    keywords?: string[];
    metadata?: Record<string, any>;
    boostScore?: number;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_index')
        .upsert({
          entity_type: params.entityType,
          entity_id: params.entityId,
          title: params.title,
          content: params.content || '',
          keywords: params.keywords || [],
          metadata: params.metadata || {},
          boost_score: params.boostScore || 1.0,
          is_active: true,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur indexContent:', error);
      return false;
    }
  }

  /**
   * Supprimer un contenu de l'index
   */
  async removeFromIndex(entityType: string, entityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_index')
        .delete()
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur removeFromIndex:', error);
      return false;
    }
  }

  /**
   * Désactiver un contenu dans l'index (soft delete)
   */
  async deactivateInIndex(entityType: string, entityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_index')
        .update({ is_active: false })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur deactivateInIndex:', error);
      return false;
    }
  }

  /**
   * Réactiver un contenu dans l'index
   */
  async reactivateInIndex(entityType: string, entityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_index')
        .update({ is_active: true })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur reactivateInIndex:', error);
      return false;
    }
  }

  /**
   * Rechercher des exposants
   */
  async searchExhibitors(query: string, limit?: number): Promise<SearchResult[]> {
    return this.search(query, {
      entity_types: ['exhibitor'],
      limit,
    });
  }

  /**
   * Rechercher des produits
   */
  async searchProducts(query: string, limit?: number): Promise<SearchResult[]> {
    return this.search(query, {
      entity_types: ['product'],
      limit,
    });
  }

  /**
   * Rechercher des événements
   */
  async searchEvents(query: string, limit?: number): Promise<SearchResult[]> {
    return this.search(query, {
      entity_types: ['event'],
      limit,
    });
  }

  /**
   * Rechercher des articles
   */
  async searchArticles(query: string, limit?: number): Promise<SearchResult[]> {
    return this.search(query, {
      entity_types: ['news_article'],
      limit,
    });
  }

  /**
   * Rechercher des partenaires
   */
  async searchPartners(query: string, limit?: number): Promise<SearchResult[]> {
    return this.search(query, {
      entity_types: ['partner'],
      limit,
    });
  }

  /**
   * Rechercher des médias
   */
  async searchMedia(query: string, limit?: number): Promise<SearchResult[]> {
    return this.search(query, {
      entity_types: ['media_content'],
      limit,
    });
  }

  /**
   * Recherche globale (tous types)
   */
  async searchAll(query: string, limit?: number): Promise<SearchResult[]> {
    return this.search(query, { limit });
  }

  /**
   * Obtenir des suggestions de recherche
   */
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      // Rechercher les titres qui correspondent partiellement
      const { data, error } = await supabase
        .from('search_index')
        .select('title')
        .ilike('title', `%${query}%`)
        .eq('is_active', true)
        .limit(limit);

      if (error) throw error;

      // Extraire les titres uniques
      const suggestions = [...new Set(data?.map((item) => item.title) || [])];
      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('❌ Erreur getSuggestions:', error);
      return [];
    }
  }

  /**
   * Indexer en masse plusieurs contenus
   */
  async bulkIndex(
    items: Array<{
      entityType: string;
      entityId: string;
      title: string;
      content?: string;
      keywords?: string[];
      metadata?: Record<string, any>;
      boostScore?: number;
    }>
  ): Promise<boolean> {
    try {
      const records = items.map((item) => ({
        entity_type: item.entityType,
        entity_id: item.entityId,
        title: item.title,
        content: item.content || '',
        keywords: item.keywords || [],
        metadata: item.metadata || {},
        boost_score: item.boostScore || 1.0,
        is_active: true,
      }));

      const { error } = await supabase
        .from('search_index')
        .upsert(records);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur bulkIndex:', error);
      return false;
    }
  }

  /**
   * Réindexer tous les exposants
   */
  async reindexExhibitors(): Promise<number> {
    try {
      const { data: exhibitors, error } = await supabase
        .from('users')
        .select('id, name, profile')
        .eq('type', 'exhibitor')
        .eq('status', 'active');

      if (error) throw error;

      const items = (exhibitors || []).map((exhibitor) => ({
        entityType: 'exhibitor',
        entityId: exhibitor.id,
        title: exhibitor.name || 'Exposant',
        content: JSON.stringify(exhibitor.profile),
        keywords: [],
        boostScore: 1.0,
      }));

      await this.bulkIndex(items);
      return items.length;
    } catch (error) {
      console.error('❌ Erreur reindexExhibitors:', error);
      return 0;
    }
  }

  /**
   * Réindexer tous les événements
   */
  async reindexEvents(): Promise<number> {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('id, title, description, tags');

      if (error) throw error;

      const items = (events || []).map((event) => ({
        entityType: 'event',
        entityId: event.id,
        title: event.title,
        content: event.description || '',
        keywords: event.tags || [],
        boostScore: 1.2, // Boost pour les événements
      }));

      await this.bulkIndex(items);
      return items.length;
    } catch (error) {
      console.error('❌ Erreur reindexEvents:', error);
      return 0;
    }
  }

  /**
   * Réindexer tous les articles
   */
  async reindexArticles(): Promise<number> {
    try {
      const { data: articles, error } = await supabase
        .from('news_articles')
        .select('id, title, content, tags')
        .eq('published', true);

      if (error) throw error;

      const items = (articles || []).map((article) => ({
        entityType: 'news_article',
        entityId: article.id,
        title: article.title,
        content: article.content || '',
        keywords: article.tags || [],
        boostScore: 1.1,
      }));

      await this.bulkIndex(items);
      return items.length;
    } catch (error) {
      console.error('❌ Erreur reindexArticles:', error);
      return 0;
    }
  }

  /**
   * Réindexer tous les médias
   */
  async reindexMedia(): Promise<number> {
    try {
      const { data: media, error } = await supabase
        .from('media_contents')
        .select('id, title, description, tags')
        .eq('status', 'published');

      if (error) throw error;

      const items = (media || []).map((item) => ({
        entityType: 'media_content',
        entityId: item.id,
        title: item.title,
        content: item.description || '',
        keywords: item.tags || [],
        boostScore: 1.15,
      }));

      await this.bulkIndex(items);
      return items.length;
    } catch (error) {
      console.error('❌ Erreur reindexMedia:', error);
      return 0;
    }
  }

  /**
   * Réindexer tous les contenus
   */
  async reindexAll(): Promise<{
    exhibitors: number;
    events: number;
    articles: number;
    media: number;
    total: number;
  }> {
    const exhibitors = await this.reindexExhibitors();
    const events = await this.reindexEvents();
    const articles = await this.reindexArticles();
    const media = await this.reindexMedia();

    return {
      exhibitors,
      events,
      articles,
      media,
      total: exhibitors + events + articles + media,
    };
  }
}

export const searchService = new SearchService();
export default searchService;
