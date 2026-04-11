/**
 * Service pour gérer les contenus médias
 * Webinaires, Podcasts, Capsules vidéo, Live Studio, etc.
 * Updated: 2024-12-22 - Force redeploy
 */

import { supabase } from '../lib/supabase';
import type { 
  MediaContent, 
  MediaInteraction, 
  LiveEvent,
  MediaPlaylist,
  MediaFilters,
  CreateMediaRequest,
  UpdateMediaRequest,
  CreateLiveEventRequest,
  MediaStats
} from '../types/media';

export class MediaService {
  // Optimized columns for media queries
  private static readonly MEDIA_COLUMNS = 'id, title, description, type, status, category, published_at, thumbnail_url, duration, sponsor_partner_id, tags, created_at, views_count, video_url, audio_url';

  /**
   * Récupérer tous les médias avec filtres
   */
  static async getMedia(filters?: MediaFilters): Promise<MediaContent[]> {
    try {
      // Step 1: Fetch media_contents without nested select
      // Optimized: Select only necessary columns instead of *
      let query = supabase
        .from('media_contents')
        .select(this.MEDIA_COLUMNS);

      // Filtres
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.partner_id) {
        query = query.eq('sponsor_partner_id', filters.partner_id);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Tri
      const orderBy = filters?.orderBy || 'published_at';
      const order = filters?.order || 'desc';
      query = query.order(orderBy, { ascending: order === 'asc' });

      // Pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data: mediaData, error } = await query;

      if (error) throw error;
      if (!mediaData || mediaData.length === 0) return [];

      // Step 2: Fetch partners separately
      const partnerIds = mediaData
        .map(m => m.sponsor_partner_id)
        .filter((id): id is string => !!id);

      let partners: any[] = [];
      if (partnerIds.length > 0) {
        const { data: partnersData } = await supabase
          .from('partners')
          .select('id, company_name, logo_url, partnership_level')
          .in('id', partnerIds);
        
        partners = partnersData || [];
      }

      // Step 3: Merge data locally
      const result = mediaData.map(media => ({
        ...media,
        sponsor_partner: media.sponsor_partner_id 
          ? partners.find(p => p.id === media.sponsor_partner_id) || null
          : null
      }));

      return result;
    } catch (error) {
      console.error('❌ Erreur getMedia:', error);
      return [];
    }
  }

  /**
   * Récupérer les médias par type
   */
  static async getMediaByType(
    type: MediaContent['type'],
    filters?: Omit<MediaFilters, 'type'>
  ): Promise<MediaContent[]> {
    return this.getMedia({ ...filters, type });
  }

  /**
   * Récupérer un média par ID
   */
  static async getMediaById(id: string): Promise<MediaContent | null> {
    try {
      // Step 1: Fetch media content
      const { data: mediaData, error } = await supabase
        .from('media_contents')
        .select(this.MEDIA_COLUMNS)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!mediaData) return null;

      // Step 2: Fetch partner if exists
      let partner = null;
      if (mediaData.sponsor_partner_id) {
        const { data: partnerData } = await supabase
          .from('partners')
          .select('id, company_name, logo_url, partnership_level, website')
          .eq('id', mediaData.sponsor_partner_id)
          .single();
        
        partner = partnerData;
      }

      // Step 3: Merge data
      return {
        ...mediaData,
        sponsor_partner: partner
      };
    } catch (error) {
      console.error('❌ Erreur getMediaById:', error);
      return null;
    }
  }

  /**
   * Créer un nouveau média (Admin)
   */
  static async createMedia(mediaData: CreateMediaRequest): Promise<MediaContent | null> {
    try {
      // Step 1: Insert media content
      const { data: newMedia, error } = await supabase
        .from('media_contents')
        .insert([{
          ...mediaData,
          status: mediaData.status || 'draft',
          published_at: mediaData.published_at || (mediaData.status === 'published' ? new Date().toISOString() : null)
        }])
        .select(this.MEDIA_COLUMNS)
        .single();

      if (error) throw error;
      if (!newMedia) return null;

      // Step 2: Fetch partner if exists
      let partner = null;
      if (newMedia.sponsor_partner_id) {
        const { data: partnerData } = await supabase
          .from('partners')
          .select('id, company_name, logo_url')
          .eq('id', newMedia.sponsor_partner_id)
          .single();
        
        partner = partnerData;
      }

      // Step 3: Return merged data
      return {
        ...newMedia,
        sponsor_partner: partner
      };
    } catch (error) {
      console.error('❌ Erreur createMedia:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un média (Admin)
   */
  static async updateMedia(updateData: UpdateMediaRequest): Promise<MediaContent | null> {
    try {
      const { id, ...updates } = updateData;
      
      // Step 1: Update media content
      const { data: updatedMedia, error } = await supabase
        .from('media_contents')
        .update(updates)
        .eq('id', id)
        .select(this.MEDIA_COLUMNS)
        .single();

      if (error) throw error;
      if (!updatedMedia) return null;

      // Step 2: Fetch partner if exists
      let partner = null;
      if (updatedMedia.sponsor_partner_id) {
        const { data: partnerData } = await supabase
          .from('partners')
          .select('id, company_name, logo_url')
          .eq('id', updatedMedia.sponsor_partner_id)
          .single();
        
        partner = partnerData;
      }

      // Step 3: Return merged data
      return {
        ...updatedMedia,
        sponsor_partner: partner
      };
    } catch (error) {
      console.error('❌ Erreur updateMedia:', error);
      return null;
    }
  }

  /**
   * Supprimer un média (Admin)
   */
  static async deleteMedia(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('media_contents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur deleteMedia:', error);
      return false;
    }
  }

  /**
   * Enregistrer une interaction utilisateur
   */
  static async recordInteraction(
    interaction: Omit<MediaInteraction, 'id' | 'created_at'>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('media_interactions')
        .insert([interaction]);

      if (error) throw error;

      // Incrémenter les compteurs appropriés
      if (interaction.action === 'view') {
        await this.incrementViewCount(interaction.media_content_id);
      } else if (interaction.action === 'like') {
        await this.incrementLikeCount(interaction.media_content_id);
      } else if (interaction.action === 'share') {
        await this.incrementShareCount(interaction.media_content_id);
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur recordInteraction:', error);
      return false;
    }
  }

  /**
   * Incrémenter le compteur de vues
   */
  private static async incrementViewCount(mediaId: string): Promise<void> {
    try {
      await supabase.rpc('increment_media_views', { media_id: mediaId });
    } catch (error) {
      console.error('❌ Erreur incrementViewCount:', error);
    }
  }

  /**
   * Incrémenter le compteur de likes
   */
  private static async incrementLikeCount(mediaId: string): Promise<void> {
    try {
      await supabase.rpc('increment_media_likes', { media_id: mediaId });
    } catch (error) {
      console.error('❌ Erreur incrementLikeCount:', error);
    }
  }

  /**
   * Incrémenter le compteur de partages
   */
  private static async incrementShareCount(mediaId: string): Promise<void> {
    try {
      await supabase.rpc('increment_media_shares', { media_id: mediaId });
    } catch (error) {
      console.error('❌ Erreur incrementShareCount:', error);
    }
  }

  /**
   * Récupérer les statistiques globales de tous les médias
   */
  static async getGlobalMediaStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalViews: number;
  }> {
    try {
      const { data: mediaList, error } = await supabase
        .from('media_contents')
        .select('id, status, views_count');

      if (error) throw error;

      const stats = {
        total: mediaList?.length || 0,
        pending: mediaList?.filter(m => m.status === 'draft' || m.status === 'pending').length || 0,
        approved: mediaList?.filter(m => m.status === 'published').length || 0,
        rejected: mediaList?.filter(m => m.status === 'rejected').length || 0,
        totalViews: mediaList?.reduce((sum, m) => sum + (m.views_count || 0), 0) || 0
      };

      return stats;
    } catch (error) {
      console.error('❌ Erreur getGlobalMediaStats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalViews: 0
      };
    }
  }

  /**
   * Récupérer les statistiques d'un média
   */
  static async getMediaStats(mediaId: string): Promise<MediaStats | null> {
    try {
      // Valider que mediaId n'est pas undefined ou vide
      if (!mediaId || mediaId === 'undefined') {
        console.warn('⚠️ getMediaStats appelé avec mediaId invalide:', mediaId);
        return null;
      }

      const { data: interactions, error } = await supabase
        .from('media_interactions')
        .select('action, watch_time, completed')
        .eq('media_content_id', mediaId);

      if (error) throw error;

      const media = await this.getMediaById(mediaId);
      if (!media) return null;

      const totalViews = interactions?.filter(i => i.action === 'view').length || 0;
      const totalLikes = media.likes_count || 0;
      const totalShares = media.shares_count || 0;

      const watchTimes = interactions
        ?.filter(i => i.watch_time)
        .map(i => i.watch_time || 0) || [];
      
      const avgWatchTime = watchTimes.length > 0
        ? watchTimes.reduce((a, b) => a + b, 0) / watchTimes.length
        : 0;

      const completedViews = interactions?.filter(i => i.completed).length || 0;
      const completionRate = totalViews > 0 ? (completedViews / totalViews) * 100 : 0;

      const engagementRate = totalViews > 0
        ? ((totalLikes + totalShares) / totalViews) * 100
        : 0;

      return {
        total_views: totalViews,
        total_likes: totalLikes,
        total_shares: totalShares,
        avg_watch_time: avgWatchTime,
        completion_rate: completionRate,
        engagement_rate: engagementRate
      };
    } catch (error) {
      console.error('❌ Erreur getMediaStats:', error);
      return null;
    }
  }

  /**
   * Récupérer les événements live à venir
   */
  static async getUpcomingLiveEvents(): Promise<LiveEvent[]> {
    try {
      const { data, error } = await supabase
        .from('live_events')
        .select(`
          *,
          media_content:media_contents(
            *,
            sponsor_partner:sponsor_partner_id(id, company_name, logo_url)
          )
        `)
        .gte('event_date', new Date().toISOString())
        .in('status', ['scheduled', 'live'])
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getUpcomingLiveEvents:', error);
      return [];
    }
  }

  /**
   * Créer un événement live
   */
  static async createLiveEvent(eventData: CreateLiveEventRequest): Promise<LiveEvent | null> {
    try {
      const { data, error } = await supabase
        .from('live_events')
        .insert([{
          ...eventData,
          chat_enabled: eventData.chat_enabled ?? true,
          registration_required: eventData.registration_required ?? false,
          current_participants: 0,
          status: 'scheduled'
        }])
        .select(`
          *,
          media_content:media_contents(
            *,
            sponsor_partner:sponsor_partner_id(id, company_name, logo_url)
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur createLiveEvent:', error);
      return null;
    }
  }

  /**
   * Récupérer les médias d'un partenaire
   */
  static async getPartnerMedia(partnerId: string): Promise<MediaContent[]> {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select(`
          *,
          sponsor_partner:sponsor_partner_id(id, company_name, logo_url)
        `)
        .eq('sponsor_partner_id', partnerId)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getPartnerMedia:', error);
      return [];
    }
  }

  /**
   * Rechercher des médias
   */
  static async searchMedia(query: string, filters?: Omit<MediaFilters, 'search'>): Promise<MediaContent[]> {
    return this.getMedia({
      ...filters,
      search: query
    });
  }

  /**
   * Récupérer les médias tendance
   */
  static async getTrendingMedia(limit: number = 10): Promise<MediaContent[]> {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select(`
          *,
          sponsor_partner:sponsor_partner_id(id, company_name, logo_url)
        `)
        .eq('status', 'published')
        .order('views_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getTrendingMedia:', error);
      return [];
    }
  }

  /**
   * Récupérer les derniers médias publiés
   */
  static async getLatestMedia(limit: number = 10): Promise<MediaContent[]> {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select(`
          *,
          sponsor_partner:sponsor_partner_id(id, company_name, logo_url)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getLatestMedia:', error);
      return [];
    }
  }

  /**
   * Récupérer une playlist
   */
  static async getPlaylist(id: string): Promise<MediaPlaylist | null> {
    try {
      const { data, error } = await supabase
        .from('media_playlists')
        .select('id, name, description, media_content_ids, created_at, updated_at, user_id')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Charger les médias de la playlist
      if (data && data.media_content_ids && data.media_content_ids.length > 0) {
        const { data: mediaContents } = await supabase
          .from('media_contents')
          .select(`
            *,
            sponsor_partner:sponsor_partner_id(id, company_name, logo_url)
          `)
          .in('id', data.media_content_ids);

        data.media_contents = mediaContents || [];
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur getPlaylist:', error);
      return null;
    }
  }

  /**
   * Vérifier si un utilisateur a aimé un média
   */
  static async hasUserLiked(userId: string, mediaId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('media_interactions')
        .select('id')
        .eq('user_id', userId)
        .eq('media_content_id', mediaId)
        .eq('action', 'like')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('❌ Erreur hasUserLiked:', error);
      return false;
    }
  }

  /**
   * Obtenir les interactions d'un utilisateur
   */
  static async getUserInteractions(
    userId: string,
    mediaId?: string
  ): Promise<MediaInteraction[]> {
    try {
      let query = supabase
        .from('media_interactions')
        .select('id, user_id, media_content_id, interaction_type, duration, created_at')
        .eq('user_id', userId);

      if (mediaId) {
        query = query.eq('media_content_id', mediaId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getUserInteractions:', error);
      return [];
    }
  }
}

export const mediaService = MediaService;
