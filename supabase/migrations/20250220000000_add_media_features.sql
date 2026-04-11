-- Migration: Add Media Features Tables
-- Date: 2025-12-20
-- Description: Tables pour webinaires, podcasts, capsules vidéo, live studio, etc.

BEGIN;

-- ============================================================================
-- TABLE: media_contents
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.media_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN (
    'webinar', 
    'capsule_inside', 
    'podcast', 
    'live_studio', 
    'best_moments', 
    'testimonial'
  )),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text,
  audio_url text,
  duration integer, -- en secondes
  published_at timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Métadonnées
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  
  -- Sponsors/Participants
  sponsor_partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL,
  featured_exhibitors uuid[],
  speakers jsonb DEFAULT '[]'::jsonb, -- [{name, title, company, photo_url, bio}]
  
  -- Contenu
  transcript text,
  tags text[] DEFAULT '{}',
  category text,
  
  -- SEO
  seo_title text,
  seo_description text,
  seo_keywords text[] DEFAULT '{}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: live_events
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.live_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_content_id uuid REFERENCES public.media_contents(id) ON DELETE CASCADE,
  event_date timestamptz NOT NULL,
  duration_minutes integer,
  live_stream_url text,
  chat_enabled boolean DEFAULT true,
  registration_required boolean DEFAULT false,
  max_participants integer,
  current_participants integer DEFAULT 0,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: media_playlists
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.media_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('webinar_series', 'podcast_season', 'capsule_collection')),
  thumbnail_url text,
  media_content_ids uuid[] DEFAULT '{}',
  partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: media_interactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.media_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  media_content_id uuid REFERENCES public.media_contents(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('view', 'like', 'share', 'comment', 'download')),
  watch_time integer, -- temps de visionnage en secondes
  completed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_media_contents_type ON public.media_contents(type);
CREATE INDEX IF NOT EXISTS idx_media_contents_status ON public.media_contents(status);
CREATE INDEX IF NOT EXISTS idx_media_contents_partner ON public.media_contents(sponsor_partner_id);
CREATE INDEX IF NOT EXISTS idx_media_contents_published_at ON public.media_contents(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_contents_tags ON public.media_contents USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_live_events_date ON public.live_events(event_date);
CREATE INDEX IF NOT EXISTS idx_live_events_status ON public.live_events(status);
CREATE INDEX IF NOT EXISTS idx_live_events_media_content ON public.live_events(media_content_id);

CREATE INDEX IF NOT EXISTS idx_media_interactions_user ON public.media_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_media_interactions_content ON public.media_interactions(media_content_id);
CREATE INDEX IF NOT EXISTS idx_media_interactions_action ON public.media_interactions(action);

CREATE INDEX IF NOT EXISTS idx_media_playlists_partner ON public.media_playlists(partner_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour incrémenter les vues
CREATE OR REPLACE FUNCTION increment_media_views(media_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.media_contents
  SET views_count = views_count + 1,
      updated_at = now()
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
  UPDATE public.media_contents
  SET likes_count = likes_count + 1,
      updated_at = now()
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
  UPDATE public.media_contents
  SET shares_count = shares_count + 1,
      updated_at = now()
  WHERE id = media_id;
END;
$$;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_media_contents_updated_at ON public.media_contents;
CREATE TRIGGER update_media_contents_updated_at
  BEFORE UPDATE ON public.media_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_playlists_updated_at ON public.media_playlists;
CREATE TRIGGER update_media_playlists_updated_at
  BEFORE UPDATE ON public.media_playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.media_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_interactions ENABLE ROW LEVEL SECURITY;

-- Policies pour media_contents
CREATE POLICY "Tout le monde peut voir les médias publiés"
  ON public.media_contents FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins peuvent tout faire"
  ON public.media_contents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

CREATE POLICY "Partenaires peuvent voir leurs médias"
  ON public.media_contents FOR SELECT
  USING (
    sponsor_partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

-- Policies pour live_events
CREATE POLICY "Tout le monde peut voir les événements"
  ON public.live_events FOR SELECT
  USING (true);

CREATE POLICY "Admins peuvent gérer les événements"
  ON public.live_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

-- Policies pour media_interactions
CREATE POLICY "Users peuvent voir leurs interactions"
  ON public.media_interactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users peuvent créer des interactions"
  ON public.media_interactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins peuvent voir toutes les interactions"
  ON public.media_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

-- Policies pour media_playlists
CREATE POLICY "Tout le monde peut voir les playlists"
  ON public.media_playlists FOR SELECT
  USING (true);

CREATE POLICY "Admins peuvent gérer les playlists"
  ON public.media_playlists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

COMMIT;

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================

-- Pour créer un webinaire:
-- INSERT INTO media_contents (type, title, description, video_url, sponsor_partner_id, speakers, status)
-- VALUES ('webinar', 'Innovation Portuaire 2025', '...', 'https://...', '<partner_uuid>', '[...]', 'published');

-- Pour créer un podcast:
-- INSERT INTO media_contents (type, title, description, audio_url, speakers, duration, status)
-- VALUES ('podcast', 'SIPORT Talks #1', '...', 'https://...', '[...]', 3600, 'published');

-- Pour enregistrer une vue:
-- SELECT increment_media_views('<media_uuid>');
