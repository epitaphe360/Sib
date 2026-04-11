# 🎬 Guide d'Intégration des Fonctionnalités Médias SIPORT

## 📋 Vue d'ensemble

Ce document décrit comment intégrer les 6 fonctionnalités médias premium pour les partenaires :

1. **Webinaires sponsorisés** (replays)
2. **Capsules vidéo "Inside SIPORT"**
3. **Podcast "SIPORT Talks"**
4. **Interview "Meet The Leaders"** (Live Studio)
5. **Capsule vidéo "Best Moments"**
6. **Testimonials** (interviews/vidéos courtes)

---

## 🏗️ Architecture de Base de Données

### 1. Nouvelles Tables Supabase

```sql
-- Table pour les contenus médias
CREATE TABLE media_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'webinar', 'capsule_inside', 'podcast', 'live_studio', 'best_moments', 'testimonial'
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text,
  audio_url text,
  duration integer, -- en secondes
  published_at timestamptz,
  status text DEFAULT 'draft', -- 'draft', 'published', 'archived'
  
  -- Métadonnées
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  
  -- Sponsors/Participants
  sponsor_partner_id uuid REFERENCES partners(id),
  featured_exhibitors uuid[],
  speakers jsonb DEFAULT '[]', -- [{name, title, company, photo_url}]
  
  -- Contenu
  transcript text,
  tags text[],
  category text,
  
  -- SEO
  seo_title text,
  seo_description text,
  seo_keywords text[],
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table pour les événements live
CREATE TABLE live_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_content_id uuid REFERENCES media_contents(id),
  event_date timestamptz NOT NULL,
  duration_minutes integer,
  live_stream_url text,
  chat_enabled boolean DEFAULT true,
  registration_required boolean DEFAULT false,
  max_participants integer,
  current_participants integer DEFAULT 0,
  status text DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended', 'cancelled'
  created_at timestamptz DEFAULT now()
);

-- Table pour les playlists/séries
CREATE TABLE media_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL, -- 'webinar_series', 'podcast_season', 'capsule_collection'
  thumbnail_url text,
  media_content_ids uuid[],
  partner_id uuid REFERENCES partners(id),
  created_at timestamptz DEFAULT now()
);

-- Table pour les interactions utilisateurs
CREATE TABLE media_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  media_content_id uuid REFERENCES media_contents(id),
  action text NOT NULL, -- 'view', 'like', 'share', 'comment', 'download'
  watch_time integer, -- temps de visionnage en secondes
  completed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_media_contents_type ON media_contents(type);
CREATE INDEX idx_media_contents_status ON media_contents(status);
CREATE INDEX idx_media_contents_partner ON media_contents(sponsor_partner_id);
CREATE INDEX idx_media_interactions_user ON media_interactions(user_id);
CREATE INDEX idx_media_interactions_content ON media_interactions(media_content_id);
```

---

## 📂 Structure des Fichiers

```
src/
├── pages/
│   └── media/
│       ├── WebinarsPage.tsx              # Liste des webinaires
│       ├── WebinarDetailPage.tsx         # Replay d'un webinaire
│       ├── CapsulesInsidePage.tsx        # Capsules "Inside SIPORT"
│       ├── PodcastsPage.tsx              # Liste des podcasts
│       ├── PodcastEpisodePage.tsx        # Épisode individuel
│       ├── LiveStudioPage.tsx            # Live Studio interviews
│       ├── BestMomentsPage.tsx           # Best Moments
│       ├── TestimonialsPage.tsx          # Testimonials
│       └── MediaLibraryPage.tsx          # Bibliothèque globale
│
├── components/
│   └── media/
│       ├── VideoPlayer.tsx               # Player vidéo personnalisé
│       ├── AudioPlayer.tsx               # Player audio pour podcasts
│       ├── MediaCard.tsx                 # Card média réutilisable
│       ├── MediaGrid.tsx                 # Grille de médias
│       ├── LiveStreamPlayer.tsx          # Player pour streams live
│       ├── SponsorBadge.tsx              # Badge sponsor
│       ├── MediaStats.tsx                # Statistiques de vue
│       └── MediaUploader.tsx             # Upload admin
│
├── services/
│   ├── mediaService.ts                   # CRUD médias
│   ├── videoStreamingService.ts          # Streaming vidéo
│   └── analyticsMediaService.ts          # Analytics médias
│
└── types/
    └── media.ts                          # Types TypeScript
```

---

## 💻 Implémentation des Types

```typescript
// src/types/media.ts

export type MediaType = 
  | 'webinar' 
  | 'capsule_inside' 
  | 'podcast' 
  | 'live_studio' 
  | 'best_moments' 
  | 'testimonial';

export type MediaStatus = 'draft' | 'published' | 'archived';
export type LiveEventStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

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
  sponsor_partner?: Partner;
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
}

export interface MediaInteraction {
  id: string;
  user_id: string;
  media_content_id: string;
  action: 'view' | 'like' | 'share' | 'comment' | 'download';
  watch_time?: number;
  completed: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}
```

---

## 🎬 Composants Principaux

### 1. VideoPlayer.tsx

```typescript
// src/components/media/VideoPlayer.tsx

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { Button } from '../ui/Button';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  autoplay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  onProgress,
  onComplete,
  autoplay = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime, video.duration);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        autoPlay={autoplay}
        className="w-full aspect-video"
      />

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full mb-2 cursor-pointer"
        />

        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={handleVolumeChange}
              className="w-20"
            />

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 2. WebinarsPage.tsx

```typescript
// src/pages/media/WebinarsPage.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, Users, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MediaService } from '../../services/mediaService';
import { MediaContent } from '../../types/media';

export const WebinarsPage: React.FC = () => {
  const [webinars, setWebinars] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    loadWebinars();
  }, [filter]);

  const loadWebinars = async () => {
    setLoading(true);
    try {
      const data = await MediaService.getMediaByType('webinar', {
        status: 'published',
        orderBy: 'published_at',
        order: 'desc'
      });
      setWebinars(data);
    } catch (error) {
      console.error('Erreur chargement webinaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}min`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Webinaires SIPORT
        </h1>
        <p className="text-lg text-gray-600">
          Retrouvez tous nos webinaires sponsorisés en replay
        </p>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          À venir
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'past'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Replays
        </button>
      </div>

      {/* Webinars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webinars.map((webinar) => (
          <Link
            key={webinar.id}
            to={`/media/webinar/${webinar.id}`}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-200">
                <img
                  src={webinar.thumbnail_url || '/placeholder-video.jpg'}
                  alt={webinar.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <Play className="h-8 w-8 text-blue-600 ml-1" />
                  </div>
                </div>

                {/* Sponsor Badge */}
                {webinar.sponsor_partner && (
                  <Badge className="absolute top-2 right-2 bg-blue-600">
                    Sponsorisé
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {webinar.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {webinar.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(webinar.duration || 0)}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{webinar.views_count} vues</span>
                  </div>
                </div>

                {/* Date */}
                {webinar.published_at && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500 mt-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(webinar.published_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {webinars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Aucun webinaire disponible pour le moment
          </p>
        </div>
      )}
    </div>
  );
};

export default WebinarsPage;
```

### 3. MediaService.ts

```typescript
// src/services/mediaService.ts

import { supabase } from '../lib/supabase';
import { MediaContent, MediaInteraction, LiveEvent } from '../types/media';

interface MediaFilters {
  status?: string;
  partner_id?: string;
  tags?: string[];
  orderBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
}

export class MediaService {
  
  /**
   * Récupérer les médias par type
   */
  static async getMediaByType(
    type: MediaContent['type'],
    filters?: MediaFilters
  ): Promise<MediaContent[]> {
    try {
      let query = supabase
        .from('media_contents')
        .select(`
          *,
          sponsor_partner:sponsor_partner_id(id, company_name, logo_url)
        `)
        .eq('type', type);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.partner_id) {
        query = query.eq('sponsor_partner_id', filters.partner_id);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.orderBy) {
        query = query.order(filters.orderBy, {
          ascending: filters.order === 'asc'
        });
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur getMediaByType:', error);
      return [];
    }
  }

  /**
   * Récupérer un média par ID
   */
  static async getMediaById(id: string): Promise<MediaContent | null> {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select(`
          *,
          sponsor_partner:sponsor_partner_id(id, company_name, logo_url, tier)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur getMediaById:', error);
      return null;
    }
  }

  /**
   * Créer un nouveau média (Admin)
   */
  static async createMedia(
    mediaData: Partial<MediaContent>
  ): Promise<MediaContent | null> {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .insert([mediaData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur createMedia:', error);
      return null;
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

      // Incrémenter le compteur approprié
      if (interaction.action === 'view') {
        await this.incrementViewCount(interaction.media_content_id);
      } else if (interaction.action === 'like') {
        await this.incrementLikeCount(interaction.media_content_id);
      } else if (interaction.action === 'share') {
        await this.incrementShareCount(interaction.media_content_id);
      }

      return true;
    } catch (error) {
      console.error('Erreur recordInteraction:', error);
      return false;
    }
  }

  /**
   * Incrémenter le compteur de vues
   */
  private static async incrementViewCount(mediaId: string): Promise<void> {
    await supabase.rpc('increment_media_views', { media_id: mediaId });
  }

  /**
   * Incrémenter le compteur de likes
   */
  private static async incrementLikeCount(mediaId: string): Promise<void> {
    await supabase.rpc('increment_media_likes', { media_id: mediaId });
  }

  /**
   * Incrémenter le compteur de partages
   */
  private static async incrementShareCount(mediaId: string): Promise<void> {
    await supabase.rpc('increment_media_shares', { media_id: mediaId });
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
          media_content:media_contents(*)
        `)
        .gte('event_date', new Date().toISOString())
        .eq('status', 'scheduled')
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur getUpcomingLiveEvents:', error);
      return [];
    }
  }

  /**
   * Récupérer les médias d'un partenaire
   */
  static async getPartnerMedia(partnerId: string): Promise<MediaContent[]> {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select('*')
        .eq('sponsor_partner_id', partnerId)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur getPartnerMedia:', error);
      return [];
    }
  }

  /**
   * Rechercher des médias
   */
  static async searchMedia(query: string): Promise<MediaContent[]> {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', 'published')
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur searchMedia:', error);
      return [];
    }
  }
}
```

---

## 🎨 Pages Principales

### 4. PodcastsPage.tsx

```typescript
// src/pages/media/PodcastsPage.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Podcast, Calendar, Clock, Play } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MediaService } from '../../services/mediaService';
import { MediaContent } from '../../types/media';

export const PodcastsPage: React.FC = () => {
  const [podcasts, setPodcasts] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPodcasts();
  }, []);

  const loadPodcasts = async () => {
    setLoading(true);
    try {
      const data = await MediaService.getMediaByType('podcast', {
        status: 'published',
        orderBy: 'published_at',
        order: 'desc'
      });
      setPodcasts(data);
    } catch (error) {
      console.error('Erreur chargement podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Podcast className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SIPORT Talks - Le Podcast
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Interviews audio avec les leaders de l'industrie maritime et portuaire
        </p>
      </div>

      {/* Latest Episode - Featured */}
      {podcasts[0] && (
        <Card className="mb-12 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <div className="p-8 md:flex items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="md:w-1/3">
              <img
                src={podcasts[0].thumbnail_url || '/podcast-cover.jpg'}
                alt={podcasts[0].title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-2/3">
              <Badge className="mb-4 bg-purple-600">
                Dernier épisode
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {podcasts[0].title}
              </h2>
              <p className="text-gray-600 mb-6">
                {podcasts[0].description}
              </p>

              {/* Speakers */}
              {podcasts[0].speakers && podcasts[0].speakers.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Intervenants:</p>
                  <div className="flex flex-wrap gap-2">
                    {podcasts[0].speakers.map((speaker, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full">
                        <span className="text-sm">{speaker.name}</span>
                        <span className="text-xs text-gray-500">{speaker.company}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to={`/media/podcast/${podcasts[0].id}`}
                className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Play className="h-5 w-5" />
                <span>Écouter maintenant</span>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* All Episodes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Tous les épisodes
        </h2>

        <div className="space-y-4">
          {podcasts.map((podcast, index) => (
            <Link
              key={podcast.id}
              to={`/media/podcast/${podcast.id}`}
              className="block group"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-6 flex items-center space-x-6">
                  {/* Episode Number */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-purple-600">
                        #{podcasts.length - index}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-24 h-24">
                    <img
                      src={podcast.thumbnail_url || '/podcast-cover.jpg'}
                      alt={podcast.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {podcast.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {podcast.description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(podcast.published_at || '').toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(podcast.duration || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-white ml-1" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {podcasts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Podcast className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            Aucun podcast disponible pour le moment
          </p>
        </div>
      )}
    </div>
  );
};

export default PodcastsPage;
```

---

## 🔧 Fonctions SQL Supabase

```sql
-- Fonction pour incrémenter les vues
CREATE OR REPLACE FUNCTION increment_media_views(media_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE media_contents
  SET views_count = views_count + 1
  WHERE id = media_id;
END;
$$;

-- Fonction pour incrémenter les likes
CREATE OR REPLACE FUNCTION increment_media_likes(media_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE media_contents
  SET likes_count = likes_count + 1
  WHERE id = media_id;
END;
$$;

-- Fonction pour incrémenter les partages
CREATE OR REPLACE FUNCTION increment_media_shares(media_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE media_contents
  SET shares_count = shares_count + 1
  WHERE id = media_id;
END;
$$;
```

---

## 🚀 Routes à Ajouter

```typescript
// src/lib/routes.ts

export const ROUTES = {
  // ... routes existantes
  
  // Media Routes
  MEDIA_LIBRARY: '/media',
  WEBINARS: '/media/webinars',
  WEBINAR_DETAIL: '/media/webinar/:id',
  PODCASTS: '/media/podcasts',
  PODCAST_DETAIL: '/media/podcast/:id',
  CAPSULES_INSIDE: '/media/inside-siport',
  LIVE_STUDIO: '/media/live-studio',
  BEST_MOMENTS: '/media/best-moments',
  TESTIMONIALS: '/media/testimonials',
  
  // Admin Media
  ADMIN_MEDIA_CREATE: '/admin/media/create',
  ADMIN_MEDIA_MANAGE: '/admin/media/manage',
  ADMIN_LIVE_EVENTS: '/admin/live-events',
};
```

---

## 📦 Prochaines Étapes

1. **Créer les migrations Supabase** pour les nouvelles tables
2. **Implémenter les composants** VideoPlayer, AudioPlayer, etc.
3. **Créer les pages** pour chaque type de média
4. **Intégrer l'upload vidéo** (Supabase Storage ou service tiers comme Cloudflare Stream)
5. **Mettre en place les analytics** pour tracker les vues et engagement
6. **Créer l'interface admin** pour gérer les contenus médias
7. **Implémenter les notifications** pour les nouveaux contenus
8. **Ajouter le SEO** pour chaque page média
9. **Créer les feeds RSS** pour les podcasts
10. **Implémenter le live streaming** pour les événements en direct

---

## 🎯 Bénéfices par Tier Partenaire

| Fonctionnalité | Bronze | Silver | Gold | Platinum |
|----------------|--------|--------|------|----------|
| Webinaires sponsorisés | ❌ | ✅ Replay | ✅ Replay | ✅ Live + Replay |
| Capsules "Inside SIPORT" | ❌ | ✅ 1/trim | ✅ 1/mois | ✅ 2/mois |
| Podcast "SIPORT Talks" | ❌ | ✅ 1 épisode | ✅ 2 épisodes | ✅ 4 épisodes |
| Live Studio "Meet The Leaders" | ❌ | ✅ 1 fois | ✅ 2 fois | ✅ 4 fois |
| Best Moments | ❌ | ✅ Mention | ✅ Feature | ✅ Dedicated |
| Testimonials | ❌ | ✅ 1 min | ✅ 2 min | ✅ 3 min |

---

Voulez-vous que je commence par implémenter une fonctionnalité spécifique en priorité ?
