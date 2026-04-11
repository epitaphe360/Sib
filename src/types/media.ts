/**
 * Types pour les fonctionnalités médias
 * Webinaires, Podcasts, Capsules vidéo, Live Studio, etc.
 */

export type MediaType = 
  | 'webinar'           // Webinaires sponsorisés
  | 'capsule_inside'    // Capsules "Inside SIB"
  | 'podcast'           // Podcast "SIB Talks"
  | 'live_studio'       // Interview Live Studio "Meet The Leaders"
  | 'best_moments'      // Capsules "Best Moments"
  | 'testimonial';      // Testimonials vidéo

export type MediaStatus = 'draft' | 'published' | 'archived';
export type LiveEventStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
export type MediaAction = 'view' | 'like' | 'share' | 'comment' | 'download';

export interface Speaker {
  name: string;
  title: string;
  company: string;
  photo_url?: string;
  bio?: string;
}

export interface MediaContent {
  id: string;
  type: MediaType;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  audio_url?: string;
  duration?: number; // en secondes
  published_at?: string;
  status: MediaStatus;
  
  // Métadonnées
  views_count: number;
  likes_count: number;
  shares_count: number;
  
  // Sponsors/Participants
  sponsor_partner_id?: string;
  sponsor_partner?: {
    id: string;
    company_name: string;
    logo_url?: string;
    tier?: string;
  };
  featured_exhibitors?: string[];
  speakers: Speaker[];
  
  // Contenu
  transcript?: string;
  tags: string[];
  category?: string;
  
  // SEO
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  
  created_at: string;
  updated_at: string;
}

export interface LiveEvent {
  id: string;
  media_content_id: string;
  media_content?: MediaContent;
  event_date: string;
  duration_minutes?: number;
  live_stream_url?: string;
  chat_enabled: boolean;
  registration_required: boolean;
  max_participants?: number;
  current_participants: number;
  status: LiveEventStatus;
  created_at: string;
}

export interface MediaPlaylist {
  id: string;
  title: string;
  description?: string;
  type: 'webinar_series' | 'podcast_season' | 'capsule_collection';
  thumbnail_url?: string;
  media_content_ids: string[];
  media_contents?: MediaContent[];
  partner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaInteraction {
  id: string;
  user_id: string;
  media_content_id: string;
  action: MediaAction;
  watch_time?: number; // temps de visionnage en secondes
  completed: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface MediaFilters {
  type?: MediaType;
  status?: MediaStatus;
  partner_id?: string;
  tags?: string[];
  category?: string;
  search?: string;
  orderBy?: 'published_at' | 'views_count' | 'likes_count' | 'created_at';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface MediaStats {
  total_views: number;
  total_likes: number;
  total_shares: number;
  avg_watch_time: number;
  completion_rate: number;
  engagement_rate: number;
}

// Types pour l'interface admin
export interface CreateMediaRequest {
  type: MediaType;
  title: string;
  description?: string;
  video_url?: string;
  audio_url?: string;
  thumbnail_url?: string;
  duration?: number;
  sponsor_partner_id?: string;
  speakers?: Speaker[];
  tags?: string[];
  category?: string;
  status?: MediaStatus;
  published_at?: string;
}

export interface UpdateMediaRequest extends Partial<CreateMediaRequest> {
  id: string;
}

// Types pour les événements live
export interface CreateLiveEventRequest {
  media_content_id: string;
  event_date: string;
  duration_minutes?: number;
  live_stream_url?: string;
  chat_enabled?: boolean;
  registration_required?: boolean;
  max_participants?: number;
}

// Helper types
export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  webinar: 'Webinaire',
  capsule_inside: 'Capsule Inside SIB',
  podcast: 'Podcast SIB Talks',
  live_studio: 'Live Studio Interview',
  best_moments: 'Best Moments',
  testimonial: 'Testimonial'
};

export const MEDIA_TYPE_ICONS: Record<MediaType, string> = {
  webinar: '🎥',
  capsule_inside: '📹',
  podcast: '🎙️',
  live_studio: '🎬',
  best_moments: '⭐',
  testimonial: '💬'
};
