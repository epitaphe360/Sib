/**
 * Types partagés pour le module Marketing Dashboard
 */

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  video_url?: string;
  audio_url?: string;
  thumbnail_url?: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  views_count: number;
  likes_count: number;
  shares_count: number;
  tags?: string[];
  duration?: number;
}

export interface ArticleItem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  published: boolean;
  published_at: string | null;
  category: string | null;
  tags: string[];
  image_url: string | null;
  created_at: string;
  shortcode: string;
}

export type ContentTab = 'media' | 'articles';

export type MediaType =
  | 'webinar'
  | 'capsule_inside'
  | 'podcast'
  | 'live_studio'
  | 'best_moments'
  | 'testimonial';

export type MediaFilterType = 'all' | MediaType;

export type MediaStatus = 'all' | 'draft' | 'published' | 'archived';

export interface MediaStats {
  total: number;
  webinars: number;
  capsules: number;
  podcasts: number;
  lives: number;
  bestMoments: number;
  testimonials: number;
  published: number;
  draft: number;
}

/** Types autorisés à l'ajout via le formulaire */
export type UploadableMediaType = 'webinar' | 'capsule_inside' | 'podcast' | 'live_studio' | 'best_moments' | 'testimonial';

export interface UploadFormData {
  title: string;
  description: string;
  url: string;
  category: string;
}
