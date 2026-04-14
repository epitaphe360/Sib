-- SIB 2026 - Master Migration (91 fichiers)
-- Appliquer dans Supabase SQL Editor


-- [20241219_add_minisite_created_flag.sql]
-- Add minisite_created flag to users table
-- This flag tracks whether an exhibitor has created their mini-site

-- Add column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'minisite_created'
  ) THEN
    ALTER TABLE public.users
    ADD COLUMN minisite_created BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_minisite_created
ON public.users(id, minisite_created)
WHERE role = 'exhibitor';

-- Add comment
COMMENT ON COLUMN public.users.minisite_created IS
'Flag indicating whether the exhibitor has created their mini-site (true) or not (false). Used to trigger the mini-site setup popup on first login after account activation.';

-- Update existing exhibitors without mini-site to false (explicit)
UPDATE public.users
SET minisite_created = false
WHERE role = 'exhibitor'
AND minisite_created IS NULL;


-- [20250103_payment_validation.sql]
-- Migration: Correction de la fonction d'approbation des paiements partenaires
-- Date: 2025-01-03
-- Description: Mise à jour de approve_payment_request() pour gérer correctement les partenaires

-- ============================================
-- FONCTION: Approuver une demande de paiement partenaire
-- ============================================

DROP FUNCTION IF EXISTS public.approve_payment_request(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.approve_payment_request(
  request_id uuid,
  admin_id uuid,
  notes text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_requested_level text;
  v_user_type text;
BEGIN
  -- Récupérer les infos de la demande
  SELECT user_id, requested_level
  INTO v_user_id, v_requested_level
  FROM public.payment_requests
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request not found or already processed';
  END IF;

  -- Récupérer le type d'utilisateur
  SELECT type
  INTO v_user_type
  FROM public.users
  WHERE id = v_user_id;

  -- Mettre à jour la demande
  UPDATE public.payment_requests
  SET
    status = 'approved',
    validated_by = admin_id,
    validated_at = now(),
    validation_notes = notes
  WHERE id = request_id;

  -- Mettre à jour l'utilisateur selon son type
  IF v_user_type = 'partner' THEN
    -- Pour les partenaires : mettre à jour partner_tier et activer le compte
    UPDATE public.users
    SET
      partner_tier = v_requested_level,
      status = 'active'
    WHERE id = v_user_id;

    -- Créer une notification pour le partenaire
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_user_id,
      'Paiement approuvé !',
      'Votre paiement a été validé. Votre compte partenaire ' || v_requested_level || ' est maintenant actif !',
      'success'
    );
  ELSE
    -- Pour les visiteurs : mettre à jour visitor_level
    UPDATE public.users
    SET visitor_level = v_requested_level
    WHERE id = v_user_id;

    -- Créer une notification pour le visiteur
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_user_id,
      'Paiement approuvé !',
      'Votre paiement a été validé. Vous avez maintenant accès au Pass Premium VIP avec tous les avantages illimités !',
      'success'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.approve_payment_request IS 'Approuve une demande de paiement et met à jour le niveau utilisateur (partner_tier pour partenaires, visitor_level pour visiteurs)';


-- [20250202000000_add_partner_translations.sql]
-- Add English translation columns to partners table
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS name_en text,
ADD COLUMN IF NOT EXISTS category_en text,
ADD COLUMN IF NOT EXISTS description_en text,
ADD COLUMN IF NOT EXISTS sector_en text;

-- Add comments for clarity
COMMENT ON COLUMN partners.name_en IS 'English translation of partner name';
COMMENT ON COLUMN partners.category_en IS 'English translation of partner category';
COMMENT ON COLUMN partners.description_en IS 'English translation of partner description';
COMMENT ON COLUMN partners.sector_en IS 'English translation of partner sector';


-- [20250220000000_add_media_features.sql]
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
-- VALUES ('podcast', 'SIB Talks #1', '...', 'https://...', '[...]', 3600, 'published');

-- Pour enregistrer une vue:
-- SELECT increment_media_views('<media_uuid>');


-- [20250220000001_seed_media_data.sql]
-- Seed Data pour les Fonctionnalités Médias
-- Exemples de données pour tester les fonctionnalités

BEGIN;

-- ============================================================================
-- SEED: WEBINAIRES
-- ============================================================================

-- Webinaire 1: Innovation Portuaire 2025
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'webinar',
  'Innovation Portuaire 2025 : Les Technologies qui Transforment le Secteur',
  'Découvrez les dernières innovations technologiques qui révolutionnent l''industrie portuaire. Des experts internationaux partagent leurs insights sur l''automatisation, l''IoT et l''intelligence artificielle dans les ports modernes.',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  3600,
  '[
    {"name": "Dr. Marie Laurent", "title": "Directrice Innovation", "company": "Port du Havre", "photo_url": "https://randomuser.me/api/portraits/women/1.jpg"},
    {"name": "Jean Dupont", "title": "CTO", "company": "Maritime Tech Solutions", "photo_url": "https://randomuser.me/api/portraits/men/1.jpg"}
  ]'::jsonb,
  ARRAY['innovation', 'technologie', 'port', 'automatisation'],
  'Technologie',
  'published',
  NOW() - INTERVAL '7 days'
);

-- Webinaire 2: Logistique Verte
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'webinar',
  'Logistique Verte : Vers des Ports Durables et Éco-Responsables',
  'Comment les ports s''adaptent aux enjeux environnementaux. Stratégies de décarbonation, énergies renouvelables et certifications écologiques.',
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  2700,
  '[
    {"name": "Sophie Martin", "title": "Responsable Développement Durable", "company": "Port de Marseille", "photo_url": "https://randomuser.me/api/portraits/women/2.jpg"},
    {"name": "Pierre Legrand", "title": "Consultant Environnemental", "company": "EcoPort Consulting", "photo_url": "https://randomuser.me/api/portraits/men/2.jpg"}
  ]'::jsonb,
  ARRAY['développement durable', 'écologie', 'port vert'],
  'Environnement',
  'published',
  NOW() - INTERVAL '14 days'
);

-- Webinaire 3: Cybersécurité Portuaire
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Cybersécurité dans les Ports : Protéger les Infrastructures Critiques',
  'Analyse des menaces cybernétiques dans le secteur portuaire et les meilleures pratiques pour sécuriser vos opérations. Conformité RGPD et normes ISO 27001.',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  3300,
  '[
    {"name": "Marc Dubois", "title": "Expert Cybersécurité", "company": "SecurePort Systems", "photo_url": "https://randomuser.me/api/portraits/men/6.jpg"},
    {"name": "Nadia El Fassi", "title": "CISO", "company": "Port Tanger Med", "photo_url": "https://randomuser.me/api/portraits/women/6.jpg"}
  ]'::jsonb,
  ARRAY['cybersécurité', 'sécurité', 'technologie', 'rgpd'],
  'Technologie',
  'published',
  NOW() - INTERVAL '21 days'
);

-- Webinaire 4: Blockchain et Traçabilité
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Blockchain et Supply Chain : Révolutionner la Traçabilité Maritime',
  'Découvrez comment la technologie blockchain transforme la logistique maritime. Cas d''usage concrets, smart contracts et interopérabilité des systèmes.',
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  2850,
  '[
    {"name": "Thomas Chen", "title": "Blockchain Architect", "company": "MarineChain", "photo_url": "https://randomuser.me/api/portraits/men/7.jpg"},
    {"name": "Lisa Anderson", "title": "VP Operations", "company": "TrackShip Global", "photo_url": "https://randomuser.me/api/portraits/women/7.jpg"}
  ]'::jsonb,
  ARRAY['blockchain', 'innovation', 'traçabilité', 'supply chain'],
  'Innovation',
  'published',
  NOW() - INTERVAL '28 days'
);

-- Webinaire 5: Ressources Humaines Portuaires
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Attractivité et Rétention des Talents dans le Secteur Portuaire',
  'Stratégies RH innovantes pour attirer et fidéliser les jeunes talents. Formation continue, transformation digitale des métiers et marque employeur.',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  2400,
  '[
    {"name": "Isabelle Moreau", "title": "DRH", "company": "Port Autonome d''Abidjan", "photo_url": "https://randomuser.me/api/portraits/women/8.jpg"},
    {"name": "Karim Benali", "title": "Consultant RH", "company": "TalentPort Advisory", "photo_url": "https://randomuser.me/api/portraits/men/8.jpg"}
  ]'::jsonb,
  ARRAY['rh', 'talents', 'formation', 'management'],
  'Business',
  'published',
  NOW() - INTERVAL '35 days'
);

-- Webinaire 6: Intelligence Artificielle
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'IA et Machine Learning : Optimiser les Opérations Portuaires',
  'Applications concrètes de l''intelligence artificielle dans la gestion portuaire : prédiction de trafic, maintenance prédictive et automatisation intelligente.',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  3150,
  '[
    {"name": "Dr. Yuki Tanaka", "title": "AI Research Lead", "company": "SmartPort Labs", "photo_url": "https://randomuser.me/api/portraits/men/9.jpg"},
    {"name": "Elena Rodriguez", "title": "Data Scientist", "company": "Port de Barcelona", "photo_url": "https://randomuser.me/api/portraits/women/9.jpg"}
  ]'::jsonb,
  ARRAY['ia', 'machine learning', 'automatisation', 'data'],
  'Technologie',
  'published',
  NOW() - INTERVAL '42 days'
);

-- Webinaire 7: Financement et Investissement
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Financer la Modernisation des Ports : Stratégies et Opportunités',
  'Sources de financement pour les projets d''infrastructures portuaires. PPP, investissements verts et fonds internationaux disponibles.',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  2550,
  '[
    {"name": "Philippe Girard", "title": "Directeur Financier", "company": "AfricaPort Investment", "photo_url": "https://randomuser.me/api/portraits/men/10.jpg"},
    {"name": "Fatima Zahra", "title": "Analyste Financier", "company": "World Bank Maritime Division", "photo_url": "https://randomuser.me/api/portraits/women/10.jpg"}
  ]'::jsonb,
  ARRAY['finance', 'investissement', 'infrastructure', 'ppp'],
  'Business',
  'published',
  NOW() - INTERVAL '49 days'
);

-- Webinaire 8: Réglementation Maritime
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Nouvelles Réglementations Maritimes 2025 : Impacts et Conformité',
  'Tour d''horizon des nouvelles normes IMO, réglementations environnementales et obligations douanières. Comment s''adapter efficacement.',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  2950,
  '[
    {"name": "Maître Dupont", "title": "Avocat Maritime", "company": "Dupont & Associés", "photo_url": "https://randomuser.me/api/portraits/men/11.jpg"},
    {"name": "Catherine Blanc", "title": "Compliance Officer", "company": "MSC Mediterranean Shipping", "photo_url": "https://randomuser.me/api/portraits/women/11.jpg"}
  ]'::jsonb,
  ARRAY['réglementation', 'conformité', 'maritime', 'imo'],
  'Réglementation',
  'published',
  NOW() - INTERVAL '56 days'
);

-- Webinaire 9: Ports Intelligents
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Smart Ports : IoT, 5G et Connectivité au Service de l''Efficacité',
  'Technologies de communication 5G, capteurs IoT et plateformes de gestion intégrées pour créer le port du futur.',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  3450,
  '[
    {"name": "Omar Bensaid", "title": "CTO", "company": "Port de Casablanca", "photo_url": "https://randomuser.me/api/portraits/men/12.jpg"},
    {"name": "Julie Kim", "title": "IoT Solutions Architect", "company": "Huawei Marine", "photo_url": "https://randomuser.me/api/portraits/women/12.jpg"}
  ]'::jsonb,
  ARRAY['smart port', 'iot', '5g', 'connectivité'],
  'Technologie',
  'published',
  NOW() - INTERVAL '63 days'
);

-- Webinaire 10: Économie Circulaire
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Économie Circulaire dans les Zones Portuaires : De la Théorie à la Pratique',
  'Recyclage des matériaux, réutilisation des ressources et symbiose industrielle dans les écosystèmes portuaires.',
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  2650,
  '[
    {"name": "Aminata Diop", "title": "Directrice Environnement", "company": "Port Autonome de Lomé", "photo_url": "https://randomuser.me/api/portraits/women/13.jpg"},
    {"name": "Jean-Marc Dubois", "title": "Expert Économie Circulaire", "company": "Circular Ports Initiative", "photo_url": "https://randomuser.me/api/portraits/men/13.jpg"}
  ]'::jsonb,
  ARRAY['économie circulaire', 'recyclage', 'durabilité', 'environnement'],
  'Environnement',
  'published',
  NOW() - INTERVAL '70 days'
);

-- ============================================================================
-- SEED: PODCASTS
-- ============================================================================

-- Podcast Episode 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  audio_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'podcast',
  'SIB Talks #1 - L''Avenir de la Logistique Maritime avec Ahmed Hassan',
  'Dans ce premier épisode, nous recevons Ahmed Hassan, CEO de Maritime Logistics International. Il nous parle de sa vision pour l''avenir du transport maritime et des défis à venir.',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  2400,
  '[
    {"name": "Ahmed Hassan", "title": "CEO", "company": "Maritime Logistics International", "photo_url": "https://randomuser.me/api/portraits/men/3.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'logistique', 'maritime', 'leadership'],
  'Business',
  'published',
  NOW() - INTERVAL '5 days'
);

-- Podcast Episode 2
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  audio_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'podcast',
  'SIB Talks #2 - Innovation et Digitalisation avec Clara Dubois',
  'Clara Dubois, Directrice de l''Innovation chez PortTech, partage son parcours et les projets innovants qui transforment les opérations portuaires.',
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  1800,
  '[
    {"name": "Clara Dubois", "title": "Directrice Innovation", "company": "PortTech", "photo_url": "https://randomuser.me/api/portraits/women/3.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'innovation', 'digital', 'technologie'],
  'Innovation',
  'published',
  NOW() - INTERVAL '12 days'
);

-- Podcast Episode 3
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIB Talks #3 - L''Essor des Ports Africains avec Amadou Koné',
  'Amadou Koné, Directeur du Port d''Abidjan, nous parle du développement spectaculaire des infrastructures portuaires en Afrique de l''Ouest et des opportunités à saisir.',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  2100,
  '[
    {"name": "Amadou Koné", "title": "Directeur Général", "company": "Port Autonome d''Abidjan", "photo_url": "https://randomuser.me/api/portraits/men/14.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'afrique', 'développement', 'infrastructure'],
  'Business',
  'published',
  NOW() - INTERVAL '19 days'
);

-- Podcast Episode 4
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIB Talks #4 - Transition Énergétique avec Marina Silva',
  'Marina Silva, experte en énergies marines renouvelables, explore les solutions pour décarboner le secteur maritime et portuaire.',
  'https://images.unsplash.com/photo-1497864149936-d3163f0c0f4b?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  1950,
  '[
    {"name": "Marina Silva", "title": "Consultante Énergie", "company": "BlueEnergy Solutions", "photo_url": "https://randomuser.me/api/portraits/women/14.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'énergie', 'transition', 'environnement'],
  'Environnement',
  'published',
  NOW() - INTERVAL '26 days'
);

-- Podcast Episode 5
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIB Talks #5 - Automatisation et Robotique avec Dr. Hans Schmidt',
  'Le Dr. Hans Schmidt, pionnier de la robotique portuaire, partage sa vision sur l''automatisation des terminaux et l''impact sur l''emploi.',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  2250,
  '[
    {"name": "Dr. Hans Schmidt", "title": "Chief Robotics Officer", "company": "AutoPort Technologies", "photo_url": "https://randomuser.me/api/portraits/men/15.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'automatisation', 'robotique', 'technologie'],
  'Technologie',
  'published',
  NOW() - INTERVAL '33 days'
);

-- Podcast Episode 6
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIB Talks #6 - Femmes Leaders dans le Maritime avec Samira Alaoui',
  'Samira Alaoui, première femme Capitaine de Port au Maroc, raconte son parcours inspirant et encourage plus de diversité dans le secteur.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  1850,
  '[
    {"name": "Samira Alaoui", "title": "Capitaine de Port", "company": "Port de Tanger", "photo_url": "https://randomuser.me/api/portraits/women/15.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'leadership', 'diversité', 'inspiration'],
  'Leadership',
  'published',
  NOW() - INTERVAL '40 days'
);

-- Podcast Episode 7
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIB Talks #7 - Économie Bleue et Opportunités avec Jean-Paul Océan',
  'Jean-Paul Océan, économiste spécialisé dans l''économie maritime, analyse les tendances du marché et les opportunités de croissance.',
  'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  2150,
  '[
    {"name": "Jean-Paul Océan", "title": "Économiste Maritime", "company": "BlueEconomy Institute", "photo_url": "https://randomuser.me/api/portraits/men/16.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'économie', 'maritime', 'business'],
  'Business',
  'published',
  NOW() - INTERVAL '47 days'
);

-- Podcast Episode 8
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIB Talks #8 - Formation et Compétences avec Patricia N''Dour',
  'Patricia N''Dour, Directrice de l''Institut Maritime de Dakar, présente les nouvelles formations pour préparer les professionnels de demain.',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  1750,
  '[
    {"name": "Patricia N''Dour", "title": "Directrice", "company": "Institut Maritime de Dakar", "photo_url": "https://randomuser.me/api/portraits/women/16.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'formation', 'éducation', 'compétences'],
  'Éducation',
  'published',
  NOW() - INTERVAL '54 days'
);

-- Podcast Episode 9
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIB Talks #9 - Partenariats Public-Privé avec Alexandre Fontaine',
  'Alexandre Fontaine, expert en PPP, explique comment structurer des partenariats gagnants pour financer les grands projets portuaires.',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  2050,
  '[
    {"name": "Alexandre Fontaine", "title": "Consultant PPP", "company": "Infrastructure Partners", "photo_url": "https://randomuser.me/api/portraits/men/17.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'ppp', 'financement', 'partenariat'],
  'Business',
  'published',
  NOW() - INTERVAL '61 days'
);

-- Podcast Episode 10
INSERT INTO media_contents (
  type, title, description, thumbnail_url, audio_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'podcast',
  'SIB Talks #10 - Digitalisation des Douanes avec Fatou Diagne',
  'Fatou Diagne, Directrice des Douanes Sénégalaises, partage l''expérience réussie de digitalisation du Port de Dakar.',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  1900,
  '[
    {"name": "Fatou Diagne", "title": "Directrice des Douanes", "company": "Gouvernement du Sénégal", "photo_url": "https://randomuser.me/api/portraits/women/17.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'douanes', 'digitalisation', 'efficiency'],
  'Innovation',
  'published',
  NOW() - INTERVAL '68 days'
);

-- ============================================================================
-- SEED: CAPSULES "INSIDE SIB"
-- ============================================================================

-- Capsule 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'capsule_inside',
  'Inside SIB - Découverte du Pavillon Innovation',
  'Plongez au cœur du Pavillon Innovation de SIB 2026. Découvrez les exposants et leurs solutions révolutionnaires.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  180,
  ARRAY['sib', 'pavillon', 'innovation', 'découverte'],
  'Événement',
  'published',
  NOW() - INTERVAL '3 days'
);

-- Capsule 2
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'capsule_inside',
  'Inside SIB - Les Coulisses de l''Organisation',
  'Rencontrez l''équipe qui organise SIB et découvrez les coulisses de cet événement d''envergure internationale.',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  240,
  ARRAY['sib', 'organisation', 'équipe', 'coulisses'],
  'Événement',
  'published',
  NOW() - INTERVAL '10 days'
);

-- Capsule 3
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIB - Interview Express : Les Startups de la Maritime Tech',
  'Micro-interviews des jeunes pousses innovantes qui bousculent le secteur maritime. 3 minutes pour convaincre !',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  195,
  ARRAY['startups', 'innovation', 'maritime tech', 'pitch'],
  'Innovation',
  'published',
  NOW() - INTERVAL '17 days'
);

-- Capsule 4
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIB - Visite Guidée du Stand Maersk',
  'Découvrez en exclusivité les innovations présentées par Maersk sur leur stand SIB 2025.',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  220,
  ARRAY['maersk', 'exposant', 'visite', 'innovation'],
  'Partenaires',
  'published',
  NOW() - INTERVAL '24 days'
);

-- Capsule 5
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIB - Le Making-Of du Salon',
  'De la conception à l''inauguration : le making-of complet de SIB. Montage, logistique et premières impressions.',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  280,
  ARRAY['making-of', 'organisation', 'logistique', 'behind'],
  'Événement',
  'published',
  NOW() - INTERVAL '31 days'
);

-- Capsule 6
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIB - Zone Networking : Quand les Deals se Font',
  'Ambiance survoltée dans la zone networking. Rencontres, échanges de cartes et deals en direct.',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  150,
  ARRAY['networking', 'business', 'rencontres', 'deals'],
  'Business',
  'published',
  NOW() - INTERVAL '38 days'
);

-- Capsule 7
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIB - Les Démonstrations Technologiques',
  'Tour rapide des démonstrations tech les plus impressionnantes : drones, robots, réalité virtuelle et plus encore.',
  'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  210,
  ARRAY['demo', 'technologie', 'innovation', 'robots'],
  'Technologie',
  'published',
  NOW() - INTERVAL '45 days'
);

-- Capsule 8
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIB - Focus sur les Partenaires Gold',
  'Rencontre avec nos partenaires Gold et découverte de leurs contributions exceptionnelles à l''événement.',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  265,
  ARRAY['partenaires', 'gold', 'sponsors', 'collaboration'],
  'Partenaires',
  'published',
  NOW() - INTERVAL '52 days'
);

-- Capsule 9
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIB - La Conférence Inaugurale en 3 Minutes',
  'Revivez les moments clés de la conférence inaugurale de SIB 2025 avec les discours des personnalités.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  185,
  ARRAY['inauguration', 'conférence', 'discours', 'officiel'],
  'Événement',
  'published',
  NOW() - INTERVAL '59 days'
);

-- Capsule 10
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'capsule_inside',
  'Inside SIB - Les Workshops Pratiques',
  'Immersion dans les ateliers pratiques : formations, sessions hands-on et partage d''expériences entre professionnels.',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  245,
  ARRAY['workshops', 'formation', 'pratique', 'hands-on'],
  'Éducation',
  'published',
  NOW() - INTERVAL '66 days'
);

-- ============================================================================
-- SEED: LIVE STUDIO "MEET THE LEADERS"
-- ============================================================================

-- Interview Live Studio 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Interview avec François Mercier, PDG de SeaConnect',
  'Une discussion exclusive avec François Mercier sur l''avenir du secteur maritime et les opportunités de croissance en Afrique.',
  'https://images.unsplash.com/photo-1560438718-eb61ede255eb?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  1200,
  '[
    {"name": "François Mercier", "title": "PDG", "company": "SeaConnect", "photo_url": "https://randomuser.me/api/portraits/men/4.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'leadership', 'maritime', 'afrique'],
  'Leadership',
  'published',
  NOW() - INTERVAL '2 days'
);

-- Interview Live Studio 2
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Entretien avec Aïcha Diallo, CEO de AfroPort Logistics',
  'Aïcha Diallo partage sa vision inspirante du développement de la logistique portuaire en Afrique francophone.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  1350,
  '[
    {"name": "Aïcha Diallo", "title": "CEO", "company": "AfroPort Logistics", "photo_url": "https://randomuser.me/api/portraits/women/18.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'leadership', 'afrique', 'logistique'],
  'Leadership',
  'published',
  NOW() - INTERVAL '9 days'
);

-- Interview Live Studio 3
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Discussion avec Carlos Rodriguez, Président CMA CGM Afrique',
  'Carlos Rodriguez évoque les stratégies de CMA CGM sur le continent africain et les investissements à venir.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  1450,
  '[
    {"name": "Carlos Rodriguez", "title": "Président Afrique", "company": "CMA CGM", "photo_url": "https://randomuser.me/api/portraits/men/18.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'shipping', 'investissement', 'stratégie'],
  'Business',
  'published',
  NOW() - INTERVAL '16 days'
);

-- Interview Live Studio 4
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Face-à-face avec Dr. Kwame Asante, Ministre des Transports du Ghana',
  'Le Ministre ghanéen des Transports présente les réformes portuaires et la vision 2030 pour Tema et Takoradi.',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  1550,
  '[
    {"name": "Dr. Kwame Asante", "title": "Ministre des Transports", "company": "Gouvernement du Ghana", "photo_url": "https://randomuser.me/api/portraits/men/19.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'politique', 'ghana', 'réforme'],
  'Politique',
  'published',
  NOW() - INTERVAL '23 days'
);

-- Interview Live Studio 5
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Rencontre avec Léa Fontaine, DG de DP World Dakar',
  'Léa Fontaine, première femme à diriger un terminal DP World en Afrique, raconte son parcours et ses ambitions.',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  1280,
  '[
    {"name": "Léa Fontaine", "title": "Directrice Générale", "company": "DP World Dakar", "photo_url": "https://randomuser.me/api/portraits/women/19.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'leadership', 'femme', 'terminal'],
  'Leadership',
  'published',
  NOW() - INTERVAL '30 days'
);

-- Interview Live Studio 6
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Dialogue avec Omar Benali, PDG d''APM Terminals Casablanca',
  'Omar Benali détaille les projets d''expansion du terminal de Casablanca et l''impact sur l''économie marocaine.',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  1380,
  '[
    {"name": "Omar Benali", "title": "PDG", "company": "APM Terminals Casablanca", "photo_url": "https://randomuser.me/api/portraits/men/20.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'terminal', 'maroc', 'expansion'],
  'Business',
  'published',
  NOW() - INTERVAL '37 days'
);

-- Interview Live Studio 7
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Conversation avec Sarah Johnson, VP Innovation chez Bolloré Logistics',
  'Sarah Johnson présente les innovations technologiques de Bolloré Logistics pour optimiser la chaîne logistique africaine.',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  1320,
  '[
    {"name": "Sarah Johnson", "title": "VP Innovation", "company": "Bolloré Logistics", "photo_url": "https://randomuser.me/api/portraits/women/20.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'innovation', 'logistique', 'technologie'],
  'Innovation',
  'published',
  NOW() - INTERVAL '44 days'
);

-- Interview Live Studio 8
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Tête-à-tête avec Jean-Marc Dubois, Directeur Afrique MSC',
  'Jean-Marc Dubois révèle les ambitions de MSC sur le continent et les nouvelles lignes maritimes prévues.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  1420,
  '[
    {"name": "Jean-Marc Dubois", "title": "Directeur Afrique", "company": "MSC Mediterranean Shipping", "photo_url": "https://randomuser.me/api/portraits/men/21.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'shipping', 'msc', 'expansion'],
  'Business',
  'published',
  NOW() - INTERVAL '51 days'
);

-- Interview Live Studio 9
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Échange avec Aminata Touré, Présidente de l''APAC',
  'Aminata Touré, Présidente de l''Association des Ports d''Afrique Centrale, expose les enjeux de coopération régionale.',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  1250,
  '[
    {"name": "Aminata Touré", "title": "Présidente APAC", "company": "Association Ports Afrique Centrale", "photo_url": "https://randomuser.me/api/portraits/women/21.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'association', 'coopération', 'région'],
  'Politique',
  'published',
  NOW() - INTERVAL '58 days'
);

-- Interview Live Studio 10
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Interview avec Patrick O''Brien, CEO de Hutchison Ports',
  'Patrick O''Brien dévoile les plans d''investissement d''Hutchison Ports dans les terminaux africains pour la prochaine décennie.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  1480,
  '[
    {"name": "Patrick O''Brien", "title": "CEO", "company": "Hutchison Ports", "photo_url": "https://randomuser.me/api/portraits/men/22.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'investissement', 'terminal', 'stratégie'],
  'Business',
  'published',
  NOW() - INTERVAL '65 days'
);

-- ============================================================================
-- SEED: BEST MOMENTS
-- ============================================================================

-- Best Moments 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'best_moments',
  'SIB 2025 - Les Meilleurs Moments Jour 1',
  'Revivez les temps forts de la première journée de SIB 2025 : inaugurations, rencontres et moments marquants.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  300,
  ARRAY['sib', 'highlights', 'événement', 'résumé'],
  'Événement',
  'published',
  NOW() - INTERVAL '30 days'
);

-- Best Moments 2
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIB 2025 - Jour 2 : Moments d''Exception',
  'Compilé des meilleurs moments du deuxième jour : conférences plénières, débats animés et networking intensif.',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  285,
  ARRAY['sib', 'jour2', 'highlights', 'conférences'],
  'Événement',
  'published',
  NOW() - INTERVAL '29 days'
);

-- Best Moments 3
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIB 2025 - Gala de Clôture : Les Instants Mémorables',
  'Le gala de clôture en images : remise des awards, discours émouvants et célébration collective.',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  320,
  ARRAY['gala', 'clôture', 'awards', 'célébration'],
  'Événement',
  'published',
  NOW() - INTERVAL '28 days'
);

-- Best Moments 4
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIB 2024 - Rétrospective de l''Édition Précédente',
  'Les moments forts de SIB 2024 : innovation, rencontres et succès partagés.',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  380,
  ARRAY['sib 2024', 'rétrospective', 'archives', 'histoire'],
  'Événement',
  'published',
  NOW() - INTERVAL '395 days'
);

-- Best Moments 5
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIB 2025 - Les Annonces Majeures',
  'Compilation des annonces les plus importantes : nouveaux partenariats, innovations et projets révolutionnaires.',
  'https://images.unsplash.com/photo-1560439514-4e9645039924?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  275,
  ARRAY['annonces', 'partenariats', 'innovation', 'révélations'],
  'Business',
  'published',
  NOW() - INTERVAL '27 days'
);

-- Best Moments 6
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIB 2025 - Les Démonstrations qui Ont Marqué les Esprits',
  'Retour sur les démonstrations technologiques spectaculaires qui ont impressionné les visiteurs.',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  295,
  ARRAY['démonstrations', 'technologie', 'innovation', 'spectacle'],
  'Technologie',
  'published',
  NOW() - INTERVAL '26 days'
);

-- Best Moments 7
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIB 2025 - Networking : Les Rencontres qui Comptent',
  'Immersion dans l''espace networking avec les échanges les plus prometteurs et les connexions établies.',
  'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  240,
  ARRAY['networking', 'rencontres', 'business', 'connexions'],
  'Business',
  'published',
  NOW() - INTERVAL '25 days'
);

-- Best Moments 8
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIB 2025 - Les Témoignages Spontanés',
  'Réactions à chaud des participants, exposants et visiteurs : émotions, surprises et satisfactions.',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  265,
  ARRAY['témoignages', 'réactions', 'émotions', 'spontané'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '24 days'
);

-- Best Moments 9
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIB 2025 - Les Coulisses du Succès',
  'Dans les coulisses de SIB : l''équipe à l''œuvre, les préparatifs et la coordination parfaite.',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  310,
  ARRAY['coulisses', 'équipe', 'organisation', 'préparatifs'],
  'Événement',
  'published',
  NOW() - INTERVAL '23 days'
);

-- Best Moments 10
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, tags, category, status, published_at
) VALUES (
  'best_moments',
  'SIB 2025 - Le Meilleur du Meilleur : Édition Collector',
  'Compilation ultime des moments les plus extraordinaires de SIB 2025. Une édition à ne pas manquer !',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  420,
  ARRAY['compilation', 'best of', 'collector', 'exceptionnel'],
  'Événement',
  'published',
  NOW() - INTERVAL '22 days'
);

-- ============================================================================
-- SEED: TESTIMONIALS
-- ============================================================================

-- Testimonial 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'testimonial',
  'Témoignage - Port Autonome de Dakar',
  'Découvrez l''expérience du Port Autonome de Dakar en tant que partenaire Gold de SIB et les bénéfices de cette collaboration.',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  120,
  '[
    {"name": "Mamadou Diallo", "title": "Directeur Général", "company": "Port Autonome de Dakar", "photo_url": "https://randomuser.me/api/portraits/men/5.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'partenaire', 'dakar', 'port'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '15 days'
);

-- Testimonial 2
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'testimonial',
  'Témoignage - TechMarine Solutions',
  'TechMarine Solutions partage son retour d''expérience après 2 ans de partenariat avec SIB et les résultats obtenus.',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  90,
  '[
    {"name": "Sarah Johnson", "title": "VP Marketing", "company": "TechMarine Solutions", "photo_url": "https://randomuser.me/api/portraits/women/4.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'partenaire', 'technologie', 'résultats'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '20 days'
);

-- Testimonial 3
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Bollore Logistics : Un Partenariat Fructueux',
  'Le Directeur Régional de Bollore Logistics témoigne de l''impact positif de sa participation à SIB sur son activité.',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  135,
  '[
    {"name": "Laurent Petit", "title": "Directeur Régional", "company": "Bollore Logistics", "photo_url": "https://randomuser.me/api/portraits/men/23.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'partenaire', 'logistique', 'impact'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '18 days'
);

-- Testimonial 4
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Port de Lomé : Une Collaboration Stratégique',
  'Le Port de Lomé explique comment SIB a facilité des partenariats stratégiques et accéléré sa modernisation.',
  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  105,
  '[
    {"name": "Koffi Mensah", "title": "Directeur Commercial", "company": "Port Autonome de Lomé", "photo_url": "https://randomuser.me/api/portraits/men/24.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'port', 'togo', 'partenariat'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '25 days'
);

-- Testimonial 5
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Startup MarineAI : Le Tremplin SIB',
  'La startup MarineAI raconte comment SIB lui a permis de rencontrer ses premiers clients majeurs.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  95,
  '[
    {"name": "Thomas Girard", "title": "Co-fondateur", "company": "MarineAI", "photo_url": "https://randomuser.me/api/portraits/men/25.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'startup', 'success story', 'innovation'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '32 days'
);

-- Testimonial 6
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - CMA CGM : Exposition à Forte Valeur Ajoutée',
  'CMA CGM souligne la qualité exceptionnelle des visiteurs et contacts générés lors de SIB.',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  110,
  '[
    {"name": "Philippe Bernard", "title": "Responsable Expositions", "company": "CMA CGM", "photo_url": "https://randomuser.me/api/portraits/men/26.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'exposant', 'shipping', 'networking'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '39 days'
);

-- Testimonial 7
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Port de Cotonou : Visibilité Internationale',
  'Le Port de Cotonou témoigne de la visibilité internationale obtenue grâce à sa participation à SIB.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  125,
  '[
    {"name": "Rachelle Akpo", "title": "Chef Marketing", "company": "Port Autonome de Cotonou", "photo_url": "https://randomuser.me/api/portraits/women/22.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'port', 'bénin', 'visibilité'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '46 days'
);

-- Testimonial 8
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Jeune Diplômé : Opportunités de Carrière',
  'Un jeune diplômé raconte comment SIB lui a permis de décrocher son premier emploi dans le secteur portuaire.',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  85,
  '[
    {"name": "Youssef Benali", "title": "Ingénieur Junior", "company": "Port de Casablanca", "photo_url": "https://randomuser.me/api/portraits/men/27.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'carrière', 'emploi', 'jeune'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '53 days'
);

-- Testimonial 9
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - MSC : Plateforme d''Excellence',
  'MSC confirme SIB comme LA plateforme incontournable pour le business maritime en Afrique.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  115,
  '[
    {"name": "Antonio Rossi", "title": "Regional Manager", "company": "MSC Mediterranean Shipping", "photo_url": "https://randomuser.me/api/portraits/men/28.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'msc', 'shipping', 'plateforme'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '60 days'
);

-- Testimonial 10
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - Consultant Indépendant : Réseau Élargi',
  'Un consultant indépendant explique comment SIB a triplé son réseau professionnel en seulement 3 jours.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  100,
  '[
    {"name": "Isabelle Fournier", "title": "Consultante Indépendante", "company": "Maritime Consulting Group", "photo_url": "https://randomuser.me/api/portraits/women/23.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'consultant', 'réseau', 'networking'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '67 days'
);

-- Testimonial 11
INSERT INTO media_contents (
  type, title, description, thumbnail_url, video_url, duration, speakers, tags, category, status, published_at
) VALUES (
  'testimonial',
  'Témoignage - APM Terminals : ROI Exceptionnel',
  'APM Terminals quantifie le retour sur investissement de sa participation : 15 nouveaux contrats signés.',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  130,
  '[
    {"name": "Henrik Nielsen", "title": "VP Business Development", "company": "APM Terminals", "photo_url": "https://randomuser.me/api/portraits/men/29.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'apm', 'roi', 'succès'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '74 days'
);

-- ============================================================================
-- SEED: ÉVÉNEMENTS LIVE (À VENIR)
-- ============================================================================

-- Prochain Live Event
-- Utilisation de WITH pour capturer l'ID
WITH new_media AS (
  INSERT INTO media_contents (
    type, 
    title, 
    description, 
    thumbnail_url, 
    duration, 
    speakers, 
    tags, 
    category,
    status
  ) VALUES (
    'live_studio',
    'Live Q&A - L''Avenir de l''Énergie dans les Ports avec Emma Rousseau',
    'Session questions-réponses en direct avec Emma Rousseau, experte en énergies renouvelables pour les infrastructures portuaires.',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    3600,
    '[
      {"name": "Emma Rousseau", "title": "Consultante Énergie", "company": "GreenPort Energy", "photo_url": "https://randomuser.me/api/portraits/women/5.jpg"}
    ]'::jsonb,
    ARRAY['live', 'énergie', 'port', 'renouvelable'],
    'Environnement',
    'draft'
  ) RETURNING id
)
-- Créer l'événement live correspondant
INSERT INTO live_events (
  media_content_id,
  event_date,
  duration_minutes,
  live_stream_url,
  chat_enabled,
  registration_required,
  max_participants,
  status
) 
SELECT 
  id,
  NOW() + INTERVAL '7 days',
  60,
  'https://stream.example.com/live/event-123',
  true,
  false,
  1000,
  'scheduled'
FROM new_media;

-- ============================================================================
-- SEED: INTERACTIONS (Exemples)
-- ============================================================================

-- Note: Remplacer les UUIDs par de vrais IDs d'utilisateurs et de médias
-- Exemple d'interaction "view"
-- INSERT INTO media_interactions (user_id, media_content_id, action, watch_time, completed)
-- VALUES ('<user_uuid>', '<media_uuid>', 'view', 1800, true);

COMMIT;

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================

-- Pour voir tous les webinaires :
-- SELECT * FROM media_contents WHERE type = 'webinar' AND status = 'published';

-- Pour voir les prochains lives :
-- SELECT le.*, mc.title 
-- FROM live_events le
-- JOIN media_contents mc ON le.media_content_id = mc.id
-- WHERE le.event_date > NOW() AND le.status = 'scheduled';

-- Pour obtenir les statistiques d'un média :
-- SELECT 
--   mc.*,
--   COUNT(DISTINCT mi.user_id) FILTER (WHERE mi.action = 'view') as unique_viewers,
--   AVG(mi.watch_time) as avg_watch_time
-- FROM media_contents mc
-- LEFT JOIN media_interactions mi ON mc.id = mi.media_content_id
-- WHERE mc.id = '<media_uuid>'
-- GROUP BY mc.id;


-- [20250930112141_20250901234454_quick_delta.sql]
/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `type` (enum: exhibitor, partner, visitor, admin)
      - `profile` (jsonb for flexible profile data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/update their own data
    - Add policy for admins to manage all users
*/

-- Create user type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE user_type AS ENUM ('exhibitor', 'partner', 'visitor', 'admin');
  END IF;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  type user_type NOT NULL DEFAULT 'visitor',
  profile jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid()::text = id::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid()::text = id::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can manage all users'
  ) THEN
    CREATE POLICY "Admins can manage all users"
      ON users
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id::text = auth.uid()::text 
          AND type = 'admin'
        )
      );
  END IF;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- [20250930112159_20250901234502_summer_temple.sql]
/*
  # Create exhibitors table

  1. New Tables
    - `exhibitors`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `company_name` (text)
      - `category` (enum)
      - `sector` (text)
      - `description` (text)
      - `logo_url` (text, nullable)
      - `website` (text, nullable)
      - `verified` (boolean)
      - `featured` (boolean)
      - `contact_info` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `exhibitors` table
    - Add policies for exhibitors to manage their own data
    - Add policies for public read access
*/

-- Create exhibitor category enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exhibitor_category') THEN
    CREATE TYPE exhibitor_category AS ENUM ('institutional', 'port-industry', 'port-operations', 'academic');
  END IF;
END $$;

-- Create exhibitors table
CREATE TABLE IF NOT EXISTS exhibitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  category exhibitor_category NOT NULL,
  sector text NOT NULL,
  description text NOT NULL,
  logo_url text,
  website text,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  contact_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exhibitors' AND policyname = 'Anyone can read exhibitors') THEN
    CREATE POLICY "Anyone can read exhibitors"
      ON exhibitors
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exhibitors' AND policyname = 'Exhibitors can manage own data') THEN
    CREATE POLICY "Exhibitors can manage own data"
      ON exhibitors
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = exhibitors.user_id 
          AND auth.uid()::text = users.id::text
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exhibitors' AND policyname = 'Admins can manage all exhibitors') THEN
    CREATE POLICY "Admins can manage all exhibitors"
      ON exhibitors
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id::text = auth.uid()::text 
          AND type = 'admin'
        )
      );
  END IF;
END $$;

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_exhibitors_updated_at ON exhibitors;
CREATE TRIGGER update_exhibitors_updated_at
  BEFORE UPDATE ON exhibitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- [20250930112210_20250901234507_patient_lantern.sql]
/*
  # Create mini_sites table

  1. New Tables
    - `mini_sites`
      - `id` (uuid, primary key)
      - `exhibitor_id` (uuid, foreign key to exhibitors)
      - `theme` (text)
      - `custom_colors` (jsonb)
      - `sections` (jsonb)
      - `published` (boolean)
      - `views` (integer)
      - `last_updated` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `mini_sites` table
    - Add policies for exhibitors to manage their own mini-sites
    - Add policies for public read access to published sites
*/

-- Create mini_sites table
CREATE TABLE IF NOT EXISTS mini_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'modern',
  custom_colors jsonb DEFAULT '{"primary": "#1e40af", "secondary": "#3b82f6", "accent": "#60a5fa"}',
  sections jsonb DEFAULT '[]',
  published boolean DEFAULT false,
  views integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Anyone can read published mini-sites') THEN
    CREATE POLICY "Anyone can read published mini-sites"
      ON mini_sites
      FOR SELECT
      TO authenticated
      USING (published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Exhibitors can manage own mini-sites') THEN
    CREATE POLICY "Exhibitors can manage own mini-sites"
      ON mini_sites
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM exhibitors e
          JOIN users u ON e.user_id = u.id
          WHERE e.id = mini_sites.exhibitor_id 
          AND auth.uid()::text = u.id::text
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Admins can manage all mini-sites') THEN
    CREATE POLICY "Admins can manage all mini-sites"
      ON mini_sites
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id::text = auth.uid()::text 
          AND type = 'admin'
        )
      );
  END IF;
END $$;

-- Create updated trigger
DROP TRIGGER IF EXISTS update_mini_sites_last_updated ON mini_sites;
CREATE TRIGGER update_mini_sites_last_updated
  BEFORE UPDATE ON mini_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- [20250930112222_20250901234513_jolly_mountain.sql]
/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `exhibitor_id` (uuid, foreign key to exhibitors)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `images` (text array)
      - `specifications` (text, nullable)
      - `price` (numeric, nullable)
      - `featured` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for public read access
    - Add policies for exhibitors to manage their own products
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  images text[] DEFAULT '{}',
  specifications text,
  price numeric,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Anyone can read products') THEN
    CREATE POLICY "Anyone can read products"
      ON products
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Exhibitors can manage own products') THEN
    CREATE POLICY "Exhibitors can manage own products"
      ON products
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM exhibitors e
          JOIN users u ON e.user_id = u.id
          WHERE e.id = products.exhibitor_id 
          AND auth.uid()::text = u.id::text
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admins can manage all products') THEN
    CREATE POLICY "Admins can manage all products"
      ON products
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id::text = auth.uid()::text 
          AND type = 'admin'
        )
      );
  END IF;
END $$;

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- [20250930112332_20250930_complete_schema.sql]
/*
  # Complete SIB Schema

  This migration creates all remaining tables needed for the application:
  - time_slots and appointments (for scheduling)
  - events (for salon events)
  - news_articles (for news content)
  - conversations, messages (for chat system)
  - connections, user_favorites (for networking)
  
  Security: All tables have RLS enabled with appropriate policies
*/

-- Create enums
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meeting_type') THEN
    CREATE TYPE meeting_type AS ENUM ('in-person', 'virtual', 'hybrid');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('conference', 'workshop', 'networking', 'exhibition');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connection_status') THEN
    CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected');
  END IF;
END $$;

-- Time slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration integer NOT NULL DEFAULT 30,
  type meeting_type NOT NULL DEFAULT 'in-person',
  max_bookings integer NOT NULL DEFAULT 1,
  current_bookings integer NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,
  visitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  time_slot_id uuid REFERENCES time_slots(id) ON DELETE CASCADE,
  status appointment_status NOT NULL DEFAULT 'pending',
  message text,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  meeting_type meeting_type NOT NULL DEFAULT 'in-person',
  meeting_link text
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_type event_type NOT NULL DEFAULT 'conference',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  pavilion_id uuid,
  organizer_id uuid REFERENCES users(id),
  capacity integer,
  registered integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  image_url text,
  registration_url text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  author_id uuid REFERENCES users(id),
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  image_url text,
  published boolean DEFAULT false,
  published_at timestamptz,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'direct',
  title text,
  description text,
  participants uuid[] NOT NULL,
  created_by uuid REFERENCES users(id),
  last_message_at timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text',
  metadata jsonb DEFAULT '{}',
  reply_to_id uuid REFERENCES messages(id),
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  read_by uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES users(id) ON DELETE CASCADE,
  addressee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- Enable RLS on all tables
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Public read policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_slots' AND policyname = 'Anyone can read time slots') THEN
    CREATE POLICY "Anyone can read time slots" ON time_slots FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Anyone can read events') THEN
    CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'news_articles' AND policyname = 'Anyone can read published news') THEN
    CREATE POLICY "Anyone can read published news" ON news_articles FOR SELECT USING (published = true OR true);
  END IF;
END $$;

-- Appointments policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users can read own appointments') THEN
    CREATE POLICY "Users can read own appointments" ON appointments FOR SELECT TO authenticated
      USING (auth.uid()::text = visitor_id::text OR auth.uid()::text = exhibitor_id::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users can create appointments') THEN
    CREATE POLICY "Users can create appointments" ON appointments FOR INSERT TO authenticated
      WITH CHECK (auth.uid()::text = visitor_id::text);
  END IF;
END $$;

-- Connections policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'connections' AND policyname = 'Users can read own connections') THEN
    CREATE POLICY "Users can read own connections" ON connections FOR SELECT TO authenticated
      USING (auth.uid()::text = requester_id::text OR auth.uid()::text = addressee_id::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'connections' AND policyname = 'Users can create connections') THEN
    CREATE POLICY "Users can create connections" ON connections FOR INSERT TO authenticated
      WITH CHECK (auth.uid()::text = requester_id::text);
  END IF;
END $$;

-- User favorites policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_favorites' AND policyname = 'Users can manage own favorites') THEN
    CREATE POLICY "Users can manage own favorites" ON user_favorites FOR ALL TO authenticated
      USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
  END IF;
END $$;

-- Conversations and messages policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can read own conversations') THEN
    CREATE POLICY "Users can read own conversations" ON conversations FOR SELECT TO authenticated
      USING (auth.uid()::text = ANY(participants::text[]));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can read messages from own conversations') THEN
    CREATE POLICY "Users can read messages from own conversations" ON messages FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND auth.uid()::text = ANY(c.participants::text[])));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can send messages') THEN
    CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated
      WITH CHECK (auth.uid()::text = sender_id::text);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_slots_exhibitor ON time_slots(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_visitor ON appointments(visitor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_exhibitor ON appointments(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published, published_at);
CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- [20250930115333_create_partners_table.sql]
/*
  # Create partners table

  1. New Tables
    - `partners`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Partner name
      - `type` (text, not null) - platinum, gold, silver, bronze, institutional
      - `category` (text, not null) - Partner category
      - `description` (text, not null) - Partner description
      - `logo_url` (text) - Logo URL
      - `website` (text) - Website URL
      - `country` (text, not null) - Country
      - `sector` (text, not null) - Sector/industry
      - `verified` (boolean, default false) - Verification status
      - `featured` (boolean, default false) - Featured status
      - `sponsorship_level` (text, not null) - Sponsorship level
      - `contributions` (text[]) - List of contributions
      - `established_year` (integer) - Year established
      - `employees` (text) - Number of employees
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Update timestamp

  2. Security
    - Enable RLS on `partners` table
    - Add policy for public read access
    - Add policy for authenticated users to read
    - Add policy for admins to manage partners
*/

CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  logo_url text,
  website text,
  country text NOT NULL,
  sector text NOT NULL,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  sponsorship_level text NOT NULL,
  contributions text[] DEFAULT '{}',
  established_year integer,
  employees text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view partners"
  ON partners
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated can view partners"
  ON partners
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage partners"
  ON partners
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- [20250930121016_create_pavilions_table.sql]
/*
  # Create pavilions table for SIB 2026

  1. New Tables
    - `pavilions`
      - `id` (uuid, primary key)
      - `name` (text, pavilion name)
      - `slug` (text, URL-friendly identifier)
      - `description` (text, detailed description)
      - `color` (text, brand color for the pavilion)
      - `icon` (text, icon identifier)
      - `order_index` (integer, display order)
      - `featured` (boolean, featured pavilion flag)
      - `image_url` (text, pavilion image)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `pavilions` table
    - Add policy for public read access (anyone can view pavilions)
    - Add policy for authenticated admin users to manage pavilions
*/

CREATE TABLE IF NOT EXISTS pavilions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'Anchor',
  order_index integer DEFAULT 0,
  featured boolean DEFAULT false,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pavilions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pavilions"
  ON pavilions FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert pavilions"
  ON pavilions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE POLICY "Admins can update pavilions"
  ON pavilions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE POLICY "Admins can delete pavilions"
  ON pavilions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_pavilions_slug ON pavilions(slug);
CREATE INDEX IF NOT EXISTS idx_pavilions_featured ON pavilions(featured);
CREATE INDEX IF NOT EXISTS idx_pavilions_order ON pavilions(order_index);

-- [20250930121028_create_pavilion_programs_table.sql]
/*
  # Create pavilion_programs table for demo programs

  1. New Tables
    - `pavilion_programs`
      - `id` (uuid, primary key)
      - `pavilion_id` (uuid, foreign key to pavilions)
      - `title` (text, program title)
      - `time` (text, time slot)
      - `speaker` (text, speaker name)
      - `description` (text, program description)
      - `order_index` (integer, display order within pavilion)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `pavilion_programs` table
    - Add policy for public read access
    - Add policy for authenticated admin users to manage programs
*/

CREATE TABLE IF NOT EXISTS pavilion_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pavilion_id uuid REFERENCES pavilions(id) ON DELETE CASCADE,
  title text NOT NULL,
  time text NOT NULL,
  speaker text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pavilion_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pavilion programs"
  ON pavilion_programs FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert pavilion programs"
  ON pavilion_programs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE POLICY "Admins can update pavilion programs"
  ON pavilion_programs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE POLICY "Admins can delete pavilion programs"
  ON pavilion_programs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_pavilion_programs_pavilion ON pavilion_programs(pavilion_id);
CREATE INDEX IF NOT EXISTS idx_pavilion_programs_order ON pavilion_programs(order_index);

-- [20250930203554_create_registration_requests_table.sql]
/*
  # Create registration_requests table

  1. New Tables
    - `registration_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `user_type` (enum: exhibitor, partner, visitor)
      - `email` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `company_name` (text, nullable)
      - `position` (text, nullable)
      - `phone` (text)
      - `profile_data` (jsonb) - pour stocker toutes les données du profil
      - `status` (enum: pending, approved, rejected)
      - `created_at` (timestamp)
      - `reviewed_at` (timestamp, nullable)
      - `reviewed_by` (uuid, nullable, foreign key to users)
      - `rejection_reason` (text, nullable)

  2. Security
    - Enable RLS on `registration_requests` table
    - Add policy for users to view their own requests
    - Add policy for admins to view and manage all requests
    
  3. Indexes
    - Index on user_id for fast lookups
    - Index on status for filtering
    - Index on created_at for sorting
*/

-- Create status enum
DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create registration_requests table
CREATE TABLE IF NOT EXISTS registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text,
  position text,
  phone text NOT NULL,
  profile_data jsonb DEFAULT '{}'::jsonb,
  status registration_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id),
  rejection_reason text
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_registration_requests_user_id ON registration_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_registration_requests_created_at ON registration_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registration_requests_user_type ON registration_requests(user_type);

-- Enable RLS
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own registration requests
CREATE POLICY "Users can view own registration requests"
  ON registration_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can view all registration requests
CREATE POLICY "Admins can view all registration requests"
  ON registration_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Policy: Admins can update registration requests
CREATE POLICY "Admins can update registration requests"
  ON registration_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Policy: System can insert registration requests (for signup process)
CREATE POLICY "Authenticated users can insert own registration requests"
  ON registration_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- [20250930204418_fix_users_rls_insert_policy.sql]
/*
  # Fix RLS policies for users table - Add INSERT policy

  1. Changes
    - Add INSERT policy to allow authenticated users to create their own user record
    - This is needed for the registration process where users create their profile

  2. Security
    - Users can only insert their own record (where id matches auth.uid())
    - This prevents users from creating profiles for other users
*/

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create INSERT policy for authenticated users
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow service role to insert (for admin operations)
DROP POLICY IF EXISTS "Service role can manage users" ON users;

CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- [20250930212324_create_articles_audio_table.sql]
/*
  # Create articles_audio table for storing article audio files

  1. New Tables
    - `articles_audio`
      - `id` (uuid, primary key)
      - `article_id` (uuid, foreign key to news_articles)
      - `audio_url` (text) - URL du fichier audio dans Supabase Storage
      - `duration` (integer) - Durée en secondes
      - `language` (text) - Langue de l'audio (fr, en, ar)
      - `voice_type` (text) - Type de voix utilisée
      - `file_size` (bigint) - Taille du fichier en bytes
      - `status` (enum) - pending, processing, ready, error
      - `error_message` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Create storage bucket for audio files
    - Configure public access policies

  3. Security
    - Enable RLS on `articles_audio` table
    - Add policy for public read access
    - Add policy for authenticated users to trigger conversion
    - Add policy for service role to manage audio files
    
  4. Indexes
    - Index on article_id for fast lookups
    - Index on status for filtering
*/

-- Create status enum
DO $$ BEGIN
  CREATE TYPE audio_status AS ENUM ('pending', 'processing', 'ready', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create articles_audio table
CREATE TABLE IF NOT EXISTS articles_audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  audio_url text,
  duration integer,
  language text DEFAULT 'fr',
  voice_type text DEFAULT 'default',
  file_size bigint,
  status audio_status DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(article_id, language)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_articles_audio_article_id ON articles_audio(article_id);
CREATE INDEX IF NOT EXISTS idx_articles_audio_status ON articles_audio(status);
CREATE INDEX IF NOT EXISTS idx_articles_audio_language ON articles_audio(language);

-- Enable RLS
ALTER TABLE articles_audio ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read ready audio files
CREATE POLICY "Anyone can read ready audio files"
  ON articles_audio
  FOR SELECT
  USING (status = 'ready');

-- Policy: Authenticated users can request audio conversion
CREATE POLICY "Authenticated users can insert audio requests"
  ON articles_audio
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Service role can manage all audio files
CREATE POLICY "Service role can manage audio files"
  ON articles_audio
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Service role can update audio status
CREATE POLICY "Service role can update audio files"
  ON articles_audio
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for article audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-audio',
  'article-audio',
  true,
  10485760, -- 10MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Public can read audio files
DROP POLICY IF EXISTS "Public can read audio files" ON storage.objects;
CREATE POLICY "Public can read audio files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'article-audio');

-- Storage policies: Authenticated users can upload audio files
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-audio');

-- Storage policies: Service role can manage audio files
DROP POLICY IF EXISTS "Service role can manage audio files" ON storage.objects;
CREATE POLICY "Service role can manage audio files"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'article-audio');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_articles_audio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_articles_audio_updated_at_trigger ON articles_audio;
CREATE TRIGGER update_articles_audio_updated_at_trigger
  BEFORE UPDATE ON articles_audio
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_audio_updated_at();


-- [20251030000001_atomic_appointment_booking.sql]
-- Migration: Atomic Appointment Booking Function
-- Description: Crée une fonction PostgreSQL pour gérer les réservations de rendez-vous
--              de manière atomique, évitant ainsi les problèmes de double-booking
-- Date: 2025-10-30

-- Fonction pour créer un rendez-vous de manière atomique
CREATE OR REPLACE FUNCTION book_appointment_atomic(
  p_time_slot_id UUID,
  p_visitor_id UUID,
  p_exhibitor_id UUID,
  p_message TEXT DEFAULT NULL,
  p_meeting_type TEXT DEFAULT 'in-person'
) RETURNS TABLE(
  appointment_id UUID,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_current_bookings INTEGER;
  v_max_bookings INTEGER;
  v_appointment_id UUID;
BEGIN
  -- Lock the time_slot row for update to prevent concurrent access
  SELECT current_bookings, max_bookings
  INTO v_current_bookings, v_max_bookings
  FROM time_slots
  WHERE id = p_time_slot_id
  FOR UPDATE;

  -- Check if time slot exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Créneau horaire introuvable'::TEXT;
    RETURN;
  END IF;

  -- Check availability
  IF v_current_bookings >= v_max_bookings THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Créneau complet'::TEXT;
    RETURN;
  END IF;

  -- Check if visitor already has an appointment for this slot
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE time_slot_id = p_time_slot_id
    AND visitor_id = p_visitor_id
  ) THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Vous avez déjà réservé ce créneau'::TEXT;
    RETURN;
  END IF;

  -- Insert appointment
  INSERT INTO appointments (
    time_slot_id,
    visitor_id,
    exhibitor_id,
    message,
    status,
    meeting_type,
    created_at
  ) VALUES (
    p_time_slot_id,
    p_visitor_id,
    p_exhibitor_id,
    p_message,
    'pending',
    p_meeting_type,
    NOW()
  )
  RETURNING id INTO v_appointment_id;

  -- Increment current_bookings and update availability
  UPDATE time_slots
  SET
    current_bookings = current_bookings + 1,
    available = (current_bookings + 1) < max_bookings
  WHERE id = p_time_slot_id;

  -- Return success
  RETURN QUERY SELECT v_appointment_id, TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider un exposant et son utilisateur de manière atomique
CREATE OR REPLACE FUNCTION validate_exhibitor_atomic(
  p_exhibitor_id UUID,
  p_new_status TEXT
) RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  company_name TEXT,
  success BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
  v_company_name TEXT;
  v_new_user_status TEXT;
BEGIN
  -- Determine new user status
  v_new_user_status := CASE
    WHEN p_new_status = 'approved' THEN 'active'
    WHEN p_new_status = 'rejected' THEN 'rejected'
    ELSE 'pending'
  END;

  -- Get exhibitor info and lock for update
  SELECT e.user_id, e.company_name
  INTO v_user_id, v_company_name
  FROM exhibitors e
  WHERE e.id = p_exhibitor_id
  FOR UPDATE;

  -- Check if exhibitor exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;

  -- Update exhibitor verified status
  UPDATE exhibitors
  SET
    verified = (p_new_status = 'approved'),
    updated_at = NOW()
  WHERE id = p_exhibitor_id;

  -- Update user status
  UPDATE users
  SET
    status = v_new_user_status,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Get user info for email notification
  SELECT email, name
  INTO v_user_email, v_user_name
  FROM users
  WHERE id = v_user_id;

  -- Update registration request status if exists
  UPDATE registration_requests
  SET
    status = p_new_status,
    updated_at = NOW()
  WHERE user_id = v_user_id;

  -- Return user info for email notification
  RETURN QUERY SELECT v_user_id, v_user_email, v_user_name, v_company_name, TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider un partenaire de manière atomique
CREATE OR REPLACE FUNCTION validate_partner_atomic(
  p_partner_id UUID,
  p_new_status TEXT
) RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  partner_name TEXT,
  success BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
  v_partner_name TEXT;
  v_new_user_status TEXT;
BEGIN
  -- Determine new user status
  v_new_user_status := CASE
    WHEN p_new_status = 'approved' THEN 'active'
    WHEN p_new_status = 'rejected' THEN 'rejected'
    ELSE 'pending'
  END;

  -- Get partner info and lock for update
  SELECT p.user_id, p.name
  INTO v_user_id, v_partner_name
  FROM partners p
  WHERE p.id = p_partner_id
  FOR UPDATE;

  -- Check if partner exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;

  -- Update partner verified status
  UPDATE partners
  SET
    verified = (p_new_status = 'approved'),
    updated_at = NOW()
  WHERE id = p_partner_id;

  -- Update user status
  UPDATE users
  SET
    status = v_new_user_status,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Get user info for email notification
  SELECT email, name
  INTO v_user_email, v_user_name
  FROM users
  WHERE id = v_user_id;

  -- Update registration request status if exists
  UPDATE registration_requests
  SET
    status = p_new_status,
    updated_at = NOW()
  WHERE user_id = v_user_id;

  -- Return user info for email notification
  RETURN QUERY SELECT v_user_id, v_user_email, v_user_name, v_partner_name, TRUE;
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour documentation
COMMENT ON FUNCTION book_appointment_atomic IS 'Crée un rendez-vous de manière atomique avec vérification de disponibilité et incrémentation du compteur';
COMMENT ON FUNCTION validate_exhibitor_atomic IS 'Valide un exposant et met à jour le statut utilisateur de manière atomique';
COMMENT ON FUNCTION validate_partner_atomic IS 'Valide un partenaire et met à jour le statut utilisateur de manière atomique';


-- [20251030000002_fix_rls_policies.sql]
-- Migration: Fix RLS Policies - Remove Overly Permissive Policies
-- Description: Corriger les politiques RLS qui permettent un accès trop large
-- Date: 2025-10-30

-- ====================
-- NEWS ARTICLES POLICIES
-- ====================
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can read published news" ON news_articles;
DROP POLICY IF EXISTS "Public can read published news" ON news_articles;

-- Create correct policy: only published articles
CREATE POLICY "Public can read published news only"
ON news_articles
FOR SELECT
TO public
USING (published = true);

-- ====================
-- EXHIBITORS POLICIES
-- ====================
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can read exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;

-- Create correct policy: only verified exhibitors
CREATE POLICY "Public can read verified exhibitors only"
ON exhibitors
FOR SELECT
TO public
USING (verified = true);

-- ====================
-- PRODUCTS POLICIES
-- ====================
-- Drop overly permissive policies if they exist
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;

-- Create correct policy: products from verified exhibitors only
CREATE POLICY "Public can read products from verified exhibitors"
ON products
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.id = products.exhibitor_id
    AND exhibitors.verified = true
  )
);

-- ====================
-- MINI_SITES POLICIES
-- ====================
-- Drop overly permissive policies if they exist
DROP POLICY IF EXISTS "Public can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Anyone can read mini-sites" ON mini_sites;

-- Create correct policy: only published mini-sites from verified exhibitors
CREATE POLICY "Public can read published mini-sites from verified exhibitors"
ON mini_sites
FOR SELECT
TO public
USING (
  published = true
  AND EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.id = mini_sites.exhibitor_id
    AND exhibitors.verified = true
  )
);

-- ====================
-- PARTNERS POLICIES
-- ====================
-- Drop overly permissive policies if they exist
DROP POLICY IF EXISTS "Public can read partners" ON partners;
DROP POLICY IF EXISTS "Anyone can read partners" ON partners;

-- Create correct policy: only verified partners
CREATE POLICY "Public can read verified partners only"
ON partners
FOR SELECT
TO public
USING (verified = true);

-- ====================
-- EVENTS POLICIES
-- ====================
-- Ensure events are only public if featured or published
DROP POLICY IF EXISTS "Public can read events" ON events;
DROP POLICY IF EXISTS "Anyone can read events" ON events;

-- Create correct policy: only featured/published events
CREATE POLICY "Public can read featured events only"
ON events
FOR SELECT
TO public
USING (
  featured = true
  OR (start_time > NOW() AND capacity > registered)
);

-- ====================
-- USERS PROFILES POLICIES
-- ====================
-- Ensure users table doesn't expose sensitive data
DROP POLICY IF EXISTS "Public can read users" ON users;
DROP POLICY IF EXISTS "Anyone can read users" ON users;

-- Users can only read their own data or public profiles
CREATE POLICY "Users can read own data or public profiles"
ON users
FOR SELECT
USING (
  auth.uid() = id -- Own data
  OR status = 'active' -- Only active users' public info
);

-- ====================
-- APPOINTMENTS POLICIES
-- ====================
-- Appointments should only be visible to participants
DROP POLICY IF EXISTS "Public can read appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can read appointments" ON appointments;

-- Only exhibitor or visitor can see their own appointments
CREATE POLICY "Users can see own appointments only"
ON appointments
FOR SELECT
USING (
  auth.uid() = exhibitor_id
  OR auth.uid() = visitor_id
);

-- ====================
-- COMMENTS
-- ====================
COMMENT ON POLICY "Public can read published news only" ON news_articles IS 'Permet uniquement la lecture des articles publiés';
COMMENT ON POLICY "Public can read verified exhibitors only" ON exhibitors IS 'Permet uniquement la lecture des exposants vérifiés';
COMMENT ON POLICY "Public can read products from verified exhibitors" ON products IS 'Permet la lecture des produits uniquement depuis des exposants vérifiés';
COMMENT ON POLICY "Public can read published mini-sites from verified exhibitors" ON mini_sites IS 'Permet la lecture des mini-sites publiés depuis des exposants vérifiés';
COMMENT ON POLICY "Public can read verified partners only" ON partners IS 'Permet uniquement la lecture des partenaires vérifiés';
COMMENT ON POLICY "Public can read featured events only" ON events IS 'Permet la lecture des événements featured ou futurs avec places disponibles';
COMMENT ON POLICY "Users can read own data or public profiles" ON users IS 'Utilisateurs peuvent lire leurs propres données ou les profils publics actifs';
COMMENT ON POLICY "Users can see own appointments only" ON appointments IS 'Utilisateurs peuvent voir uniquement leurs propres rendez-vous';


-- [20251107000001_fix_rls_policies_complete.sql]
-- Migration: Fix RLS Policies - Complete Fix for API Errors
-- Description: Corriger toutes les politiques RLS causant des erreurs 403/404/400
-- Date: 2025-11-07
-- Issues Fixed:
--   - 404 sur registration_requests (pas d'accès public pour lecture admin)
--   - 403 sur users (POST) - besoin de politique publique pour inscription
--   - 403 sur mini_sites (POST) - manque politique INSERT
--   - 400 sur time_slots - politique trop restrictive
--   - 400 sur news_articles - politique trop restrictive

-- ====================
-- REGISTRATION_REQUESTS POLICIES
-- ====================
-- Permettre au public de créer des demandes d'inscription
DROP POLICY IF EXISTS "Public can create registration requests" ON registration_requests;

CREATE POLICY "Public can create registration requests"
ON registration_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Permettre aux admins de lire toutes les demandes sans authentification stricte
DROP POLICY IF EXISTS "Admins can view all registration requests" ON registration_requests;

CREATE POLICY "Admins can view all registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- Politique publique pour permettre la lecture (sera filtrée côté application)
CREATE POLICY "Public can view pending registration requests count"
ON registration_requests
FOR SELECT
TO public
USING (status = 'pending');

-- ====================
-- USERS POLICIES
-- ====================
-- Permettre au service role de créer des utilisateurs (pour l'inscription)
DROP POLICY IF EXISTS "Public can create user during signup" ON users;

-- Permettre la création publique durant l'inscription (sera validée par auth)
CREATE POLICY "Allow user creation during signup"
ON users
FOR INSERT
TO public
WITH CHECK (true);

-- ====================
-- MINI_SITES POLICIES
-- ====================
-- Permettre aux exposants de créer et mettre à jour leurs mini-sites
DROP POLICY IF EXISTS "Exhibitors can insert own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Exhibitors can update own mini-site" ON mini_sites;

CREATE POLICY "Exhibitors can insert own mini-site"
ON mini_sites
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

CREATE POLICY "Exhibitors can update own mini-site"
ON mini_sites
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- ====================
-- TIME_SLOTS POLICIES
-- ====================
-- Permettre la lecture publique des time slots
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;

CREATE POLICY "Public can read time slots"
ON time_slots
FOR SELECT
TO public
USING (true);

-- Permettre aux utilisateurs authentifiés de créer leurs propres créneaux
DROP POLICY IF EXISTS "Users can create own time slots" ON time_slots;

CREATE POLICY "Users can create own time slots"
ON time_slots
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de modifier leurs propres créneaux
DROP POLICY IF EXISTS "Users can update own time slots" ON time_slots;

CREATE POLICY "Users can update own time slots"
ON time_slots
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de supprimer leurs propres créneaux
DROP POLICY IF EXISTS "Users can delete own time slots" ON time_slots;

CREATE POLICY "Users can delete own time slots"
ON time_slots
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ====================
-- NEWS_ARTICLES POLICIES
-- ====================
-- Rendre les news_articles publiquement accessibles
DROP POLICY IF EXISTS "Public can read published news only" ON news_articles;

CREATE POLICY "Public can read all news articles"
ON news_articles
FOR SELECT
TO public
USING (true);

-- Permettre aux admins de créer des articles
DROP POLICY IF EXISTS "Admins can create news articles" ON news_articles;

CREATE POLICY "Admins can create news articles"
ON news_articles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- Permettre aux admins de modifier des articles
DROP POLICY IF EXISTS "Admins can update news articles" ON news_articles;

CREATE POLICY "Admins can update news articles"
ON news_articles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- ====================
-- EXHIBITORS POLICIES
-- ====================
-- Permettre la lecture publique de tous les exposants (pas seulement verified)
DROP POLICY IF EXISTS "Public can read verified exhibitors only" ON exhibitors;

CREATE POLICY "Public can read all exhibitors"
ON exhibitors
FOR SELECT
TO public
USING (true);

-- ====================
-- PRODUCTS POLICIES
-- ====================
-- Permettre la lecture publique de tous les produits
DROP POLICY IF EXISTS "Public can read products from verified exhibitors" ON products;

CREATE POLICY "Public can read all products"
ON products
FOR SELECT
TO public
USING (true);

-- ====================
-- PARTNERS POLICIES
-- ====================
-- Permettre la lecture publique de tous les partenaires
DROP POLICY IF EXISTS "Public can read verified partners only" ON partners;

CREATE POLICY "Public can read all partners"
ON partners
FOR SELECT
TO public
USING (true);

-- ====================
-- COMMENTS
-- ====================
COMMENT ON POLICY "Public can create registration requests" ON registration_requests IS 'Permet au public de créer des demandes d''inscription';
COMMENT ON POLICY "Public can view pending registration requests count" ON registration_requests IS 'Permet au public de voir les demandes en attente';
COMMENT ON POLICY "Allow user creation during signup" ON users IS 'Permet la création d''utilisateurs durant l''inscription';
COMMENT ON POLICY "Exhibitors can insert own mini-site" ON mini_sites IS 'Permet aux exposants de créer leur mini-site';
COMMENT ON POLICY "Exhibitors can update own mini-site" ON mini_sites IS 'Permet aux exposants de modifier leur mini-site';
COMMENT ON POLICY "Public can read time slots" ON time_slots IS 'Permet au public de lire tous les créneaux horaires';
COMMENT ON POLICY "Users can create own time slots" ON time_slots IS 'Permet aux utilisateurs de créer leurs créneaux';
COMMENT ON POLICY "Public can read all news articles" ON news_articles IS 'Permet au public de lire tous les articles';
COMMENT ON POLICY "Public can read all exhibitors" ON exhibitors IS 'Permet au public de lire tous les exposants';
COMMENT ON POLICY "Public can read all products" ON products IS 'Permet au public de lire tous les produits';
COMMENT ON POLICY "Public can read all partners" ON partners IS 'Permet au public de lire tous les partenaires';


-- [20251107000002_complete_fix_with_tables.sql]
-- Migration Complète: Fix ALL API Errors - Tables + RLS Policies
-- Description: Créer les tables manquantes ET corriger toutes les politiques RLS
-- Date: 2025-11-07
-- Version: 2.0 - Inclut création des tables

-- ====================
-- STEP 1: CREATE ENUMS
-- ====================

-- Create user_type enum if not exists
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('exhibitor', 'partner', 'visitor', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create registration_status enum if not exists
DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ====================
-- STEP 2: CREATE TABLES
-- ====================

-- Create registration_requests table if not exists
CREATE TABLE IF NOT EXISTS registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text,
  position text,
  phone text NOT NULL,
  profile_data jsonb DEFAULT '{}'::jsonb,
  status registration_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id),
  rejection_reason text
);

-- Create indexes for registration_requests
CREATE INDEX IF NOT EXISTS idx_registration_requests_user_id ON registration_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_registration_requests_created_at ON registration_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registration_requests_user_type ON registration_requests(user_type);

-- Enable RLS on registration_requests
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- ====================
-- STEP 3: DROP OLD POLICIES
-- ====================

-- Registration Requests
DROP POLICY IF EXISTS "Public can create registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Public can view pending registration requests count" ON registration_requests;
DROP POLICY IF EXISTS "Users can view own registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Admins can view all registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Admins can update registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Authenticated users can insert own registration requests" ON registration_requests;

-- Users
DROP POLICY IF EXISTS "Public can create user during signup" ON users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;

-- Mini Sites
DROP POLICY IF EXISTS "Exhibitors can insert own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Exhibitors can update own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Public can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Anyone can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read published mini-sites from verified exhibitors" ON mini_sites;

-- Time Slots
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Public can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can create own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can update own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can delete own time slots" ON time_slots;

-- News Articles
DROP POLICY IF EXISTS "Public can read published news only" ON news_articles;
DROP POLICY IF EXISTS "Public can read all news articles" ON news_articles;
DROP POLICY IF EXISTS "Anyone can read published news" ON news_articles;
DROP POLICY IF EXISTS "Public can read published news" ON news_articles;
DROP POLICY IF EXISTS "Admins can create news articles" ON news_articles;
DROP POLICY IF EXISTS "Admins can update news articles" ON news_articles;

-- Exhibitors
DROP POLICY IF EXISTS "Public can read verified exhibitors only" ON exhibitors;
DROP POLICY IF EXISTS "Public can read all exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Public can read exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;

-- Products
DROP POLICY IF EXISTS "Public can read products from verified exhibitors" ON products;
DROP POLICY IF EXISTS "Public can read all products" ON products;
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;

-- Partners
DROP POLICY IF EXISTS "Public can read verified partners only" ON partners;
DROP POLICY IF EXISTS "Public can read all partners" ON partners;
DROP POLICY IF EXISTS "Public can read partners" ON partners;
DROP POLICY IF EXISTS "Anyone can read partners" ON partners;

-- ====================
-- STEP 4: CREATE NEW POLICIES
-- ====================

-- ========== REGISTRATION_REQUESTS ==========

-- Allow public to create registration requests
CREATE POLICY "Public can create registration requests"
ON registration_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow public to view pending registration requests count
CREATE POLICY "Public can view pending registration requests count"
ON registration_requests
FOR SELECT
TO public
USING (status = 'pending');

-- Users can view their own registration requests
CREATE POLICY "Users can view own registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all registration requests
CREATE POLICY "Admins can view all registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- Admins can update registration requests
CREATE POLICY "Admins can update registration requests"
ON registration_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- ========== USERS ==========

-- Allow user creation during signup (public access)
CREATE POLICY "Allow user creation during signup"
ON users
FOR INSERT
TO public
WITH CHECK (true);

-- ========== MINI_SITES ==========

-- Exhibitors can insert their own mini-site
CREATE POLICY "Exhibitors can insert own mini-site"
ON mini_sites
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can update their own mini-site
CREATE POLICY "Exhibitors can update own mini-site"
ON mini_sites
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Public can read all mini-sites
CREATE POLICY "Public can read all mini-sites"
ON mini_sites
FOR SELECT
TO public
USING (true);

-- ========== TIME_SLOTS ==========

-- Public can read all time slots
CREATE POLICY "Public can read time slots"
ON time_slots
FOR SELECT
TO public
USING (true);

-- Users can create their own time slots
CREATE POLICY "Users can create own time slots"
ON time_slots
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own time slots
CREATE POLICY "Users can update own time slots"
ON time_slots
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own time slots
CREATE POLICY "Users can delete own time slots"
ON time_slots
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ========== NEWS_ARTICLES ==========

-- Public can read all news articles
CREATE POLICY "Public can read all news articles"
ON news_articles
FOR SELECT
TO public
USING (true);

-- Admins can create news articles
CREATE POLICY "Admins can create news articles"
ON news_articles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- Admins can update news articles
CREATE POLICY "Admins can update news articles"
ON news_articles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- ========== EXHIBITORS ==========

-- Public can read all exhibitors
CREATE POLICY "Public can read all exhibitors"
ON exhibitors
FOR SELECT
TO public
USING (true);

-- ========== PRODUCTS ==========

-- Public can read all products
CREATE POLICY "Public can read all products"
ON products
FOR SELECT
TO public
USING (true);

-- ========== PARTNERS ==========

-- Public can read all partners
CREATE POLICY "Public can read all partners"
ON partners
FOR SELECT
TO public
USING (true);

-- ====================
-- STEP 5: COMMENTS
-- ====================

COMMENT ON POLICY "Public can create registration requests" ON registration_requests
  IS 'Permet au public de créer des demandes d''inscription';
COMMENT ON POLICY "Public can view pending registration requests count" ON registration_requests
  IS 'Permet au public de voir les demandes en attente';
COMMENT ON POLICY "Allow user creation during signup" ON users
  IS 'Permet la création d''utilisateurs durant l''inscription';
COMMENT ON POLICY "Exhibitors can insert own mini-site" ON mini_sites
  IS 'Permet aux exposants de créer leur mini-site';
COMMENT ON POLICY "Exhibitors can update own mini-site" ON mini_sites
  IS 'Permet aux exposants de modifier leur mini-site';
COMMENT ON POLICY "Public can read time slots" ON time_slots
  IS 'Permet au public de lire tous les créneaux horaires';
COMMENT ON POLICY "Users can create own time slots" ON time_slots
  IS 'Permet aux utilisateurs de créer leurs créneaux';
COMMENT ON POLICY "Public can read all news articles" ON news_articles
  IS 'Permet au public de lire tous les articles';
COMMENT ON POLICY "Public can read all exhibitors" ON exhibitors
  IS 'Permet au public de lire tous les exposants';
COMMENT ON POLICY "Public can read all products" ON products
  IS 'Permet au public de lire tous les produits';
COMMENT ON POLICY "Public can read all partners" ON partners
  IS 'Permet au public de lire tous les partenaires';

-- ====================
-- VERIFICATION
-- ====================

-- Display all policies for verification
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles::text[],
    cmd,
    CASE
      WHEN length(qual) > 50 THEN substring(qual from 1 for 47) || '...'
      ELSE qual
    END as qual_short
FROM pg_policies
WHERE tablename IN ('registration_requests', 'users', 'mini_sites', 'time_slots', 'news_articles', 'exhibitors', 'products', 'partners')
ORDER BY tablename, policyname;


-- [20251107000003_fix_rls_final.sql]
-- Migration Complète v3.0: Fix ALL API Errors - FINAL
-- Description: Créer les tables manquantes ET corriger toutes les politiques RLS
-- Date: 2025-11-07
-- Version: 3.0 - Correction des colonnes (exhibitor_id au lieu de user_id pour time_slots)

-- ====================
-- STEP 1: CREATE ENUMS
-- ====================

-- Create user_type enum if not exists
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('exhibitor', 'partner', 'visitor', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create registration_status enum if not exists
DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ====================
-- STEP 2: CREATE TABLES
-- ====================

-- Create registration_requests table if not exists
CREATE TABLE IF NOT EXISTS registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text,
  position text,
  phone text NOT NULL,
  profile_data jsonb DEFAULT '{}'::jsonb,
  status registration_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id),
  rejection_reason text
);

-- Create indexes for registration_requests
CREATE INDEX IF NOT EXISTS idx_registration_requests_user_id ON registration_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_registration_requests_created_at ON registration_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registration_requests_user_type ON registration_requests(user_type);

-- Enable RLS on registration_requests
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- ====================
-- STEP 3: DROP OLD POLICIES
-- ====================

-- Registration Requests
DROP POLICY IF EXISTS "Public can create registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Public can view pending registration requests count" ON registration_requests;
DROP POLICY IF EXISTS "Users can view own registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Admins can view all registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Admins can update registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Authenticated users can insert own registration requests" ON registration_requests;

-- Users
DROP POLICY IF EXISTS "Public can create user during signup" ON users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;

-- Mini Sites
DROP POLICY IF EXISTS "Exhibitors can insert own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Exhibitors can update own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Public can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read all mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Anyone can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read published mini-sites from verified exhibitors" ON mini_sites;

-- Time Slots
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Public can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can create own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can create own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can update own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can update own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can delete own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can delete own time slots" ON time_slots;

-- News Articles
DROP POLICY IF EXISTS "Public can read published news only" ON news_articles;
DROP POLICY IF EXISTS "Public can read all news articles" ON news_articles;
DROP POLICY IF EXISTS "Anyone can read published news" ON news_articles;
DROP POLICY IF EXISTS "Public can read published news" ON news_articles;
DROP POLICY IF EXISTS "Admins can create news articles" ON news_articles;
DROP POLICY IF EXISTS "Admins can update news articles" ON news_articles;

-- Exhibitors
DROP POLICY IF EXISTS "Public can read verified exhibitors only" ON exhibitors;
DROP POLICY IF EXISTS "Public can read all exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Public can read exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;

-- Products
DROP POLICY IF EXISTS "Public can read products from verified exhibitors" ON products;
DROP POLICY IF EXISTS "Public can read all products" ON products;
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;

-- Partners
DROP POLICY IF EXISTS "Public can read verified partners only" ON partners;
DROP POLICY IF EXISTS "Public can read all partners" ON partners;
DROP POLICY IF EXISTS "Public can read partners" ON partners;
DROP POLICY IF EXISTS "Anyone can read partners" ON partners;

-- ====================
-- STEP 4: CREATE NEW POLICIES
-- ====================

-- ========== REGISTRATION_REQUESTS ==========

-- Allow public to create registration requests
CREATE POLICY "Public can create registration requests"
ON registration_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow public to view pending registration requests count
CREATE POLICY "Public can view pending registration requests count"
ON registration_requests
FOR SELECT
TO public
USING (status = 'pending');

-- Users can view their own registration requests
CREATE POLICY "Users can view own registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all registration requests
CREATE POLICY "Admins can view all registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- Admins can update registration requests
CREATE POLICY "Admins can update registration requests"
ON registration_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- ========== USERS ==========

-- Allow user creation during signup (public access)
CREATE POLICY "Allow user creation during signup"
ON users
FOR INSERT
TO public
WITH CHECK (true);

-- ========== MINI_SITES ==========

-- Exhibitors can insert their own mini-site
CREATE POLICY "Exhibitors can insert own mini-site"
ON mini_sites
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can update their own mini-site
CREATE POLICY "Exhibitors can update own mini-site"
ON mini_sites
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Public can read all mini-sites
CREATE POLICY "Public can read all mini-sites"
ON mini_sites
FOR SELECT
TO public
USING (true);

-- ========== TIME_SLOTS ==========
-- NOTE: time_slots uses exhibitor_id, not user_id

-- Public can read all time slots
CREATE POLICY "Public can read time slots"
ON time_slots
FOR SELECT
TO public
USING (true);

-- Exhibitors can create their own time slots
CREATE POLICY "Exhibitors can create own time slots"
ON time_slots
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can update their own time slots
CREATE POLICY "Exhibitors can update own time slots"
ON time_slots
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can delete their own time slots
CREATE POLICY "Exhibitors can delete own time slots"
ON time_slots
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- ========== NEWS_ARTICLES ==========

-- Public can read all news articles
CREATE POLICY "Public can read all news articles"
ON news_articles
FOR SELECT
TO public
USING (true);

-- Admins can create news articles
CREATE POLICY "Admins can create news articles"
ON news_articles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- Admins can update news articles
CREATE POLICY "Admins can update news articles"
ON news_articles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- ========== EXHIBITORS ==========

-- Public can read all exhibitors
CREATE POLICY "Public can read all exhibitors"
ON exhibitors
FOR SELECT
TO public
USING (true);

-- ========== PRODUCTS ==========

-- Public can read all products
CREATE POLICY "Public can read all products"
ON products
FOR SELECT
TO public
USING (true);

-- ========== PARTNERS ==========

-- Public can read all partners
CREATE POLICY "Public can read all partners"
ON partners
FOR SELECT
TO public
USING (true);

-- ====================
-- STEP 5: COMMENTS
-- ====================

COMMENT ON POLICY "Public can create registration requests" ON registration_requests
  IS 'Permet au public de créer des demandes d''inscription';
COMMENT ON POLICY "Public can view pending registration requests count" ON registration_requests
  IS 'Permet au public de voir les demandes en attente';
COMMENT ON POLICY "Allow user creation during signup" ON users
  IS 'Permet la création d''utilisateurs durant l''inscription';
COMMENT ON POLICY "Exhibitors can insert own mini-site" ON mini_sites
  IS 'Permet aux exposants de créer leur mini-site';
COMMENT ON POLICY "Exhibitors can update own mini-site" ON mini_sites
  IS 'Permet aux exposants de modifier leur mini-site';
COMMENT ON POLICY "Public can read time slots" ON time_slots
  IS 'Permet au public de lire tous les créneaux horaires';
COMMENT ON POLICY "Exhibitors can create own time slots" ON time_slots
  IS 'Permet aux exposants de créer leurs créneaux';
COMMENT ON POLICY "Exhibitors can update own time slots" ON time_slots
  IS 'Permet aux exposants de modifier leurs créneaux';
COMMENT ON POLICY "Exhibitors can delete own time slots" ON time_slots
  IS 'Permet aux exposants de supprimer leurs créneaux';
COMMENT ON POLICY "Public can read all news articles" ON news_articles
  IS 'Permet au public de lire tous les articles';
COMMENT ON POLICY "Public can read all exhibitors" ON exhibitors
  IS 'Permet au public de lire tous les exposants';
COMMENT ON POLICY "Public can read all products" ON products
  IS 'Permet au public de lire tous les produits';
COMMENT ON POLICY "Public can read all partners" ON partners
  IS 'Permet au public de lire tous les partenaires';

-- ====================
-- VERIFICATION
-- ====================

-- Display all policies for verification
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles::text[],
    cmd,
    CASE
      WHEN length(qual) > 50 THEN substring(qual from 1 for 47) || '...'
      ELSE qual
    END as qual_short
FROM pg_policies
WHERE tablename IN ('registration_requests', 'users', 'mini_sites', 'time_slots', 'news_articles', 'exhibitors', 'products', 'partners')
ORDER BY tablename, policyname;


-- [20251107000004_fix_rls_policies_only.sql]
-- Migration v4.0: Fix RLS Policies ONLY (tables already exist)
-- Description: Corriger toutes les politiques RLS sans recréer les tables
-- Date: 2025-11-07
-- Version: 4.0 - Politiques seulement

-- ====================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ====================

-- Registration Requests
DROP POLICY IF EXISTS "Public can create registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Public can view pending registration requests count" ON registration_requests;
DROP POLICY IF EXISTS "Users can view own registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Admins can view all registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Admins can update registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Authenticated users can insert own registration requests" ON registration_requests;

-- Users
DROP POLICY IF EXISTS "Public can create user during signup" ON users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;

-- Mini Sites
DROP POLICY IF EXISTS "Exhibitors can insert own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Exhibitors can update own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Public can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read all mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Anyone can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read published mini-sites from verified exhibitors" ON mini_sites;

-- Time Slots
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Public can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can create own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can create own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can update own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can update own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can delete own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can delete own time slots" ON time_slots;

-- News Articles
DROP POLICY IF EXISTS "Public can read published news only" ON news_articles;
DROP POLICY IF EXISTS "Public can read all news articles" ON news_articles;
DROP POLICY IF EXISTS "Anyone can read published news" ON news_articles;
DROP POLICY IF EXISTS "Public can read published news" ON news_articles;
DROP POLICY IF EXISTS "Admins can create news articles" ON news_articles;
DROP POLICY IF EXISTS "Admins can update news articles" ON news_articles;

-- Exhibitors
DROP POLICY IF EXISTS "Public can read verified exhibitors only" ON exhibitors;
DROP POLICY IF EXISTS "Public can read all exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Public can read all exhibitors data" ON exhibitors;

-- Products
DROP POLICY IF EXISTS "Public can read all products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Exhibitors can create own products" ON products;
DROP POLICY IF EXISTS "Exhibitors can update own products" ON products;
DROP POLICY IF EXISTS "Exhibitors can delete own products" ON products;

-- Partners
DROP POLICY IF EXISTS "Public can read verified partners only" ON partners;
DROP POLICY IF EXISTS "Public can read all partners" ON partners;
DROP POLICY IF EXISTS "Anyone can read partners" ON partners;

-- ====================
-- STEP 2: CREATE NEW POLICIES
-- ====================

-- ===== REGISTRATION_REQUESTS POLICIES =====

-- Allow anonymous users to create registration requests
CREATE POLICY "Public can create registration requests"
ON registration_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to view their own registration requests
CREATE POLICY "Users can view own registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all registration requests
CREATE POLICY "Admins can view all registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Allow admins to update registration requests (approve/reject)
CREATE POLICY "Admins can update registration requests"
ON registration_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ===== USERS POLICIES =====

-- Allow public user creation during signup
CREATE POLICY "Public can create user during signup"
ON users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ===== MINI_SITES POLICIES =====

-- Exhibitors can create their own mini-site
CREATE POLICY "Exhibitors can insert own mini-site"
ON mini_sites
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = mini_sites.exhibitor_id
  )
);

-- Exhibitors can update their own mini-site
CREATE POLICY "Exhibitors can update own mini-site"
ON mini_sites
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = mini_sites.exhibitor_id
  )
);

-- Public can read all mini-sites
CREATE POLICY "Public can read all mini-sites"
ON mini_sites
FOR SELECT
TO anon, authenticated
USING (true);

-- ===== TIME_SLOTS POLICIES =====

-- Public can read all time slots
CREATE POLICY "Public can read time slots"
ON time_slots
FOR SELECT
TO anon, authenticated
USING (true);

-- Exhibitors can create own time slots
CREATE POLICY "Exhibitors can create own time slots"
ON time_slots
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can update own time slots
CREATE POLICY "Exhibitors can update own time slots"
ON time_slots
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can delete own time slots
CREATE POLICY "Exhibitors can delete own time slots"
ON time_slots
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- ===== NEWS_ARTICLES POLICIES =====

-- Public can read all news articles
CREATE POLICY "Public can read all news articles"
ON news_articles
FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can create news articles
CREATE POLICY "Admins can create news articles"
ON news_articles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Admins can update news articles
CREATE POLICY "Admins can update news articles"
ON news_articles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ===== EXHIBITORS POLICIES =====

-- Public can read all exhibitors
CREATE POLICY "Public can read all exhibitors data"
ON exhibitors
FOR SELECT
TO anon, authenticated
USING (true);

-- ===== PRODUCTS POLICIES =====

-- Public can read all products
CREATE POLICY "Anyone can read products"
ON products
FOR SELECT
TO anon, authenticated
USING (true);

-- Exhibitors can create products
CREATE POLICY "Exhibitors can create own products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can update own products
CREATE POLICY "Exhibitors can update own products"
ON products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can delete own products
CREATE POLICY "Exhibitors can delete own products"
ON products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- ===== PARTNERS POLICIES =====

-- Public can read all partners
CREATE POLICY "Anyone can read partners"
ON partners
FOR SELECT
TO anon, authenticated
USING (true);

-- ====================
-- STEP 3: ENSURE RLS IS ENABLED
-- ====================

ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Migration v4.0 completed successfully


-- [20251107000005_fix_rls_policies_type_column.sql]
-- Migration v5.0: Fix RLS Policies - Correction colonne type au lieu de role
-- Description: Corriger toutes les politiques RLS qui référencent users.role → users.type
-- Date: 2025-11-07
-- Version: 5.0 - Correction users.role → users.type

-- ====================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ====================

-- Registration Requests
DROP POLICY IF EXISTS "Public can create registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Public can view pending registration requests count" ON registration_requests;
DROP POLICY IF EXISTS "Users can view own registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Admins can view all registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Admins can update registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Authenticated users can insert own registration requests" ON registration_requests;

-- Users
DROP POLICY IF EXISTS "Public can create user during signup" ON users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;

-- Mini Sites
DROP POLICY IF EXISTS "Exhibitors can insert own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Exhibitors can update own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Public can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read all mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Anyone can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read published mini-sites from verified exhibitors" ON mini_sites;

-- Time Slots
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Public can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can create own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can create own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can update own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can update own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can delete own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can delete own time slots" ON time_slots;

-- News Articles
DROP POLICY IF EXISTS "Public can read published news only" ON news_articles;
DROP POLICY IF EXISTS "Public can read all news articles" ON news_articles;
DROP POLICY IF EXISTS "Anyone can read published news" ON news_articles;
DROP POLICY IF EXISTS "Public can read published news" ON news_articles;
DROP POLICY IF EXISTS "Admins can create news articles" ON news_articles;
DROP POLICY IF EXISTS "Admins can update news articles" ON news_articles;

-- Exhibitors
DROP POLICY IF EXISTS "Public can read verified exhibitors only" ON exhibitors;
DROP POLICY IF EXISTS "Public can read all exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Public can read all exhibitors data" ON exhibitors;

-- Products
DROP POLICY IF EXISTS "Public can read all products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Exhibitors can create own products" ON products;
DROP POLICY IF EXISTS "Exhibitors can update own products" ON products;
DROP POLICY IF EXISTS "Exhibitors can delete own products" ON products;

-- Partners
DROP POLICY IF EXISTS "Public can read verified partners only" ON partners;
DROP POLICY IF EXISTS "Public can read all partners" ON partners;
DROP POLICY IF EXISTS "Anyone can read partners" ON partners;

-- ====================
-- STEP 2: CREATE NEW POLICIES (avec users.type au lieu de users.role)
-- ====================

-- ===== REGISTRATION_REQUESTS POLICIES =====

-- Allow anonymous users to create registration requests
CREATE POLICY "Public can create registration requests"
ON registration_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to view their own registration requests
CREATE POLICY "Users can view own registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all registration requests
CREATE POLICY "Admins can view all registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- Allow admins to update registration requests (approve/reject)
CREATE POLICY "Admins can update registration requests"
ON registration_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- ===== USERS POLICIES =====

-- Allow public user creation during signup
CREATE POLICY "Public can create user during signup"
ON users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ===== MINI_SITES POLICIES =====

-- Exhibitors can create their own mini-site
CREATE POLICY "Exhibitors can insert own mini-site"
ON mini_sites
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = mini_sites.exhibitor_id
  )
);

-- Exhibitors can update their own mini-site
CREATE POLICY "Exhibitors can update own mini-site"
ON mini_sites
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = mini_sites.exhibitor_id
  )
);

-- Public can read all mini-sites
CREATE POLICY "Public can read all mini-sites"
ON mini_sites
FOR SELECT
TO anon, authenticated
USING (true);

-- ===== TIME_SLOTS POLICIES =====

-- Public can read all time slots
CREATE POLICY "Public can read time slots"
ON time_slots
FOR SELECT
TO anon, authenticated
USING (true);

-- Exhibitors can create own time slots
CREATE POLICY "Exhibitors can create own time slots"
ON time_slots
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can update own time slots
CREATE POLICY "Exhibitors can update own time slots"
ON time_slots
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can delete own time slots
CREATE POLICY "Exhibitors can delete own time slots"
ON time_slots
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- ===== NEWS_ARTICLES POLICIES =====

-- Public can read all news articles
CREATE POLICY "Public can read all news articles"
ON news_articles
FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can create news articles
CREATE POLICY "Admins can create news articles"
ON news_articles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- Admins can update news articles
CREATE POLICY "Admins can update news articles"
ON news_articles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- ===== EXHIBITORS POLICIES =====

-- Public can read all exhibitors
CREATE POLICY "Public can read all exhibitors data"
ON exhibitors
FOR SELECT
TO anon, authenticated
USING (true);

-- ===== PRODUCTS POLICIES =====

-- Public can read all products
CREATE POLICY "Anyone can read products"
ON products
FOR SELECT
TO anon, authenticated
USING (true);

-- Exhibitors can create products
CREATE POLICY "Exhibitors can create own products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can update own products
CREATE POLICY "Exhibitors can update own products"
ON products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can delete own products
CREATE POLICY "Exhibitors can delete own products"
ON products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- ===== PARTNERS POLICIES =====

-- Public can read all partners
CREATE POLICY "Anyone can read partners"
ON partners
FOR SELECT
TO anon, authenticated
USING (true);

-- ====================
-- STEP 3: ENSURE RLS IS ENABLED
-- ====================

ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Migration v5.0 completed successfully


-- [20251108000001_create_contact_messages.sql]
-- Migration: Création table contact_messages
-- Date: 2025-11-08
-- Description: Table pour stocker les messages de contact du formulaire

-- Créer la table contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  subject VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES users(id),
  response_notes TEXT,

  -- Index pour recherche rapide
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Commentaires
COMMENT ON TABLE contact_messages IS 'Messages de contact envoyés via le formulaire du site';
COMMENT ON COLUMN contact_messages.status IS 'Statut du message: new, in_progress, resolved, archived';
COMMENT ON COLUMN contact_messages.subject IS 'Sujet: exhibitor, visitor, partnership, support, other';

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut créer un message de contact (anonyme)
CREATE POLICY "Anyone can create contact message"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Seuls les admins peuvent lire les messages
CREATE POLICY "Admins can view all contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Policy: Seuls les admins peuvent mettre à jour les messages
CREATE POLICY "Admins can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();


-- [20251204_payment_requests_manual.sql]
-- Migration: Système de paiement par virement bancaire avec validation manuelle
-- Date: 2025-12-04
-- Description: Remplacement de Stripe par un système de demandes de paiement validées manuellement

-- ============================================
-- CRÉATION TABLE payment_requests
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  requested_level text NOT NULL CHECK (requested_level IN ('premium', 'silver', 'gold', 'platinium', 'museum')),
  amount numeric NOT NULL DEFAULT 700.00,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  payment_method text NOT NULL DEFAULT 'bank_transfer',

  -- Informations de virement
  transfer_reference text,
  transfer_date timestamp with time zone,
  transfer_proof_url text, -- URL du justificatif de paiement uploadé

  -- Validation admin
  validated_by uuid REFERENCES public.users(id),
  validated_at timestamp with time zone,
  validation_notes text,

  -- Métadonnées
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Mise à jour de la contrainte si la table existe déjà
DO $$ 
BEGIN 
    ALTER TABLE public.payment_requests 
    DROP CONSTRAINT IF EXISTS payment_requests_requested_level_check;
    
    ALTER TABLE public.payment_requests 
    ADD CONSTRAINT payment_requests_requested_level_check 
    CHECK (requested_level IN ('premium', 'silver', 'gold', 'platinium', 'museum'));
EXCEPTION 
    WHEN undefined_table THEN 
        NULL; 
END $$;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON public.payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON public.payment_requests(created_at DESC);

-- ============================================
-- TRIGGER pour updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_payment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_payment_requests_updated_at ON public.payment_requests;
CREATE TRIGGER trigger_payment_requests_updated_at
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_requests_updated_at();

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres demandes
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public.payment_requests;
CREATE POLICY "Users can view their own payment requests"
  ON public.payment_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres demandes
DROP POLICY IF EXISTS "Users can create their own payment requests" ON public.payment_requests;
CREATE POLICY "Users can create their own payment requests"
  ON public.payment_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent tout voir et modifier
DROP POLICY IF EXISTS "Admins can view all payment requests" ON public.payment_requests;
CREATE POLICY "Admins can view all payment requests"
  ON public.payment_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update payment requests" ON public.payment_requests;
CREATE POLICY "Admins can update payment requests"
  ON public.payment_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- ============================================
-- FONCTION: Approuver une demande de paiement
-- ============================================

DROP FUNCTION IF EXISTS public.approve_payment_request(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.approve_payment_request(
  request_id uuid,
  admin_id uuid,
  notes text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_requested_level text;
BEGIN
  -- Récupérer les infos de la demande
  SELECT user_id, requested_level
  INTO v_user_id, v_requested_level
  FROM public.payment_requests
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request not found or already processed';
  END IF;

  -- Mettre à jour la demande
  UPDATE public.payment_requests
  SET
    status = 'approved',
    validated_by = admin_id,
    validated_at = now(),
    validation_notes = notes
  WHERE id = request_id;

  -- Mettre à jour le niveau de l'utilisateur
  UPDATE public.users
  SET visitor_level = v_requested_level
  WHERE id = v_user_id;

  -- Créer une notification pour l'utilisateur
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_user_id,
    'Paiement approuvé !',
    'Votre paiement a été validé. Vous avez maintenant accès au Pass Premium VIP avec tous les avantages illimités !',
    'success'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: Rejeter une demande de paiement
-- ============================================

DROP FUNCTION IF EXISTS public.reject_payment_request(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.reject_payment_request(
  request_id uuid,
  admin_id uuid,
  notes text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Récupérer l'user_id
  SELECT user_id
  INTO v_user_id
  FROM public.payment_requests
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request not found or already processed';
  END IF;

  -- Mettre à jour la demande
  UPDATE public.payment_requests
  SET
    status = 'rejected',
    validated_by = admin_id,
    validated_at = now(),
    validation_notes = notes
  WHERE id = request_id;

  -- Créer une notification pour l'utilisateur
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_user_id,
    'Paiement refusé',
    COALESCE(notes, 'Votre demande de paiement n''a pas pu être validée. Veuillez nous contacter pour plus d''informations.'),
    'error'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONNÉES DE CONFIGURATION BANCAIRE
-- ============================================

-- Table pour stocker les informations bancaires (pour affichage aux utilisateurs)
CREATE TABLE IF NOT EXISTS public.bank_transfer_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  account_holder text NOT NULL,
  iban text NOT NULL,
  bic_swift text,
  reference_format text NOT NULL DEFAULT 'SIB-PREMIUM-{USER_ID}',
  instructions text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insérer les informations bancaires par défaut
INSERT INTO public.bank_transfer_info (bank_name, account_holder, iban, bic_swift, instructions)
VALUES (
  'Attijariwafa bank',
  'LINECO EVENTS',
  'MA64 007 780 000413200000498 25',
  'BCMAMAMC',
  'Merci d''effectuer le virement avec la référence indiquée. Domiciliation: CASA MY IDRISS 1ER. Une fois le paiement effectué, téléchargez votre justificatif sur votre espace personnel. La validation peut prendre 24-48h.'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Vérifier la structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_requests'
ORDER BY ordinal_position;

SELECT * FROM public.bank_transfer_info;


-- [20251204_update_subscription_tiers.sql]
-- Migration: Simplification des niveaux d'abonnement visiteur
-- Date: 2025-12-04
-- Description: Passage de 4 niveaux (free, basic, premium, vip) à 2 niveaux (free, premium à 700€)
-- Le nouveau niveau premium offre tous les avantages de l'ancien VIP

-- ============================================
-- ÉTAPE 1: Mise à jour de la table visitor_levels
-- ============================================

-- Supprimer les anciens niveaux basic et vip
DELETE FROM public.visitor_levels WHERE level IN ('basic', 'vip');

-- Mettre à jour le quota premium pour illimité (9999)
UPDATE public.visitor_levels
SET quota = 9999
WHERE level = 'premium';

-- S'assurer que le niveau free existe avec quota 0
INSERT INTO public.visitor_levels (level, quota)
VALUES ('free', 0)
ON CONFLICT (level) DO UPDATE SET quota = 0;

-- ============================================
-- ÉTAPE 2: Migration des utilisateurs existants
-- ============================================

-- Migrer les utilisateurs "basic" vers "free"
-- (ils devront repayer pour obtenir le premium)
UPDATE public.users
SET visitor_level = 'free'
WHERE visitor_level = 'basic';

-- Migrer les utilisateurs "vip" vers "premium"
-- (ils gardent leurs avantages)
UPDATE public.users
SET visitor_level = 'premium'
WHERE visitor_level = 'vip';

-- ============================================
-- ÉTAPE 3: Nettoyage des données obsolètes
-- ============================================

-- Optionnel: Supprimer les anciennes transactions liées aux niveaux supprimés
-- (Commenté pour conserver l'historique)
-- DELETE FROM public.payment_transactions WHERE visitor_level IN ('basic', 'vip');

-- ============================================
-- ÉTAPE 4: Vérification
-- ============================================

-- Afficher les niveaux restants
SELECT * FROM public.visitor_levels ORDER BY quota;

-- Afficher la distribution des utilisateurs par niveau
SELECT visitor_level, COUNT(*) as count
FROM public.users
WHERE visitor_level IS NOT NULL
GROUP BY visitor_level
ORDER BY count DESC;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- visitor_levels devrait contenir:
--   - free: quota 0
--   - premium: quota 9999
--
-- Tous les utilisateurs devraient avoir visitor_level = 'free' ou 'premium'


-- [20251212_create_event_registrations.sql]
-- Migration: Création table event_registrations
-- Date: 2025-12-12
-- Description: Table pour gérer les inscriptions aux événements

-- Table event_registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registration_type text DEFAULT 'standard',
  status text NOT NULL DEFAULT 'confirmed',
  registered_at timestamptz DEFAULT now(),
  attended_at timestamptz,
  notes text,
  special_requirements text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Contrainte d'unicité: un utilisateur ne peut s'inscrire qu'une fois par événement
  UNIQUE(event_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

-- RLS (Row Level Security)
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres inscriptions
CREATE POLICY "Users can view own event registrations"
  ON event_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent créer leurs propres inscriptions
CREATE POLICY "Users can create own event registrations"
  ON event_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent mettre à jour leurs propres inscriptions
CREATE POLICY "Users can update own event registrations"
  ON event_registrations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs propres inscriptions
CREATE POLICY "Users can delete own event registrations"
  ON event_registrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Les admins peuvent tout voir
CREATE POLICY "Admins can view all event registrations"
  ON event_registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Policy: Les admins peuvent tout modifier
CREATE POLICY "Admins can manage all event registrations"
  ON event_registrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Fonction trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_event_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_registrations_updated_at_trigger
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_event_registrations_updated_at();

-- Fonction pour compter les inscrits d'un événement
CREATE OR REPLACE FUNCTION count_event_registrations(p_event_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM event_registrations
    WHERE event_id = p_event_id
    AND status = 'confirmed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- [20251217000000_create_profile_tables.sql]
-- ========================================
-- Create Profile Tables for Multi-Tier System
-- ========================================
-- This migration creates the profile tables that the seed file and multi-tier system expect
--
-- Tables: visitor_profiles, partner_profiles, exhibitor_profiles
-- All linked to users table via user_id
-- ========================================

-- 1. Create visitor_profiles table
CREATE TABLE IF NOT EXISTS visitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  position text,
  phone text,
  country text,
  visitor_type text CHECK (visitor_type IN ('company', 'professional', 'student', 'press')),
  pass_type text CHECK (pass_type IN ('free', 'vip', 'premium')),
  interests text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitor_profiles_user_id ON visitor_profiles(user_id);

-- 2. Create partner_profiles table
CREATE TABLE IF NOT EXISTS partner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  description text,
  logo_url text,
  website text,
  country text,
  partnership_level text CHECK (partnership_level IN ('museum', 'silver', 'gold', 'platinium')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON partner_profiles(user_id);

-- 3. Create exhibitor_profiles table
CREATE TABLE IF NOT EXISTS exhibitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  company_name text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  description text,
  logo_url text,
  website text,
  country text,
  sector text,
  category text,
  stand_number text,
  stand_area numeric DEFAULT 9.0 CHECK (stand_area > 0 AND stand_area <= 200),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_user_id ON exhibitor_profiles(user_id);

-- Enable RLS on all profile tables
ALTER TABLE visitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_profiles
CREATE POLICY "Users can view their own visitor profile"
  ON visitor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visitor profile"
  ON visitor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visitor profile"
  ON visitor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for partner_profiles
CREATE POLICY "Anyone can view partner profiles"
  ON partner_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own partner profile"
  ON partner_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner profile"
  ON partner_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for exhibitor_profiles
CREATE POLICY "Anyone can view exhibitor profiles"
  ON exhibitor_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own exhibitor profile"
  ON exhibitor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exhibitor profile"
  ON exhibitor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
DROP TRIGGER IF EXISTS update_visitor_profiles_updated_at ON visitor_profiles;
CREATE TRIGGER update_visitor_profiles_updated_at
  BEFORE UPDATE ON visitor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

DROP TRIGGER IF EXISTS update_partner_profiles_updated_at ON partner_profiles;
CREATE TRIGGER update_partner_profiles_updated_at
  BEFORE UPDATE ON partner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

DROP TRIGGER IF EXISTS update_exhibitor_profiles_updated_at ON exhibitor_profiles;
CREATE TRIGGER update_exhibitor_profiles_updated_at
  BEFORE UPDATE ON exhibitor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();


-- [20251217000001_create_user_badges.sql]
-- Table pour les badges utilisateurs (visiteurs, exposants, partenaires)
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_code text NOT NULL UNIQUE, -- Code unique pour le QR code
  user_type text NOT NULL CHECK (user_type IN ('visitor', 'exhibitor', 'partner', 'admin')),
  user_level text, -- Pour visiteurs: 'free' ou 'premium', pour exposants/partenaires: leur niveau
  full_name text NOT NULL,
  company_name text,
  position text,
  email text NOT NULL,
  phone text,
  avatar_url text,
  stand_number text, -- Numéro de stand pour exposants
  access_level text NOT NULL DEFAULT 'standard', -- 'standard', 'vip', 'exhibitor', 'partner'
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz NOT NULL DEFAULT (now() + interval '3 days'), -- Validité par défaut 3 jours
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'pending')),
  qr_data jsonb, -- Données additionnelles encodées dans le QR code
  scan_count integer DEFAULT 0,
  last_scanned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_code ON user_badges(badge_code);
CREATE INDEX IF NOT EXISTS idx_user_badges_status ON user_badges(status);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_type ON user_badges(user_type);

-- RLS Policies
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leur propre badge
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all badges"
  ON user_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Les utilisateurs peuvent créer leur propre badge (auto-génération)
CREATE POLICY "Users can create their own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leur propre badge
CREATE POLICY "Users can update their own badges"
  ON user_badges FOR UPDATE
  USING (auth.uid() = user_id);

-- Les admins peuvent tout faire
CREATE POLICY "Admins can manage all badges"
  ON user_badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Fonction pour générer un code de badge unique
CREATE OR REPLACE FUNCTION generate_badge_code(user_id_param uuid)
RETURNS text AS $$
DECLARE
  code_prefix text;
  random_suffix text;
  final_code text;
  attempt_count integer := 0;
  max_attempts integer := 10;
BEGIN
  -- Générer un préfixe basé sur l'ID utilisateur (6 premiers caractères)
  code_prefix := UPPER(SUBSTRING(REPLACE(user_id_param::text, '-', ''), 1, 6));

  LOOP
    -- Générer un suffixe aléatoire
    random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 6));
    final_code := code_prefix || '-' || random_suffix;

    -- Vérifier si le code existe déjà
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE badge_code = final_code) THEN
      RETURN final_code;
    END IF;

    attempt_count := attempt_count + 1;
    IF attempt_count >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique badge code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer ou mettre à jour un badge utilisateur
CREATE OR REPLACE FUNCTION upsert_user_badge(
  p_user_id uuid,
  p_user_type text,
  p_user_level text DEFAULT NULL,
  p_full_name text DEFAULT NULL,
  p_company_name text DEFAULT NULL,
  p_position text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL,
  p_stand_number text DEFAULT NULL
)
RETURNS user_badges AS $$
DECLARE
  v_badge user_badges;
  v_badge_code text;
  v_access_level text;
  v_valid_until timestamptz;
BEGIN
  -- Déterminer le niveau d'accès basé sur le type et niveau
  IF p_user_type = 'visitor' AND p_user_level = 'premium' THEN
    v_access_level := 'vip';
    v_valid_until := now() + interval '3 days';
  ELSIF p_user_type = 'exhibitor' THEN
    v_access_level := 'exhibitor';
    v_valid_until := now() + interval '3 days';
  ELSIF p_user_type = 'partner' THEN
    v_access_level := 'partner';
    v_valid_until := now() + interval '3 days';
  ELSIF p_user_type = 'admin' THEN
    v_access_level := 'admin';
    v_valid_until := now() + interval '1 year';
  ELSE
    v_access_level := 'standard';
    v_valid_until := now() + interval '3 days';
  END IF;

  -- Vérifier si un badge existe déjà
  SELECT * INTO v_badge FROM user_badges WHERE user_id = p_user_id LIMIT 1;

  IF v_badge.id IS NULL THEN
    -- Créer un nouveau badge
    v_badge_code := generate_badge_code(p_user_id);

    INSERT INTO user_badges (
      user_id, badge_code, user_type, user_level, full_name,
      company_name, position, email, phone, avatar_url,
      stand_number, access_level, valid_until, status,
      qr_data
    ) VALUES (
      p_user_id, v_badge_code, p_user_type, p_user_level, p_full_name,
      p_company_name, p_position, p_email, p_phone, p_avatar_url,
      p_stand_number, v_access_level, v_valid_until, 'active',
      jsonb_build_object(
        'user_id', p_user_id,
        'badge_code', v_badge_code,
        'user_type', p_user_type,
        'access_level', v_access_level,
        'generated_at', now()
      )
    )
    RETURNING * INTO v_badge;
  ELSE
    -- Mettre à jour le badge existant
    UPDATE user_badges
    SET
      user_type = COALESCE(p_user_type, user_type),
      user_level = COALESCE(p_user_level, user_level),
      full_name = COALESCE(p_full_name, full_name),
      company_name = COALESCE(p_company_name, company_name),
      position = COALESCE(p_position, position),
      email = COALESCE(p_email, email),
      phone = COALESCE(p_phone, phone),
      avatar_url = COALESCE(p_avatar_url, avatar_url),
      stand_number = COALESCE(p_stand_number, stand_number),
      access_level = v_access_level,
      valid_until = v_valid_until,
      updated_at = now()
    WHERE user_id = p_user_id
    RETURNING * INTO v_badge;
  END IF;

  RETURN v_badge;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour scanner un badge (incrémenter le compteur)
CREATE OR REPLACE FUNCTION scan_badge(p_badge_code text)
RETURNS user_badges AS $$
DECLARE
  v_badge user_badges;
BEGIN
  UPDATE user_badges
  SET
    scan_count = scan_count + 1,
    last_scanned_at = now()
  WHERE badge_code = p_badge_code
  RETURNING * INTO v_badge;

  IF v_badge.id IS NULL THEN
    RAISE EXCEPTION 'Badge not found: %', p_badge_code;
  END IF;

  IF v_badge.status != 'active' THEN
    RAISE EXCEPTION 'Badge is not active: %', v_badge.status;
  END IF;

  IF v_badge.valid_until < now() THEN
    RAISE EXCEPTION 'Badge has expired';
  END IF;

  RETURN v_badge;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires
COMMENT ON TABLE user_badges IS 'Badges avec QR code pour tous les utilisateurs (visiteurs, exposants, partenaires)';
COMMENT ON COLUMN user_badges.badge_code IS 'Code unique pour le QR code, format: PREFIX-SUFFIX';
COMMENT ON COLUMN user_badges.access_level IS 'Niveau d''accès: standard (visiteur free), vip (visiteur premium), exhibitor, partner, admin';
COMMENT ON COLUMN user_badges.qr_data IS 'Données JSON encodées dans le QR code pour validation';


-- [20251217000002_auto_generate_badges.sql]
-- Trigger pour générer automatiquement un badge lors de la création d'un utilisateur
-- ou lorsque son statut/niveau change

CREATE OR REPLACE FUNCTION auto_generate_user_badge()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name text;
  v_company_name text;
  v_position text;
  v_email text;
  v_phone text;
  v_avatar_url text;
  v_stand_number text;
  v_user_level text;
  v_exhibitor_id uuid;
  v_partner_id uuid;
BEGIN
  -- Construire le nom complet
  v_full_name := COALESCE(
    NULLIF(
      CONCAT_WS(' ',
        jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'firstName'),
        jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'lastName')
      ),
    ''),
    NEW.name,
    NEW.email
  );

  -- Récupérer les informations du profil
  v_email := NEW.email;
  v_phone := jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'phone');
  v_avatar_url := jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'avatar');
  v_position := jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'position');
  v_user_level := NEW.visitor_level;

  -- Si c'est un exposant, récupérer les infos de la table exhibitors
  IF NEW.type = 'exhibitor' THEN
    SELECT id, company_name, stand_number
    INTO v_exhibitor_id, v_company_name, v_stand_number
    FROM exhibitor_profiles
    WHERE user_id = NEW.id
    LIMIT 1;

    -- Si pas d'entreprise trouvée dans exhibitors, utiliser le profil
    v_company_name := COALESCE(v_company_name, jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'company'));
  END IF;

  -- Si c'est un partenaire, récupérer les infos de la table partners
  IF NEW.type = 'partner' THEN
    SELECT id, company_name
    INTO v_partner_id, v_company_name
    FROM partner_profiles
    WHERE user_id = NEW.id
    LIMIT 1;

    -- Si pas d'entreprise trouvée dans partners, utiliser le profil
    v_company_name := COALESCE(v_company_name, jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'company'));
  END IF;

  -- Si c'est un visiteur, utiliser les infos du profil
  IF NEW.type = 'visitor' THEN
    v_company_name := jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'company');
  END IF;

  -- Générer ou mettre à jour le badge
  PERFORM upsert_user_badge(
    p_user_id := NEW.id,
    p_user_type := NEW.type::text,
    p_user_level := v_user_level,
    p_full_name := v_full_name,
    p_company_name := v_company_name,
    p_position := v_position,
    p_email := v_email,
    p_phone := v_phone,
    p_avatar_url := v_avatar_url,
    p_stand_number := v_stand_number
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les insertions d'utilisateurs
DROP TRIGGER IF EXISTS trigger_auto_generate_badge_on_insert ON users;
CREATE TRIGGER trigger_auto_generate_badge_on_insert
  AFTER INSERT ON users
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION auto_generate_user_badge();

-- Créer le trigger pour les mises à jour d'utilisateurs
-- (quand le statut devient 'active' ou quand visitor_level change)
DROP TRIGGER IF EXISTS trigger_auto_generate_badge_on_update ON users;
CREATE TRIGGER trigger_auto_generate_badge_on_update
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (
    (NEW.status = 'active' AND OLD.status != 'active')
    OR (NEW.visitor_level IS DISTINCT FROM OLD.visitor_level)
    OR (NEW.profile IS DISTINCT FROM OLD.profile)
  )
  EXECUTE FUNCTION auto_generate_user_badge();

-- Trigger pour mettre à jour le badge quand l'exposant est créé/modifié
CREATE OR REPLACE FUNCTION auto_update_badge_from_exhibitor()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le badge de l'utilisateur lié
  IF NEW.user_id IS NOT NULL THEN
    PERFORM upsert_user_badge(
      p_user_id := NEW.user_id,
      p_user_type := 'exhibitor',
      p_user_level := NULL,
      p_full_name := (SELECT name FROM users WHERE id = NEW.user_id),
      p_company_name := NEW.company_name,
      p_position := (SELECT safe_jsonb(profile::text)->>'position' FROM users WHERE id = NEW.user_id),
      p_email := (SELECT email FROM users WHERE id = NEW.user_id),
      p_phone := (SELECT safe_jsonb(profile::text)->>'phone' FROM users WHERE id = NEW.user_id),
      p_avatar_url := (SELECT safe_jsonb(profile::text)->>'avatar' FROM users WHERE id = NEW.user_id),
      p_stand_number := NEW.stand_number
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_badge_from_exhibitor ON exhibitor_profiles;
CREATE TRIGGER trigger_update_badge_from_exhibitor
  AFTER INSERT OR UPDATE ON exhibitor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_badge_from_exhibitor();


-- Trigger pour mettre à jour le badge quand le partenaire est créé/modifié
CREATE OR REPLACE FUNCTION auto_update_badge_from_partner()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le badge de l'utilisateur lié
  IF NEW.user_id IS NOT NULL THEN
    PERFORM upsert_user_badge(
      p_user_id := NEW.user_id,
      p_user_type := 'partner',
      p_user_level := NULL,
      p_full_name := (SELECT name FROM users WHERE id = NEW.user_id),
      p_company_name := NEW.company_name,
      p_position := (SELECT safe_jsonb(profile::text)->>'position' FROM users WHERE id = NEW.user_id),
      p_email := (SELECT email FROM users WHERE id = NEW.user_id),
      p_phone := (SELECT safe_jsonb(profile::text)->>'phone' FROM users WHERE id = NEW.user_id),
      p_avatar_url := (SELECT safe_jsonb(profile::text)->>'avatar' FROM users WHERE id = NEW.user_id),
      p_stand_number := NULL
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_badge_from_partner ON partner_profiles;
CREATE TRIGGER trigger_update_badge_from_partner
  AFTER INSERT OR UPDATE ON partner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_badge_from_partner();

-- Commentaires
COMMENT ON FUNCTION auto_generate_user_badge() IS 'Génère automatiquement un badge pour un utilisateur lors de sa création ou mise à jour';
COMMENT ON FUNCTION auto_update_badge_from_exhibitor() IS 'Met à jour le badge quand les informations exposant changent';
COMMENT ON FUNCTION auto_update_badge_from_partner() IS 'Met à jour le badge quand les informations partenaire changent';


-- [20251217000003_add_user_levels_and_quotas.sql]
-- Migration: Ajouter colonnes pour niveaux visiteurs, partenaires et exposants
-- Date: 2025-12-17
-- Description: Support des niveaux FREE/VIP, tiers partenaires, et surfaces exposants

-- 1. Ajouter colonne visitor_level si elle n'existe pas déjà
ALTER TABLE users ADD COLUMN IF NOT EXISTS visitor_level TEXT DEFAULT 'free'
  CHECK (visitor_level IN ('free', 'premium', 'vip'));

-- 2. Ajouter colonne partner_tier pour les 4 niveaux partenaires
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_tier TEXT DEFAULT 'museum'
  CHECK (partner_tier IN ('museum', 'silver', 'gold', 'platinium'));

-- 3. Mettre à jour les profils exposants avec surface stand
ALTER TABLE exhibitor_profiles ADD COLUMN IF NOT EXISTS stand_area NUMERIC DEFAULT 9.0
  CHECK (stand_area > 0 AND stand_area <= 200);

-- 4. Ajouter colonne pour niveau exposant calculé
ALTER TABLE exhibitor_profiles ADD COLUMN IF NOT EXISTS exhibitor_level TEXT
  GENERATED ALWAYS AS (
    CASE
      WHEN stand_area <= 9 THEN 'basic_9'
      WHEN stand_area <= 18 THEN 'standard_18'
      WHEN stand_area <= 36 THEN 'premium_36'
      ELSE 'elite_54plus'
    END
  ) STORED;

-- 5. Créer table pour tracking usage des quotas
CREATE TABLE IF NOT EXISTS quota_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quota_type text NOT NULL, -- 'appointments', 'media_uploads', 'team_members', etc.
  current_usage integer DEFAULT 0 CHECK (current_usage >= 0),
  period text DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly', 'lifetime')),
  reset_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Contrainte unique par utilisateur, type de quota et période
  UNIQUE(user_id, quota_type, period)
);

-- 6. Créer index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_quota_usage_user_id ON quota_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_quota_usage_quota_type ON quota_usage(quota_type);
CREATE INDEX IF NOT EXISTS idx_quota_usage_reset_at ON quota_usage(reset_at);

-- 7. Créer table pour historique des upgrades
CREATE TABLE IF NOT EXISTS user_upgrades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('visitor', 'partner', 'exhibitor')),
  previous_level text,
  new_level text NOT NULL,
  payment_amount numeric,
  payment_currency text DEFAULT 'USD',
  payment_method text CHECK (payment_method IN ('stripe', 'paypal', 'cmi', 'wire_transfer', 'free')),
  payment_transaction_id text,
  upgraded_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  notes text
);

-- 8. Index pour historique upgrades
CREATE INDEX IF NOT EXISTS idx_user_upgrades_user_id ON user_upgrades(user_id);
CREATE INDEX IF NOT EXISTS idx_user_upgrades_upgraded_at ON user_upgrades(upgraded_at);

-- 9. Créer table pour tracking leads (scans badges)
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scanner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scanned_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  badge_code text,
  visitor_name text,
  visitor_email text,
  visitor_company text,
  visitor_phone text,
  source text DEFAULT 'badge_scan' CHECK (source IN ('badge_scan', 'appointment', 'event', 'manual', 'import')),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost', 'archived')),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  scanned_at timestamptz DEFAULT now(),
  last_contact_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. Index pour leads
CREATE INDEX IF NOT EXISTS idx_leads_scanner_id ON leads(scanner_id);
CREATE INDEX IF NOT EXISTS idx_leads_scanned_user_id ON leads(scanned_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_scanned_at ON leads(scanned_at);

-- 11. Fonction pour obtenir le quota d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_quota(
  p_user_id uuid,
  p_quota_type text
) RETURNS integer AS $$
DECLARE
  v_user_type text;
  v_user_level text;
  v_quota integer;
BEGIN
  -- Récupérer le type et niveau de l'utilisateur
  SELECT type,
         COALESCE(visitor_level, partner_tier, 'free')
  INTO v_user_type, v_user_level
  FROM users
  WHERE id = p_user_id;

  -- Déterminer le quota selon le type et niveau
  IF v_user_type = 'visitor' THEN
    IF v_user_level = 'free' THEN
      v_quota := 0; -- FREE: 0 RDV
    ELSIF v_user_level IN ('premium', 'vip') THEN
      v_quota := 10; -- VIP: 10 RDV
    ELSE
      v_quota := 0;
    END IF;

  ELSIF v_user_type = 'partner' THEN
    -- Quotas partenaires selon le tier
    IF p_quota_type = 'appointments' THEN
      CASE v_user_level
        WHEN 'museum' THEN v_quota := 20;
        WHEN 'silver' THEN v_quota := 50;
        WHEN 'gold' THEN v_quota := 100;
        WHEN 'platinium' THEN v_quota := 999999; -- Illimité
        ELSE v_quota := 20;
      END CASE;
    ELSIF p_quota_type = 'team_members' THEN
      CASE v_user_level
        WHEN 'museum' THEN v_quota := 3;
        WHEN 'silver' THEN v_quota := 5;
        WHEN 'gold' THEN v_quota := 10;
        WHEN 'platinium' THEN v_quota := 20;
        ELSE v_quota := 3;
      END CASE;
    ELSIF p_quota_type = 'media_uploads' THEN
      CASE v_user_level
        WHEN 'museum' THEN v_quota := 10;
        WHEN 'silver' THEN v_quota := 30;
        WHEN 'gold' THEN v_quota := 75;
        WHEN 'platinium' THEN v_quota := 200;
        ELSE v_quota := 10;
      END CASE;
    END IF;

  ELSIF v_user_type = 'exhibitor' THEN
    -- Quotas exposants selon la surface (à récupérer depuis exhibitor_profiles)
    DECLARE
      v_exhibitor_level text;
    BEGIN
      SELECT exhibitor_level INTO v_exhibitor_level
      FROM exhibitor_profiles
      WHERE user_id = p_user_id;

      IF p_quota_type = 'appointments' THEN
        CASE v_exhibitor_level
          WHEN 'basic_9' THEN v_quota := 15;
          WHEN 'standard_18' THEN v_quota := 40;
          WHEN 'premium_36' THEN v_quota := 100;
          WHEN 'elite_54plus' THEN v_quota := 999999; -- Illimité
          ELSE v_quota := 15;
        END CASE;
      ELSIF p_quota_type = 'team_members' THEN
        CASE v_exhibitor_level
          WHEN 'basic_9' THEN v_quota := 2;
          WHEN 'standard_18' THEN v_quota := 4;
          WHEN 'premium_36' THEN v_quota := 8;
          WHEN 'elite_54plus' THEN v_quota := 15;
          ELSE v_quota := 2;
        END CASE;
      END IF;
    END;
  ELSE
    v_quota := 0;
  END IF;

  RETURN v_quota;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Fonction pour obtenir l'usage actuel d'un quota
CREATE OR REPLACE FUNCTION get_quota_usage(
  p_user_id uuid,
  p_quota_type text,
  p_period text DEFAULT 'monthly'
) RETURNS integer AS $$
DECLARE
  v_usage integer;
BEGIN
  SELECT COALESCE(current_usage, 0) INTO v_usage
  FROM quota_usage
  WHERE user_id = p_user_id
    AND quota_type = p_quota_type
    AND period = p_period
    AND (reset_at IS NULL OR reset_at > now());

  RETURN COALESCE(v_usage, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Fonction pour vérifier si un quota est disponible
CREATE OR REPLACE FUNCTION check_quota_available(
  p_user_id uuid,
  p_quota_type text,
  p_increment integer DEFAULT 1
) RETURNS boolean AS $$
DECLARE
  v_quota integer;
  v_current_usage integer;
BEGIN
  -- Obtenir le quota limite
  v_quota := get_user_quota(p_user_id, p_quota_type);

  -- Obtenir l'usage actuel
  v_current_usage := get_quota_usage(p_user_id, p_quota_type);

  -- Vérifier si l'action est autorisée
  IF v_quota = 999999 THEN
    RETURN true; -- Illimité
  ELSIF v_current_usage + p_increment <= v_quota THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Fonction pour incrémenter un quota
CREATE OR REPLACE FUNCTION increment_quota_usage(
  p_user_id uuid,
  p_quota_type text,
  p_increment integer DEFAULT 1,
  p_period text DEFAULT 'monthly'
) RETURNS boolean AS $$
DECLARE
  v_reset_at timestamptz;
BEGIN
  -- Calculer la date de reset selon la période
  CASE p_period
    WHEN 'daily' THEN v_reset_at := date_trunc('day', now()) + interval '1 day';
    WHEN 'weekly' THEN v_reset_at := date_trunc('week', now()) + interval '1 week';
    WHEN 'monthly' THEN v_reset_at := date_trunc('month', now()) + interval '1 month';
    WHEN 'yearly' THEN v_reset_at := date_trunc('year', now()) + interval '1 year';
    ELSE v_reset_at := NULL; -- lifetime
  END CASE;

  -- Insérer ou mettre à jour l'usage
  INSERT INTO quota_usage (user_id, quota_type, current_usage, period, reset_at, updated_at)
  VALUES (p_user_id, p_quota_type, p_increment, p_period, v_reset_at, now())
  ON CONFLICT (user_id, quota_type, period)
  DO UPDATE SET
    current_usage = quota_usage.current_usage + p_increment,
    updated_at = now();

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Fonction pour reset les quotas expirés (à exécuter via CRON)
CREATE OR REPLACE FUNCTION reset_expired_quotas()
RETURNS integer AS $$
DECLARE
  v_reset_count integer;
BEGIN
  UPDATE quota_usage
  SET current_usage = 0,
      updated_at = now()
  WHERE reset_at IS NOT NULL
    AND reset_at < now()
    AND current_usage > 0;

  GET DIAGNOSTICS v_reset_count = ROW_COUNT;
  RETURN v_reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. RLS Policies pour quota_usage
ALTER TABLE quota_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quota usage"
  ON quota_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage quota usage"
  ON quota_usage FOR ALL
  USING (true)
  WITH CHECK (true);

-- 17. RLS Policies pour user_upgrades
ALTER TABLE user_upgrades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own upgrade history"
  ON user_upgrades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all upgrades"
  ON user_upgrades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

-- 18. RLS Policies pour leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leads"
  ON leads FOR SELECT
  USING (auth.uid() = scanner_id);

CREATE POLICY "Users can create leads"
  ON leads FOR INSERT
  WITH CHECK (auth.uid() = scanner_id);

CREATE POLICY "Users can update their own leads"
  ON leads FOR UPDATE
  USING (auth.uid() = scanner_id);

-- Commentaires
COMMENT ON TABLE quota_usage IS 'Tracking de l''usage des quotas par utilisateur et type';
COMMENT ON TABLE user_upgrades IS 'Historique des upgrades de niveaux/tiers utilisateurs';
COMMENT ON TABLE leads IS 'Leads générés par scan de badges et autres sources';
COMMENT ON FUNCTION get_user_quota IS 'Retourne la limite de quota pour un utilisateur';
COMMENT ON FUNCTION get_quota_usage IS 'Retourne l''usage actuel d''un quota';
COMMENT ON FUNCTION check_quota_available IS 'Vérifie si un quota est disponible avant action';
COMMENT ON FUNCTION increment_quota_usage IS 'Incrémente l''usage d''un quota';
COMMENT ON FUNCTION reset_expired_quotas IS 'Reset les quotas expirés (CRON job)';


-- [20251217000004_disable_badge_triggers.sql]
-- ========================================
-- Temporarily Disable Auto-Badge Generation Triggers
-- ========================================
-- The auto_generate_user_badge triggers are querying tables/columns
-- that don't match the actual schema (camelCase vs snake_case mismatch)
--
-- This migration disables the triggers so seed data can be inserted successfully
-- Badges can be generated manually after profiles are created
-- ========================================

-- Drop triggers that auto-generate badges (they have schema mismatches)
DROP TRIGGER IF EXISTS trigger_auto_generate_badge_on_insert ON users;
DROP TRIGGER IF EXISTS trigger_auto_generate_badge_on_update ON users;
DROP TRIGGER IF EXISTS trigger_update_badge_from_exhibitor ON exhibitors;
DROP TRIGGER IF EXISTS trigger_update_badge_from_partner ON partners;

-- Also drop similar triggers on profile tables if they were created
DROP TRIGGER IF EXISTS trigger_update_badge_from_exhibitor ON exhibitor_profiles;
DROP TRIGGER IF EXISTS trigger_update_badge_from_partner ON partner_profiles;

-- Comment explaining why triggers are disabled
COMMENT ON FUNCTION auto_generate_user_badge() IS
  'DISABLED: Auto badge generation has schema mismatches.
   Trigger attempts to query camelCase columns (userId, companyName, standNumber)
   but actual tables use snake_case (user_id, company_name).
   Generate badges manually using upsert_user_badge() function after profile creation.';


-- [20251218000000_add_user_status_column.sql]
-- Migration: ajouter la colonne `status` à la table `users`
-- Résout les triggers/migrations qui référencent `NEW.status` (erreur 42703)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Index pour accélérer les recherches par statut et les filtres d'administration
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Notes:
-- - Valeur par défaut 'active' pour ne pas bloquer l'accès des comptes existants.
-- - Si vous préférez que les comptes existants soient 'pending', exécutez:
--     UPDATE public.users SET status = 'pending' WHERE status IS NULL;


-- [20251218000001_create_exhibitor_profiles.sql]
-- Migration: créer la table `exhibitor_profiles` si elle n'existe pas
-- Date: 2025-12-17 (complément)

CREATE TABLE IF NOT EXISTS public.exhibitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  description text,
  logo_url text,
  website text,
  country text,
  sector text,
  category text,
  stand_number text,
  stand_area numeric DEFAULT 9.0 CHECK (stand_area > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes utiles
CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_user_id ON public.exhibitor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_stand_area ON public.exhibitor_profiles(stand_area);

-- Note: certaines migrations ultérieures ajoutent des colonnes dérivées
-- (ex: `exhibitor_level`). Ce fichier crée la table de base utilisée
-- par les scripts de seed et les fonctions de quota.


-- [20251218000001_create_missing_tables.sql]
-- ========================================
-- Create Missing Tables for Full Application Functionality
-- ========================================
-- Date: 2024-12-18
-- Purpose: Add 7 missing tables identified in audit
-- Tables: profile_views, downloads, minisite_views, activities,
--         notifications, visitor_levels, recommendations
-- ========================================

-- ========================================
-- 1. PROFILE_VIEWS TABLE
-- ========================================
-- Tracks who viewed whose profile (for analytics)
CREATE TABLE IF NOT EXISTS profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);

-- RLS Policies
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile view stats"
  ON profile_views FOR SELECT
  USING (auth.uid() = viewed_user_id);

CREATE POLICY "Users can create profile views"
  ON profile_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- ========================================
-- 2. DOWNLOADS TABLE
-- ========================================
-- Tracks file/document downloads (catalogs, brochures, etc.)
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('catalog', 'brochure', 'product_sheet', 'minisite', 'document')),
  entity_id uuid NOT NULL,
  file_name text,
  file_type text,
  file_url text,
  downloaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_entity ON downloads(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_downloads_date ON downloads(downloaded_at);

-- RLS Policies
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own downloads"
  ON downloads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create downloads"
  ON downloads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 3. MINISITE_VIEWS TABLE
-- ========================================
-- Tracks mini-site page views for exhibitors
CREATE TABLE IF NOT EXISTS minisite_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid NOT NULL,
  viewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  viewer_ip text,
  user_agent text,
  referrer text,
  viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_minisite_views_exhibitor ON minisite_views(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_minisite_views_viewer ON minisite_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_minisite_views_date ON minisite_views(viewed_at);

-- RLS Policies
ALTER TABLE minisite_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exhibitors can view their minisite stats"
  ON minisite_views FOR SELECT
  USING (
    exhibitor_id IN (
      SELECT id FROM exhibitors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create minisite views"
  ON minisite_views FOR INSERT
  WITH CHECK (true);

-- ========================================
-- 4. ACTIVITIES TABLE
-- ========================================
-- Activity feed/logs for user actions
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN (
    'profile_view', 'message', 'appointment', 'connection',
    'download', 'minisite_view', 'event_registration',
    'favorite_add', 'favorite_remove', 'badge_scan'
  )),
  description text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(created_at DESC);

-- RLS Policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create activities"
  ON activities FOR INSERT
  WITH CHECK (true);

-- ========================================
-- 5. NOTIFICATIONS TABLE
-- ========================================
-- User notifications system
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'info', 'success', 'warning', 'error',
    'appointment', 'message', 'connection',
    'payment', 'system'
  )),
  entity_type text,
  entity_id uuid,
  read boolean DEFAULT false,
  read_at timestamptz,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_date ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ========================================
-- 6. VISITOR_LEVELS TABLE
-- ========================================
-- Configuration table for visitor tier features/quotas
CREATE TABLE IF NOT EXISTS visitor_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL UNIQUE CHECK (level IN ('free', 'premium', 'vip')),
  name text NOT NULL,
  description text,
  price_monthly numeric DEFAULT 0,
  price_annual numeric DEFAULT 0,
  features jsonb DEFAULT '{}',
  quotas jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default visitor levels
INSERT INTO visitor_levels (level, name, description, price_monthly, price_annual, features, quotas, display_order)
VALUES
  (
    'free',
    'Pass Gratuit',
    'Accès de base au salon virtuel',
    0,
    0,
    '{"appointments": 0, "connections": 10, "minisite_views": true, "chat": true}',
    '{"appointments": 0, "connections_per_day": 10, "favorites": 20}',
    1
  ),
  (
    'vip',
    'Pass VIP Premium',
    'Accès VIP avec 10 rendez-vous B2B et tous les avantages premium - 700€ TTC',
    700.00,
    700.00,
    '{"appointments": 10, "connections": 9999, "minisite_views": true, "chat": true, "priority_support": true, "concierge": true, "private_lounge": true}',
    '{"appointments": 10, "connections_per_day": 9999, "favorites": 9999}',
    2
  ),
  (
    'premium',
    'Pass VIP Premium (alias)',
    'Alias pour le Pass VIP Premium - 700€ TTC',
    700.00,
    700.00,
    '{"appointments": 10, "connections": 9999, "minisite_views": true, "chat": true, "priority_support": true, "concierge": true, "private_lounge": true}',
    '{"appointments": 10, "connections_per_day": 9999, "favorites": 9999}',
    3
  )
ON CONFLICT (level) DO NOTHING;

-- RLS Policies (public read)
ALTER TABLE visitor_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visitor levels"
  ON visitor_levels FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can modify visitor levels"
  ON visitor_levels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- ========================================
-- 7. RECOMMENDATIONS TABLE
-- ========================================
-- AI-powered networking recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommended_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 1),
  reasons jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  is_dismissed boolean DEFAULT false,
  is_accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recommended_user_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_score ON recommendations(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(user_id, is_dismissed, is_accepted);

-- RLS Policies
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
  ON recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
  ON recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (true);

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to create activity log entry
CREATE OR REPLACE FUNCTION create_activity_log(
  p_user_id uuid,
  p_actor_id uuid,
  p_type text,
  p_description text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_id uuid;
BEGIN
  INSERT INTO activities (user_id, actor_id, type, description, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_actor_id, p_type, p_description, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, action_url, metadata)
  VALUES (p_user_id, p_title, p_message, p_type, p_entity_type, p_entity_id, p_action_url, p_metadata)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND read = false;

  RETURN v_count;
END;
$$;

-- ========================================
-- TRIGGERS
-- ========================================

-- Auto-update updated_at on visitor_levels
CREATE OR REPLACE FUNCTION update_visitor_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_visitor_levels_updated_at_trigger ON visitor_levels;
CREATE TRIGGER update_visitor_levels_updated_at_trigger
  BEFORE UPDATE ON visitor_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_visitor_levels_updated_at();

-- Auto-update updated_at on recommendations
DROP TRIGGER IF EXISTS update_recommendations_updated_at_trigger ON recommendations;
CREATE TRIGGER update_recommendations_updated_at_trigger
  BEFORE UPDATE ON recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_visitor_levels_updated_at();

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE profile_views IS 'Tracks profile view analytics for users';
COMMENT ON TABLE downloads IS 'Tracks file/document downloads for analytics';
COMMENT ON TABLE minisite_views IS 'Tracks mini-site page views for exhibitors';
COMMENT ON TABLE activities IS 'Activity feed/logs for user actions';
COMMENT ON TABLE notifications IS 'User notification system';
COMMENT ON TABLE visitor_levels IS 'Configuration for visitor tier features and quotas';
COMMENT ON TABLE recommendations IS 'AI-powered networking recommendations';

-- ========================================
-- END OF MIGRATION
-- ========================================


-- [20251218000002_create_partner_profiles.sql]
-- Migration: create partner_profiles table for seed and app usage
-- Created: 2025-12-18

CREATE TABLE IF NOT EXISTS public.partner_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  description text,
  logo_url text,
  website text,
  country text,
  partnership_level text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON public.partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_partnership_level ON public.partner_profiles(partnership_level);


-- [20251218000002_fix_chat_schema.sql]
-- ========================================
-- Fix Chat Schema - Add Missing Columns
-- ========================================
-- Date: 2024-12-18
-- Purpose: Fix schema mismatch between code expectations and database
-- Issue: Code expects receiver_id and read_at columns that don't exist
-- Solution: Add these columns while keeping read_by array for group chats
-- ========================================

-- ========================================
-- 1. ADD MISSING COLUMNS TO MESSAGES TABLE
-- ========================================

-- Add receiver_id column (for direct 1-1 messages)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS receiver_id uuid REFERENCES users(id) ON DELETE CASCADE;

-- Add read_at column (timestamp when message was read)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- ========================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, read_at)
  WHERE read_at IS NULL;

-- ========================================
-- 3. UPDATE EXISTING DATA
-- ========================================

-- For existing messages, try to infer receiver_id from conversations
-- In a direct conversation (2 participants), receiver is the other person
UPDATE messages m
SET receiver_id = (
  SELECT
    CASE
      WHEN array_length(c.participants, 1) = 2 THEN
        (SELECT unnest(c.participants)
         WHERE unnest(c.participants) != m.sender_id
         LIMIT 1)
      ELSE NULL
    END
  FROM conversations c
  WHERE c.id = m.conversation_id
)
WHERE m.receiver_id IS NULL AND m.conversation_id IS NOT NULL;

-- For messages that have been read (in read_by array), set read_at
-- Use created_at + 1 minute as approximate read time if we don't have exact timestamp
UPDATE messages m
SET read_at = m.created_at + INTERVAL '1 minute'
WHERE
  m.read_at IS NULL
  AND m.receiver_id = ANY(m.read_by)
  AND m.receiver_id IS NOT NULL;

-- ========================================
-- 4. UPDATE RLS POLICIES
-- ========================================

-- Drop old policies that might conflict
DROP POLICY IF EXISTS "Users can read messages from own conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- New comprehensive policies
CREATE POLICY "Users can read their messages (sender or receiver)"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
    OR auth.uid() = ANY(
      SELECT unnest(participants)
      FROM conversations
      WHERE id = messages.conversation_id
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      receiver_id IS NULL
      OR auth.uid() IN (
        SELECT unnest(participants)
        FROM conversations
        WHERE id = conversation_id
      )
    )
  );

CREATE POLICY "Users can update their received messages (mark as read)"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- ========================================
-- 5. HELPER FUNCTIONS FOR CHAT
-- ========================================

-- Function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_as_read(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE messages
  SET
    read_at = now(),
    read_by = array_append(
      COALESCE(read_by, ARRAY[]::uuid[]),
      auth.uid()
    )
  WHERE
    id = p_message_id
    AND receiver_id = auth.uid()
    AND read_at IS NULL;
END;
$$;

-- Function to mark all messages in conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(p_conversation_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE messages
  SET
    read_at = now(),
    read_by = array_append(
      COALESCE(read_by, ARRAY[]::uuid[]),
      auth.uid()
    )
  WHERE
    conversation_id = p_conversation_id
    AND receiver_id = auth.uid()
    AND read_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to get unread message count for user
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_count integer;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  SELECT COUNT(*)::integer INTO v_count
  FROM messages
  WHERE receiver_id = v_user_id AND read_at IS NULL;

  RETURN v_count;
END;
$$;

-- Function to send direct message (helper)
CREATE OR REPLACE FUNCTION send_direct_message(
  p_receiver_id uuid,
  p_content text,
  p_message_type text DEFAULT 'text'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id uuid;
  v_message_id uuid;
  v_sender_id uuid;
BEGIN
  v_sender_id := auth.uid();

  -- Find or create conversation between sender and receiver
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE
    type = 'direct'
    AND participants @> ARRAY[v_sender_id, p_receiver_id]
    AND participants <@ ARRAY[v_sender_id, p_receiver_id]
  LIMIT 1;

  -- Create conversation if doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (type, participants, created_by)
    VALUES ('direct', ARRAY[v_sender_id, p_receiver_id], v_sender_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  -- Insert message
  INSERT INTO messages (
    conversation_id,
    sender_id,
    receiver_id,
    content,
    message_type
  )
  VALUES (
    v_conversation_id,
    v_sender_id,
    p_receiver_id,
    p_content,
    p_message_type
  )
  RETURNING id INTO v_message_id;

  -- Update conversation last_message_at
  UPDATE conversations
  SET last_message_at = now()
  WHERE id = v_conversation_id;

  RETURN v_message_id;
END;
$$;

-- ========================================
-- 6. TRIGGERS
-- ========================================

-- Auto-add sender to read_by array when they send message
CREATE OR REPLACE FUNCTION auto_mark_sender_as_read()
RETURNS TRIGGER AS $$
BEGIN
  NEW.read_by := array_append(COALESCE(NEW.read_by, ARRAY[]::uuid[]), NEW.sender_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_mark_sender_as_read_trigger ON messages;
CREATE TRIGGER auto_mark_sender_as_read_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_sender_as_read();

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON COLUMN messages.receiver_id IS 'Direct recipient of message (for 1-1 chats)';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when message was first read by receiver';
COMMENT ON COLUMN messages.read_by IS 'Array of user IDs who have read this message (for group chats)';

-- ========================================
-- END OF MIGRATION
-- ========================================


-- [20251218000003_create_visitor_profiles.sql]
-- Migration: create visitor_profiles table for seed and app usage
-- Created: 2025-12-18

CREATE TABLE IF NOT EXISTS public.visitor_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  company text,
  position text,
  phone text,
  country text,
  visitor_type text,
  pass_type text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitor_profiles_user_id ON public.visitor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_pass_type ON public.visitor_profiles(pass_type);


-- [20251218000003_fix_rls_and_user_status.sql]
-- ========================================
-- Fix RLS Policies and Add User Status Column
-- ========================================
-- Date: 2024-12-18
-- Purpose: Fix broken RLS policies and add missing status column
-- Issues:
--   1. time_slots RLS references non-existent user_id column
--   2. users table missing status column for account management
-- ========================================

-- ========================================
-- 1. ADD STATUS COLUMN TO USERS TABLE
-- ========================================

-- Create user_status enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
  END IF;
END $$;

-- Add status column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'active';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Update existing users to 'active' status
UPDATE users
SET status = 'active'
WHERE status IS NULL;

-- ========================================
-- 2. FIX TIME_SLOTS RLS POLICIES
-- ========================================

-- Drop broken policies that reference non-existent user_id column
DROP POLICY IF EXISTS "Users can manage own slots" ON time_slots;
DROP POLICY IF EXISTS "Users can manage their own time slots" ON time_slots;
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;

-- Create correct policies using exhibitor_id
CREATE POLICY "Exhibitors can manage their own time slots"
  ON time_slots FOR ALL
  USING (
    exhibitor_id IN (
      SELECT id FROM exhibitors WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    exhibitor_id IN (
      SELECT id FROM exhibitors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view time slots"
  ON time_slots FOR SELECT
  TO authenticated
  USING (available = true);

CREATE POLICY "Public can view available time slots"
  ON time_slots FOR SELECT
  TO anon
  USING (available = true);

-- ========================================
-- 3. FIX APPOINTMENTS RLS POLICIES
-- ========================================

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Users can read own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;

-- Create comprehensive policies
CREATE POLICY "Users can view their appointments"
  ON appointments FOR SELECT
  USING (
    auth.uid() = visitor_id
    OR auth.uid() IN (
      SELECT user_id FROM exhibitors WHERE id = exhibitor_id
    )
  );

CREATE POLICY "Visitors can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = visitor_id);

CREATE POLICY "Exhibitors can update appointments"
  ON appointments FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM exhibitors WHERE id = exhibitor_id
    )
  );

CREATE POLICY "Users can cancel their own appointments"
  ON appointments FOR DELETE
  USING (
    auth.uid() = visitor_id
    OR auth.uid() IN (
      SELECT user_id FROM exhibitors WHERE id = exhibitor_id
    )
  );

-- ========================================
-- 4. ADD HELPER FUNCTIONS FOR STATUS MANAGEMENT
-- ========================================

-- Function to activate pending user
CREATE OR REPLACE FUNCTION activate_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- Only admins can activate users
  SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();
  IF v_current_user_type != 'admin' THEN
    RAISE EXCEPTION 'Only admins can activate users';
  END IF;

  UPDATE users
  SET status = 'active'
  WHERE id = p_user_id AND status = 'pending';

  -- Create notification for user
  PERFORM create_notification(
    p_user_id,
    'Compte activé',
    'Votre compte a été activé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.',
    'success',
    'user',
    p_user_id
  );
END;
$$;

-- Function to suspend user
CREATE OR REPLACE FUNCTION suspend_user(
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- Only admins can suspend users
  SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();
  IF v_current_user_type != 'admin' THEN
    RAISE EXCEPTION 'Only admins can suspend users';
  END IF;

  UPDATE users
  SET status = 'suspended'
  WHERE id = p_user_id;

  -- Create notification for user
  PERFORM create_notification(
    p_user_id,
    'Compte suspendu',
    COALESCE(
      'Votre compte a été suspendu. Raison: ' || p_reason,
      'Votre compte a été suspendu. Veuillez contacter le support.'
    ),
    'warning',
    'user',
    p_user_id
  );
END;
$$;

-- Function to reject user application
CREATE OR REPLACE FUNCTION reject_user(
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- Only admins can reject users
  SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();
  IF v_current_user_type != 'admin' THEN
    RAISE EXCEPTION 'Only admins can reject users';
  END IF;

  UPDATE users
  SET status = 'rejected'
  WHERE id = p_user_id;

  -- Create notification for user
  PERFORM create_notification(
    p_user_id,
    'Candidature rejetée',
    COALESCE(
      'Votre candidature a été rejetée. Raison: ' || p_reason,
      'Votre candidature a été rejetée. Veuillez contacter le support pour plus d\'informations.'
    ),
    'error',
    'user',
    p_user_id
  );
END;
$$;

-- Function to check if user is active
CREATE OR REPLACE FUNCTION is_user_active(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status user_status;
BEGIN
  SELECT status INTO v_status FROM users WHERE id = p_user_id;
  RETURN v_status = 'active';
END;
$$;

-- ========================================
-- 5. UPDATE EXISTING RLS POLICIES TO CHECK STATUS
-- ========================================

-- Add status check to users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Active users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id AND status = 'active')
  WITH CHECK (auth.uid() = id AND status = 'active');

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'
    )
  );

CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- ========================================
-- 6. ADD STATUS VALIDATION TRIGGER
-- ========================================

-- Prevent status changes from non-admins
CREATE OR REPLACE FUNCTION validate_user_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- If status is being changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Check if current user is admin
    SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();

    -- Only admins or the user themselves (for specific transitions) can change status
    IF v_current_user_type != 'admin' AND auth.uid() != NEW.id THEN
      RAISE EXCEPTION 'Only admins can change user status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_user_status_change_trigger ON users;
CREATE TRIGGER validate_user_status_change_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_status_change();

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON COLUMN users.status IS 'Account status: pending (awaiting approval), active (can use platform), suspended (temporarily blocked), rejected (denied access)';
COMMENT ON FUNCTION activate_user(uuid) IS 'Activate a pending user account (admin only)';
COMMENT ON FUNCTION suspend_user(uuid, text) IS 'Suspend a user account (admin only)';
COMMENT ON FUNCTION reject_user(uuid, text) IS 'Reject a user application (admin only)';

-- ========================================
-- END OF MIGRATION
-- ========================================


-- [20251218000004_add_foreign_keys_and_fix_types.sql]
-- ========================================
-- Add Missing Foreign Keys and Fix Type Mismatches
-- ========================================
-- Date: 2024-12-18
-- Purpose: Add referential integrity constraints and fix type inconsistencies
-- ========================================

-- ========================================
-- 1. ADD MISSING FOREIGN KEYS TO EVENTS TABLE
-- ========================================

-- Add foreign key for pavilion_id
ALTER TABLE events
DROP CONSTRAINT IF EXISTS events_pavilion_id_fkey;

ALTER TABLE events
ADD CONSTRAINT events_pavilion_id_fkey
FOREIGN KEY (pavilion_id)
REFERENCES pavilions(id)
ON DELETE SET NULL;

-- Add foreign key for organizer_id
ALTER TABLE events
DROP CONSTRAINT IF EXISTS events_organizer_id_fkey;

ALTER TABLE events
ADD CONSTRAINT events_organizer_id_fkey
FOREIGN KEY (organizer_id)
REFERENCES users(id)
ON DELETE SET NULL;

-- ========================================
-- 2. UPDATE VISITOR_LEVEL ENUM (Remove 'basic')
-- ========================================

-- Note: visitor_level in users table should only have: free, premium, vip
-- The TypeScript type was including 'basic' which doesn't exist in DB

-- Verify and update any 'basic' values to 'free' (shouldn't exist but just in case)
UPDATE users
SET visitor_level = 'free'
WHERE visitor_level = 'basic';

-- ========================================
-- 3. ADD CONSISTENCY CHECKS
-- ========================================

-- Ensure visitor_profiles.pass_type syncs with users.visitor_level
CREATE OR REPLACE FUNCTION sync_visitor_level_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- When users.visitor_level changes, update visitor_profiles.pass_type
  IF OLD.visitor_level IS DISTINCT FROM NEW.visitor_level THEN
    UPDATE visitor_profiles
    SET pass_type = NEW.visitor_level
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_visitor_level_trigger ON users;
CREATE TRIGGER sync_visitor_level_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.visitor_level IS DISTINCT FROM NEW.visitor_level)
  EXECUTE FUNCTION sync_visitor_level_to_profile();

-- Ensure partner_profiles.partnership_level syncs with users.partner_tier
CREATE OR REPLACE FUNCTION sync_partner_tier_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- When users.partner_tier changes, update partner_profiles.partnership_level
  IF OLD.partner_tier IS DISTINCT FROM NEW.partner_tier THEN
    UPDATE partner_profiles
    SET partnership_level = NEW.partner_tier
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_partner_tier_trigger ON users;
CREATE TRIGGER sync_partner_tier_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.partner_tier IS DISTINCT FROM NEW.partner_tier)
  EXECUTE FUNCTION sync_partner_tier_to_profile();

-- ========================================
-- 4. ADD INDEXES FOR FOREIGN KEYS (Performance)
-- ========================================

CREATE INDEX IF NOT EXISTS idx_events_pavilion ON events(pavilion_id)
  WHERE pavilion_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id)
  WHERE organizer_id IS NOT NULL;

-- ========================================
-- 5. DATA VALIDATION CONSTRAINTS
-- ========================================

-- Ensure email format is valid (basic check)
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_email_format_check;

ALTER TABLE users
ADD CONSTRAINT users_email_format_check
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure dates are logical for events
ALTER TABLE events
DROP CONSTRAINT IF EXISTS events_dates_logical_check;

ALTER TABLE events
ADD CONSTRAINT events_dates_logical_check
CHECK (end_date >= start_date);

-- Ensure capacity is positive
ALTER TABLE events
DROP CONSTRAINT IF EXISTS events_capacity_positive_check;

ALTER TABLE events
ADD CONSTRAINT events_capacity_positive_check
CHECK (capacity IS NULL OR capacity > 0);

-- Ensure registered doesn't exceed capacity
ALTER TABLE events
DROP CONSTRAINT IF EXISTS events_registered_valid_check;

ALTER TABLE events
ADD CONSTRAINT events_registered_valid_check
CHECK (
  capacity IS NULL
  OR registered IS NULL
  OR registered <= capacity
);

-- ========================================
-- 6. ADD HELPER VIEWS FOR COMMON QUERIES
-- ========================================

-- View: Active users with full profile data
CREATE OR REPLACE VIEW active_users_with_profiles AS
SELECT
  u.id,
  u.email,
  u.name,
  u.type,
  u.status,
  u.visitor_level,
  u.partner_tier,
  u.profile,
  CASE
    WHEN u.type = 'visitor' THEN row_to_json(vp.*)
    WHEN u.type = 'partner' THEN row_to_json(pp.*)
    WHEN u.type = 'exhibitor' THEN row_to_json(ep.*)
    ELSE NULL
  END as full_profile,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN visitor_profiles vp ON u.id = vp.user_id
LEFT JOIN partner_profiles pp ON u.id = pp.user_id
LEFT JOIN exhibitor_profiles ep ON u.id = ep.user_id
WHERE u.status = 'active';

-- View: Upcoming events with organizer info
CREATE OR REPLACE VIEW upcoming_events AS
SELECT
  e.*,
  u.name as organizer_name,
  u.email as organizer_email,
  p.name as pavilion_name
FROM events e
LEFT JOIN users u ON e.organizer_id = u.id
LEFT JOIN pavilions p ON e.pavilion_id = p.id
WHERE e.start_date > now()
ORDER BY e.start_date ASC;

-- View: User connection network
CREATE OR REPLACE VIEW user_connections_view AS
SELECT
  c.id,
  c.requester_id,
  c.addressee_id,
  c.status,
  c.created_at,
  u1.name as requester_name,
  u1.email as requester_email,
  u1.type as requester_type,
  u2.name as addressee_name,
  u2.email as addressee_email,
  u2.type as addressee_type
FROM connections c
JOIN users u1 ON c.requester_id = u1.id
JOIN users u2 ON c.addressee_id = u2.id
WHERE c.status = 'accepted';

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON CONSTRAINT events_pavilion_id_fkey ON events IS 'Events can be associated with a pavilion';
COMMENT ON CONSTRAINT events_organizer_id_fkey ON events IS 'Events have an organizer (user)';
COMMENT ON VIEW active_users_with_profiles IS 'Active users with their complete profile data';
COMMENT ON VIEW upcoming_events IS 'Future events with organizer and pavilion information';
COMMENT ON VIEW user_connections_view IS 'Accepted connections between users with full details';

-- ========================================
-- END OF MIGRATION
-- ========================================


-- [20251218000004_add_user_role_type_columns.sql]
-- Migration: add missing user columns used by seed_test_data.sql
-- Created: 2025-12-18

-- Add simple text columns if they don't exist so seeds can run
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS visitor_level text,
  ADD COLUMN IF NOT EXISTS partner_tier text;

-- Indexes to speed lookups by role/type
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_type ON public.users(type);


-- [20251218000005_add_users_status_columns.sql]
-- Migration: add users is_active, email_verified, created_at columns used by seed
-- Created: 2025-12-18

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users(email_verified);


-- [20251218000006_add_users_name_default.sql]
-- Migration: ensure users.name has a sensible default so seed inserts without 'name' succeed
-- Created: 2025-12-18

-- Add column if missing (nullable at first to avoid failures)
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS name text;

-- Set existing NULL names to empty string
UPDATE public.users SET name = '' WHERE name IS NULL;

-- Set a default so future INSERTs that omit `name` get '' instead of NULL
ALTER TABLE IF EXISTS public.users ALTER COLUMN name SET DEFAULT '';

-- Keep NOT NULL constraint if desired; here we make it NOT NULL to match intended model
ALTER TABLE IF EXISTS public.users ALTER COLUMN name SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);


-- [20251218000007_create_safe_jsonb_function.sql]
-- Migration: create safe_jsonb(text) helper to safely cast text to jsonb
-- Created: 2025-12-18

CREATE OR REPLACE FUNCTION public.safe_jsonb(input_text text)
RETURNS jsonb AS $$
BEGIN
  IF input_text IS NULL OR input_text = '' THEN
    RETURN '{}'::jsonb;
  END IF;
  BEGIN
    RETURN input_text::jsonb;
  EXCEPTION WHEN others THEN
    -- If parsing fails, return empty object to avoid trigger errors
    RETURN '{}'::jsonb;
  END;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

COMMENT ON FUNCTION public.safe_jsonb(text) IS 'Safely convert text to jsonb; returns {} on error';


-- [20251218100001_create_missing_tables_safe.sql]
-- ========================================
-- Create Missing Tables - SAFE VERSION
-- ========================================
-- Date: 2024-12-18
-- Purpose: Add 7 missing tables with safe checks
-- ========================================

-- ========================================
-- 1. PROFILE_VIEWS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profile_views'
    AND policyname = 'Users can view their own profile view stats'
  ) THEN
    CREATE POLICY "Users can view their own profile view stats"
      ON profile_views FOR SELECT
      USING (auth.uid() = viewed_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profile_views'
    AND policyname = 'Users can create profile views'
  ) THEN
    CREATE POLICY "Users can create profile views"
      ON profile_views FOR INSERT
      WITH CHECK (auth.uid() = viewer_id);
  END IF;
END $$;

-- ========================================
-- 2. DOWNLOADS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('catalog', 'brochure', 'product_sheet', 'minisite', 'document')),
  entity_id uuid NOT NULL,
  file_name text,
  file_type text,
  file_url text,
  downloaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_entity ON downloads(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_downloads_date ON downloads(downloaded_at);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'downloads'
    AND policyname = 'Users can view their own downloads'
  ) THEN
    CREATE POLICY "Users can view their own downloads"
      ON downloads FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'downloads'
    AND policyname = 'Users can create downloads'
  ) THEN
    CREATE POLICY "Users can create downloads"
      ON downloads FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ========================================
-- 3. MINISITE_VIEWS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS minisite_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid NOT NULL,
  viewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  viewer_ip text,
  user_agent text,
  referrer text,
  viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_minisite_views_exhibitor ON minisite_views(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_minisite_views_viewer ON minisite_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_minisite_views_date ON minisite_views(viewed_at);

ALTER TABLE minisite_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'minisite_views'
    AND policyname = 'Anyone can create minisite views'
  ) THEN
    CREATE POLICY "Anyone can create minisite views"
      ON minisite_views FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- 4. ACTIVITIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN (
    'profile_view', 'message', 'appointment', 'connection',
    'download', 'minisite_view', 'event_registration',
    'favorite_add', 'favorite_remove', 'badge_scan'
  )),
  description text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(created_at DESC);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'activities'
    AND policyname = 'Users can view their own activities'
  ) THEN
    CREATE POLICY "Users can view their own activities"
      ON activities FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'activities'
    AND policyname = 'System can create activities'
  ) THEN
    CREATE POLICY "System can create activities"
      ON activities FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- 5. NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'info', 'success', 'warning', 'error',
    'appointment', 'message', 'connection',
    'payment', 'system'
  )),
  entity_type text,
  entity_id uuid,
  read boolean DEFAULT false,
  read_at timestamptz,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_date ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications'
    AND policyname = 'Users can view their own notifications'
  ) THEN
    CREATE POLICY "Users can view their own notifications"
      ON notifications FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications'
    AND policyname = 'Users can update their own notifications'
  ) THEN
    CREATE POLICY "Users can update their own notifications"
      ON notifications FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications'
    AND policyname = 'System can create notifications'
  ) THEN
    CREATE POLICY "System can create notifications"
      ON notifications FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- 6. VISITOR_LEVELS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS visitor_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL UNIQUE CHECK (level IN ('free', 'premium', 'vip')),
  name text NOT NULL,
  description text,
  price_monthly numeric DEFAULT 0,
  price_annual numeric DEFAULT 0,
  features jsonb DEFAULT '{}',
  quotas jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default levels only if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM visitor_levels) THEN
    INSERT INTO visitor_levels (level, name, description, price_monthly, price_annual, features, quotas, display_order)
    VALUES
      ('free', 'Pass Gratuit', 'Accès de base au salon virtuel', 0, 0,
       '{"appointments": 5, "connections": 10, "minisite_views": true, "chat": true}',
       '{"appointments": 5, "connections_per_day": 10, "favorites": 20}', 1),
      ('premium', 'Pass Premium', 'Accès étendu avec plus de rendez-vous', 29.99, 299.99,
       '{"appointments": 15, "connections": 30, "minisite_views": true, "chat": true, "priority_support": true}',
       '{"appointments": 15, "connections_per_day": 30, "favorites": 50}', 2),
      ('vip', 'Pass VIP', 'Accès illimité avec tous les avantages', 99.99, 999.99,
       '{"appointments": 9999, "connections": 9999, "minisite_views": true, "chat": true, "priority_support": true, "concierge": true}',
       '{"appointments": 9999, "connections_per_day": 9999, "favorites": 9999}', 3);
  END IF;
END $$;

ALTER TABLE visitor_levels ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'visitor_levels'
    AND policyname = 'Anyone can view visitor levels'
  ) THEN
    CREATE POLICY "Anyone can view visitor levels"
      ON visitor_levels FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

-- ========================================
-- 7. RECOMMENDATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommended_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 1),
  reasons jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  is_dismissed boolean DEFAULT false,
  is_accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recommended_user_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_score ON recommendations(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(user_id, is_dismissed, is_accepted);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recommendations'
    AND policyname = 'Users can view their own recommendations'
  ) THEN
    CREATE POLICY "Users can view their own recommendations"
      ON recommendations FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recommendations'
    AND policyname = 'Users can update their own recommendations'
  ) THEN
    CREATE POLICY "Users can update their own recommendations"
      ON recommendations FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recommendations'
    AND policyname = 'System can create recommendations'
  ) THEN
    CREATE POLICY "System can create recommendations"
      ON recommendations FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- FUNCTIONS (only create if notifications table exists)
-- ========================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, action_url, metadata)
  VALUES (p_user_id, p_title, p_message, p_type, p_entity_type, p_entity_id, p_action_url, p_metadata)
  RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND read = false;
  RETURN v_count;
END;
$$;

COMMENT ON TABLE profile_views IS 'Tracks profile view analytics';
COMMENT ON TABLE downloads IS 'Tracks file/document downloads';
COMMENT ON TABLE minisite_views IS 'Tracks mini-site page views';
COMMENT ON TABLE activities IS 'Activity feed/logs';
COMMENT ON TABLE notifications IS 'User notification system';
COMMENT ON TABLE visitor_levels IS 'Visitor tier configuration';
COMMENT ON TABLE recommendations IS 'AI networking recommendations';


-- [20251218100002_fix_chat_schema_safe.sql]
-- ========================================
-- Fix Chat Schema - Add Missing Columns (SAFE VERSION)
-- ========================================
-- Date: 2024-12-18
-- Purpose: Fix schema mismatch between code expectations and database
-- Issue: Code expects receiver_id and read_at columns that don't exist
-- Solution: Add these columns while keeping read_by array for group chats
-- ========================================

-- ========================================
-- 1. ADD MISSING COLUMNS TO MESSAGES TABLE
-- ========================================

-- Add receiver_id column (for direct 1-1 messages)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS receiver_id uuid REFERENCES users(id) ON DELETE CASCADE;

-- Add read_at column (timestamp when message was read)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- ========================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, read_at)
  WHERE read_at IS NULL;

-- ========================================
-- 3. UPDATE EXISTING DATA (SAFELY)
-- ========================================

-- For existing messages, try to infer receiver_id from conversations
-- In a direct conversation (2 participants), receiver is the other person
DO $$
BEGIN
  UPDATE messages m
  SET receiver_id = (
    SELECT
      CASE
        WHEN array_length(c.participants, 1) = 2 THEN
          (SELECT unnest(c.participants)
           WHERE unnest(c.participants) != m.sender_id
           LIMIT 1)
        ELSE NULL
      END
    FROM conversations c
    WHERE c.id = m.conversation_id
  )
  WHERE m.receiver_id IS NULL AND m.conversation_id IS NOT NULL;
END $$;

-- For messages that have been read (in read_by array), set read_at
-- Use created_at + 1 minute as approximate read time if we don't have exact timestamp
DO $$
BEGIN
  UPDATE messages m
  SET read_at = m.created_at + INTERVAL '1 minute'
  WHERE
    m.read_at IS NULL
    AND m.receiver_id = ANY(m.read_by)
    AND m.receiver_id IS NOT NULL;
END $$;

-- ========================================
-- 4. UPDATE RLS POLICIES (SAFELY)
-- ========================================

-- Drop old policies that might conflict
DROP POLICY IF EXISTS "Users can read messages from own conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can read their messages (sender or receiver)" ON messages;
DROP POLICY IF EXISTS "Users can update their received messages (mark as read)" ON messages;

-- New comprehensive policies (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages'
    AND policyname = 'Users can read their messages (sender or receiver)'
  ) THEN
    CREATE POLICY "Users can read their messages (sender or receiver)"
      ON messages FOR SELECT
      USING (
        auth.uid() = sender_id
        OR auth.uid() = receiver_id
        OR auth.uid() = ANY(
          SELECT unnest(participants)
          FROM conversations
          WHERE id = messages.conversation_id
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages'
    AND policyname = 'Users can send messages'
  ) THEN
    CREATE POLICY "Users can send messages"
      ON messages FOR INSERT
      WITH CHECK (
        auth.uid() = sender_id
        AND (
          receiver_id IS NULL
          OR auth.uid() IN (
            SELECT unnest(participants)
            FROM conversations
            WHERE id = conversation_id
          )
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages'
    AND policyname = 'Users can update their received messages (mark as read)'
  ) THEN
    CREATE POLICY "Users can update their received messages (mark as read)"
      ON messages FOR UPDATE
      USING (auth.uid() = receiver_id)
      WITH CHECK (auth.uid() = receiver_id);
  END IF;
END $$;

-- ========================================
-- 5. HELPER FUNCTIONS FOR CHAT
-- ========================================

-- Function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_as_read(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE messages
  SET
    read_at = now(),
    read_by = array_append(
      COALESCE(read_by, ARRAY[]::uuid[]),
      auth.uid()
    )
  WHERE
    id = p_message_id
    AND receiver_id = auth.uid()
    AND read_at IS NULL;
END;
$$;

-- Function to mark all messages in conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(p_conversation_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE messages
  SET
    read_at = now(),
    read_by = array_append(
      COALESCE(read_by, ARRAY[]::uuid[]),
      auth.uid()
    )
  WHERE
    conversation_id = p_conversation_id
    AND receiver_id = auth.uid()
    AND read_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to get unread message count for user
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_count integer;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  SELECT COUNT(*)::integer INTO v_count
  FROM messages
  WHERE receiver_id = v_user_id AND read_at IS NULL;

  RETURN v_count;
END;
$$;

-- Function to send direct message (helper)
CREATE OR REPLACE FUNCTION send_direct_message(
  p_receiver_id uuid,
  p_content text,
  p_message_type text DEFAULT 'text'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id uuid;
  v_message_id uuid;
  v_sender_id uuid;
BEGIN
  v_sender_id := auth.uid();

  -- Find or create conversation between sender and receiver
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE
    type = 'direct'
    AND participants @> ARRAY[v_sender_id, p_receiver_id]
    AND participants <@ ARRAY[v_sender_id, p_receiver_id]
  LIMIT 1;

  -- Create conversation if doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (type, participants, created_by)
    VALUES ('direct', ARRAY[v_sender_id, p_receiver_id], v_sender_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  -- Insert message
  INSERT INTO messages (
    conversation_id,
    sender_id,
    receiver_id,
    content,
    message_type
  )
  VALUES (
    v_conversation_id,
    v_sender_id,
    p_receiver_id,
    p_content,
    p_message_type
  )
  RETURNING id INTO v_message_id;

  -- Update conversation last_message_at
  UPDATE conversations
  SET last_message_at = now()
  WHERE id = v_conversation_id;

  RETURN v_message_id;
END;
$$;

-- ========================================
-- 6. TRIGGERS
-- ========================================

-- Auto-add sender to read_by array when they send message
CREATE OR REPLACE FUNCTION auto_mark_sender_as_read()
RETURNS TRIGGER AS $$
BEGIN
  NEW.read_by := array_append(COALESCE(NEW.read_by, ARRAY[]::uuid[]), NEW.sender_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_mark_sender_as_read_trigger ON messages;
CREATE TRIGGER auto_mark_sender_as_read_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_sender_as_read();

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON COLUMN messages.receiver_id IS 'Direct recipient of message (for 1-1 chats)';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when message was first read by receiver';
COMMENT ON COLUMN messages.read_by IS 'Array of user IDs who have read this message (for group chats)';

-- ========================================
-- END OF MIGRATION
-- ========================================


-- [20251218100003_fix_rls_and_user_status_safe.sql]
-- ========================================
-- Fix RLS Policies and Add User Status Column (SAFE VERSION)
-- ========================================
-- Date: 2024-12-18
-- Purpose: Fix broken RLS policies and add missing status column
-- Issues:
--   1. time_slots RLS references non-existent user_id column
--   2. users table missing status column for account management
-- ========================================

-- ========================================
-- 1. ADD STATUS COLUMN TO USERS TABLE
-- ========================================

-- Create user_status enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
  END IF;
END $$;

-- Add status column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'active';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Update existing users to 'active' status
DO $$
BEGIN
  UPDATE users
  SET status = 'active'
  WHERE status IS NULL;
END $$;

-- ========================================
-- 2. FIX TIME_SLOTS RLS POLICIES
-- ========================================

-- Drop broken policies that reference non-existent user_id column
DROP POLICY IF EXISTS "Users can manage own slots" ON time_slots;
DROP POLICY IF EXISTS "Users can manage their own time slots" ON time_slots;
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can manage their own time slots" ON time_slots;
DROP POLICY IF EXISTS "Authenticated users can view time slots" ON time_slots;
DROP POLICY IF EXISTS "Public can view available time slots" ON time_slots;

-- Create correct policies using exhibitor_id (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'time_slots'
    AND policyname = 'Exhibitors can manage their own time slots'
  ) THEN
    CREATE POLICY "Exhibitors can manage their own time slots"
      ON time_slots FOR ALL
      USING (
        exhibitor_id IN (
          SELECT id FROM exhibitors WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        exhibitor_id IN (
          SELECT id FROM exhibitors WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'time_slots'
    AND policyname = 'Authenticated users can view time slots'
  ) THEN
    CREATE POLICY "Authenticated users can view time slots"
      ON time_slots FOR SELECT
      TO authenticated
      USING (available = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'time_slots'
    AND policyname = 'Public can view available time slots'
  ) THEN
    CREATE POLICY "Public can view available time slots"
      ON time_slots FOR SELECT
      TO anon
      USING (available = true);
  END IF;
END $$;

-- ========================================
-- 3. FIX APPOINTMENTS RLS POLICIES
-- ========================================

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Users can read own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Visitors can create appointments" ON appointments;
DROP POLICY IF EXISTS "Exhibitors can update appointments" ON appointments;
DROP POLICY IF EXISTS "Users can cancel their own appointments" ON appointments;

-- Create comprehensive policies (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'appointments'
    AND policyname = 'Users can view their appointments'
  ) THEN
    CREATE POLICY "Users can view their appointments"
      ON appointments FOR SELECT
      USING (
        auth.uid() = visitor_id
        OR auth.uid() IN (
          SELECT user_id FROM exhibitors WHERE id = exhibitor_id
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'appointments'
    AND policyname = 'Visitors can create appointments'
  ) THEN
    CREATE POLICY "Visitors can create appointments"
      ON appointments FOR INSERT
      WITH CHECK (auth.uid() = visitor_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'appointments'
    AND policyname = 'Exhibitors can update appointments'
  ) THEN
    CREATE POLICY "Exhibitors can update appointments"
      ON appointments FOR UPDATE
      USING (
        auth.uid() IN (
          SELECT user_id FROM exhibitors WHERE id = exhibitor_id
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'appointments'
    AND policyname = 'Users can cancel their own appointments'
  ) THEN
    CREATE POLICY "Users can cancel their own appointments"
      ON appointments FOR DELETE
      USING (
        auth.uid() = visitor_id
        OR auth.uid() IN (
          SELECT user_id FROM exhibitors WHERE id = exhibitor_id
        )
      );
  END IF;
END $$;

-- ========================================
-- 4. ADD HELPER FUNCTIONS FOR STATUS MANAGEMENT
-- ========================================

-- Function to activate pending user
CREATE OR REPLACE FUNCTION activate_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- Only admins can activate users
  SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();
  IF v_current_user_type != 'admin' THEN
    RAISE EXCEPTION 'Only admins can activate users';
  END IF;

  UPDATE users
  SET status = 'active'
  WHERE id = p_user_id AND status = 'pending';

  -- Create notification for user (only if create_notification exists)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_notification') THEN
    PERFORM create_notification(
      p_user_id,
      'Compte activé',
      'Votre compte a été activé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.',
      'success',
      'user',
      p_user_id
    );
  END IF;
END;
$$;

-- Function to suspend user
CREATE OR REPLACE FUNCTION suspend_user(
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- Only admins can suspend users
  SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();
  IF v_current_user_type != 'admin' THEN
    RAISE EXCEPTION 'Only admins can suspend users';
  END IF;

  UPDATE users
  SET status = 'suspended'
  WHERE id = p_user_id;

  -- Create notification for user (only if create_notification exists)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_notification') THEN
    PERFORM create_notification(
      p_user_id,
      'Compte suspendu',
      COALESCE(
        'Votre compte a été suspendu. Raison: ' || p_reason,
        'Votre compte a été suspendu. Veuillez contacter le support.'
      ),
      'warning',
      'user',
      p_user_id
    );
  END IF;
END;
$$;

-- Function to reject user application
CREATE OR REPLACE FUNCTION reject_user(
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- Only admins can reject users
  SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();
  IF v_current_user_type != 'admin' THEN
    RAISE EXCEPTION 'Only admins can reject users';
  END IF;

  UPDATE users
  SET status = 'rejected'
  WHERE id = p_user_id;

  -- Create notification for user (only if create_notification exists)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_notification') THEN
    PERFORM create_notification(
      p_user_id,
      'Candidature rejetée',
      COALESCE(
        'Votre candidature a été rejetée. Raison: ' || p_reason,
        'Votre candidature a été rejetée. Veuillez contacter le support pour plus d''informations.'
      ),
      'error',
      'user',
      p_user_id
    );
  END IF;
END;
$$;

-- Function to check if user is active
CREATE OR REPLACE FUNCTION is_user_active(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status user_status;
BEGIN
  SELECT status INTO v_status FROM users WHERE id = p_user_id;
  RETURN v_status = 'active';
END;
$$;

-- ========================================
-- 5. UPDATE EXISTING RLS POLICIES TO CHECK STATUS
-- ========================================

-- Add status check to users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Active users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users'
    AND policyname = 'Users can view their own data'
  ) THEN
    CREATE POLICY "Users can view their own data"
      ON users FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users'
    AND policyname = 'Active users can update their own data'
  ) THEN
    CREATE POLICY "Active users can update their own data"
      ON users FOR UPDATE
      USING (auth.uid() = id AND status = 'active')
      WITH CHECK (auth.uid() = id AND status = 'active');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users'
    AND policyname = 'Admins can view all users'
  ) THEN
    CREATE POLICY "Admins can view all users"
      ON users FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users'
    AND policyname = 'Admins can update any user'
  ) THEN
    CREATE POLICY "Admins can update any user"
      ON users FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'
        )
      );
  END IF;
END $$;

-- ========================================
-- 6. ADD STATUS VALIDATION TRIGGER
-- ========================================

-- Prevent status changes from non-admins
CREATE OR REPLACE FUNCTION validate_user_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- If status is being changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Check if current user is admin
    SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();

    -- Only admins or the user themselves (for specific transitions) can change status
    IF v_current_user_type != 'admin' AND auth.uid() != NEW.id THEN
      RAISE EXCEPTION 'Only admins can change user status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_user_status_change_trigger ON users;
CREATE TRIGGER validate_user_status_change_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_status_change();

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON COLUMN users.status IS 'Account status: pending (awaiting approval), active (can use platform), suspended (temporarily blocked), rejected (denied access)';
COMMENT ON FUNCTION activate_user(uuid) IS 'Activate a pending user account (admin only)';
COMMENT ON FUNCTION suspend_user(uuid, text) IS 'Suspend a user account (admin only)';
COMMENT ON FUNCTION reject_user(uuid, text) IS 'Reject a user application (admin only)';

-- ========================================
-- END OF MIGRATION
-- ========================================


-- [20251218100004_add_foreign_keys_safe.sql]
-- ========================================
-- Add Missing Foreign Keys and Fix Type Mismatches (SAFE VERSION)
-- ========================================
-- Date: 2024-12-18
-- Purpose: Add referential integrity constraints and fix type inconsistencies
-- ========================================

-- ========================================
-- 1. ADD MISSING FOREIGN KEYS TO EVENTS TABLE
-- ========================================

-- Add foreign key for pavilion_id (safely)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'events_pavilion_id_fkey'
  ) THEN
    ALTER TABLE events
    ADD CONSTRAINT events_pavilion_id_fkey
    FOREIGN KEY (pavilion_id)
    REFERENCES pavilions(id)
    ON DELETE SET NULL;
  ELSE
    -- Drop and recreate to ensure correct definition
    ALTER TABLE events DROP CONSTRAINT IF EXISTS events_pavilion_id_fkey;
    ALTER TABLE events
    ADD CONSTRAINT events_pavilion_id_fkey
    FOREIGN KEY (pavilion_id)
    REFERENCES pavilions(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key for organizer_id (safely)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'events_organizer_id_fkey'
  ) THEN
    ALTER TABLE events
    ADD CONSTRAINT events_organizer_id_fkey
    FOREIGN KEY (organizer_id)
    REFERENCES users(id)
    ON DELETE SET NULL;
  ELSE
    -- Drop and recreate to ensure correct definition
    ALTER TABLE events DROP CONSTRAINT IF EXISTS events_organizer_id_fkey;
    ALTER TABLE events
    ADD CONSTRAINT events_organizer_id_fkey
    FOREIGN KEY (organizer_id)
    REFERENCES users(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- ========================================
-- 2. UPDATE VISITOR_LEVEL ENUM (Remove 'basic')
-- ========================================

-- Note: visitor_level in users table should only have: free, premium, vip
-- The TypeScript type was including 'basic' which doesn't exist in DB

-- Verify and update any 'basic' values to 'free' (shouldn't exist but just in case)
DO $$
BEGIN
  UPDATE users
  SET visitor_level = 'free'
  WHERE visitor_level = 'basic';
EXCEPTION WHEN OTHERS THEN
  -- If error (e.g., 'basic' is not a valid value), ignore
  NULL;
END $$;

-- ========================================
-- 3. ADD CONSISTENCY CHECKS
-- ========================================

-- Ensure visitor_profiles.pass_type syncs with users.visitor_level
CREATE OR REPLACE FUNCTION sync_visitor_level_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- When users.visitor_level changes, update visitor_profiles.pass_type
  IF OLD.visitor_level IS DISTINCT FROM NEW.visitor_level THEN
    UPDATE visitor_profiles
    SET pass_type = NEW.visitor_level
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_visitor_level_trigger ON users;
CREATE TRIGGER sync_visitor_level_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.visitor_level IS DISTINCT FROM NEW.visitor_level)
  EXECUTE FUNCTION sync_visitor_level_to_profile();

-- Ensure partner_profiles.partnership_level syncs with users.partner_tier
CREATE OR REPLACE FUNCTION sync_partner_tier_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- When users.partner_tier changes, update partner_profiles.partnership_level
  IF OLD.partner_tier IS DISTINCT FROM NEW.partner_tier THEN
    UPDATE partner_profiles
    SET partnership_level = NEW.partner_tier
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_partner_tier_trigger ON users;
CREATE TRIGGER sync_partner_tier_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.partner_tier IS DISTINCT FROM NEW.partner_tier)
  EXECUTE FUNCTION sync_partner_tier_to_profile();

-- ========================================
-- 4. ADD INDEXES FOR FOREIGN KEYS (Performance)
-- ========================================

CREATE INDEX IF NOT EXISTS idx_events_pavilion ON events(pavilion_id)
  WHERE pavilion_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id)
  WHERE organizer_id IS NOT NULL;

-- ========================================
-- 5. DATA VALIDATION CONSTRAINTS (SAFELY)
-- ========================================

-- Ensure email format is valid (basic check)
DO $$
BEGIN
  ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_email_format_check;

  ALTER TABLE users
  ADD CONSTRAINT users_email_format_check
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
EXCEPTION WHEN OTHERS THEN
  -- Ignore if constraint cannot be added (might have invalid existing data)
  RAISE NOTICE 'Could not add email format constraint - may have invalid existing data';
END $$;

-- Ensure dates are logical for events
DO $$
BEGIN
  ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_dates_logical_check;

  ALTER TABLE events
  ADD CONSTRAINT events_dates_logical_check
  CHECK (end_date >= start_date);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add events dates constraint - may have invalid existing data';
END $$;

-- Ensure capacity is positive
DO $$
BEGIN
  ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_capacity_positive_check;

  ALTER TABLE events
  ADD CONSTRAINT events_capacity_positive_check
  CHECK (capacity IS NULL OR capacity > 0);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add events capacity constraint - may have invalid existing data';
END $$;

-- Ensure registered doesn't exceed capacity
DO $$
BEGIN
  ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_registered_valid_check;

  ALTER TABLE events
  ADD CONSTRAINT events_registered_valid_check
  CHECK (
    capacity IS NULL
    OR registered IS NULL
    OR registered <= capacity
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add events registered constraint - may have invalid existing data';
END $$;

-- ========================================
-- 6. ADD HELPER VIEWS FOR COMMON QUERIES
-- ========================================

-- View: Active users with full profile data
CREATE OR REPLACE VIEW active_users_with_profiles AS
SELECT
  u.id,
  u.email,
  u.name,
  u.type,
  u.status,
  u.visitor_level,
  u.partner_tier,
  u.profile,
  CASE
    WHEN u.type = 'visitor' THEN row_to_json(vp.*)
    WHEN u.type = 'partner' THEN row_to_json(pp.*)
    WHEN u.type = 'exhibitor' THEN row_to_json(ep.*)
    ELSE NULL
  END as full_profile,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN visitor_profiles vp ON u.id = vp.user_id
LEFT JOIN partner_profiles pp ON u.id = pp.user_id
LEFT JOIN exhibitor_profiles ep ON u.id = ep.user_id
WHERE u.status = 'active';

-- View: Upcoming events with organizer info
CREATE OR REPLACE VIEW upcoming_events AS
SELECT
  e.*,
  u.name as organizer_name,
  u.email as organizer_email,
  p.name as pavilion_name
FROM events e
LEFT JOIN users u ON e.organizer_id = u.id
LEFT JOIN pavilions p ON e.pavilion_id = p.id
WHERE e.start_date > now()
ORDER BY e.start_date ASC;

-- View: User connection network
CREATE OR REPLACE VIEW user_connections_view AS
SELECT
  c.id,
  c.requester_id,
  c.addressee_id,
  c.status,
  c.created_at,
  u1.name as requester_name,
  u1.email as requester_email,
  u1.type as requester_type,
  u2.name as addressee_name,
  u2.email as addressee_email,
  u2.type as addressee_type
FROM connections c
JOIN users u1 ON c.requester_id = u1.id
JOIN users u2 ON c.addressee_id = u2.id
WHERE c.status = 'accepted';

-- ========================================
-- COMMENTS
-- ========================================

DO $$
BEGIN
  COMMENT ON CONSTRAINT events_pavilion_id_fkey ON events IS 'Events can be associated with a pavilion';
  COMMENT ON CONSTRAINT events_organizer_id_fkey ON events IS 'Events have an organizer (user)';
  COMMENT ON VIEW active_users_with_profiles IS 'Active users with their complete profile data';
  COMMENT ON VIEW upcoming_events IS 'Future events with organizer and pavilion information';
  COMMENT ON VIEW user_connections_view IS 'Accepted connections between users with full details';
EXCEPTION WHEN OTHERS THEN
  -- Ignore comment errors
  NULL;
END $$;

-- ========================================
-- END OF MIGRATION
-- ========================================


-- [20251218120001_create_access_logs_table.sql]
-- ========================================
-- Create Access Logs Table for Physical Access Control
-- ========================================
-- Date: 2024-12-18
-- Purpose: Logger tous les accès physiques (accordés/refusés) avec QR codes
-- ========================================

-- ========================================
-- 1. CREATE ACCESS_LOGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User information
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_name text,
  user_type text CHECK (user_type IN ('visitor', 'partner', 'exhibitor', 'admin', 'security')),
  user_level text, -- 'free', 'premium', 'museum', 'silver', 'gold', 'platinium'

  -- Access details
  zone text, -- 'public', 'vip_lounge', 'exhibition_hall', 'backstage', etc.
  event text, -- 'conference', 'gala', 'workshop', etc.
  entrance_point text, -- 'main_entrance', 'vip_entrance', 'exhibitor_entrance'

  -- Status
  status text NOT NULL CHECK (status IN ('granted', 'denied')),
  reason text, -- Reason if denied

  -- Agent who scanned
  scanned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  scanner_device text, -- Device identifier

  -- Timestamps
  accessed_at timestamptz DEFAULT now(),

  -- Metadata
  metadata jsonb DEFAULT '{}',

  -- Indexes
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed_at ON access_logs(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_status ON access_logs(status);
CREATE INDEX IF NOT EXISTS idx_access_logs_zone ON access_logs(zone);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_type ON access_logs(user_type);

-- Index composite pour les requêtes de statistiques
CREATE INDEX IF NOT EXISTS idx_access_logs_stats
  ON access_logs(accessed_at DESC, status, user_type, zone);

-- ========================================
-- 3. CREATE RLS POLICIES
-- ========================================

ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'access_logs'
    AND policyname = 'Users can view their own access logs'
  ) THEN
    CREATE POLICY "Users can view their own access logs"
      ON access_logs FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Les admins et sécurité peuvent voir tous les logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'access_logs'
    AND policyname = 'Admins and security can view all access logs'
  ) THEN
    CREATE POLICY "Admins and security can view all access logs"
      ON access_logs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND type IN ('admin', 'security')
        )
      );
  END IF;
END $$;

-- Les agents de sécurité peuvent créer des logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'access_logs'
    AND policyname = 'Security agents can create access logs'
  ) THEN
    CREATE POLICY "Security agents can create access logs"
      ON access_logs FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND type IN ('admin', 'security')
        )
        OR auth.uid() = user_id -- Users can log their own accesses
      );
  END IF;
END $$;

-- ========================================
-- 4. CREATE HELPER FUNCTIONS
-- ========================================

-- Fonction pour obtenir les statistiques d'accès
CREATE OR REPLACE FUNCTION get_access_stats(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_zone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'granted', COUNT(*) FILTER (WHERE status = 'granted'),
    'denied', COUNT(*) FILTER (WHERE status = 'denied'),
    'by_user_type', (
      SELECT jsonb_object_agg(user_type, count)
      FROM (
        SELECT user_type, COUNT(*) as count
        FROM access_logs
        WHERE (p_start_date IS NULL OR accessed_at >= p_start_date)
        AND (p_end_date IS NULL OR accessed_at <= p_end_date)
        AND (p_zone IS NULL OR zone = p_zone)
        GROUP BY user_type
      ) sub
    ),
    'by_zone', (
      SELECT jsonb_object_agg(zone, count)
      FROM (
        SELECT zone, COUNT(*) as count
        FROM access_logs
        WHERE (p_start_date IS NULL OR accessed_at >= p_start_date)
        AND (p_end_date IS NULL OR accessed_at <= p_end_date)
        AND (p_zone IS NULL OR zone = p_zone)
        GROUP BY zone
      ) sub
    ),
    'by_hour', (
      SELECT jsonb_object_agg(hour, count)
      FROM (
        SELECT EXTRACT(HOUR FROM accessed_at) as hour, COUNT(*) as count
        FROM access_logs
        WHERE (p_start_date IS NULL OR accessed_at >= p_start_date)
        AND (p_end_date IS NULL OR accessed_at <= p_end_date)
        AND (p_zone IS NULL OR zone = p_zone)
        GROUP BY hour
        ORDER BY hour
      ) sub
    )
  )
  INTO v_stats
  FROM access_logs
  WHERE (p_start_date IS NULL OR accessed_at >= p_start_date)
  AND (p_end_date IS NULL OR accessed_at <= p_end_date)
  AND (p_zone IS NULL OR zone = p_zone);

  RETURN v_stats;
END;
$$;

-- Fonction pour obtenir les derniers accès en temps réel
CREATE OR REPLACE FUNCTION get_recent_access_logs(
  p_limit integer DEFAULT 50,
  p_zone text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_name text,
  user_type text,
  user_level text,
  zone text,
  status text,
  reason text,
  accessed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    al.user_name,
    al.user_type,
    al.user_level,
    al.zone,
    al.status,
    al.reason,
    al.accessed_at
  FROM access_logs al
  WHERE (p_zone IS NULL OR al.zone = p_zone)
  ORDER BY al.accessed_at DESC
  LIMIT p_limit;
END;
$$;

-- Fonction pour détecter les tentatives suspectes
CREATE OR REPLACE FUNCTION detect_suspicious_access()
RETURNS TABLE (
  user_id uuid,
  user_name text,
  denied_count bigint,
  last_denied_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Utilisateurs avec plus de 3 refus dans les 10 dernières minutes
  RETURN QUERY
  SELECT
    al.user_id,
    al.user_name,
    COUNT(*) as denied_count,
    MAX(al.accessed_at) as last_denied_at
  FROM access_logs al
  WHERE
    al.status = 'denied'
    AND al.accessed_at >= NOW() - INTERVAL '10 minutes'
  GROUP BY al.user_id, al.user_name
  HAVING COUNT(*) >= 3
  ORDER BY denied_count DESC;
END;
$$;

-- ========================================
-- 5. CREATE TRIGGER FOR AUTO-CLEANUP
-- ========================================

-- Trigger pour archiver les logs de plus de 30 jours
CREATE OR REPLACE FUNCTION archive_old_access_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Déplacer vers une table d'archive (à créer si nécessaire)
  -- Pour l'instant, on se contente de supprimer
  DELETE FROM access_logs
  WHERE accessed_at < NOW() - INTERVAL '30 days';
END;
$$;

-- ========================================
-- 6. REALTIME PUBLICATION
-- ========================================

-- Activer les publications en temps réel pour les logs d'accès
ALTER PUBLICATION supabase_realtime ADD TABLE access_logs;

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE access_logs IS 'Logs de tous les accès physiques au salon (accordés et refusés)';
COMMENT ON COLUMN access_logs.zone IS 'Zone d\'accès demandée (public, vip_lounge, backstage, etc.)';
COMMENT ON COLUMN access_logs.status IS 'Statut: granted (accès accordé) ou denied (accès refusé)';
COMMENT ON COLUMN access_logs.scanned_by IS 'Agent de sécurité qui a scanné le QR code';

COMMENT ON FUNCTION get_access_stats IS 'Obtenir les statistiques d\'accès agrégées';
COMMENT ON FUNCTION get_recent_access_logs IS 'Obtenir les derniers logs d\'accès en temps réel';
COMMENT ON FUNCTION detect_suspicious_access IS 'Détecter les tentatives d\'accès suspectes (multiples refus)';

-- ========================================
-- END OF MIGRATION
-- ========================================


-- [20251218_combined_migrations.sql]
-- Combined migrations (2025-12-18)
-- Ce fichier concatène les migrations nécessaires pour appliquer les corrections
-- générées localement. Exécutez dans Supabase SQL Editor en une seule passe.

BEGIN;

-- 1) add_user_status_column
-- Migration: ajouter la colonne `status` à la table `users`
-- Résout les triggers/migrations qui référencent `NEW.status` (erreur 42703)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- 2) create_exhibitor_profiles
-- Migration: créer la table `exhibitor_profiles` si elle n'existe pas

CREATE TABLE IF NOT EXISTS public.exhibitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  description text,
  logo_url text,
  website text,
  country text,
  sector text,
  category text,
  stand_number text,
  stand_area numeric DEFAULT 9.0 CHECK (stand_area > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_user_id ON public.exhibitor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_stand_area ON public.exhibitor_profiles(stand_area);

-- 3) create_partner_profiles
-- Migration: create partner_profiles table for seed and app usage

CREATE TABLE IF NOT EXISTS public.partner_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  description text,
  logo_url text,
  website text,
  country text,
  partnership_level text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON public.partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_partnership_level ON public.partner_profiles(partnership_level);

-- 4) create_visitor_profiles
-- Migration: create visitor_profiles table for seed and app usage

CREATE TABLE IF NOT EXISTS public.visitor_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  company text,
  position text,
  phone text,
  country text,
  visitor_type text,
  pass_type text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitor_profiles_user_id ON public.visitor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_pass_type ON public.visitor_profiles(pass_type);

-- 5) add_user_role_type_columns
-- Migration: add missing user columns used by seed_test_data.sql

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS visitor_level text,
  ADD COLUMN IF NOT EXISTS partner_tier text;

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_type ON public.users(type);

-- 6) add_users_status_columns (is_active, email_verified, created_at)

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users(email_verified);

-- 7) add_users_name_default
-- Ensure users.name exists, set NULLs to '', make NOT NULL with default

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS name text;

UPDATE public.users SET name = '' WHERE name IS NULL;

ALTER TABLE IF EXISTS public.users ALTER COLUMN name SET DEFAULT '';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name'
  ) THEN
    -- Ensure no NULLs remain before applying NOT NULL
    UPDATE public.users SET name = '' WHERE name IS NULL;
    EXECUTE 'ALTER TABLE public.users ALTER COLUMN name SET NOT NULL';
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);

COMMIT;

-- Fin du script combiné.
-- Remarques:
-- - Si votre projet Supabase exécute déjà certaines de ces migrations, la plupart
--   des commandes sont idempotentes (`IF NOT EXISTS`) et ne provoqueront pas d'erreur.
-- - Exécutez ensuite `supabase/seed_test_data.sql` si vous souhaitez réinjecter les comptes de test.


-- [20251219_create_digital_badges_table.sql]
-- Migration: Création table digital_badges pour QR codes visiteurs
-- Description: Stockage des badges QR avec JWT rotatifs pour contrôle d'accès

-- 1. Créer la table digital_badges
CREATE TABLE IF NOT EXISTS public.digital_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- QR Code data
  qr_data TEXT NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN (
    'visitor_free',
    'visitor_premium',
    'exhibitor_basic',
    'exhibitor_standard',
    'exhibitor_premium',
    'exhibitor_prestige',
    'partner_museum',
    'partner_silver',
    'partner_gold',
    'partner_platinium'
  )),

  -- JWT Token management
  current_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  last_rotation_at TIMESTAMPTZ DEFAULT NOW(),
  rotation_interval_seconds INTEGER DEFAULT 30,

  -- Photo for VIP/Premium badges
  photo_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id)
);

-- 2. Index pour performance
CREATE INDEX IF NOT EXISTS idx_digital_badges_user_id ON public.digital_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_badges_badge_type ON public.digital_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_digital_badges_is_active ON public.digital_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_digital_badges_token_expires ON public.digital_badges(token_expires_at);

-- 3. Fonction de mise à jour automatique updated_at
CREATE OR REPLACE FUNCTION update_digital_badges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_digital_badges_updated_at
  BEFORE UPDATE ON public.digital_badges
  FOR EACH ROW
  EXECUTE FUNCTION update_digital_badges_updated_at();

-- 4. Row Level Security (RLS)
ALTER TABLE public.digital_badges ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leur propre badge
CREATE POLICY "Users can view their own badge"
  ON public.digital_badges
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent créer leur badge (via edge function)
CREATE POLICY "Service role can insert badges"
  ON public.digital_badges
  FOR INSERT
  WITH CHECK (true); -- Service role only

-- Politique: Les utilisateurs peuvent mettre à jour leur badge (via edge function)
CREATE POLICY "Service role can update badges"
  ON public.digital_badges
  FOR UPDATE
  USING (true); -- Service role only

-- Politique: Admin peut tout voir
CREATE POLICY "Admins can view all badges"
  ON public.digital_badges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- 5. Commentaires pour documentation
COMMENT ON TABLE public.digital_badges IS 'Stockage des badges QR avec JWT rotatifs pour contrôle d''accès au salon';
COMMENT ON COLUMN public.digital_badges.qr_data IS 'Données JSON du QR code (version, type, token, level, userId)';
COMMENT ON COLUMN public.digital_badges.badge_type IS 'Type de badge déterminant les zones d''accès autorisées';
COMMENT ON COLUMN public.digital_badges.current_token IS 'JWT actuel pour validation QR (rotation 30s)';
COMMENT ON COLUMN public.digital_badges.rotation_interval_seconds IS 'Intervalle de rotation du token en secondes';
COMMENT ON COLUMN public.digital_badges.photo_url IS 'URL de la photo pour badges VIP/Premium (Supabase Storage)';
COMMENT ON COLUMN public.digital_badges.is_active IS 'Badge actif/inactif (permet de bloquer l''accès)';

-- 6. Fonction helper pour vérifier expiration token
CREATE OR REPLACE FUNCTION is_badge_token_expired(badge_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  expires_at TIMESTAMPTZ;
BEGIN
  SELECT token_expires_at INTO expires_at
  FROM public.digital_badges
  WHERE id = badge_id;

  IF expires_at IS NULL THEN
    RETURN false; -- Pas d'expiration
  END IF;

  RETURN NOW() > expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Vue pour monitoring des badges actifs
CREATE OR REPLACE VIEW public.active_badges_summary AS
SELECT
  badge_type,
  COUNT(*) as total_badges,
  COUNT(CASE WHEN is_active THEN 1 END) as active_badges,
  COUNT(CASE WHEN NOT is_active THEN 1 END) as inactive_badges,
  MIN(created_at) as first_created,
  MAX(created_at) as last_created
FROM public.digital_badges
GROUP BY badge_type
ORDER BY total_badges DESC;

-- Permission pour la vue (admin seulement)
GRANT SELECT ON public.active_badges_summary TO authenticated;

-- 8. Fonction de nettoyage des badges expirés (optionnel, pour maintenance)
CREATE OR REPLACE FUNCTION cleanup_expired_badges()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.digital_badges
    WHERE token_expires_at < NOW() - INTERVAL '1 year'
    AND is_active = false
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_badges() IS 'Nettoie les badges inactifs expirés depuis plus d''un an (maintenance)';


-- [20251219_create_storage_buckets.sql]
-- Création des buckets Supabase Storage pour les photos et badges

-- 1. Bucket pour les photos de profil visiteurs VIP
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Créer le dossier visitor-photos dans le bucket public
-- (Supabase Storage créera automatiquement les dossiers lors de l'upload)

-- 3. Politique de lecture publique pour les photos visiteurs
CREATE POLICY "Public photos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'public' AND (storage.foldername(name))[1] = 'visitor-photos');

-- 4. Politique d'upload pour les utilisateurs authentifiés
CREATE POLICY "Users can upload visitor photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'visitor-photos'
  AND auth.role() = 'authenticated'
);

-- 5. Politique de mise à jour pour le propriétaire
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'visitor-photos'
  AND auth.role() = 'authenticated'
);

-- 6. Politique de suppression pour le propriétaire
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'visitor-photos'
  AND auth.role() = 'authenticated'
);


-- [20251221000001_fix_media_partners_relation.sql]
-- Migration: Fix media_contents to partners relationship for PostgREST
-- Date: 2024-12-21
-- Description: Ensure the foreign key relationship is recognized by PostgREST

-- Drop and recreate the foreign key to ensure it's properly indexed
DO $$
BEGIN
  -- Check if the foreign key exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'media_contents_sponsor_partner_id_fkey'
    AND table_name = 'media_contents'
  ) THEN
    -- FK exists, nothing to do
    RAISE NOTICE 'Foreign key media_contents_sponsor_partner_id_fkey already exists';
  ELSE
    -- Create the foreign key if it doesn't exist
    BEGIN
      ALTER TABLE public.media_contents
        ADD CONSTRAINT media_contents_sponsor_partner_id_fkey
        FOREIGN KEY (sponsor_partner_id) REFERENCES public.partners(id) ON DELETE SET NULL;
      RAISE NOTICE 'Foreign key media_contents_sponsor_partner_id_fkey created';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Foreign key already exists (duplicate_object)';
    END;
  END IF;
END $$;

-- Add a comment to help PostgREST recognize the relationship
COMMENT ON CONSTRAINT media_contents_sponsor_partner_id_fkey ON public.media_contents 
IS 'Foreign key linking media content to sponsor partner';

-- Ensure the index exists for the FK
CREATE INDEX IF NOT EXISTS idx_media_contents_sponsor_partner 
ON public.media_contents(sponsor_partner_id);

-- Grant necessary permissions
GRANT SELECT ON public.partners TO anon;
GRANT SELECT ON public.partners TO authenticated;
GRANT SELECT ON public.media_contents TO anon;
GRANT SELECT ON public.media_contents TO authenticated;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';


-- [20251221100000_create_missing_tables_final.sql]
/*
  # Create Missing Tables - Final Fix
  
  1. Creates `favorites` table (alias for user_favorites compatibility)
  2. Creates `salon_config` table for salon global configuration
  3. Creates `notifications` table if not exists
  4. Creates `downloads` table if not exists
  5. Creates `recommendations` table if not exists
*/

-- =====================================================
-- 1. FAVORITES TABLE (for visitor favorites)
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  exhibitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(visitor_id, exhibitor_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = visitor_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = visitor_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = visitor_id);

CREATE INDEX IF NOT EXISTS idx_favorites_visitor_id ON favorites(visitor_id);
CREATE INDEX IF NOT EXISTS idx_favorites_exhibitor_id ON favorites(exhibitor_id);

-- =====================================================
-- 2. SALON_CONFIG TABLE (global salon configuration)
-- =====================================================
CREATE TABLE IF NOT EXISTS salon_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'SIB 2026',
  edition text DEFAULT '2026',
  start_date timestamptz DEFAULT '2026-06-15T09:00:00Z',
  end_date timestamptz DEFAULT '2026-06-18T18:00:00Z',
  location text DEFAULT 'Casablanca, Maroc',
  venue text DEFAULT 'Palais des Expositions - SAFEX',
  description text DEFAULT 'Salon International des Ports',
  logo_url text,
  banner_url text,
  website_url text DEFAULT 'https://sib2026.ma',
  contact_email text DEFAULT 'contact@sib2026.ma',
  contact_phone text,
  social_links jsonb DEFAULT '{}',
  features jsonb DEFAULT '{"networking": true, "appointments": true, "chat": true, "events": true}',
  theme_colors jsonb DEFAULT '{"primary": "#2563eb", "secondary": "#1e40af"}',
  registration_open boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE salon_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read salon config" ON salon_config;
CREATE POLICY "Anyone can read salon config" ON salon_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage salon config" ON salon_config;
CREATE POLICY "Admin can manage salon config" ON salon_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

-- Insert default salon config if not exists
INSERT INTO salon_config (name, edition, description)
SELECT 'SIB 2026', '2026', 'Salon International des Ports - Maroc'
WHERE NOT EXISTS (SELECT 1 FROM salon_config LIMIT 1);

-- =====================================================
-- 3. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  category text DEFAULT 'general',
  is_read boolean DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- 4. DOWNLOADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  resource_id uuid,
  resource_name text NOT NULL,
  file_url text,
  file_size bigint,
  download_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  last_downloaded_at timestamptz DEFAULT now()
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own downloads" ON downloads;
CREATE POLICY "Users can view own downloads" ON downloads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own downloads" ON downloads;
CREATE POLICY "Users can insert own downloads" ON downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);

-- =====================================================
-- 5. RECOMMENDATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recommended_type text NOT NULL,
  recommended_id uuid NOT NULL,
  score numeric(5,2) DEFAULT 0,
  reason text,
  is_dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recommendations" ON recommendations;
CREATE POLICY "Users can view own recommendations" ON recommendations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recommendations" ON recommendations;
CREATE POLICY "Users can update own recommendations" ON recommendations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage recommendations" ON recommendations;
CREATE POLICY "System can manage recommendations" ON recommendations
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);

-- =====================================================
-- 6. ACTIVITIES TABLE (user activity log)
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  description text,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activities" ON activities;
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert activities" ON activities;
CREATE POLICY "System can insert activities" ON activities
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- =====================================================
-- 7. PROFILE_VIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  viewed_id uuid REFERENCES users(id) ON DELETE CASCADE,
  view_count integer DEFAULT 1,
  first_viewed_at timestamptz DEFAULT now(),
  last_viewed_at timestamptz DEFAULT now(),
  UNIQUE(viewer_id, viewed_id)
);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view profile views" ON profile_views;
CREATE POLICY "Users can view profile views" ON profile_views
  FOR SELECT USING (auth.uid() = viewer_id OR auth.uid() = viewed_id);

DROP POLICY IF EXISTS "Users can insert profile views" ON profile_views;
CREATE POLICY "Users can insert profile views" ON profile_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

DROP POLICY IF EXISTS "Users can update profile views" ON profile_views;
CREATE POLICY "Users can update profile views" ON profile_views
  FOR UPDATE USING (auth.uid() = viewer_id);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_id ON profile_views(viewed_id);

-- =====================================================
-- 8. MINISITE_VIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS minisite_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  minisite_id uuid,
  exhibitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  view_date date DEFAULT CURRENT_DATE,
  view_count integer DEFAULT 1,
  source text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(minisite_id, viewer_id, view_date)
);

ALTER TABLE minisite_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view minisite stats" ON minisite_views;
CREATE POLICY "Anyone can view minisite stats" ON minisite_views
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert minisite views" ON minisite_views;
CREATE POLICY "Anyone can insert minisite views" ON minisite_views
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_minisite_views_exhibitor_id ON minisite_views(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_minisite_views_view_date ON minisite_views(view_date);

-- =====================================================
-- 9. QUOTA_USAGE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS quota_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  quota_type text NOT NULL,
  used integer DEFAULT 0,
  max_allowed integer DEFAULT 100,
  period_start timestamptz DEFAULT now(),
  period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quota_type)
);

ALTER TABLE quota_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quota" ON quota_usage;
CREATE POLICY "Users can view own quota" ON quota_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage quota" ON quota_usage;
CREATE POLICY "System can manage quota" ON quota_usage
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_quota_usage_user_id ON quota_usage(user_id);

-- =====================================================
-- 10. MINI_SITES TABLE (exhibitor minisites)
-- =====================================================
CREATE TABLE IF NOT EXISTS mini_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  slug text UNIQUE,
  title text NOT NULL,
  description text,
  logo_url text,
  banner_url text,
  theme jsonb DEFAULT '{}',
  sections jsonb DEFAULT '[]',
  contact_info jsonb DEFAULT '{}',
  social_links jsonb DEFAULT '{}',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published minisites" ON mini_sites;
CREATE POLICY "Anyone can view published minisites" ON mini_sites
  FOR SELECT USING (is_published = true OR auth.uid() = exhibitor_id);

DROP POLICY IF EXISTS "Exhibitors can manage own minisite" ON mini_sites;
CREATE POLICY "Exhibitors can manage own minisite" ON mini_sites
  FOR ALL USING (auth.uid() = exhibitor_id);

CREATE INDEX IF NOT EXISTS idx_mini_sites_exhibitor_id ON mini_sites(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_mini_sites_slug ON mini_sites(slug);

-- =====================================================
-- 11. LEADS TABLE (business leads for exhibitors)
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  visitor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  visitor_name text,
  visitor_email text,
  visitor_company text,
  visitor_phone text,
  source text DEFAULT 'salon',
  status text DEFAULT 'new',
  score integer DEFAULT 0,
  notes text,
  tags text[] DEFAULT '{}',
  contacted_at timestamptz,
  converted_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Exhibitors can view own leads" ON leads;
CREATE POLICY "Exhibitors can view own leads" ON leads
  FOR SELECT USING (auth.uid() = exhibitor_id);

DROP POLICY IF EXISTS "Exhibitors can manage own leads" ON leads;
CREATE POLICY "Exhibitors can manage own leads" ON leads
  FOR ALL USING (auth.uid() = exhibitor_id);

DROP POLICY IF EXISTS "System can insert leads" ON leads;
CREATE POLICY "System can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leads_exhibitor_id ON leads(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);


-- [20251224000001_fix_critical_issues.sql]
/*
  # Fix Critical Issues - Complete Migration

  1. Creates `connections` table for networking
  2. Updates `book_appointment_atomic` to return all required fields
  3. Creates `cancel_appointment_atomic` function
  4. Creates `user_favorites` table (compatible with existing code)
  5. Creates `daily_quotas` table for tracking user usage
  6. Adds seed data for demo exhibitors
*/

-- =====================================================
-- 1. CONNECTIONS TABLE (for networking)
-- =====================================================
-- Drop the existing table if it has incompatible structure
DROP TABLE IF EXISTS connections CASCADE;

CREATE TABLE connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Users can view their own connections (sent or received)
DROP POLICY IF EXISTS "Users can view own connections" ON connections;
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can create connections (send requests)
DROP POLICY IF EXISTS "Users can create connections" ON connections;
CREATE POLICY "Users can create connections" ON connections
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Users can update connections they are part of
DROP POLICY IF EXISTS "Users can update own connections" ON connections;
CREATE POLICY "Users can update own connections" ON connections
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can delete their own connection requests
DROP POLICY IF EXISTS "Users can delete own connections" ON connections;
CREATE POLICY "Users can delete own connections" ON connections
  FOR DELETE USING (auth.uid() = requester_id);

CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_addressee_id ON connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- =====================================================
-- 2. USER_FAVORITES TABLE (compatible with existing code)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type text NOT NULL DEFAULT 'user' CHECK (entity_type IN ('user', 'exhibitor', 'partner', 'event', 'product')),
  entity_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorites;
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_entity ON user_favorites(entity_type, entity_id);

-- =====================================================
-- 3. DAILY_QUOTAS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quota_date date NOT NULL DEFAULT CURRENT_DATE,
  connections_used integer DEFAULT 0,
  messages_used integer DEFAULT 0,
  meetings_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quota_date)
);

ALTER TABLE daily_quotas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quotas" ON daily_quotas;
CREATE POLICY "Users can view own quotas" ON daily_quotas
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own quotas" ON daily_quotas;
CREATE POLICY "Users can manage own quotas" ON daily_quotas
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_quotas_user_date ON daily_quotas(user_id, quota_date);

-- =====================================================
-- 4. UPDATE book_appointment_atomic FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION book_appointment_atomic(
  p_time_slot_id UUID,
  p_visitor_id UUID,
  p_exhibitor_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_meeting_type meeting_type DEFAULT 'in-person'
) RETURNS JSONB AS $$
DECLARE
  v_current_bookings INTEGER;
  v_max_bookings INTEGER;
  v_appointment_id UUID;
  v_new_current_bookings INTEGER;
  v_available BOOLEAN;
BEGIN
  -- Lock the time_slot row for update to prevent concurrent access
  SELECT current_bookings, max_bookings
  INTO v_current_bookings, v_max_bookings
  FROM time_slots
  WHERE id = p_time_slot_id
  FOR UPDATE;

  -- Check if time slot exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Créneau horaire introuvable'
    );
  END IF;

  -- Check availability
  IF v_current_bookings >= v_max_bookings THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce créneau est complet'
    );
  END IF;

  -- Check if visitor already has an appointment for this slot
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE time_slot_id = p_time_slot_id
    AND visitor_id = p_visitor_id
    AND status != 'cancelled'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Vous avez déjà réservé ce créneau'
    );
  END IF;

  -- Insert appointment avec statut PENDING (demande visiteur)
  -- L'exposant/partenaire devra confirmer le RDV ensuite
  INSERT INTO appointments (
    time_slot_id,
    visitor_id,
    exhibitor_id,
    notes,
    status,
    meeting_type,
    created_at
  ) VALUES (
    p_time_slot_id,
    p_visitor_id,
    p_exhibitor_id,
    p_notes,
    'pending',  -- Statut initial: en attente de confirmation exposant/partenaire
    p_meeting_type,
    NOW()
  )
  RETURNING id INTO v_appointment_id;

  -- Calculate new values
  v_new_current_bookings := v_current_bookings + 1;
  v_available := v_new_current_bookings < v_max_bookings;

  -- Increment current_bookings and update availability
  UPDATE time_slots
  SET
    current_bookings = v_new_current_bookings,
    available = v_available,
    updated_at = NOW()
  WHERE id = p_time_slot_id;

  -- Return success with all required data
  RETURN jsonb_build_object(
    'success', true,
    'appointment_id', v_appointment_id,
    'current_bookings', v_new_current_bookings,
    'available', v_available
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. CREATE cancel_appointment_atomic FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION cancel_appointment_atomic(
  p_appointment_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_appointment RECORD;
  v_new_current_bookings INTEGER;
BEGIN
  -- Get and lock the appointment
  SELECT a.*, ts.current_bookings, ts.max_bookings
  INTO v_appointment
  FROM appointments a
  LEFT JOIN time_slots ts ON ts.id = a.time_slot_id
  WHERE a.id = p_appointment_id
  FOR UPDATE;

  -- Check if appointment exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rendez-vous introuvable'
    );
  END IF;

  -- Check if user is authorized (visitor or exhibitor)
  IF v_appointment.visitor_id != p_user_id AND v_appointment.exhibitor_id != p_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Non autorisé à annuler ce rendez-vous'
    );
  END IF;

  -- Check if already cancelled
  IF v_appointment.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce rendez-vous est déjà annulé'
    );
  END IF;

  -- Update appointment status
  UPDATE appointments
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_appointment_id;

  -- Decrement time slot bookings if applicable
  IF v_appointment.time_slot_id IS NOT NULL THEN
    v_new_current_bookings := GREATEST(0, COALESCE(v_appointment.current_bookings, 1) - 1);

    UPDATE time_slots
    SET
      current_bookings = v_new_current_bookings,
      available = true,
      updated_at = NOW()
    WHERE id = v_appointment.time_slot_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Rendez-vous annulé avec succès'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. GET DAILY QUOTAS FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_daily_quotas(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_quotas RECORD;
BEGIN
  -- Get or create today's quotas
  INSERT INTO daily_quotas (user_id, quota_date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, quota_date) DO NOTHING;

  SELECT connections_used, messages_used, meetings_used
  INTO v_quotas
  FROM daily_quotas
  WHERE user_id = p_user_id AND quota_date = CURRENT_DATE;

  RETURN jsonb_build_object(
    'connections', COALESCE(v_quotas.connections_used, 0),
    'messages', COALESCE(v_quotas.messages_used, 0),
    'meetings', COALESCE(v_quotas.meetings_used, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. INCREMENT QUOTA FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION increment_daily_quota(
  p_user_id UUID,
  p_quota_type TEXT
) RETURNS JSONB AS $$
DECLARE
  v_column_name TEXT;
BEGIN
  -- Validate quota type
  IF p_quota_type NOT IN ('connections', 'messages', 'meetings') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid quota type');
  END IF;

  v_column_name := p_quota_type || '_used';

  -- Insert or update quota
  INSERT INTO daily_quotas (user_id, quota_date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, quota_date) DO NOTHING;

  -- Increment the appropriate column
  EXECUTE format(
    'UPDATE daily_quotas SET %I = %I + 1, updated_at = NOW() WHERE user_id = $1 AND quota_date = CURRENT_DATE',
    v_column_name, v_column_name
  ) USING p_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. ENSURE TIME_SLOTS HAS REQUIRED COLUMNS
-- =====================================================
DO $$
BEGIN
  -- Add current_bookings if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'current_bookings') THEN
    ALTER TABLE time_slots ADD COLUMN current_bookings integer DEFAULT 0;
  END IF;

  -- Add max_bookings if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'max_bookings') THEN
    ALTER TABLE time_slots ADD COLUMN max_bookings integer DEFAULT 1;
  END IF;

  -- Add available if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'available') THEN
    ALTER TABLE time_slots ADD COLUMN available boolean DEFAULT true;
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'updated_at') THEN
    ALTER TABLE time_slots ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- =====================================================
-- 9. ENSURE APPOINTMENTS HAS REQUIRED COLUMNS
-- =====================================================
DO $$
BEGIN
  -- Add notes if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'notes') THEN
    ALTER TABLE appointments ADD COLUMN notes text;
  END IF;

  -- Add meeting_type if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'meeting_type') THEN
    ALTER TABLE appointments ADD COLUMN meeting_type text DEFAULT 'in-person';
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'updated_at') THEN
    ALTER TABLE appointments ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- =====================================================
-- 10. MEDIA_CONTENTS TABLE + DEMO DATA
-- =====================================================

CREATE TABLE IF NOT EXISTS media_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('webinar', 'capsule_inside', 'podcast', 'live_studio', 'best_moments', 'testimonial')),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text,
  audio_url text,
  duration integer, -- en secondes
  published_at timestamptz,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),

  -- Métriques
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,

  -- Sponsor/Participants
  sponsor_partner_id uuid,
  featured_exhibitors uuid[] DEFAULT '{}',
  speakers jsonb DEFAULT '[]',

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

ALTER TABLE media_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published media" ON media_contents;
CREATE POLICY "Anyone can view published media" ON media_contents
  FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin can manage media" ON media_contents;
CREATE POLICY "Admin can manage media" ON media_contents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.type = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_media_contents_type ON media_contents(type);
CREATE INDEX IF NOT EXISTS idx_media_contents_status ON media_contents(status);
CREATE INDEX IF NOT EXISTS idx_media_contents_published ON media_contents(published_at);

-- Insert demo media content
INSERT INTO media_contents (type, title, description, thumbnail_url, duration, status, views_count, likes_count, speakers, tags, category, published_at)
VALUES
  -- Webinaires
  ('webinar', 'L''avenir des ports intelligents au Maroc',
   'Découvrez les tendances et innovations qui transforment l''industrie portuaire marocaine. Un webinaire animé par des experts du secteur.',
   'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
   3600, 'published', 1250, 89,
   '[{"name": "Karim Bennani", "title": "CEO", "company": "PortTech Maroc"}, {"name": "Sara Amrani", "title": "Directrice Innovation", "company": "Marsa Maroc"}]'::jsonb,
   ARRAY['port', 'digital', 'innovation'], 'Technologie', NOW() - INTERVAL '7 days'),

  ('webinar', 'Infrastructures portuaires: normes et qualité',
   'Analyse approfondie des normes internationales pour les infrastructures portuaires et leur application au Maroc.',
   'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800',
   2700, 'published', 890, 67,
   '[{"name": "Mohamed Larbi", "title": "Expert Qualité", "company": "IANOR"}]'::jsonb,
   ARRAY['équipement', 'qualité', 'normes'], 'Réglementation', NOW() - INTERVAL '14 days'),

  ('webinar', 'Financement des projets portuaires',
   'Comment financer votre projet portuaire ? Subventions, investisseurs, PPP - toutes les options expliquées.',
   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
   2400, 'published', 720, 45,
   '[{"name": "Amine Djebbar", "title": "Consultant Finance", "company": "Port Invest"}]'::jsonb,
   ARRAY['finance', 'investissement', 'startup'], 'Finance', NOW() - INTERVAL '21 days'),

  -- Podcasts
  ('podcast', 'SIB Talks #1: L''écosystème portuaire marocain',
   'Premier épisode de notre podcast dédié à l''industrie des ports. Invité spécial: le président de l''Autorité Portuaire.',
   'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800',
   1800, 'published', 2100, 156,
   '[{"name": "Farid Bensalem", "title": "Journaliste Maritime", "company": "SIB"}]'::jsonb,
   ARRAY['podcast', 'interview', 'port'], 'Interview', NOW() - INTERVAL '5 days'),

  ('podcast', 'SIB Talks #2: Femmes et Secteur Maritime',
   'Focus sur les femmes dans le secteur maritime marocain. Défis, opportunités et success stories.',
   'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
   2100, 'published', 1850, 203,
   '[{"name": "Yasmine Khelifi", "title": "Capitaine", "company": "Marine Nationale"}]'::jsonb,
   ARRAY['femmes', 'port', 'égalité'], 'Société', NOW() - INTERVAL '12 days'),

  -- Capsules Inside
  ('capsule_inside', 'Inside SIB: Coulisses du salon',
   'Découvrez les coulisses de l''organisation du plus grand salon portuaire du Maroc.',
   'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
   300, 'published', 3500, 245,
   '[]'::jsonb,
   ARRAY['coulisses', 'organisation', 'salon'], 'Behind The Scenes', NOW() - INTERVAL '3 days'),

  ('capsule_inside', 'Inside SIB: Préparation des stands',
   'Comment les exposants préparent leurs stands pour impressionner les visiteurs.',
   'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
   240, 'published', 2800, 178,
   '[]'::jsonb,
   ARRAY['stands', 'exposants', 'préparation'], 'Behind The Scenes', NOW() - INTERVAL '2 days'),

  -- Live Studio
  ('live_studio', 'Meet The Leaders: Interview CEO PortTech',
   'Interview exclusive avec le CEO de PortTech DZ sur l''avenir de la technologie dans les ports.',
   'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
   1200, 'published', 1560, 98,
   '[{"name": "Karim Benzarti", "title": "CEO", "company": "PortTech DZ"}]'::jsonb,
   ARRAY['interview', 'leader', 'technologie'], 'Leadership', NOW() - INTERVAL '8 days'),

  -- Best Moments
  ('best_moments', 'SIB 2025: Les moments forts',
   'Revivez les meilleurs moments de l''édition 2025 du salon SIB.',
   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
   420, 'published', 4200, 312,
   '[]'::jsonb,
   ARRAY['highlights', 'salon', '2025'], 'Événement', NOW() - INTERVAL '1 day'),

  -- Testimonials
  ('testimonial', 'Témoignage: Exposant satisfait',
   'Ahmed Kaci, exposant depuis 3 éditions, partage son expérience au salon SIB.',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
   180, 'published', 980, 67,
   '[{"name": "Ahmed Kaci", "title": "Directeur Commercial", "company": "Équipements Portuaires Pro"}]'::jsonb,
   ARRAY['témoignage', 'exposant', 'satisfaction'], 'Témoignage', NOW() - INTERVAL '10 days'),

  ('testimonial', 'Témoignage: Visiteur VIP',
   'Retour d''expérience d''un visiteur VIP sur les avantages du pass premium.',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800',
   150, 'published', 750, 45,
   '[{"name": "Mehdi Belkacem", "title": "Acheteur", "company": "Groupe Portuaire Oran"}]'::jsonb,
   ARRAY['témoignage', 'visiteur', 'VIP'], 'Témoignage', NOW() - INTERVAL '6 days')

ON CONFLICT DO NOTHING;

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION book_appointment_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_appointment_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_quotas TO authenticated;
GRANT EXECUTE ON FUNCTION increment_daily_quota TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE connections IS 'User networking connections with status tracking';
COMMENT ON TABLE user_favorites IS 'User favorites for various entity types';
COMMENT ON TABLE daily_quotas IS 'Daily usage quotas for networking features';
COMMENT ON FUNCTION book_appointment_atomic IS 'Atomically books an appointment with status=pending (requires exhibitor confirmation)';
COMMENT ON FUNCTION cancel_appointment_atomic IS 'Atomically cancels an appointment and frees the slot';
COMMENT ON FUNCTION get_daily_quotas IS 'Gets current daily quota usage for a user';
COMMENT ON FUNCTION increment_daily_quota IS 'Increments a specific daily quota counter';

-- Workflow documentation
COMMENT ON COLUMN appointments.status IS 'Appointment workflow: pending (visitor request) → confirmed (exhibitor accepts) → completed/cancelled';

-- =====================================================
-- APPOINTMENT WORKFLOW DOCUMENTATION
-- =====================================================
/*
  FLUX DE PRISE DE RENDEZ-VOUS:
  
  1. DEMANDE (Visiteur):
     - Le visiteur sélectionne un créneau disponible
     - Appel de book_appointment_atomic()
     - Création du RDV avec status='pending'
     - Le créneau reste disponible mais affiche "X RÉSERVÉ(S)"
  
  2. CONFIRMATION (Exposant):
     - L'exposant voit la demande dans son dashboard
     - Il peut ACCEPTER ou REFUSER
     - Si accepté: UPDATE appointments SET status='confirmed'
     - Notification envoyée au visiteur
     - Calendriers mis à jour (exposant + visiteur)
  
  3. AFFICHAGE:
     - Calendrier personnel exposant: tous les RDV (pending + confirmed)
     - Calendrier personnel visiteur: tous les RDV (pending + confirmed)
     - Calendrier de disponibilité: affiche "X RÉSERVÉ(S)" ou "COMPLET"
  
  4. ANNULATION:
     - Visiteur ou exposant peut annuler via cancel_appointment_atomic()
     - Le créneau est libéré (currentBookings décrémenté)
     - Status devient 'cancelled'
*/


-- [20251224000002_seed_demo_data.sql]
/*
  # Seed Demo Data for Presentation
  
  This migration populates all tables with realistic demo data:
  - Users (admin, exhibitors, partners, visitors)
  - Exhibitors & Partners profiles
  - Visitor profiles
  - Events
  - News articles
  - Appointments & Time slots
  - Connections
  - Messages
  - Pavilions
*/

-- Recréer les tables de profils avec la bonne structure (nécessaires pour le trigger)
DROP TABLE IF EXISTS public.exhibitor_profiles CASCADE;
CREATE TABLE public.exhibitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  description text,
  logo_url text,
  website text,
  country text,
  sector text,
  category text,
  stand_number text,
  stand_area numeric DEFAULT 9.0 CHECK (stand_area > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_exhibitor_profiles_user_id ON public.exhibitor_profiles(user_id);

DROP TABLE IF EXISTS public.partner_profiles CASCADE;
CREATE TABLE public.partner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  description text,
  logo_url text,
  website text,
  country text,
  partnership_level text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_partner_profiles_user_id ON public.partner_profiles(user_id);

DROP TABLE IF EXISTS public.visitor_profiles CASCADE;
CREATE TABLE public.visitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  company text,
  position text,
  phone text,
  country text,
  visitor_type text,
  pass_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_visitor_profiles_user_id ON public.visitor_profiles(user_id);

-- Ajouter la colonne stand_number à exhibitors si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'exhibitors' 
    AND column_name = 'stand_number'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN stand_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'exhibitors' 
    AND column_name = 'featured'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'exhibitors' 
    AND column_name = 'verified'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN verified boolean DEFAULT false;
  END IF;

  -- S'assurer que la table partners a les bonnes colonnes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners') THEN
    -- Ajouter company_name si name existe (renommer ou ajouter)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'company_name') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'name') THEN
        ALTER TABLE public.partners RENAME COLUMN name TO company_name;
      ELSE
        ALTER TABLE public.partners ADD COLUMN company_name text;
      END IF;
    END IF;

    -- Ajouter partner_type si type existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'partner_type') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'type') THEN
        ALTER TABLE public.partners RENAME COLUMN type TO partner_type;
      ELSE
        ALTER TABLE public.partners ADD COLUMN partner_type text;
      END IF;
    END IF;

    -- Ajouter partnership_level si sponsorship_level existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'partnership_level') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'sponsorship_level') THEN
        ALTER TABLE public.partners RENAME COLUMN sponsorship_level TO partnership_level;
      ELSE
        ALTER TABLE public.partners ADD COLUMN partnership_level text;
      END IF;
    END IF;

    -- Ajouter user_id si manquant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'user_id') THEN
      ALTER TABLE public.partners ADD COLUMN user_id uuid REFERENCES public.users(id);
    END IF;

    -- Ajouter contact_info si manquant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'contact_info') THEN
      ALTER TABLE public.partners ADD COLUMN contact_info jsonb DEFAULT '{}';
    END IF;
  END IF;
END $$;

-- Créer la table pavilions si elle n'existe pas
CREATE TABLE IF NOT EXISTS pavilions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text NOT NULL,
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'Anchor',
  order_index integer DEFAULT 0,
  featured boolean DEFAULT false,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer le type event_type si il n'existe pas
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('conference', 'workshop', 'networking', 'exhibition');
  END IF;
END $$;

-- Note: ALTER TYPE ADD VALUE ne peut pas être utilisé dans la même transaction
-- Les valeurs doivent déjà exister dans l'enum ou on utilise des valeurs texte

-- Créer la table events si elle n'existe pas
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_type event_type NOT NULL DEFAULT 'conference',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  pavilion_id uuid,
  organizer_id uuid REFERENCES users(id),
  capacity integer,
  registered integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  image_url text,
  registration_url text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajouter la colonne event_type à events si elle n'existe pas
DO $$ 
BEGIN
  -- event_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'event_type') THEN
    ALTER TABLE public.events ADD COLUMN event_type text DEFAULT 'conference';
  END IF;
  -- start_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'start_date') THEN
    ALTER TABLE public.events ADD COLUMN start_date timestamptz DEFAULT now();
  END IF;
  -- end_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'end_date') THEN
    ALTER TABLE public.events ADD COLUMN end_date timestamptz DEFAULT now();
  END IF;
  -- location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'location') THEN
    ALTER TABLE public.events ADD COLUMN location text;
  END IF;
  -- pavilion_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'pavilion_id') THEN
    ALTER TABLE public.events ADD COLUMN pavilion_id uuid;
  END IF;
  -- organizer_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'organizer_id') THEN
    ALTER TABLE public.events ADD COLUMN organizer_id uuid;
  END IF;
  -- capacity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'capacity') THEN
    ALTER TABLE public.events ADD COLUMN capacity integer;
  END IF;
  -- registered
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'registered') THEN
    ALTER TABLE public.events ADD COLUMN registered integer DEFAULT 0;
  END IF;
  -- is_featured
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_featured') THEN
    ALTER TABLE public.events ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- =====================================================
-- 1. INSERT DEMO USERS
-- =====================================================

-- Ensure pgcrypto is enabled for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert into auth.users first to satisfy foreign key constraints
-- Using DO block to avoid unique constraint violations
DO $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_password text := 'Admin123!';
  v_users RECORD;
BEGIN
  -- Clean up dependent tables to avoid foreign key violations during user cleanup
  -- We do this because deleting from auth.users triggers deletion in public.users
  DELETE FROM daily_quotas;
  DELETE FROM user_favorites;
  DELETE FROM products;
  DELETE FROM mini_sites;
  DELETE FROM news_articles;
  DELETE FROM events;
  DELETE FROM appointments;
  DELETE FROM messages;
  DELETE FROM conversations;
  DELETE FROM connections;
  DELETE FROM exhibitors;
  DELETE FROM exhibitor_profiles;
  DELETE FROM partner_profiles;
  DELETE FROM visitor_profiles;
  DELETE FROM notifications;
  DELETE FROM registration_requests;

  -- Define the users we want to ensure exist
  FOR v_users IN 
    SELECT * FROM (VALUES 
      ('00000000-0000-0000-0000-000000000001', 'admin.sib@sib.com'),
      ('00000000-0000-0000-0000-000000000002', 'exhibitor-54m@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000003', 'exhibitor-36m@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000004', 'exhibitor-18m@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000017', 'exhibitor-9m@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000005', 'partner-gold@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000006', 'partner-silver@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000011', 'partner-platinium@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000012', 'partner-museum@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000013', 'partner-porttech@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000014', 'partner-oceanfreight@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000015', 'partner-coastal@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000007', 'visitor-vip@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000008', 'visitor-premium@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000009', 'visitor-basic@test.sib2026.ma'),
      ('00000000-0000-0000-0000-000000000010', 'visitor-free@test.sib2026.ma')
    ) AS t(id, email)
  LOOP
    v_user_id := v_users.id::uuid;
    v_email := v_users.email;

    -- 1. Remove any user that has this email but a different ID
    -- We delete from public.users first to avoid constraint issues
    DELETE FROM public.users WHERE email = v_email AND id <> v_user_id;
    DELETE FROM auth.users WHERE email = v_email AND id <> v_user_id;
    
    -- 2. Remove any user that has this ID but a different email
    DELETE FROM public.users WHERE id = v_user_id AND email <> v_email;
    DELETE FROM auth.users WHERE id = v_user_id AND email <> v_email;

    -- 3. Insert if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
      VALUES (v_user_id, v_email, crypt(v_password, gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');
    END IF;
  END LOOP;
END $$;

-- Admin user
INSERT INTO users (id, email, name, type, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'admin.sib@sib.com',
    'Admin SIB',
    'admin',
    'active',
    '{"role": "administrator", "avatar": "https://ui-avatars.com/api/?name=Admin+SIB"}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- Exhibitor users
INSERT INTO users (id, email, name, type, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000002',
    'exhibitor-54m@test.sib2026.ma',
    'ABB Marine & Ports',
    'exhibitor',
    'active',
    '{"company": "ABB Marine & Ports", "sector": "Technologie", "tier": "54m2", "avatar": "https://ui-avatars.com/api/?name=ABB+Marine"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'exhibitor-36m@test.sib2026.ma',
    'Advanced Port Systems',
    'exhibitor',
    'active',
    '{"company": "Advanced Port Systems", "sector": "Automation", "tier": "36m2", "avatar": "https://ui-avatars.com/api/?name=Advanced+Port"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'exhibitor-18m@test.sib2026.ma',
    'Maritime Equipment Co',
    'exhibitor',
    'active',
    '{"company": "Maritime Equipment Co", "sector": "Equipment", "tier": "18m2", "avatar": "https://ui-avatars.com/api/?name=Maritime+Equip"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000017',
    'exhibitor-9m@test.sib2026.ma',
    'StartUp Port Innovations',
    'exhibitor',
    'active',
    '{"company": "StartUp Port Innovations", "sector": "IoT", "tier": "9m2", "avatar": "https://ui-avatars.com/api/?name=StartUp+Port"}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- Partner users
INSERT INTO users (id, email, name, type, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000005',
    'partner-gold@test.sib2026.ma',
    'Gold Partner Industries',
    'partner',
    'active',
    '{"company": "Gold Partner Industries", "tier": "gold", "avatar": "https://ui-avatars.com/api/?name=Gold+Partner"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'partner-silver@test.sib2026.ma',
    'Silver Tech Group',
    'partner',
    'active',
    '{"company": "Silver Tech Group", "tier": "silver", "avatar": "https://ui-avatars.com/api/?name=Silver+Tech"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    'partner-platinium@test.sib2026.ma',
    'Platinium Global Corp',
    'partner',
    'active',
    '{"company": "Platinium Global Corp", "tier": "platinium", "avatar": "https://ui-avatars.com/api/?name=Platinium+Global"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    'partner-museum@test.sib2026.ma',
    'Museum Heritage',
    'partner',
    'active',
    '{"company": "Museum Heritage", "tier": "museum", "avatar": "https://ui-avatars.com/api/?name=Museum+Heritage"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    'partner-porttech@test.sib2026.ma',
    'Port Tech Systems',
    'partner',
    'active',
    '{"company": "Port Tech Systems", "tier": "platinium", "avatar": "https://ui-avatars.com/api/?name=Port+Tech"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    'partner-oceanfreight@test.sib2026.ma',
    'Ocean Freight Services',
    'partner',
    'active',
    '{"company": "Ocean Freight Services", "tier": "gold", "avatar": "https://ui-avatars.com/api/?name=Ocean+Freight"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000015',
    'partner-coastal@test.sib2026.ma',
    'Coastal Shipping Co',
    'partner',
    'active',
    '{"company": "Coastal Shipping Co", "tier": "silver", "avatar": "https://ui-avatars.com/api/?name=Coastal+Shipping"}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- Visitor users
INSERT INTO users (id, email, name, type, visitor_level, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000007',
    'visitor-vip@test.sib2026.ma',
    'Jean Dupont',
    'visitor',
    'vip',
    'active',
    '{"firstName": "Jean", "lastName": "Dupont", "company": "Dupont Consulting", "avatar": "https://ui-avatars.com/api/?name=Jean+Dupont"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'visitor-premium@test.sib2026.ma',
    'Marie Martin',
    'visitor',
    'premium',
    'active',
    '{"firstName": "Marie", "lastName": "Martin", "company": "Martin & Associés", "avatar": "https://ui-avatars.com/api/?name=Marie+Martin"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000009',
    'visitor-basic@test.sib2026.ma',
    'Pierre Dubois',
    'visitor',
    'basic',
    'active',
    '{"firstName": "Pierre", "lastName": "Dubois", "avatar": "https://ui-avatars.com/api/?name=Pierre+Dubois"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000010',
    'visitor-free@test.sib2026.ma',
    'Sophie Bernard',
    'visitor',
    'free',
    'active',
    '{"firstName": "Sophie", "lastName": "Bernard", "avatar": "https://ui-avatars.com/api/?name=Sophie+Bernard"}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  visitor_level = EXCLUDED.visitor_level,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- =====================================================
-- 1.5 INSERT REGISTRATION REQUESTS (PENDING)
-- =====================================================
INSERT INTO registration_requests (id, user_type, email, first_name, last_name, company_name, position, phone, status, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000901',
    'exhibitor',
    'pending-exhibitor@example.com',
    'Jean',
    'Enattente',
    'Future Port Tech',
    'CTO',
    '+33600000001',
    'pending',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000902',
    'partner',
    'pending-partner@example.com',
    'Alice',
    'Demande',
    'Global Logistics Partner',
    'Directrice',
    '+33600000002',
    'pending',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000903',
    'exhibitor',
    'new-expo@example.com',
    'Marc',
    'Nouveau',
    'EcoShipping Solutions',
    'CEO',
    '+33600000003',
    'pending',
    NOW() - INTERVAL '5 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000904',
    'visitor',
    'vip-request@example.com',
    'Sophie',
    'Vip',
    'Luxe Events',
    'Manager',
    '+33600000004',
    'pending',
    NOW() - INTERVAL '10 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000905',
    'exhibitor',
    'maritime-tech@example.com',
    'Thomas',
    'Marine',
    'Maritime Tech',
    'Sales',
    '+33600000005',
    'pending',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. INSERT EXHIBITOR PROFILES
-- =====================================================
INSERT INTO exhibitors (id, user_id, company_name, category, sector, description, website, logo_url, stand_number, featured, verified, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000002',
    'ABB Marine & Ports',
    'port-industry',
    'Technology',
    'Leader mondial en automatisation et électrification marine. Nous fournissons des solutions de pointe pour les ports et les navires.',
    'https://abb.com',
    'https://ui-avatars.com/api/?name=ABB+Marine&size=200',
    'D4-050',
    true,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000003',
    'Advanced Port Systems',
    'port-operations',
    'Automation',
    'Systèmes automatisés et IA pour optimisation portuaire. Spécialiste des terminaux à conteneurs intelligents.',
    'https://advancedportsys.cn',
    'https://ui-avatars.com/api/?name=Advanced+Port&size=200',
    'C3-027',
    true,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000004',
    'Maritime Equipment Co',
    'port-industry',
    'Equipment',
    'Fabricant d''équipements maritimes et portuaires de qualité. Grues, chariots cavaliers et solutions de manutention.',
    'https://maritimeequip.fr',
    'https://ui-avatars.com/api/?name=Maritime+Equip&size=200',
    'B2-015',
    true,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000117',
    '00000000-0000-0000-0000-000000000017',
    'StartUp Port Innovations',
    'port-industry',
    'IoT',
    'Startup innovante en solutions IoT pour ports intelligents. Capteurs connectés et analyse de données en temps réel.',
    'https://startupportinno.com',
    'https://ui-avatars.com/api/?name=StartUp+Port&size=200',
    'A1-001',
    true,
    true,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  category = EXCLUDED.category,
  sector = EXCLUDED.sector,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  logo_url = EXCLUDED.logo_url,
  stand_number = EXCLUDED.stand_number,
  featured = EXCLUDED.featured,
  verified = EXCLUDED.verified;

-- =====================================================
-- 2b. INSERT INTO exhibitor_profiles (pour la compatibilité)
-- =====================================================
INSERT INTO exhibitor_profiles (user_id, company_name, description, logo_url, website, sector, category, stand_number, stand_area, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'ABB Marine & Ports', 'Leader mondial en automatisation et électrification marine.', 'https://ui-avatars.com/api/?name=ABB+Marine&size=200', 'https://abb.com', 'Technology', 'major_brand', 'D4-050', 60.0, NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Advanced Port Systems', 'Systèmes automatisés et IA pour optimisation portuaire.', 'https://ui-avatars.com/api/?name=Advanced+Port&size=200', 'https://advancedportsys.cn', 'Automation', 'automation', 'C3-027', 36.0, NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Maritime Equipment Co', 'Fabricant d''équipements maritimes et portuaires de qualité.', 'https://ui-avatars.com/api/?name=Maritime+Equip&size=200', 'https://maritimeequip.fr', 'Equipment', 'equipment', 'B2-015', 18.0, NOW()),
  ('00000000-0000-0000-0000-000000000017', 'StartUp Port Innovations', 'Startup innovante en solutions IoT pour ports intelligents.', 'https://ui-avatars.com/api/?name=StartUp+Port&size=200', 'https://startupportinno.com', 'IoT', 'startup', 'A1-001', 9.0, NOW())
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  stand_number = EXCLUDED.stand_number;

-- =====================================================
-- 3. INSERT PARTNER PROFILES (dans partner_profiles)
-- =====================================================
INSERT INTO partner_profiles (id, user_id, company_name, contact_name, contact_email, description, website, logo_url, country, partnership_level, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000005',
    'Gold Partner Industries',
    'Marie Laurent',
    'contact@gold-partner.example.com',
    'Partenaire stratégique majeur offrant des services premium et un accompagnement personnalisé. Sponsor principal de l''événement SIB 2025.',
    'https://gold-partner.example.com',
    'https://ui-avatars.com/api/?name=Gold+Partner&size=200',
    'France',
    'gold',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000006',
    'Silver Tech Group',
    'Pierre Martin',
    'info@silver-tech.example.com',
    'Expert en solutions technologiques pour événements professionnels. Support technique et innovation digitale.',
    'https://silver-tech.example.com',
    'https://ui-avatars.com/api/?name=Silver+Tech&size=200',
    'France',
    'silver',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000107',
    '00000000-0000-0000-0000-000000000011',
    'Platinium Global Corp',
    'Sarah Connor',
    'contact@platinium-global.example.com',
    'Leader mondial de l''industrie, partenaire exclusif Platinium. Innovation et excellence.',
    'https://platinium-global.example.com',
    'https://ui-avatars.com/api/?name=Platinium+Global&size=200',
    'USA',
    'platinium',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000108',
    '00000000-0000-0000-0000-000000000012',
    'Museum Heritage',
    'Jean-Pierre Archives',
    'contact@museum-heritage.example.com',
    'Préservation du patrimoine maritime et portuaire. Partenaire culturel.',
    'https://museum-heritage.example.com',
    'https://ui-avatars.com/api/?name=Museum+Heritage&size=200',
    'France',
    'museum',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000109',
    '00000000-0000-0000-0000-000000000013',
    'Port Tech Systems',
    'Alex Tech',
    'contact@porttech.example.com',
    'Solutions logistiques avancées pour les ports modernes.',
    'https://porttech.example.com',
    'https://ui-avatars.com/api/?name=Port+Tech&size=200',
    'France',
    'platinium',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000110',
    '00000000-0000-0000-0000-000000000014',
    'Ocean Freight Services',
    'Sarah Ocean',
    'contact@oceanfreight.example.com',
    'Services de fret maritime et gestion de conteneurs.',
    'https://oceanfreight.example.com',
    'https://ui-avatars.com/api/?name=Ocean+Freight&size=200',
    'France',
    'gold',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000111',
    '00000000-0000-0000-0000-000000000015',
    'Coastal Shipping Co',
    'Marc Coast',
    'contact@coastal.example.com',
    'Transport maritime côtier et logistique régionale.',
    'https://coastal.example.com',
    'https://ui-avatars.com/api/?name=Coastal+Shipping&size=200',
    'France',
    'silver',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  logo_url = EXCLUDED.logo_url,
  partnership_level = EXCLUDED.partnership_level;

-- =====================================================
-- 3b. INSERT INTO partners (pour la compatibilité UI)
-- =====================================================
INSERT INTO partners (id, user_id, company_name, partner_type, sector, description, logo_url, website, verified, featured, partnership_level, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000005',
    'Global Shipping Alliance',
    'strategic',
    'Logistique',
    'Alliance mondiale de compagnies de transport maritime offrant des services premium et un accompagnement personnalisé.',
    'https://ui-avatars.com/api/?name=Global+Shipping&size=200',
    'https://global-shipping.example.com',
    true,
    true,
    'gold',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000006',
    'Silver Tech Group',
    'technology',
    'Technologie',
    'Expert en solutions technologiques pour événements professionnels.',
    'https://ui-avatars.com/api/?name=Silver+Tech&size=200',
    'https://silver-tech.example.com',
    true,
    true,
    'silver',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000107',
    '00000000-0000-0000-0000-000000000011',
    'Platinium Global Corp',
    'strategic',
    'Industrie',
    'Leader mondial de l''industrie, partenaire exclusif Platinium.',
    'https://ui-avatars.com/api/?name=Platinium+Global&size=200',
    'https://platinium-global.example.com',
    true,
    true,
    'platinium',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000108',
    '00000000-0000-0000-0000-000000000012',
    'Museum Heritage',
    'institutional',
    'Culture',
    'Institution culturelle partenaire pour la promotion du patrimoine maritime.',
    'https://ui-avatars.com/api/?name=Museum+Heritage&size=200',
    'https://museum.example.com',
    true,
    true,
    'museum',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000109',
    '00000000-0000-0000-0000-000000000013',
    'Port Tech Systems',
    'technology',
    'Exploitation & Gestion',
    'Solutions logistiques avancées pour les ports modernes.',
    'https://ui-avatars.com/api/?name=Port+Tech&size=200',
    'https://porttech.example.com',
    true,
    true,
    'platinium',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000110',
    '00000000-0000-0000-0000-000000000014',
    'Ocean Freight Services',
    'logistics',
    'Exploitation & Gestion',
    'Services de fret maritime et gestion de conteneurs.',
    'https://ui-avatars.com/api/?name=Ocean+Freight&size=200',
    'https://oceanfreight.example.com',
    true,
    true,
    'gold',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000111',
    '00000000-0000-0000-0000-000000000015',
    'Coastal Shipping Co',
    'logistics',
    'Industrie Portuaire',
    'Transport maritime côtier et logistique régionale.',
    'https://ui-avatars.com/api/?name=Coastal+Shipping&size=200',
    'https://coastal.example.com',
    true,
    true,
    'silver',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  partner_type = EXCLUDED.partner_type,
  sector = EXCLUDED.sector,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  website = EXCLUDED.website,
  verified = EXCLUDED.verified,
  featured = EXCLUDED.featured,
  partnership_level = EXCLUDED.partnership_level;

-- =====================================================
-- 4. INSERT VISITOR PROFILES
-- =====================================================
INSERT INTO visitor_profiles (user_id, first_name, last_name, company, position, phone, country, visitor_type, pass_type, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000007',
    'Jean',
    'Dupont',
    'Dupont Consulting',
    'Directeur Innovation',
    '+33612345678',
    'France',
    'professional',
    'vip',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'Marie',
    'Martin',
    'Martin & Associés',
    'Chef de Projet',
    '+33612345679',
    'France',
    'professional',
    'standard',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000009',
    'Pierre',
    'Dubois',
    NULL,
    'Entrepreneur',
    '+33612345680',
    'France',
    'entrepreneur',
    'standard',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000010',
    'Sophie',
    'Bernard',
    NULL,
    'Étudiante',
    '+33612345681',
    'France',
    'student',
    'student',
    NOW()
  )
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company = EXCLUDED.company,
  position = EXCLUDED.position;

-- =====================================================
-- 5. INSERT PAVILIONS
-- =====================================================
INSERT INTO pavilions (id, name, slug, description, color, icon, order_index, featured, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    'Pavillon Innovation',
    'innovation',
    'Espace dédié aux technologies innovantes et startups du futur',
    '#3b82f6',
    'Zap',
    1,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'Pavillon Agritech',
    'agritech',
    'Solutions agricoles intelligentes et développement durable',
    '#10b981',
    'Sprout',
    2,
    false,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'Pavillon Luxe & Mode',
    'luxe-mode',
    'Haute couture et accessoires de luxe',
    '#ec4899',
    'Sparkles',
    3,
    false,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. INSERT EVENTS
-- =====================================================
INSERT INTO events (id, title, description, type, category, event_date, start_time, end_time, start_date, end_date, location, pavilion_id, organizer_id, capacity, registered, is_featured, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000301',
    'Conférence Innovation 2025',
    'Les dernières tendances en matière d''innovation technologique et digitale. Intervenants internationaux et sessions de networking.',
    'conference',
    'Innovation',
    CURRENT_DATE + INTERVAL '2 days',
    '09:00:00',
    '13:00:00',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days' + INTERVAL '4 hours',
    'Salle Plenière A',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    200,
    87,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    'Atelier Agriculture Durable',
    'Workshop pratique sur les techniques d''agriculture de précision et l''utilisation de l''IoT dans les exploitations.',
    'conference',
    'Agriculture',
    CURRENT_DATE + INTERVAL '3 days',
    '14:00:00',
    '17:00:00',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
    'Salle Workshop B1',
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000001',
    50,
    32,
    false,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000303',
    'Défilé Mode & Innovation',
    'Présentation exclusive des collections 2025 avec intégration de technologies wearables.',
    'conference',
    'Mode',
    CURRENT_DATE + INTERVAL '5 days',
    '10:00:00',
    '12:00:00',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days' + INTERVAL '2 hours',
    'Podium Principal',
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000001',
    300,
    156,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000304',
    'Networking Business Leaders',
    'Session de networking exclusif pour dirigeants et décideurs. Cocktail et échanges professionnels.',
    'conference',
    'Business',
    CURRENT_DATE + INTERVAL '4 days',
    '18:00:00',
    '21:00:00',
    NOW() + INTERVAL '4 days',
    NOW() + INTERVAL '4 days' + INTERVAL '3 hours',
    'Salon VIP',
    NULL,
    '00000000-0000-0000-0000-000000000001',
    100,
    67,
    true,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. INSERT NEWS ARTICLES
-- =====================================================

-- Ensure news_articles table exists and has correct columns
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    -- Add columns if they don't exist
    BEGIN
        ALTER TABLE news_articles ADD COLUMN excerpt TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN author_id UUID REFERENCES auth.users(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN author TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN published BOOLEAN DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN category TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN tags TEXT[];
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN image_url TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN published_at TIMESTAMPTZ;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO news_articles (id, title, content, excerpt, author_id, author, published, published_at, category, tags, image_url, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000401',
    'SIB 2025 : Record d''affluence attendu',
    'Le salon SIB 2025 s''annonce comme l''édition la plus importante de son histoire avec plus de 500 exposants confirmés et 50 000 visiteurs attendus. Cette année, l''accent est mis sur l''innovation durable et les technologies vertes...',
    'Le salon SIB 2025 bat tous les records avec 500 exposants et 50 000 visiteurs attendus.',
    (SELECT id FROM users WHERE email = 'admin@sib.com' LIMIT 1),
    'Admin SIB',
    true,
    NOW() - INTERVAL '2 days',
    'Événement',
    ARRAY['SIB', 'Salon', 'Innovation'],
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    'TechExpo Solutions dévoile sa nouvelle plateforme VR',
    'L''exposant TechExpo Solutions présentera en exclusivité sa nouvelle plateforme de réalité virtuelle destinée aux salons professionnels. Une révolution dans l''expérience visiteur...',
    'TechExpo Solutions lance une plateforme VR révolutionnaire pour les salons.',
    (SELECT id FROM users WHERE email = 'admin@sib.com' LIMIT 1),
    'Admin SIB',
    true,
    NOW() - INTERVAL '5 days',
    'Technologie',
    ARRAY['Innovation', 'Réalité Virtuelle', 'TechExpo'],
    'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800',
    NOW() - INTERVAL '5 days'
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    'Agriculture de demain : Les innovations d''AgriInnov',
    'AgriInnov présente ses dernières solutions IoT pour l''agriculture de précision. Des capteurs intelligents et des systèmes d''irrigation automatisés qui réduisent la consommation d''eau de 40%...',
    'AgriInnov révolutionne l''agriculture avec des solutions IoT innovantes.',
    (SELECT id FROM users WHERE email = 'admin@sib.com' LIMIT 1),
    'Admin SIB',
    true,
    NOW() - INTERVAL '1 day',
    'Agriculture',
    ARRAY['AgriTech', 'Innovation', 'Développement Durable'],
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000404',
    'ModeDesign Paris : La haute couture rencontre la tech',
    'La maison ModeDesign Paris fusionne tradition et innovation avec sa nouvelle collection intégrant des textiles intelligents et des accessoires connectés...',
    'ModeDesign Paris présente une collection alliant haute couture et technologies.',
    (SELECT id FROM users WHERE email = 'admin@sib.com' LIMIT 1),
    'Admin SIB',
    true,
    NOW() - INTERVAL '3 days',
    'Mode',
    ARRAY['Mode', 'Innovation', 'Luxe'],
    'https://images.unsplash.com/photo-1558769132-cb1aea1f1c77?w=800',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. INSERT TIME SLOTS (Plus de créneaux pour calendriers)
-- =====================================================

-- Ensure time_slots table exists
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id),
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE time_slots ADD COLUMN exhibitor_id UUID REFERENCES exhibitors(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN slot_date DATE;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN start_time TIME;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN end_time TIME;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN duration INTEGER;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN type TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN max_bookings INTEGER DEFAULT 1;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN current_bookings INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN available BOOLEAN DEFAULT true;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN location TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO time_slots (id, exhibitor_id, slot_date, start_time, end_time, duration, type, max_bookings, current_bookings, available, location, created_at)
VALUES
  -- TechExpo Solutions - Aujourd'hui
  (
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '09:00:00',
    '09:30:00',
    30,
    'in-person',
    3,
    2,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000502',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '10:00:00',
    '10:30:00',
    30,
    'in-person',
    3,
    1,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000503',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '14:00:00',
    '14:30:00',
    30,
    'virtual',
    5,
    3,
    true,
    'Salle VR - Démo en ligne',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000508',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '15:00:00',
    '15:30:00',
    30,
    'in-person',
    3,
    0,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000509',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '16:00:00',
    '16:30:00',
    30,
    'virtual',
    5,
    1,
    true,
    'Salle VR - Démo en ligne',
    NOW()
  ),
  -- TechExpo Solutions - Demain
  (
    '00000000-0000-0000-0000-000000000510',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE + INTERVAL '1 day',
    '09:00:00',
    '09:30:00',
    30,
    'in-person',
    3,
    1,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000511',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE + INTERVAL '1 day',
    '11:00:00',
    '11:30:00',
    30,
    'in-person',
    3,
    0,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000512',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE + INTERVAL '1 day',
    '14:00:00',
    '14:30:00',
    30,
    'virtual',
    5,
    1,
    true,
    'Salle VR - Démo en ligne',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- APPOINTMENTS (Rendez-vous)
-- =====================================================

-- Ensure appointments table exists
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id),
  visitor_id UUID REFERENCES visitor_profiles(id),
  time_slot_id UUID REFERENCES time_slots(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE appointments ADD COLUMN exhibitor_id UUID REFERENCES exhibitors(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE appointments ADD COLUMN visitor_id UUID REFERENCES visitor_profiles(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE appointments ADD COLUMN time_slot_id UUID REFERENCES time_slots(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'pending';
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE appointments ADD COLUMN notes TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE appointments ADD COLUMN meeting_type TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- Disable trigger to allow seeding data that might violate quotas (e.g. free user with confirmed appointment)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_check_visitor_quota') THEN
    ALTER TABLE public.appointments DISABLE TRIGGER trigger_check_visitor_quota;
  END IF;
END $$;

-- 8.5. INSERT MORE TIME SLOTS (AgriInnov & ModeDesign)
-- =====================================================
INSERT INTO time_slots (id, exhibitor_id, slot_date, start_time, end_time, duration, type, max_bookings, current_bookings, available, location, created_at)
VALUES
  -- AgriInnov - Aujourd'hui
  (
    '00000000-0000-0000-0000-000000000504',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE,
    '11:00:00',
    '11:30:00',
    30,
    'in-person',
    2,
    0,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000513',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE,
    '14:00:00',
    '14:30:00',
    30,
    'in-person',
    2,
    1,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  -- AgriInnov - Demain
  (
    '00000000-0000-0000-0000-000000000505',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE + INTERVAL '1 day',
    '10:00:00',
    '10:30:00',
    30,
    'in-person',
    2,
    1,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000515',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE + INTERVAL '1 day',
    '14:00:00',
    '14:30:00',
    30,
    'virtual',
    3,
    0,
    true,
    'Présentation IoT en ligne',
    NOW()
  ),
  -- ModeDesign Paris - Aujourd'hui
  (
    '00000000-0000-0000-0000-000000000506',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE,
    '10:00:00',
    '10:45:00',
    45,
    'in-person',
    1,
    1,
    false,
    'Showroom C12 - Luxe',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000516',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE,
    '11:30:00',
    '12:15:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000517',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE,
    '15:00:00',
    '15:45:00',
    45,
    'in-person',
    1,
    1,
    false,
    'Showroom C12 - Luxe',
    NOW()
  ),
  -- ModeDesign Paris - Demain
  (
    '00000000-0000-0000-0000-000000000507',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE + INTERVAL '1 day',
    '13:00:00',
    '13:45:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000518',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE + INTERVAL '1 day',
    '16:00:00',
    '16:45:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  ),
  -- Créneaux pour dans 2 jours
  (
    '00000000-0000-0000-0000-000000000519',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE + INTERVAL '2 days',
    '10:00:00',
    '10:30:00',
    30,
    'in-person',
    3,
    0,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000520',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE + INTERVAL '2 days',
    '11:00:00',
    '11:30:00',
    30,
    'in-person',
    2,
    0,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000521',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE + INTERVAL '2 days',
    '14:00:00',
    '14:45:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO appointments (id, exhibitor_id, visitor_id, time_slot_id, status, notes, meeting_type, created_at)
VALUES
  -- Rendez-vous AUJOURD''HUI pour Jean Dupont (VIP Visitor)
  (
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000501',
    'confirmed',
    'Intéressé par la solution VR pour notre prochain salon. Discussion approfondie prévue.',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000610',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000502',
    'confirmed',
    'Suite de notre discussion sur l''implémentation VR',
    'in-person',
    NOW()
  ),
  -- Rendez-vous AUJOURD'HUI pour Marie Martin (Premium Visitor)
  (
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000503',
    'confirmed',
    'Démo de la plateforme VR complète avec cas d''usage agricole',
    'virtual',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000603',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000504',
    'confirmed',
    'Discussion sur les solutions IoT pour exploitation agricole - capteurs et automatisation',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000611',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000513',
    'confirmed',
    'Démonstration des capteurs IoT en conditions réelles',
    'in-person',
    NOW()
  ),
  -- Rendez-vous AUJOURD'HUI pour Pierre Dubois (Basic Visitor)
  (
    '00000000-0000-0000-0000-000000000604',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000506',
    'confirmed',
    'Présentation collection exclusive automne-hiver 2025',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000612',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000517',
    'confirmed',
    'Suite - Sélection de pièces sur-mesure',
    'in-person',
    NOW()
  ),
  -- Rendez-vous AUJOURD'HUI pour Sophie Bernard (Free Visitor)
  (
    '00000000-0000-0000-0000-000000000613',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000509',
    'confirmed',
    'Découverte des technologies VR pour étudiants',
    'virtual',
    NOW()
  ),
  -- Rendez-vous DEMAIN pour Jean Dupont
  (
    '00000000-0000-0000-0000-000000000614',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000510',
    'confirmed',
    'Point final sur le projet VR - prise de décision',
    'in-person',
    NOW()
  ),
  -- Rendez-vous DEMAIN pour Marie Martin
  (
    '00000000-0000-0000-0000-000000000615',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000505',
    'confirmed',
    'Analyse des données IoT collectées - rapport personnalisé',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000616',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000512',
    'pending',
    'Webinaire complet sur la transformation digitale',
    'virtual',
    NOW()
  ),
  -- Rendez-vous DEMAIN pour Pierre Dubois
  (
    '00000000-0000-0000-0000-000000000617',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000507',
    'pending',
    'Essayage final et validation commande',
    'in-person',
    NOW()
  ),
  -- Rendez-vous passé (hier) - pour historique
  (
    '00000000-0000-0000-0000-000000000605',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000009',
    NULL,
    'completed',
    'Première prise de contact - très intéressant',
    'in-person',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000606',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000007',
    NULL,
    'completed',
    'Présentation des solutions AgriInnov - excellente session',
    'in-person',
    NOW() - INTERVAL '2 days'
  ),
  -- Rendez-vous annulé
  (
    '00000000-0000-0000-0000-000000000607',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000010',
    NULL,
    'cancelled',
    'Annulé à la demande du visiteur',
    'in-person',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_check_visitor_quota') THEN
    ALTER TABLE public.appointments ENABLE TRIGGER trigger_check_visitor_quota;
  END IF;
END $$;

-- =====================================================
-- 8.5. INSERT MORE TIME SLOTS (AgriInnov & ModeDesign) - MOVED UP BEFORE APPOINTMENTS
-- =====================================================
-- (Moved to ensure FK constraints are satisfied)


-- =====================================================
-- 10. INSERT CONNECTIONS (Visibles dans calendriers via rendez-vous)
-- =====================================================

-- Ensure connections table exists
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES auth.users(id),
  addressee_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE connections ADD COLUMN requester_id UUID REFERENCES auth.users(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE connections ADD COLUMN addressee_id UUID REFERENCES auth.users(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE connections ADD COLUMN status TEXT DEFAULT 'pending';
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE connections ADD COLUMN message TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO connections (id, requester_id, addressee_id, status, message, created_at)
VALUES
  -- Jean Dupont (VIP) connecté avec Marie Martin (Premium)
  (
    '00000000-0000-0000-0000-000000000701',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008',
    'accepted',
    'Ravi de vous rencontrer au salon. Échangeons sur nos projets communs en innovation.',
    NOW() - INTERVAL '1 day'
  ),
  -- Jean Dupont connecté avec TechExpo (Exposant)
  (
    '00000000-0000-0000-0000-000000000702',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000002',
    'accepted',
    'Très intéressé par vos solutions technologiques VR. Discussion approfondie nécessaire.',
    NOW() - INTERVAL '2 days'
  ),
  -- Marie Martin connectée avec AgriInnov (Exposant)
  (
    '00000000-0000-0000-0000-000000000703',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Vos solutions IoT correspondent parfaitement à nos besoins en agriculture durable.',
    NOW() - INTERVAL '3 days'
  ),
  -- Pierre Dubois connecté avec ModeDesign (Exposant)
  (
    '00000000-0000-0000-0000-000000000704',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000004',
    'accepted',
    'Collaboration potentielle dans le domaine de la mode innovante.',
    NOW() - INTERVAL '1 day'
  ),
  -- Sophie Bernard connectée avec Jean Dupont (Networking)
  (
    '00000000-0000-0000-0000-000000000705',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000007',
    'accepted',
    'Networking étudiant-professionnel. Merci pour vos conseils!',
    NOW() - INTERVAL '2 days'
  ),
  -- Marie Martin connectée avec Pierre Dubois
  (
    '00000000-0000-0000-0000-000000000706',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000009',
    'accepted',
    'Intérêts communs en innovation et design durable',
    NOW() - INTERVAL '1 day'
  ),
  -- Jean Dupont connecté avec AgriInnov
  (
    '00000000-0000-0000-0000-000000000707',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Exploration de synergies entre technologie et agriculture',
    NOW() - INTERVAL '4 days'
  ),
  -- Sophie Bernard connectée avec TechExpo
  (
    '00000000-0000-0000-0000-000000000708',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000002',
    'accepted',
    'Opportunité de stage - merci pour votre accueil!',
    NOW() - INTERVAL '1 day'
  ),
  -- Pierre Dubois connecté avec Jean Dupont
  (
    '00000000-0000-0000-0000-000000000709',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000007',
    'pending',
    'J''aimerais échanger sur votre expérience en consulting',
    NOW()
  ),
  -- Marie Martin connectée avec Gold Partner
  (
    '00000000-0000-0000-0000-000000000710',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000005',
    'accepted',
    'Partenariat stratégique pour projets agricoles innovants',
    NOW() - INTERVAL '5 days'
  ),
  -- Exposants connectés entre eux
  (
    '00000000-0000-0000-0000-000000000711',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Collaboration TechExpo x AgriInnov - solutions VR pour agriculture',
    NOW() - INTERVAL '6 days'
  ),
  (
    '00000000-0000-0000-0000-000000000712',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    'accepted',
    'Innovation mode & tech - projet wearables',
    NOW() - INTERVAL '4 days'
  ),
  -- Partenaires et exposants
  (
    '00000000-0000-0000-0000-000000000713',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    'accepted',
    'Gold Partner sponsoring TechExpo Solutions',
    NOW() - INTERVAL '10 days'
  ),
  (
    '00000000-0000-0000-0000-000000000714',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Support technique Silver Tech pour AgriInnov',
    NOW() - INTERVAL '7 days'
  ),
  -- Connexions en attente
  (
    '00000000-0000-0000-0000-000000000715',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000004',
    'pending',
    'Étudiante intéressée par le secteur de la mode',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 11. INSERT CONVERSATIONS
-- =====================================================

-- Ensure conversations table exists
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT DEFAULT 'direct',
  participants UUID[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE conversations ADD COLUMN type TEXT DEFAULT 'direct';
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE conversations ADD COLUMN participants UUID[];
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE conversations ADD COLUMN created_by UUID REFERENCES auth.users(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO conversations (id, type, participants, created_by, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000801',
    'direct',
    ARRAY['00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000008'::uuid],
    '00000000-0000-0000-0000-000000000007',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000802',
    'direct',
    ARRAY['00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000002'::uuid],
    '00000000-0000-0000-0000-000000000007',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000803',
    'direct',
    ARRAY['00000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-0000-0000-000000000003'::uuid],
    '00000000-0000-0000-0000-000000000008',
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 12. INSERT MESSAGES
-- =====================================================

-- Ensure messages table exists
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE messages ADD COLUMN sender_id UUID REFERENCES auth.users(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE messages ADD COLUMN content TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000901',
    '00000000-0000-0000-0000-000000000801',
    '00000000-0000-0000-0000-000000000007',
    'Bonjour Marie, ravi de vous avoir rencontrée au salon !',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000902',
    '00000000-0000-0000-0000-000000000801',
    '00000000-0000-0000-0000-000000000008',
    'Bonjour Jean, moi de même. Votre présentation était très intéressante.',
    NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000903',
    '00000000-0000-0000-0000-000000000801',
    '00000000-0000-0000-0000-000000000007',
    'Merci ! On pourrait organiser une réunion la semaine prochaine ?',
    NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000904',
    '00000000-0000-0000-0000-000000000802',
    '00000000-0000-0000-0000-000000000007',
    'Bonjour, je suis intéressé par votre solution VR.',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000905',
    '00000000-0000-0000-0000-000000000802',
    '00000000-0000-0000-0000-000000000002',
    'Bonjour ! Nous serions ravis de vous faire une démonstration. Êtes-vous disponible demain ?',
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000906',
    '00000000-0000-0000-0000-000000000803',
    '00000000-0000-0000-0000-000000000008',
    'Bonjour AgriInnov, vos solutions IoT m''intéressent beaucoup.',
    NOW() - INTERVAL '3 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000907',
    '00000000-0000-0000-0000-000000000803',
    '00000000-0000-0000-0000-000000000003',
    'Merci pour votre intérêt ! Nous avons plusieurs solutions adaptées à différents types d''exploitations.',
    NOW() - INTERVAL '2 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 13. INSERT USER FAVORITES
-- =====================================================

-- Ensure user_favorites table exists with correct constraints
DROP TABLE IF EXISTS user_favorites CASCADE;
CREATE TABLE user_favorites (
  user_id UUID REFERENCES auth.users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, entity_type, entity_id)
);

INSERT INTO user_favorites (user_id, entity_type, entity_id, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000007', 'exhibitor', '00000000-0000-0000-0000-000000000102', NOW()),
  ('00000000-0000-0000-0000-000000000007', 'exhibitor', '00000000-0000-0000-0000-000000000103', NOW()),
  ('00000000-0000-0000-0000-000000000007', 'event', '00000000-0000-0000-0000-000000000301', NOW()),
  ('00000000-0000-0000-0000-000000000008', 'exhibitor', '00000000-0000-0000-0000-000000000103', NOW()),
  ('00000000-0000-0000-0000-000000000008', 'event', '00000000-0000-0000-0000-000000000302', NOW()),
  ('00000000-0000-0000-0000-000000000009', 'exhibitor', '00000000-0000-0000-0000-000000000104', NOW()),
  ('00000000-0000-0000-0000-000000000009', 'event', '00000000-0000-0000-0000-000000000303', NOW())
ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING;

-- =====================================================
-- 14. INSERT DAILY QUOTAS
-- =====================================================

-- Ensure daily_quotas table exists with correct constraints
DROP TABLE IF EXISTS daily_quotas CASCADE;
CREATE TABLE daily_quotas (
  user_id UUID REFERENCES auth.users(id),
  quota_date DATE NOT NULL,
  connections_used INTEGER DEFAULT 0,
  messages_used INTEGER DEFAULT 0,
  meetings_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, quota_date)
);

INSERT INTO daily_quotas (user_id, quota_date, connections_used, messages_used, meetings_used, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000007', CURRENT_DATE, 2, 5, 1, NOW()),
  ('00000000-0000-0000-0000-000000000008', CURRENT_DATE, 1, 3, 2, NOW()),
  ('00000000-0000-0000-0000-000000000009', CURRENT_DATE, 1, 1, 1, NOW()),
  ('00000000-0000-0000-0000-000000000010', CURRENT_DATE, 0, 0, 0, NOW())
ON CONFLICT (user_id, quota_date) DO UPDATE SET
  connections_used = EXCLUDED.connections_used,
  messages_used = EXCLUDED.messages_used,
  meetings_used = EXCLUDED.meetings_used;

-- =====================================================
-- 15. INSERT MINI-SITES (Pages exposants avec sections hero, about, contact)
-- =====================================================

-- Ensure mini_sites table exists
CREATE TABLE IF NOT EXISTS mini_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id),
  theme TEXT DEFAULT 'modern',
  custom_colors JSONB,
  sections JSONB,
  published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE mini_sites ADD COLUMN exhibitor_id UUID REFERENCES exhibitors(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE mini_sites ADD COLUMN theme TEXT DEFAULT 'modern';
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE mini_sites ADD COLUMN custom_colors JSONB;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE mini_sites ADD COLUMN sections JSONB;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE mini_sites ADD COLUMN published BOOLEAN DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE mini_sites ADD COLUMN views INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO mini_sites (id, exhibitor_id, theme, custom_colors, sections, published, views, created_at)
VALUES
  -- ABB Marine & Ports Mini-Site
  (
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-000000000102',
    'modern',
    '{"primary": "#ff0000", "secondary": "#333333", "accent": "#666666"}',
    '[
      {"type": "hero", "title": "ABB Marine & Ports", "subtitle": "L''avenir de la navigation est électrique, numérique et connecté", "image": "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200", "cta_text": "Découvrir nos solutions", "cta_link": "#products"},
      {"type": "about", "title": "À propos de nous", "content": "ABB Marine & Ports est le leader mondial en automatisation et électrification marine. Nous fournissons des solutions de pointe pour les ports et les navires, permettant une exploitation plus efficace et durable.", "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"},
      {"type": "contact", "title": "Contactez-nous", "email": "contact@abb.com", "phone": "+46 10 242 4000", "address": "Affolternstrasse 44, 8050 Zurich, Suisse", "form_enabled": true}
    ]',
    true,
    2500,
    NOW()
  ),
  -- Advanced Port Systems Mini-Site
  (
    '00000000-0000-0000-0000-000000001002',
    '00000000-0000-0000-0000-000000000103',
    'nature',
    '{"primary": "#1e40af", "secondary": "#3b82f6", "accent": "#4ade80"}',
    '[
      {"type": "hero", "title": "Advanced Port Systems", "subtitle": "Optimisation portuaire par l''IA", "image": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200", "cta_text": "Explorer nos solutions", "cta_link": "#products"},
      {"type": "about", "title": "Notre mission", "content": "Advanced Port Systems développe des systèmes automatisés et des solutions d''IA pour l''optimisation des terminaux portuaires. Nos technologies permettent d''augmenter la productivité de 30%.", "image": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800"},
      {"type": "contact", "title": "Nous contacter", "email": "contact@advancedportsys.cn", "phone": "+86 138 0013 8000", "address": "Tech Park, Shanghai, Chine", "form_enabled": true}
    ]',
    true,
    1200,
    NOW()
  ),
  -- Maritime Equipment Co Mini-Site
  (
    '00000000-0000-0000-0000-000000001003',
    '00000000-0000-0000-0000-000000000104',
    'elegant',
    '{"primary": "#16a34a", "secondary": "#22c55e", "accent": "#a78bfa"}',
    '[
      {"type": "hero", "title": "Maritime Equipment Co", "subtitle": "L''excellence en équipement portuaire", "image": "https://images.unsplash.com/photo-1558769132-cb1aea1f1c77?w=1200", "cta_text": "Voir le catalogue", "cta_link": "#products"},
      {"type": "about", "title": "Notre maison", "content": "Maritime Equipment Co est un fabricant français d''équipements maritimes et portuaires de haute qualité. Nous équipons les plus grands ports mondiaux depuis plus de 50 ans.", "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"},
      {"type": "contact", "title": "Demander un devis", "email": "contact@maritimeequip.fr", "phone": "+33 6 56 78 90 12", "address": "Zone Portuaire, Marseille, France", "form_enabled": true}
    ]',
    true,
    800,
    NOW()
  ),
  -- StartUp Port Innovations Mini-Site
  (
    '00000000-0000-0000-0000-000000001004',
    '00000000-0000-0000-0000-000000000117',
    'modern',
    '{"primary": "#0ea5e9", "secondary": "#0f172a", "accent": "#f59e0b"}',
    '[
      {"type": "hero", "title": "StartUp Port Innovations", "subtitle": "L''IoT au service de la performance portuaire", "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200", "cta_text": "Découvrir nos capteurs", "cta_link": "#products"},
      {"type": "about", "title": "Innovation IoT", "content": "Nous transformons les ports traditionnels en ports intelligents grâce à nos capteurs IoT brevetés et notre plateforme d''analyse prédictive.", "image": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800"},
      {"type": "contact", "title": "Rejoignez la révolution", "email": "hello@startupportinno.com", "phone": "+33 7 89 01 23 45", "address": "Station F, Paris, France", "form_enabled": true}
    ]',
    false,
    450,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  theme = EXCLUDED.theme,
  custom_colors = EXCLUDED.custom_colors,
  sections = EXCLUDED.sections,
  published = EXCLUDED.published,
  views = EXCLUDED.views;

-- =====================================================
-- 16. INSERT PRODUCTS (Produits des exposants)
-- =====================================================

-- Ensure products table exists
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  images TEXT[],
  price NUMERIC,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE products ADD COLUMN exhibitor_id UUID REFERENCES exhibitors(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN name TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN description TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN category TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN images TEXT[];
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN price NUMERIC;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO products (id, exhibitor_id, name, description, category, images, price, featured, created_at)
VALUES
  -- ABB Marine & Ports Products
  (
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000000102',
    'Azipod® Propulsion',
    'Système de propulsion électrique révolutionnaire pour navires, offrant une manœuvrabilité exceptionnelle et une efficacité énergétique accrue.',
    'Propulsion',
    ARRAY['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600'],
    NULL,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000002002',
    '00000000-0000-0000-0000-000000000102',
    'Shore-to-Ship Power',
    'Solution d''alimentation électrique à quai permettant aux navires de couper leurs moteurs auxiliaires au port, réduisant les émissions.',
    'Énergie',
    ARRAY['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600'],
    NULL,
    true,
    NOW()
  ),
  -- Advanced Port Systems Products
  (
    '00000000-0000-0000-0000-000000002004',
    '00000000-0000-0000-0000-000000000103',
    'Smart Terminal AI',
    'Système d''IA pour la gestion optimisée des terminaux à conteneurs. Planification automatique des grues et des véhicules.',
    'Logiciel',
    ARRAY['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600'],
    NULL,
    true,
    NOW()
  ),
  -- Maritime Equipment Co Products
  (
    '00000000-0000-0000-0000-000000002007',
    '00000000-0000-0000-0000-000000000104',
    'Heavy Lift Crane X1',
    'Grue portuaire haute performance pour charges lourdes. Capacité de levage de 100 tonnes avec précision millimétrique.',
    'Équipement',
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
    NULL,
    true,
    NOW()
  ),
  -- StartUp Port Innovations Products
  (
    '00000000-0000-0000-0000-000000002010',
    '00000000-0000-0000-0000-000000000117',
    'Smart Sensor Node V2',
    'Capteur IoT multi-paramètres pour le suivi en temps réel des conditions environnementales et structurelles des quais.',
    'IoT',
    ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'],
    NULL,
    true,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  images = EXCLUDED.images,
  price = EXCLUDED.price,
  featured = EXCLUDED.featured;

-- =====================================================
-- BULK DATA FOR METRICS (300+ Exhibitors, 6000+ Visitors)
-- =====================================================
DO $$
DECLARE
  i INTEGER;
  v_user_id UUID;
  v_countries TEXT[] := ARRAY['France', 'Belgique', 'Suisse', 'Canada', 'Maroc', 'Sénégal', 'Côte d''Ivoire', 'Tunisie', 'Maroc', 'Luxembourg', 'Monaco', 'Liban', 'Vietnam', 'Maurice', 'Madagascar', 'Gabon', 'Congo', 'Togo', 'Bénin', 'Guinée', 'Mali', 'Niger', 'Burkina Faso', 'Tchad', 'Centrafrique', 'Djibouti', 'Comores', 'Seychelles', 'Vanuatu', 'Haïti', 'Sainte-Lucie', 'Dominique', 'Grenade', 'Saint-Vincent', 'Antigua', 'Saint-Kitts', 'Maurice', 'Seychelles', 'Vanuatu', 'Haïti'];
  v_categories TEXT[] := ARRAY['institutional', 'port-industry', 'port-operations', 'academic'];
BEGIN
  -- Insert 300 Exhibitors
  FOR i IN 1..300 LOOP
    v_user_id := gen_random_uuid();
    
    INSERT INTO public.users (id, email, name, type, status, created_at)
    VALUES (v_user_id, 'exhibitor-bulk-' || i || '@demo.sib2026.ma', 'Exposant ' || i, 'exhibitor', 'active', NOW() - (i || ' minutes')::interval);
    
    INSERT INTO public.exhibitors (id, user_id, company_name, category, sector, description, verified, created_at)
    VALUES (gen_random_uuid(), v_user_id, 'Company ' || i, v_categories[(i % 4) + 1]::exhibitor_category, 'Secteur ' || (i % 5 + 1), 'Description de l''exposant ' || i, true, NOW() - (i || ' minutes')::interval);
    
    INSERT INTO public.exhibitor_profiles (id, user_id, company_name, country, sector, created_at)
    VALUES (gen_random_uuid(), v_user_id, 'Company ' || i, v_countries[(i % 40) + 1], 'Secteur ' || (i % 5 + 1), NOW() - (i || ' minutes')::interval);
  END LOOP;

  -- Insert 6000 Visitors
  FOR i IN 1..6000 LOOP
    v_user_id := gen_random_uuid();
    
    INSERT INTO public.users (id, email, name, type, status, created_at)
    VALUES (v_user_id, 'visitor-bulk-' || i || '@demo.sib2026.ma', 'Visiteur ' || i, 'visitor', 'active', NOW() - (i || ' seconds')::interval);
    
    INSERT INTO public.visitor_profiles (id, user_id, first_name, last_name, country, created_at)
    VALUES (gen_random_uuid(), v_user_id, 'Visiteur', i::text, v_countries[(i % 40) + 1], NOW() - (i || ' seconds')::interval);
  END LOOP;

  -- Insert 30 Events
  FOR i IN 1..30 LOOP
    INSERT INTO public.events (id, title, description, event_type, type, category, event_date, start_time, end_time, start_date, end_date, location, created_at)
    VALUES (gen_random_uuid(), 'Conférence ' || i, 'Description de la conférence ' || i, 'conference', 'conference', 'Innovation', NOW() + (i || ' hours')::interval, '09:00:00', '10:00:00', NOW() + (i || ' hours')::interval, NOW() + (i + 1 || ' hours')::interval, 'Salle ' || (i % 5 + 1), NOW());
  END LOOP;
END $$;

-- =====================================================
-- FINAL COMMENTS
-- =====================================================
COMMENT ON COLUMN users.visitor_level IS 'Visitor subscription level: free, basic, premium, vip';
COMMENT ON TABLE exhibitors IS 'Exhibitor company profiles and information';
COMMENT ON TABLE partners IS 'Partner company profiles with tier levels';
COMMENT ON TABLE visitor_profiles IS 'Detailed visitor profile information';
COMMENT ON TABLE events IS 'Salon events, conferences, and workshops';
COMMENT ON TABLE news_articles IS 'News articles and announcements';
COMMENT ON TABLE appointments IS 'Scheduled appointments between visitors and exhibitors';
COMMENT ON TABLE connections IS 'Professional connections and networking requests';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Demo data successfully seeded for presentation!';
  RAISE NOTICE 'Created: 10 users (1 admin, 3 exhibitors, 2 partners, 4 visitors)';
  RAISE NOTICE 'Created: 3 exhibitor profiles, 2 partner profiles, 4 visitor profiles';
  RAISE NOTICE 'Created: 3 pavilions, 4 events, 4 news articles';
  RAISE NOTICE 'Created: 22 time slots (today + tomorrow + day after)';
  RAISE NOTICE 'Created: 15 appointments (confirmed, pending, completed, cancelled)';
  RAISE NOTICE 'Created: 15 professional connections (exposants, visiteurs, partenaires)';
  RAISE NOTICE 'Created: 3 conversations, 7 messages, favorites, quotas';
  RAISE NOTICE 'Created: 3 mini-sites complets avec sections (hero, about, contact)';
  RAISE NOTICE 'Created: 9 produits de démonstration (3 par exposant)';
  RAISE NOTICE '';
  RAISE NOTICE '📅 CALENDRIERS REMPLIS:';
  RAISE NOTICE '  - Jean Dupont (VIP): 3 RDV aujourd''hui, 1 demain';
  RAISE NOTICE '  - Marie Martin (Premium): 3 RDV aujourd''hui, 2 demain';
  RAISE NOTICE '  - Pierre Dubois (Basic): 2 RDV aujourd''hui, 1 demain';
  RAISE NOTICE '  - Sophie Bernard (Free): 1 RDV aujourd''hui';
  RAISE NOTICE '  - TechExpo Solutions: 8 créneaux disponibles';
  RAISE NOTICE '  - AgriInnov: 6 créneaux disponibles';
  RAISE NOTICE '  - ModeDesign Paris: 6 créneaux disponibles';
  RAISE NOTICE '';
  RAISE NOTICE '🌐 MINI-SITES EXPOSANTS:';
  RAISE NOTICE '  - TechExpo Solutions: /minisite/00000000-0000-0000-0000-000000000102';
  RAISE NOTICE '  - AgriInnov: /minisite/00000000-0000-0000-0000-000000000103';
  RAISE NOTICE '  - ModeDesign Paris: /minisite/00000000-0000-0000-0000-000000000104';
  RAISE NOTICE '';
  RAISE NOTICE '🤝 CONNEXIONS PROFESSIONNELLES:';
  RAISE NOTICE '  - 12 connexions acceptées (visibles dans tous les calendriers)';
  RAISE NOTICE '  - 3 connexions en attente';
  RAISE NOTICE '  - Réseau complet entre exposants, visiteurs et partenaires';
END $$;


-- [20251224000003_add_partner_projects.sql]
-- =====================================================
-- MIGRATION: Add Partner Projects Table and Seed Data
-- =====================================================

-- 1. Create partner_projects table
CREATE TABLE IF NOT EXISTS partner_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'planned')),
  start_date DATE NOT NULL,
  end_date DATE,
  budget TEXT,
  impact TEXT,
  image_url TEXT,
  technologies TEXT[] DEFAULT '{}',
  team TEXT[] DEFAULT '{}',
  kpis JSONB DEFAULT '{}',
  timeline JSONB DEFAULT '[]',
  project_partners TEXT[] DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  gallery TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE partner_projects ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Public can view partner projects" ON partner_projects;
CREATE POLICY "Public can view partner projects" ON partner_projects FOR SELECT TO public USING (true);

-- 4. Seed Data for Partners
-- We use the IDs from 20251224000002_seed_demo_data.sql

-- Clear existing projects to avoid duplicates during re-runs
DELETE FROM partner_projects;

INSERT INTO partner_projects (partner_id, name, description, status, start_date, end_date, budget, impact, image_url, technologies, team, kpis, timeline, project_partners, documents, gallery)
VALUES
  -- Projects for Platinium Global Corp (00000000-0000-0000-0000-000000000107)
  (
    '00000000-0000-0000-0000-000000000107',
    'Smart Port Hub 2030',
    'Développement d''une plateforme intégrée de gestion portuaire utilisant la 5G et l''IA pour l''automatisation des terminaux.',
    'active',
    '2024-01-01',
    '2026-12-31',
    '15.5M €',
    'Augmentation productivité +40%',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    ARRAY['5G', 'IA', 'Edge Computing'],
    ARRAY['Jean-Marc L.', 'Sarah B.', 'Kevin T.'],
    '{"progress": 65, "satisfaction": 95, "roi": 210}',
    '[{"phase": "Infrastructure", "date": "2024-06-01", "status": "completed", "description": "Installation des antennes 5G"}, {"phase": "Software", "date": "2025-01-15", "status": "current", "description": "Déploiement du moteur IA"}]',
    ARRAY['Port de Tanger', 'Telecom Global'],
    '[{"name": "Livre Blanc", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=400']
  ),
  
  -- Projects for Global Shipping Alliance (00000000-0000-0000-0000-000000000105)
  (
    '00000000-0000-0000-0000-000000000105',
    'Eco-Logistics Network',
    'Optimisation des routes de transport pour réduire l''empreinte carbone de la chaîne logistique globale.',
    'completed',
    '2023-05-10',
    '2024-11-20',
    '4.2M €',
    'Réduction CO2 -25%',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80',
    ARRAY['Big Data', 'Algorithmes Verts'],
    ARRAY['Marc D.', 'Elena S.'],
    '{"progress": 100, "satisfaction": 88, "roi": 145}',
    '[{"phase": "Audit", "date": "2023-06-01", "status": "completed", "description": "Analyse des flux existants"}, {"phase": "Optimisation", "date": "2024-11-20", "status": "completed", "description": "Mise en service du nouveau réseau"}]',
    ARRAY['Green Freight', 'LogiTrack'],
    '[{"name": "Rapport Impact", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400']
  ),

  -- Projects for Port Tech Systems (00000000-0000-0000-0000-000000000109)
  (
    '00000000-0000-0000-0000-000000000109',
    'Blockchain Cargo Tracking',
    'Système de traçabilité immuable pour les marchandises sensibles transitant par les ports internationaux.',
    'active',
    '2024-08-15',
    '2025-12-01',
    '2.8M €',
    'Sécurité accrue 100%',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    ARRAY['Blockchain', 'Hyperledger', 'IoT'],
    ARRAY['Thomas W.', 'Li Na'],
    '{"progress": 45, "satisfaction": 92, "roi": 120}',
    '[{"phase": "MVP", "date": "2024-12-01", "status": "completed", "description": "Test sur le port de Rotterdam"}]',
    ARRAY['IBM Logistics', 'Maersk'],
    '[{"name": "Spécifications", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400']
  ),

  -- Projects for Museum Heritage (00000000-0000-0000-0000-000000000108)
  (
    '00000000-0000-0000-0000-000000000108',
    'Digital Maritime Archive',
    'Numérisation 3D des épaves historiques et création d''un musée virtuel accessible au grand public.',
    'planned',
    '2025-03-01',
    '2027-03-01',
    '1.5M €',
    'Éducation & Culture',
    'https://images.unsplash.com/photo-1501503060445-738213995a8c?w=800&q=80',
    ARRAY['Photogrammétrie', 'VR/AR'],
    ARRAY['Pr. Aris T.', 'Sophie M.'],
    '{"progress": 5, "satisfaction": 100, "roi": 0}',
    '[{"phase": "Scan", "date": "2025-04-01", "status": "upcoming", "description": "Première expédition sous-marine"}]',
    ARRAY['UNESCO', 'DeepSea Research'],
    '[{"name": "Brochure", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400']
  ),

  -- Projects for Silver Tech Group (00000000-0000-0000-0000-000000000106)
  (
    '00000000-0000-0000-0000-000000000106',
    'EventConnect Mobile App',
    'Application mobile de networking en temps réel pour les grands salons internationaux.',
    'completed',
    '2024-01-10',
    '2024-09-30',
    '850k €',
    'Engagement utilisateur +60%',
    'https://images.unsplash.com/photo-1512428559083-a40ce12b26f0?w=800&q=80',
    ARRAY['React Native', 'Node.js', 'WebSockets'],
    ARRAY['Alice R.', 'Bob S.'],
    '{"progress": 100, "satisfaction": 94, "roi": 115}',
    '[{"phase": "Lancement", "date": "2024-09-30", "status": "completed", "description": "Déploiement sur les stores"}]',
    ARRAY['Expo Global'],
    '[{"name": "User Guide", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=400']
  ),

  -- Projects for Ocean Freight Services (00000000-0000-0000-0000-000000000110)
  (
    '00000000-0000-0000-0000-000000000110',
    'Global Route Optimizer',
    'Système d''optimisation des trajets maritimes pour minimiser la consommation de carburant.',
    'active',
    '2024-11-01',
    '2025-12-31',
    '3.5M €',
    'Économie carburant 12%',
    'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800&q=80',
    ARRAY['Python', 'Machine Learning', 'Satellite Data'],
    ARRAY['Capt. Nemo', 'Dr. Aronnax'],
    '{"progress": 30, "satisfaction": 85, "roi": 160}',
    '[{"phase": "Data Collection", "date": "2025-01-01", "status": "current", "description": "Intégration des données météo"}]',
    ARRAY['WeatherGlobal'],
    '[{"name": "Technical Specs", "type": "PDF", "url": "#"}]',
    ARRAY['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400']
  );


-- [20251224000004_fix_partner_projects_relationship.sql]
-- =====================================================
-- MIGRATION: Fix Partner Projects Relationship
-- =====================================================

-- 1. Add user_id to partner_projects to allow direct join with users table
-- This is required for the query in SupabaseService.getUserByEmail
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_projects' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE partner_projects ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Populate user_id from partners table
-- We link partner_projects to users via the partners table
UPDATE partner_projects pp
SET user_id = p.user_id
FROM partners p
WHERE pp.partner_id = p.id
AND pp.user_id IS NULL;

-- 3. Add index for performance
CREATE INDEX IF NOT EXISTS idx_partner_projects_user_id ON partner_projects(user_id);

-- 4. Update RLS policies to include user_id check if needed
-- (The existing policy is public view, so it's fine for now)


-- [20251225000001_create_partner_time_slots.sql]
-- Table pour les créneaux de disponibilité des partenaires
CREATE TABLE IF NOT EXISTS partner_time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER DEFAULT 60,
  type TEXT DEFAULT 'virtual',
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_partner_time_slots_partner_id ON partner_time_slots(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_time_slots_date ON partner_time_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_partner_time_slots_available ON partner_time_slots(available);

-- RLS policies
ALTER TABLE partner_time_slots ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent voir les créneaux disponibles
CREATE POLICY "Anyone can view available partner slots"
  ON partner_time_slots FOR SELECT
  USING (available = true);

-- Les partenaires peuvent gérer leurs propres créneaux
CREATE POLICY "Partners can manage their own slots"
  ON partner_time_slots FOR ALL
  USING (
    partner_id IN (
      SELECT id FROM partners 
      WHERE user_id = auth.uid()
    )
  );

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage all partner slots"
  ON partner_time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );


-- [20251225000001_fix_time_slots_access.sql]
-- Fix time_slots RLS and accessibility
-- Date: 2025-12-25

-- 1. Ensure time_slots table has all required columns and proper structure
DO $$
BEGIN
  -- Check if exhibitor_id column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'exhibitor_id'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_time_slots_exhibitor_id ON time_slots(exhibitor_id);
  END IF;

  -- Ensure slot_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'slot_date'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN slot_date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  -- Ensure start_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN start_time TIME NOT NULL DEFAULT '09:00:00';
  END IF;

  -- Ensure end_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN end_time TIME NOT NULL DEFAULT '10:00:00';
  END IF;

  -- Ensure type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'type'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN type TEXT DEFAULT 'in-person';
  END IF;

  -- Ensure max_bookings column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'max_bookings'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN max_bookings INTEGER DEFAULT 1;
  END IF;

  -- Ensure current_bookings column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'current_bookings'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN current_bookings INTEGER DEFAULT 0;
  END IF;

  -- Ensure available column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'available'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN available BOOLEAN DEFAULT true;
  END IF;

  -- Ensure location column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'location'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN location TEXT;
  END IF;

  -- Ensure duration column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'duration'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN duration INTEGER;
  END IF;

  -- Ensure updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;

END $$;

-- 2. Enable RLS on time_slots if not already enabled
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Public can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can create own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can update own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can delete own time slots" ON time_slots;

-- 4. Create new RLS policies for time_slots
-- Allow everyone to read all time slots
CREATE POLICY "Public can read all time slots" ON time_slots
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users (exhibitors) to create time slots
CREATE POLICY "Authenticated users can create time slots" ON time_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update any time slots (admin/exhibitor management)
CREATE POLICY "Authenticated users can update time slots" ON time_slots
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete time slots
CREATE POLICY "Authenticated users can delete time slots" ON time_slots
  FOR DELETE
  TO authenticated
  USING (true);

-- 5. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_time_slots_exhibitor_id ON time_slots(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_slot_date ON time_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON time_slots(available);
CREATE INDEX IF NOT EXISTS idx_time_slots_exhibitor_date ON time_slots(exhibitor_id, slot_date);

-- 6. Add comment for documentation
COMMENT ON TABLE time_slots IS 'Table for storing exhibitor meeting time slots';
COMMENT ON COLUMN time_slots.exhibitor_id IS 'Reference to the exhibitor offering this time slot';
COMMENT ON COLUMN time_slots.slot_date IS 'Date of the time slot';
COMMENT ON COLUMN time_slots.start_time IS 'Start time of the slot';
COMMENT ON COLUMN time_slots.end_time IS 'End time of the slot';
COMMENT ON COLUMN time_slots.available IS 'Whether the slot is available for booking';


-- [20251225000002_create_demo_accounts.sql]
/*
  # Create Demo Accounts for Testing
  
  This migration creates demo accounts directly in the auth and users tables
  using the standard bcrypt hashing that Supabase uses.
*/

-- Use the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_password text := 'Admin123!';
  v_salt text;
  v_hash text;
  v_record RECORD;
BEGIN
  -- Clean up dependent tables to avoid foreign key violations
  DELETE FROM daily_quotas;
  DELETE FROM user_favorites;
  DELETE FROM products;
  DELETE FROM mini_sites;
  DELETE FROM news_articles;
  DELETE FROM events;
  DELETE FROM appointments;
  DELETE FROM time_slots;
  DELETE FROM messages;
  DELETE FROM conversations;
  DELETE FROM connections;
  DELETE FROM exhibitors;
  DELETE FROM exhibitor_profiles;
  DELETE FROM partner_profiles;
  DELETE FROM visitor_profiles;
  DELETE FROM notifications;
  DELETE FROM registration_requests;
  DELETE FROM partners;

  -- Clean up users
  DELETE FROM public.users;
  DELETE FROM auth.users;

  -- Define the users to create
  FOR v_record IN 
    SELECT * FROM (VALUES 
      ('00000000-0000-0000-0000-000000000001'::uuid, 'admin.sib@sib.com', 'admin', 'Admin SIB'),
      ('00000000-0000-0000-0000-000000000002'::uuid, 'exhibitor-54m@test.sib2026.ma', 'exhibitor', 'ABB Marine & Ports'),
      ('00000000-0000-0000-0000-000000000003'::uuid, 'exhibitor-36m@test.sib2026.ma', 'exhibitor', 'Advanced Port Systems'),
      ('00000000-0000-0000-0000-000000000004'::uuid, 'exhibitor-18m@test.sib2026.ma', 'exhibitor', 'Maritime Equipment Co'),
      ('00000000-0000-0000-0000-000000000017'::uuid, 'exhibitor-9m@test.sib2026.ma', 'exhibitor', 'StartUp Port Innovations'),
      ('00000000-0000-0000-0000-000000000005'::uuid, 'partner-gold@test.sib2026.ma', 'partner', 'Gold Partner Industries'),
      ('00000000-0000-0000-0000-000000000006'::uuid, 'partner-silver@test.sib2026.ma', 'partner', 'Silver Tech Group'),
      ('00000000-0000-0000-0000-000000000011'::uuid, 'partner-platinium@test.sib2026.ma', 'partner', 'Platinium Global Corp'),
      ('00000000-0000-0000-0000-000000000012'::uuid, 'partner-museum@test.sib2026.ma', 'partner', 'Museum Cultural Center'),
      ('00000000-0000-0000-0000-000000000013'::uuid, 'partner-porttech@test.sib2026.ma', 'partner', 'PortTech Solutions'),
      ('00000000-0000-0000-0000-000000000014'::uuid, 'partner-oceanfreight@test.sib2026.ma', 'partner', 'OceanFreight Logistics'),
      ('00000000-0000-0000-0000-000000000015'::uuid, 'partner-coastal@test.sib2026.ma', 'partner', 'Coastal Maritime Services'),
      ('00000000-0000-0000-0000-000000000007'::uuid, 'visitor-vip@test.sib2026.ma', 'visitor', 'VIP Visitor'),
      ('00000000-0000-0000-0000-000000000008'::uuid, 'visitor-premium@test.sib2026.ma', 'visitor', 'Premium Visitor'),
      ('00000000-0000-0000-0000-000000000009'::uuid, 'visitor-basic@test.sib2026.ma', 'visitor', 'Basic Visitor'),
      ('00000000-0000-0000-0000-000000000010'::uuid, 'visitor-free@test.sib2026.ma', 'visitor', 'Free Visitor')
    ) AS t(id, email, type, name)
  LOOP
    v_user_id := v_record.id;
    v_email := v_record.email;

    -- Generate bcrypt hash for the password
    v_hash := crypt(v_password, gen_salt('bf'));

    -- Insert into auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES (v_user_id, v_email, v_hash, NOW(), NOW(), NOW(), 'authenticated', 'authenticated')
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      encrypted_password = EXCLUDED.encrypted_password;

    -- Insert into public.users
    INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
    VALUES (
      v_user_id,
      v_email,
      v_record.name,
      v_record.type,
      'active',
      jsonb_build_object('role', v_record.type),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      type = EXCLUDED.type;
  END LOOP;

  RAISE NOTICE 'Demo accounts created successfully!';
END $$;

-- Verify the accounts were created
SELECT COUNT(*) as created_accounts FROM auth.users WHERE email LIKE '%@test.sib2026.ma' OR email LIKE '%@sib.com';


-- [20251225000003_recreate_demo_accounts.sql]
/*
  # Recreate Demo Accounts - Direct SQL Execution
  
  This script creates demo accounts directly using Supabase's PostgreSQL instance.
  It uses crypt() for bcrypt hashing which is compatible with Supabase.
*/

-- Ensure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 1: Delete old demo data
DELETE FROM public.appointments;
DELETE FROM public.time_slots;
DELETE FROM public.messages;
DELETE FROM public.conversations;
DELETE FROM public.connections;
DELETE FROM public.exhibitors;
DELETE FROM public.exhibitor_profiles;
DELETE FROM public.partner_profiles;
DELETE FROM public.visitor_profiles;
DELETE FROM public.notifications;
DELETE FROM public.registration_requests;
DELETE FROM public.user_favorites;
DELETE FROM public.daily_quotas WHERE user_id IN (
  SELECT id FROM public.users WHERE email IN (
    'admin.sib@sib.com',
    'exhibitor-54m@test.sib2026.ma',
    'exhibitor-36m@test.sib2026.ma',
    'exhibitor-18m@test.sib2026.ma',
    'exhibitor-9m@test.sib2026.ma',
    'partner-gold@test.sib2026.ma',
    'partner-silver@test.sib2026.ma',
    'partner-platinium@test.sib2026.ma',
    'partner-museum@test.sib2026.ma',
    'partner-porttech@test.sib2026.ma',
    'partner-oceanfreight@test.sib2026.ma',
    'partner-coastal@test.sib2026.ma',
    'visitor-vip@test.sib2026.ma',
    'visitor-premium@test.sib2026.ma',
    'visitor-basic@test.sib2026.ma',
    'visitor-free@test.sib2026.ma'
  )
);
DELETE FROM public.users WHERE email IN (
  'admin.sib@sib.com',
  'exhibitor-54m@test.sib2026.ma',
  'exhibitor-36m@test.sib2026.ma',
  'exhibitor-18m@test.sib2026.ma',
  'exhibitor-9m@test.sib2026.ma',
  'partner-gold@test.sib2026.ma',
  'partner-silver@test.sib2026.ma',
  'partner-platinium@test.sib2026.ma',
  'partner-museum@test.sib2026.ma',
  'partner-porttech@test.sib2026.ma',
  'partner-oceanfreight@test.sib2026.ma',
  'partner-coastal@test.sib2026.ma',
  'visitor-vip@test.sib2026.ma',
  'visitor-premium@test.sib2026.ma',
  'visitor-basic@test.sib2026.ma',
  'visitor-free@test.sib2026.ma'
);

DELETE FROM auth.users WHERE email IN (
  'admin.sib@sib.com',
  'exhibitor-54m@test.sib2026.ma',
  'exhibitor-36m@test.sib2026.ma',
  'exhibitor-18m@test.sib2026.ma',
  'exhibitor-9m@test.sib2026.ma',
  'partner-gold@test.sib2026.ma',
  'partner-silver@test.sib2026.ma',
  'partner-platinium@test.sib2026.ma',
  'partner-museum@test.sib2026.ma',
  'partner-porttech@test.sib2026.ma',
  'partner-oceanfreight@test.sib2026.ma',
  'partner-coastal@test.sib2026.ma',
  'visitor-vip@test.sib2026.ma',
  'visitor-premium@test.sib2026.ma',
  'visitor-basic@test.sib2026.ma',
  'visitor-free@test.sib2026.ma'
);

-- Step 2: Create demo accounts with bcrypt-hashed passwords
-- All accounts use password: Admin123!

-- Admin
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin.sib@sib.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin.sib@sib.com',
  'Admin SIB',
  'admin',
  'active',
  jsonb_build_object('role', 'administrator'),
  NOW(),
  NOW()
);

-- Exhibitors (54m², 36m², 18m², 9m²)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'exhibitor-54m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000003', 'exhibitor-36m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000004', 'exhibitor-18m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000017', 'exhibitor-9m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'exhibitor-54m@test.sib2026.ma', 'ABB Marine & Ports', 'exhibitor', 'active', jsonb_build_object('sector', 'Technology'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'exhibitor-36m@test.sib2026.ma', 'Advanced Port Systems', 'exhibitor', 'active', jsonb_build_object('sector', 'Automation'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'exhibitor-18m@test.sib2026.ma', 'Maritime Equipment Co', 'exhibitor', 'active', jsonb_build_object('sector', 'Equipment'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000017', 'exhibitor-9m@test.sib2026.ma', 'StartUp Port Innovations', 'exhibitor', 'active', jsonb_build_object('sector', 'IoT'), NOW(), NOW());

-- Partners
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES 
  ('00000000-0000-0000-0000-000000000005', 'partner-gold@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000006', 'partner-silver@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000011', 'partner-platinium@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000012', 'partner-museum@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000013', 'partner-porttech@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000014', 'partner-oceanfreight@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000015', 'partner-coastal@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000005', 'partner-gold@test.sib2026.ma', 'Gold Partner Industries', 'partner', 'active', jsonb_build_object('level', 'gold'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000006', 'partner-silver@test.sib2026.ma', 'Silver Tech Group', 'partner', 'active', jsonb_build_object('level', 'silver'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000011', 'partner-platinium@test.sib2026.ma', 'Platinium Global Corp', 'partner', 'active', jsonb_build_object('level', 'platinium'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', 'partner-museum@test.sib2026.ma', 'Museum Cultural Center', 'partner', 'active', jsonb_build_object('level', 'museum'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000013', 'partner-porttech@test.sib2026.ma', 'PortTech Solutions', 'partner', 'active', jsonb_build_object('level', 'porttech'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000014', 'partner-oceanfreight@test.sib2026.ma', 'OceanFreight Logistics', 'partner', 'active', jsonb_build_object('level', 'oceanfreight'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000015', 'partner-coastal@test.sib2026.ma', 'Coastal Maritime Services', 'partner', 'active', jsonb_build_object('level', 'coastal'), NOW(), NOW());

-- Visitors
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES 
  ('00000000-0000-0000-0000-000000000007', 'visitor-vip@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000008', 'visitor-premium@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000009', 'visitor-basic@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000010', 'visitor-free@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000007', 'visitor-vip@test.sib2026.ma', 'VIP Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'vip'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000008', 'visitor-premium@test.sib2026.ma', 'Premium Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'premium'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000009', 'visitor-basic@test.sib2026.ma', 'Basic Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'basic'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000010', 'visitor-free@test.sib2026.ma', 'Free Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'free'), NOW(), NOW());

-- Step 3: Create exhibitor records (linking users to the exhibitors table)
INSERT INTO public.exhibitors (user_id, company_name, category, sector, description, logo_url, website, verified, featured, contact_info, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'ABB Marine & Ports', 'port-industry', 'Technology', 'Leader in maritime automation and port technology solutions', NULL, 'https://www.abb.com', true, true, jsonb_build_object('email', 'exhibitor-54m@test.sib2026.ma', 'phone', '+212 6 12 34 56 78', 'address', '123 Tech Street, Casablanca', 'name', 'ABB Sales Team'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Advanced Port Systems', 'port-operations', 'Automation', 'Cutting-edge automation systems for modern ports', NULL, 'https://www.advancedport.com', true, true, jsonb_build_object('email', 'exhibitor-36m@test.sib2026.ma', 'phone', '+212 6 98 76 54 32', 'address', '456 Port Avenue, Tangier', 'name', 'APS Team'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Maritime Equipment Co', 'port-industry', 'Equipment', 'Premium maritime equipment supplier', NULL, 'https://www.maritimeequip.com', true, false, jsonb_build_object('email', 'exhibitor-18m@test.sib2026.ma', 'phone', '+212 6 55 44 33 22', 'address', '789 Harbor Blvd, Rabat', 'name', 'Maritime Team'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000017', 'StartUp Port Innovations', 'port-operations', 'IoT', 'Innovative IoT solutions for port operations', NULL, 'https://www.portinnovations.startup', false, false, jsonb_build_object('email', 'exhibitor-9m@test.sib2026.ma', 'phone', '+212 6 11 22 33 44', 'address', '321 Innovation Park, Fez', 'name', 'StartUp Team'), NOW(), NOW());

-- Step 4: Create partner records (link to partners table)
INSERT INTO public.partners (user_id, company_name, partner_type, partnership_level, sector, description, logo_url, website, verified, contact_info, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000005', 'Gold Partner Industries', 'corporate', 'gold', 'Port Operations', 'Premium partnership for port excellence', NULL, 'https://www.goldpartner.com', true, jsonb_build_object('email', 'partner-gold@test.sib2026.ma', 'phone', '+212 6 99 88 77 66', 'address', '111 Gold Street, Casablanca'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000006', 'Silver Tech Group', 'tech', 'silver', 'Technology', 'Technology partner for digital transformation', NULL, 'https://www.silvertech.com', true, jsonb_build_object('email', 'partner-silver@test.sib2026.ma', 'phone', '+212 6 77 66 55 44', 'address', '222 Silver Ave, Marrakech'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000011', 'Platinium Global Corp', 'corporate', 'platinium', 'Port Management', 'Global platinum partner', NULL, 'https://www.platinium-global.com', true, jsonb_build_object('email', 'partner-platinium@test.sib2026.ma', 'phone', '+212 6 33 44 55 66', 'address', '333 Platinum Lane, Agadir'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', 'Museum Cultural Center', 'cultural', 'museum', 'Culture & Heritage', 'Cultural partnership for heritage', NULL, 'https://www.museum-center.ma', true, jsonb_build_object('email', 'partner-museum@test.sib2026.ma', 'phone', '+212 6 22 33 44 55', 'address', '444 Culture Way, Essaouira'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000013', 'PortTech Solutions', 'tech', 'gold', 'Technology', 'Port technology innovation partner', NULL, 'https://www.porttech-solutions.com', true, jsonb_build_object('email', 'partner-porttech@test.sib2026.ma', 'phone', '+212 6 11 22 33 44', 'address', '555 Tech Drive, Tétouan'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000014', 'OceanFreight Logistics', 'logistics', 'silver', 'Logistics', 'Maritime freight specialist', NULL, 'https://www.oceanfreight.logistics', true, jsonb_build_object('email', 'partner-oceanfreight@test.sib2026.ma', 'phone', '+212 6 88 99 00 11', 'address', '666 Ocean Path, Safi'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000015', 'Coastal Maritime Services', 'services', 'silver', 'Maritime Services', 'Comprehensive maritime services', NULL, 'https://www.coastal-maritime.com', true, jsonb_build_object('email', 'partner-coastal@test.sib2026.ma', 'phone', '+212 6 77 88 99 00', 'address', '777 Coastal Road, El Jadida'), NOW(), NOW());

-- Verify accounts were created
SELECT COUNT(*) as created_accounts FROM auth.users WHERE email LIKE '%@test.sib2026.ma' OR email LIKE '%@sib.com';
SELECT COUNT(*) as exhibitors_count FROM public.exhibitors;
SELECT COUNT(*) as partners_count FROM public.partners;


-- [20251225000004_populate_exhibitors_partners.sql]
-- Migration: Create Exhibitors and Partners from existing users
-- Date: 2025-12-25

-- First, delete any existing data to avoid duplicates
DELETE FROM public.exhibitors WHERE user_id IN (
  SELECT id FROM public.users WHERE type = 'exhibitor' AND email LIKE '%@test.sib2026.ma'
);

DELETE FROM public.partners WHERE user_id IN (
  SELECT id FROM public.users WHERE type = 'partner' AND email LIKE '%@test.sib2026.ma'
);

-- Create exhibitors from users with type='exhibitor'
INSERT INTO public.exhibitors (user_id, company_name, category, sector, description, contact_info, created_at, updated_at)
SELECT 
  u.id,
  u.name,
  CASE 
    WHEN u.email LIKE '%-54m%' THEN 'port-industry'::exhibitor_category
    WHEN u.email LIKE '%-36m%' THEN 'port-operations'::exhibitor_category
    WHEN u.email LIKE '%-18m%' THEN 'port-industry'::exhibitor_category
    WHEN u.email LIKE '%-9m%' THEN 'port-operations'::exhibitor_category
    ELSE 'port-industry'::exhibitor_category
  END as category,
  CASE 
    WHEN u.email LIKE '%-54m%' THEN 'Technology'
    WHEN u.email LIKE '%-36m%' THEN 'Automation'
    WHEN u.email LIKE '%-18m%' THEN 'Equipment'
    WHEN u.email LIKE '%-9m%' THEN 'IoT'
    ELSE 'Technology'
  END as sector,
  CASE 
    WHEN u.email LIKE '%-54m%' THEN 'Leader in maritime automation and port technology solutions'
    WHEN u.email LIKE '%-36m%' THEN 'Cutting-edge automation systems for modern ports'
    WHEN u.email LIKE '%-18m%' THEN 'Premium maritime equipment supplier'
    WHEN u.email LIKE '%-9m%' THEN 'Innovative IoT solutions for port operations'
    ELSE 'Port exhibitor'
  END as description,
  jsonb_build_object('email', u.email, 'phone', '+212 6 00 00 00 00', 'name', u.name) as contact_info,
  NOW(),
  NOW()
FROM public.users u
WHERE u.type = 'exhibitor' AND u.email LIKE '%@test.sib2026.ma';

-- Create partners from users with type='partner'
INSERT INTO public.partners (user_id, company_name, partner_type, partnership_level, sector, description, contact_info, created_at, updated_at)
SELECT 
  u.id,
  u.name,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'corporate'
    WHEN u.email LIKE '%silver%' THEN 'tech'
    WHEN u.email LIKE '%platinium%' THEN 'corporate'
    WHEN u.email LIKE '%museum%' THEN 'cultural'
    WHEN u.email LIKE '%porttech%' THEN 'tech'
    WHEN u.email LIKE '%oceanfreight%' THEN 'logistics'
    WHEN u.email LIKE '%coastal%' THEN 'services'
    ELSE 'corporate'
  END as partner_type,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'gold'
    WHEN u.email LIKE '%silver%' THEN 'silver'
    WHEN u.email LIKE '%platinium%' THEN 'platinium'
    WHEN u.email LIKE '%museum%' THEN 'museum'
    WHEN u.email LIKE '%porttech%' THEN 'gold'
    WHEN u.email LIKE '%oceanfreight%' THEN 'silver'
    WHEN u.email LIKE '%coastal%' THEN 'silver'
    ELSE 'silver'
  END as partnership_level,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'Port Operations'
    WHEN u.email LIKE '%silver%' THEN 'Technology'
    WHEN u.email LIKE '%platinium%' THEN 'Port Management'
    WHEN u.email LIKE '%museum%' THEN 'Culture & Heritage'
    WHEN u.email LIKE '%porttech%' THEN 'Technology'
    WHEN u.email LIKE '%oceanfreight%' THEN 'Logistics'
    WHEN u.email LIKE '%coastal%' THEN 'Maritime Services'
    ELSE 'General'
  END as sector,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'Premium partnership for port excellence'
    WHEN u.email LIKE '%silver%' THEN 'Technology partner for digital transformation'
    WHEN u.email LIKE '%platinium%' THEN 'Global platinum partner'
    WHEN u.email LIKE '%museum%' THEN 'Cultural partnership for heritage'
    WHEN u.email LIKE '%porttech%' THEN 'Port technology innovation partner'
    WHEN u.email LIKE '%oceanfreight%' THEN 'Maritime freight specialist'
    WHEN u.email LIKE '%coastal%' THEN 'Comprehensive maritime services'
    ELSE 'Strategic partner'
  END as description,
  jsonb_build_object('email', u.email, 'phone', '+212 6 00 00 00 00', 'name', u.name) as contact_info,
  NOW(),
  NOW()
FROM public.users u
WHERE u.type = 'partner' AND u.email LIKE '%@test.sib2026.ma';

-- Verify the data was created
SELECT 'Exhibitors created' as status, COUNT(*) as count FROM public.exhibitors;
SELECT 'Partners created' as status, COUNT(*) as count FROM public.partners;


-- [20251229_enhance_partners_table.sql]
-- Migration pour améliorer la table partners avec les nouveaux champs
-- Date: 2025-12-29
-- Description: Ajout de champs pour la page partenaire enrichie (En savoir plus)

-- Ajouter les nouvelles colonnes pour les informations enrichies
ALTER TABLE partners
ADD COLUMN IF NOT EXISTS mission text,
ADD COLUMN IF NOT EXISTS vision text,
ADD COLUMN IF NOT EXISTS values jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS awards jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS key_figures jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS testimonials jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS news jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS expertise jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS clients jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS established_year integer,
ADD COLUMN IF NOT EXISTS employees text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'Maroc';

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN partners.mission IS 'Mission de l''entreprise';
COMMENT ON COLUMN partners.vision IS 'Vision de l''entreprise';
COMMENT ON COLUMN partners.values IS 'Valeurs de l''entreprise (JSONB array de strings)';
COMMENT ON COLUMN partners.certifications IS 'Certifications obtenues (JSONB array de strings)';
COMMENT ON COLUMN partners.awards IS 'Récompenses (JSONB array de {name, year, issuer})';
COMMENT ON COLUMN partners.social_media IS 'Liens réseaux sociaux (JSONB object {linkedin, twitter, facebook, instagram, youtube})';
COMMENT ON COLUMN partners.key_figures IS 'Chiffres clés (JSONB array de {label, value, icon})';
COMMENT ON COLUMN partners.testimonials IS 'Témoignages (JSONB array de {quote, author, role, avatar})';
COMMENT ON COLUMN partners.news IS 'Actualités du partenaire (JSONB array de {title, date, excerpt, image})';
COMMENT ON COLUMN partners.expertise IS 'Domaines d''expertise (JSONB array de strings)';
COMMENT ON COLUMN partners.clients IS 'Clients référents (JSONB array de strings)';
COMMENT ON COLUMN partners.video_url IS 'URL de la vidéo de présentation (YouTube, Vimeo)';
COMMENT ON COLUMN partners.gallery IS 'Galerie photos (JSONB array d''URLs)';
COMMENT ON COLUMN partners.established_year IS 'Année de création de l''entreprise';
COMMENT ON COLUMN partners.employees IS 'Nombre d''employés (ex: 500-1000)';
COMMENT ON COLUMN partners.country IS 'Pays de l''entreprise';

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_partners_country ON partners(country);
CREATE INDEX IF NOT EXISTS idx_partners_established_year ON partners(established_year);

-- Mise à jour des données existantes avec des valeurs par défaut enrichies pour la démo
UPDATE partners
SET 
  mission = COALESCE(mission, 'Contribuer à l''excellence du secteur portuaire africain par l''innovation et le partenariat durable.'),
  vision = COALESCE(vision, 'Devenir un acteur clé de la transformation digitale des infrastructures portuaires.'),
  values = COALESCE(NULLIF(values::text, '[]')::jsonb, '["Innovation", "Excellence", "Durabilité", "Partenariat", "Intégrité"]'::jsonb),
  expertise = COALESCE(NULLIF(expertise::text, '[]')::jsonb, '["Gestion portuaire", "Digitalisation", "Logistique maritime", "Développement durable"]'::jsonb),
  established_year = COALESCE(established_year, 2010),
  employees = COALESCE(employees, '500-1000'),
  country = COALESCE(country, 'Maroc'),
  certifications = COALESCE(NULLIF(certifications::text, '[]')::jsonb, '["ISO 9001:2015", "ISO 14001:2015"]'::jsonb)
WHERE mission IS NULL OR values = '[]'::jsonb;

-- Exemple de structure pour les awards
-- [
--   {"name": "Prix de l'Innovation", "year": 2024, "issuer": "African Ports Association"}
-- ]

-- Exemple de structure pour social_media
-- {
--   "linkedin": "https://linkedin.com/company/...",
--   "twitter": "https://twitter.com/...",
--   "facebook": "https://facebook.com/...",
--   "youtube": "https://youtube.com/@..."
-- }

-- Exemple de structure pour testimonials
-- [
--   {
--     "quote": "Un partenaire d'exception...",
--     "author": "Jean Dupont",
--     "role": "Directeur Général",
--     "avatar": "https://..."
--   }
-- ]

-- Exemple de structure pour key_figures
-- [
--   {"label": "Chiffre d'affaires", "value": "45M €", "icon": "TrendingUp"},
--   {"label": "Projets réalisés", "value": "120+", "icon": "Target"}
-- ]

-- Vérification de la structure finale
SELECT 
  id,
  company_name,
  mission,
  vision,
  values,
  certifications,
  established_year,
  employees,
  country,
  expertise
FROM partners
LIMIT 3;


-- [20251229_enhance_products_table.sql]
-- Migration pour améliorer la table products avec les nouveaux champs
-- Date: 2025-12-29
-- Description: Ajout de champs pour la modal produit améliorée

-- Créer la colonne 'image' si elle n'existe pas (pour compatibilité)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image text;

-- Ajouter les colonnes pour les nouvelles fonctionnalités
-- Note: la colonne 'images' existe déjà en text[], on ne la recrée pas
ALTER TABLE products
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS certified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_time text,
ADD COLUMN IF NOT EXISTS original_price text,
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb;

-- Migrer les données de 'image' vers 'images' si la colonne contient des données
-- La colonne images est de type text[], on utilise array_append
UPDATE products
SET images = ARRAY[image]::text[]
WHERE image IS NOT NULL 
  AND image != '' 
  AND (images IS NULL OR array_length(images, 1) IS NULL);

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN products.images IS 'Tableau d''URLs d''images du produit (text[] array - compatible avec le schema existant)';
COMMENT ON COLUMN products.video_url IS 'URL de la vidéo de démonstration (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN products.is_new IS 'Indique si le produit est nouveau';
COMMENT ON COLUMN products.in_stock IS 'Indique si le produit est en stock';
COMMENT ON COLUMN products.certified IS 'Indique si le produit a des certifications';
COMMENT ON COLUMN products.delivery_time IS 'Délai de livraison estimé';
COMMENT ON COLUMN products.original_price IS 'Prix original avant réduction';
COMMENT ON COLUMN products.documents IS 'Documents téléchargeables (fiches techniques, catalogues) - JSONB array of {name, type, size, url}';

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_certified ON products(certified) WHERE certified = true;

-- Exemples de données pour les documents (structure JSON)
-- {
--   "name": "Fiche technique",
--   "type": "pdf",
--   "size": "2.3 MB",
--   "url": "https://example.com/document.pdf"
-- }

-- Note: Cette migration gère automatiquement la transition
-- - Crée la colonne 'image' si elle n'existe pas
-- - Migre les données de 'image' vers 'images' si des données existent
-- - Les colonnes existantes sont conservées
-- - Les nouveaux champs sont des ajouts, pas des remplacements

-- Vérification de la structure finale
SELECT 
  id,
  name,
  images,
  video_url,
  is_new,
  in_stock,
  certified,
  delivery_time,
  documents
FROM products
LIMIT 5;


-- [20251230_validate_digital_badges.sql]
-- Migration: Fonction pour valider les badges numériques dynamiques (JWT) et statiques
-- Date: 2025-12-30
-- Description: Permet au scanner de valider à la fois:
--   1. Les badges statiques (user_badges avec badge_code fixe)
--   2. Les badges dynamiques (digital_badges avec JWT qui change toutes les 30s)

-- ================================================
-- Fonction: validate_scanned_badge
-- ================================================
-- Accepte soit un badge_code statique soit un JWT dynamique
-- Retourne les informations du badge pour affichage dans le scanner

CREATE OR REPLACE FUNCTION validate_scanned_badge(p_qr_data text)
RETURNS json AS $$
DECLARE
  v_result json;
  v_user_badge user_badges%ROWTYPE;
  v_digital_badge digital_badges%ROWTYPE;
  v_user_info json;
BEGIN
  -- 1. D'abord, essayer de valider comme badge statique (user_badges)
  BEGIN
    SELECT * INTO v_user_badge
    FROM user_badges
    WHERE badge_code = p_qr_data
      AND status = 'active'
      AND valid_until > now();
    
    IF FOUND THEN
      -- Badge statique trouvé et valide - incrémenter le compteur
      UPDATE user_badges
      SET scan_count = scan_count + 1,
          last_scanned_at = now()
      WHERE id = v_user_badge.id
      RETURNING * INTO v_user_badge;
      
      -- Récupérer les infos utilisateur
      SELECT json_build_object(
        'id', COALESCE(u.id, p.id),
        'full_name', COALESCE(u.full_name, p.name),
        'email', COALESCE(u.email, p.email),
        'phone', COALESCE(u.phone, p.phone),
        'company_name', COALESCE(u.company_name, p.company_name),
        'avatar_url', COALESCE(u.avatar_url, p.logo_url),
        'user_type', CASE 
          WHEN u.id IS NOT NULL THEN u.type::text
          WHEN p.id IS NOT NULL THEN 'partner'
          ELSE 'visitor'
        END,
        'user_level', COALESCE(u.level, p.partnership_level, 'free')
      )
      INTO v_user_info
      FROM users u
      FULL OUTER JOIN partners p ON p.id = v_user_badge.user_id
      WHERE u.id = v_user_badge.user_id OR p.id = v_user_badge.user_id;
      
      -- Retourner le résultat
      RETURN json_build_object(
        'success', true,
        'badge_type', 'static',
        'id', v_user_badge.id,
        'badge_code', v_user_badge.badge_code,
        'scan_count', v_user_badge.scan_count,
        'last_scanned_at', v_user_badge.last_scanned_at,
        'valid_until', v_user_badge.valid_until,
        'status', v_user_badge.status,
        'user', v_user_info
      );
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Continuer vers la validation de badge dynamique
      NULL;
  END;
  
  -- 2. Si pas trouvé comme badge statique, essayer comme badge dynamique (JWT)
  BEGIN
    -- Extraire le userId du JWT (format: header.payload.signature)
    -- Le payload est en base64, on cherche un badge actif avec current_token correspondant
    SELECT db.* INTO v_digital_badge
    FROM digital_badges db
    WHERE db.current_token = p_qr_data
      AND db.is_active = true
      AND db.token_expires_at > now();
    
    IF FOUND THEN
      -- Badge dynamique trouvé et valide - incrémenter le compteur
      UPDATE digital_badges
      SET scan_count = COALESCE(scan_count, 0) + 1,
          last_scanned_at = now()
      WHERE id = v_digital_badge.id
      RETURNING * INTO v_digital_badge;
      
      -- Récupérer les infos utilisateur
      SELECT json_build_object(
        'id', u.id,
        'full_name', u.full_name,
        'email', u.email,
        'phone', u.phone,
        'company_name', u.company_name,
        'avatar_url', COALESCE(v_digital_badge.photo_url, u.avatar_url),
        'user_type', u.type::text,
        'user_level', u.level
      )
      INTO v_user_info
      FROM users u
      WHERE u.id = v_digital_badge.user_id;
      
      -- Retourner le résultat
      RETURN json_build_object(
        'success', true,
        'badge_type', 'dynamic',
        'id', v_digital_badge.id,
        'badge_code', 'DYNAMIC-' || substring(v_digital_badge.current_token, 1, 8),
        'scan_count', COALESCE(v_digital_badge.scan_count, 1),
        'last_scanned_at', v_digital_badge.last_scanned_at,
        'valid_until', v_digital_badge.token_expires_at,
        'status', CASE WHEN v_digital_badge.is_active THEN 'active' ELSE 'inactive' END,
        'badge_type_name', v_digital_badge.badge_type,
        'rotation_interval', v_digital_badge.rotation_interval_seconds,
        'user', v_user_info
      );
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Badge dynamique non trouvé
      NULL;
  END;
  
  -- 3. Aucun badge trouvé (ni statique ni dynamique)
  RETURN json_build_object(
    'success', false,
    'error', 'Badge non trouvé ou expiré',
    'message', 'Ce badge n''est pas valide. Il peut être expiré ou révoqué.'
  );
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter les colonnes manquantes à digital_badges si elles n'existent pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'digital_badges' 
    AND column_name = 'scan_count'
  ) THEN
    ALTER TABLE digital_badges ADD COLUMN scan_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'digital_badges' 
    AND column_name = 'last_scanned_at'
  ) THEN
    ALTER TABLE digital_badges ADD COLUMN last_scanned_at timestamptz;
  END IF;
END $$;

-- Créer un index pour améliorer les performances de recherche sur current_token
CREATE INDEX IF NOT EXISTS idx_digital_badges_current_token 
ON digital_badges(current_token) 
WHERE is_active = true;

-- Commentaire
COMMENT ON FUNCTION validate_scanned_badge IS 
'Valide un badge scanné (statique ou dynamique) et retourne les informations utilisateur. 
Supporte à la fois les badge_code statiques (user_badges) et les JWT dynamiques (digital_badges).';


-- [20251231000001_complete_api_integration.sql]
-- ============================================================================
-- MIGRATION: Complete API Integration
-- Date: 2025-12-31
-- Description: Création de toutes les tables et fonctions manquantes pour
--              une intégration complète de l'API
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TABLE: payment_transactions
-- Description: Historique complet des transactions de paiement
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,

  -- Stripe fields
  stripe_session_id text,
  stripe_payment_intent text,
  stripe_customer_id text,

  -- PayPal fields
  paypal_order_id text,
  paypal_capture_id text,

  -- CMI fields
  cmi_order_id text,
  cmi_transaction_id text,
  cmi_auth_code text,

  -- Common fields
  amount bigint NOT NULL, -- montant en centimes
  currency text NOT NULL DEFAULT 'eur',
  visitor_level text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('stripe', 'paypal', 'cmi', 'bank_transfer')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),

  -- Metadata
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Refund info
  refunded_at timestamptz,
  refund_amount bigint,
  refund_reason text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_method ON public.payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_session ON public.payment_transactions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_paypal_order ON public.payment_transactions(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_cmi_order ON public.payment_transactions(cmi_order_id);

-- RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view own transactions" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.payment_transactions;
CREATE POLICY "Admins can view all transactions" ON public.payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

DROP POLICY IF EXISTS "System can insert transactions" ON public.payment_transactions;
CREATE POLICY "System can insert transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update transactions" ON public.payment_transactions;
CREATE POLICY "System can update transactions" ON public.payment_transactions
  FOR UPDATE USING (true);

-- ============================================================================
-- 2. TABLE: audit_logs
-- Description: Logs d'audit pour la conformité et la sécurité
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES public.users(id) ON DELETE SET NULL, -- Qui a fait l'action (admin, etc.)

  -- Action details
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,

  -- Change tracking
  old_values jsonb,
  new_values jsonb,
  changes jsonb, -- Diff between old and new

  -- Context
  ip_address inet,
  user_agent text,
  request_id text,
  session_id text,

  -- Severity
  severity text DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 3. TABLE: two_factor_auth
-- Description: Configuration 2FA pour chaque utilisateur
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.two_factor_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,

  -- TOTP
  totp_secret text,
  totp_enabled boolean DEFAULT false,
  totp_verified_at timestamptz,

  -- SMS
  sms_phone text,
  sms_enabled boolean DEFAULT false,
  sms_verified_at timestamptz,

  -- Email
  email_enabled boolean DEFAULT false,
  email_verified_at timestamptz,

  -- Backup codes
  backup_codes text[], -- Array of hashed backup codes
  backup_codes_generated_at timestamptz,

  -- Recovery
  recovery_email text,
  recovery_phone text,

  -- Metadata
  last_used_at timestamptz,
  failed_attempts integer DEFAULT 0,
  locked_until timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON public.two_factor_auth(user_id);

-- RLS
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own 2FA" ON public.two_factor_auth;
CREATE POLICY "Users can view own 2FA" ON public.two_factor_auth
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own 2FA" ON public.two_factor_auth;
CREATE POLICY "Users can manage own 2FA" ON public.two_factor_auth
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 4. TABLE: push_subscriptions
-- Description: Abonnements pour les notifications push (Web Push API)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,

  -- Push subscription details (Web Push API format)
  endpoint text NOT NULL,
  keys jsonb NOT NULL, -- {p256dh: string, auth: string}

  -- Device info
  device_type text DEFAULT 'web' CHECK (device_type IN ('web', 'ios', 'android')),
  device_name text,
  browser text,
  os text,

  -- Status
  is_active boolean DEFAULT true,
  last_used_at timestamptz DEFAULT now(),

  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON public.push_subscriptions(is_active);

-- RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 5. TABLE: notification_preferences
-- Description: Préférences de notifications par utilisateur
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,

  -- Email notifications
  email_notifications_enabled boolean DEFAULT true,
  email_digest_frequency text DEFAULT 'daily' CHECK (email_digest_frequency IN ('realtime', 'daily', 'weekly', 'never')),

  -- Push notifications
  push_notifications_enabled boolean DEFAULT true,

  -- SMS notifications
  sms_notifications_enabled boolean DEFAULT false,

  -- Notification types
  notify_appointments boolean DEFAULT true,
  notify_messages boolean DEFAULT true,
  notify_events boolean DEFAULT true,
  notify_networking boolean DEFAULT true,
  notify_promotions boolean DEFAULT false,
  notify_system boolean DEFAULT true,

  -- Quiet hours
  quiet_hours_enabled boolean DEFAULT false,
  quiet_hours_start time,
  quiet_hours_end time,
  quiet_hours_timezone text DEFAULT 'UTC',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON public.notification_preferences;
CREATE POLICY "Users can view own preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 6. TABLE: search_index
-- Description: Index de recherche full-text pour tous les contenus
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.search_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Entity reference
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,

  -- Search fields
  title text NOT NULL,
  content text,
  keywords text[],

  -- Full-text search
  search_vector tsvector,

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Boost/Ranking
  boost_score numeric(5,2) DEFAULT 1.0,

  -- Status
  is_active boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_search_index_entity ON public.search_index(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_search_index_vector ON public.search_index USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_index_keywords ON public.search_index USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_search_index_is_active ON public.search_index(is_active);

-- RLS
ALTER TABLE public.search_index ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can search" ON public.search_index;
CREATE POLICY "Anyone can search" ON public.search_index
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "System can manage search index" ON public.search_index;
CREATE POLICY "System can manage search index" ON public.search_index
  FOR ALL USING (true);

-- ============================================================================
-- 7. TABLE: api_keys
-- Description: Clés API pour l'accès programmatique
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,

  -- API Key
  key_hash text NOT NULL UNIQUE, -- Hash de la clé API
  key_prefix text NOT NULL, -- Préfixe visible (ex: "sk_live_abc...")

  -- Permissions
  name text NOT NULL,
  scopes text[] DEFAULT '{}', -- Ex: ['read:events', 'write:appointments']

  -- Rate limiting
  rate_limit_per_minute integer DEFAULT 60,
  rate_limit_per_hour integer DEFAULT 1000,

  -- Status
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  last_used_at timestamptz,

  -- Usage stats
  total_requests bigint DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(is_active);

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own API keys" ON public.api_keys;
CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 8. TABLE: rate_limits
-- Description: Suivi du rate limiting par utilisateur/IP
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifier
  identifier text NOT NULL, -- user_id, api_key, ou IP address
  identifier_type text NOT NULL CHECK (identifier_type IN ('user', 'api_key', 'ip')),

  -- Endpoint/Resource
  resource text NOT NULL, -- Ex: "POST /api/appointments"

  -- Counts
  requests_count integer DEFAULT 0,
  window_start timestamptz DEFAULT now(),
  window_duration interval DEFAULT '1 minute',

  -- Limits
  max_requests integer DEFAULT 60,

  -- Status
  is_blocked boolean DEFAULT false,
  blocked_until timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(identifier, resource, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_is_blocked ON public.rate_limits(is_blocked);

-- RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
CREATE POLICY "System can manage rate limits" ON public.rate_limits
  FOR ALL USING (true);

-- ============================================================================
-- 9. TABLE: feature_flags
-- Description: Feature flags pour activer/désactiver des fonctionnalités
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Flag details
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,

  -- Status
  is_enabled boolean DEFAULT false,

  -- Rollout
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  enabled_for_users uuid[], -- Liste d'utilisateurs spécifiques
  enabled_for_roles text[], -- Liste de rôles

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_enabled ON public.feature_flags(is_enabled);

-- RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read feature flags" ON public.feature_flags;
CREATE POLICY "Anyone can read feature flags" ON public.feature_flags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

-- ============================================================================
-- 10. FUNCTIONS
-- ============================================================================

-- Fonction pour mettre à jour le search_vector automatiquement
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(array_to_string(NEW.keywords, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_search_index_vector ON public.search_index;
CREATE TRIGGER update_search_index_vector
  BEFORE INSERT OR UPDATE ON public.search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

-- Fonction de recherche full-text
CREATE OR REPLACE FUNCTION search_content(
  search_query text,
  entity_types text[] DEFAULT NULL,
  limit_results integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  entity_type text,
  entity_id uuid,
  title text,
  content text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.id,
    si.entity_type,
    si.entity_id,
    si.title,
    si.content,
    ts_rank(si.search_vector, websearch_to_tsquery('french', search_query)) AS rank
  FROM public.search_index si
  WHERE si.is_active = true
    AND (entity_types IS NULL OR si.entity_type = ANY(entity_types))
    AND si.search_vector @@ websearch_to_tsquery('french', search_query)
  ORDER BY rank DESC, si.boost_score DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour logger les actions d'audit
CREATE OR REPLACE FUNCTION log_audit(
  p_user_id uuid,
  p_actor_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_severity text DEFAULT 'info'
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
  v_changes jsonb;
BEGIN
  -- Calculate diff between old and new values
  IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
    SELECT jsonb_object_agg(key, value)
    INTO v_changes
    FROM jsonb_each(p_new_values)
    WHERE value IS DISTINCT FROM p_old_values->key;
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    changes,
    ip_address,
    user_agent,
    severity
  ) VALUES (
    p_user_id,
    p_actor_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    v_changes,
    p_ip_address,
    p_user_agent,
    p_severity
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter le compteur de rate limit
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_identifier text,
  p_identifier_type text,
  p_resource text,
  p_max_requests integer DEFAULT 60,
  p_window_duration interval DEFAULT '1 minute'
)
RETURNS boolean AS $$
DECLARE
  v_current_count integer;
  v_is_blocked boolean;
BEGIN
  -- Clean old windows
  DELETE FROM public.rate_limits
  WHERE identifier = p_identifier
    AND resource = p_resource
    AND window_start < now() - window_duration;

  -- Get or create rate limit record
  INSERT INTO public.rate_limits (
    identifier,
    identifier_type,
    resource,
    requests_count,
    window_start,
    window_duration,
    max_requests
  ) VALUES (
    p_identifier,
    p_identifier_type,
    p_resource,
    1,
    now(),
    p_window_duration,
    p_max_requests
  )
  ON CONFLICT (identifier, resource, window_start)
  DO UPDATE SET
    requests_count = rate_limits.requests_count + 1,
    updated_at = now()
  RETURNING requests_count, is_blocked
  INTO v_current_count, v_is_blocked;

  -- Check if limit exceeded
  IF v_current_count > p_max_requests THEN
    UPDATE public.rate_limits
    SET is_blocked = true,
        blocked_until = now() + p_window_duration
    WHERE identifier = p_identifier
      AND resource = p_resource
      AND window_start = (
        SELECT window_start FROM public.rate_limits
        WHERE identifier = p_identifier AND resource = p_resource
        ORDER BY window_start DESC
        LIMIT 1
      );
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un feature flag est activé
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_flag_key text,
  p_user_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_flag record;
  v_user_role text;
BEGIN
  SELECT * INTO v_flag
  FROM public.feature_flags
  WHERE key = p_flag_key;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if globally enabled
  IF v_flag.is_enabled = true AND v_flag.rollout_percentage = 100 THEN
    RETURN true;
  END IF;

  -- Check if user-specific
  IF p_user_id IS NOT NULL THEN
    IF p_user_id = ANY(v_flag.enabled_for_users) THEN
      RETURN true;
    END IF;

    -- Check role-based
    SELECT type INTO v_user_role
    FROM public.users
    WHERE id = p_user_id;

    IF v_user_role = ANY(v_flag.enabled_for_roles) THEN
      RETURN true;
    END IF;

    -- Check rollout percentage (deterministic based on user ID)
    IF v_flag.rollout_percentage > 0 THEN
      IF (hashtext(p_user_id::text) % 100) < v_flag.rollout_percentage THEN
        RETURN true;
      END IF;
    END IF;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. TRIGGERS
-- ============================================================================

-- Trigger pour mettre à jour updated_at sur les tables
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payment_transactions_timestamp ON public.payment_transactions;
CREATE TRIGGER update_payment_transactions_timestamp
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_two_factor_auth_timestamp ON public.two_factor_auth;
CREATE TRIGGER update_two_factor_auth_timestamp
  BEFORE UPDATE ON public.two_factor_auth
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_notification_preferences_timestamp ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_timestamp
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_search_index_timestamp ON public.search_index;
CREATE TRIGGER update_search_index_timestamp
  BEFORE UPDATE ON public.search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_api_keys_timestamp ON public.api_keys;
CREATE TRIGGER update_api_keys_timestamp
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_feature_flags_timestamp ON public.feature_flags;
CREATE TRIGGER update_feature_flags_timestamp
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

-- ============================================================================
-- 12. SEED DEFAULT DATA
-- ============================================================================

-- Insert default feature flags
INSERT INTO public.feature_flags (key, name, description, is_enabled, rollout_percentage)
VALUES
  ('networking_ai', 'AI-Powered Networking', 'Recommandations de networking basées sur l''IA', true, 100),
  ('advanced_analytics', 'Advanced Analytics', 'Analytics avancées pour les exposants', true, 100),
  ('live_streaming', 'Live Streaming', 'Streaming en direct des événements', true, 100),
  ('mobile_app', 'Mobile App', 'Application mobile native', false, 0),
  ('payment_installments', 'Payment Installments', 'Paiement en plusieurs fois', false, 50)
ON CONFLICT (key) DO NOTHING;

COMMIT;

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================

-- Recherche full-text:
-- SELECT * FROM search_content('innovation maritime', ARRAY['exhibitor', 'event']);

-- Log audit:
-- SELECT log_audit(
--   '<user_id>', '<actor_id>', 'update', 'user', '<entity_id>',
--   '{"email": "old@example.com"}'::jsonb,
--   '{"email": "new@example.com"}'::jsonb,
--   '192.168.1.1'::inet,
--   'Mozilla/5.0...',
--   'info'
-- );

-- Check rate limit:
-- SELECT increment_rate_limit('<user_id>', 'user', 'POST /api/appointments', 60, '1 minute');

-- Check feature flag:
-- SELECT is_feature_enabled('networking_ai', '<user_id>');


-- [20251231000002_chat_attachments_and_cdn.sql]
-- ============================================================================
-- MIGRATION: Chat Attachments & CDN Configuration
-- Date: 2025-12-31
-- Description: Table pour les pièces jointes chat et configuration CDN
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TABLE: message_attachments
-- Description: Pièces jointes des messages chat
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,

  -- File info
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,

  -- Thumbnail (pour images)
  thumbnail_url text,

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_created_at ON public.message_attachments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_attachments_file_type ON public.message_attachments(file_type);

-- RLS
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view attachments in their conversations" ON public.message_attachments;
CREATE POLICY "Users can view attachments in their conversations" ON public.message_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      INNER JOIN public.conversations c ON m.conversation_id = c.id
      WHERE m.id = message_attachments.message_id
      AND auth.uid() = ANY(c.participants)
    )
  );

DROP POLICY IF EXISTS "Users can create attachments in their messages" ON public.message_attachments;
CREATE POLICY "Users can create attachments in their messages" ON public.message_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
      AND m.sender_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own attachments" ON public.message_attachments;
CREATE POLICY "Users can delete own attachments" ON public.message_attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
      AND m.sender_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. TABLE: cdn_config
-- Description: Configuration CDN pour optimisation médias
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cdn_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- CDN provider
  provider text NOT NULL CHECK (provider IN ('cloudflare', 'cloudinary', 'imgix', 'bunny', 'custom')),

  -- Configuration
  cdn_url text NOT NULL,
  api_key text,
  api_secret text,
  zone_id text,

  -- Features
  auto_optimize boolean DEFAULT true,
  webp_conversion boolean DEFAULT true,
  lazy_loading boolean DEFAULT true,
  responsive_images boolean DEFAULT true,

  -- Presets
  image_presets jsonb DEFAULT '{
    "thumbnail": {"width": 150, "height": 150, "quality": 80},
    "small": {"width": 480, "height": 480, "quality": 85},
    "medium": {"width": 1024, "height": 1024, "quality": 85},
    "large": {"width": 1920, "height": 1920, "quality": 90},
    "original": {"quality": 95}
  }'::jsonb,

  -- Cache settings
  cache_ttl integer DEFAULT 86400, -- 24 hours

  -- Status
  is_active boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.cdn_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read CDN config" ON public.cdn_config;
CREATE POLICY "Anyone can read CDN config" ON public.cdn_config
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage CDN config" ON public.cdn_config;
CREATE POLICY "Admins can manage CDN config" ON public.cdn_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

-- ============================================================================
-- 3. TABLE: storage_quotas
-- Description: Quotas de storage par utilisateur
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.storage_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,

  -- Quotas (en bytes)
  max_storage bigint DEFAULT 1073741824, -- 1GB par défaut
  used_storage bigint DEFAULT 0,

  -- Limites par type
  max_file_size bigint DEFAULT 10485760, -- 10MB par défaut
  max_files integer DEFAULT 1000,
  current_files integer DEFAULT 0,

  -- Metadata
  last_calculated_at timestamptz DEFAULT now(),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_storage_quotas_user_id ON public.storage_quotas(user_id);

-- RLS
ALTER TABLE public.storage_quotas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own storage quota" ON public.storage_quotas;
CREATE POLICY "Users can view own storage quota" ON public.storage_quotas
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage storage quotas" ON public.storage_quotas;
CREATE POLICY "System can manage storage quotas" ON public.storage_quotas
  FOR ALL USING (true);

-- ============================================================================
-- 4. FUNCTIONS
-- ============================================================================

-- Fonction pour mettre à jour le quota de storage
CREATE OR REPLACE FUNCTION update_storage_quota(
  p_user_id uuid,
  p_file_size bigint,
  p_operation text -- 'add' ou 'remove'
)
RETURNS boolean AS $$
BEGIN
  -- Créer le quota s'il n'existe pas
  INSERT INTO public.storage_quotas (user_id, used_storage, current_files)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Mettre à jour selon l'opération
  IF p_operation = 'add' THEN
    UPDATE public.storage_quotas
    SET used_storage = used_storage + p_file_size,
        current_files = current_files + 1,
        last_calculated_at = now(),
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSIF p_operation = 'remove' THEN
    UPDATE public.storage_quotas
    SET used_storage = GREATEST(0, used_storage - p_file_size),
        current_files = GREATEST(0, current_files - 1),
        last_calculated_at = now(),
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur peut uploader un fichier
CREATE OR REPLACE FUNCTION can_upload_file(
  p_user_id uuid,
  p_file_size bigint
)
RETURNS boolean AS $$
DECLARE
  v_quota record;
BEGIN
  -- Récupérer le quota
  SELECT * INTO v_quota
  FROM public.storage_quotas
  WHERE user_id = p_user_id;

  -- Si pas de quota, créer avec valeurs par défaut
  IF NOT FOUND THEN
    INSERT INTO public.storage_quotas (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_quota;
  END IF;

  -- Vérifier la taille du fichier
  IF p_file_size > v_quota.max_file_size THEN
    RAISE EXCEPTION 'File size exceeds maximum allowed: % bytes', v_quota.max_file_size;
  END IF;

  -- Vérifier le quota total
  IF (v_quota.used_storage + p_file_size) > v_quota.max_storage THEN
    RAISE EXCEPTION 'Storage quota exceeded: % / % bytes', v_quota.used_storage, v_quota.max_storage;
  END IF;

  -- Vérifier le nombre de fichiers
  IF v_quota.current_files >= v_quota.max_files THEN
    RAISE EXCEPTION 'Maximum number of files exceeded: %', v_quota.max_files;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer le quota utilisé
CREATE OR REPLACE FUNCTION recalculate_storage_quota(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_total_size bigint;
  v_total_files integer;
BEGIN
  -- Calculer depuis les attachments
  SELECT
    COALESCE(SUM(file_size), 0),
    COUNT(*)
  INTO v_total_size, v_total_files
  FROM public.message_attachments ma
  INNER JOIN public.messages m ON ma.message_id = m.id
  WHERE m.sender_id = p_user_id;

  -- Mettre à jour le quota
  UPDATE public.storage_quotas
  SET used_storage = v_total_size,
      current_files = v_total_files,
      last_calculated_at = now(),
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Créer si n'existe pas
  IF NOT FOUND THEN
    INSERT INTO public.storage_quotas (user_id, used_storage, current_files)
    VALUES (p_user_id, v_total_size, v_total_files);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_message_attachments_updated_at ON public.message_attachments;
CREATE TRIGGER update_message_attachments_updated_at
  BEFORE UPDATE ON public.message_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_trigger();

DROP TRIGGER IF EXISTS update_cdn_config_updated_at ON public.cdn_config;
CREATE TRIGGER update_cdn_config_updated_at
  BEFORE UPDATE ON public.cdn_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_trigger();

DROP TRIGGER IF EXISTS update_storage_quotas_updated_at ON public.storage_quotas;
CREATE TRIGGER update_storage_quotas_updated_at
  BEFORE UPDATE ON public.storage_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_trigger();

-- ============================================================================
-- 6. STORAGE BUCKETS (via Supabase UI ou CLI)
-- ============================================================================

-- À créer via Supabase Dashboard ou CLI:
-- 1. chat-files (public: false, max size: 10MB)
-- 2. chat-thumbnails (public: true, max size: 1MB)
-- 3. media-uploads (public: false, max size: 500MB)

-- Policies RLS pour les buckets:
-- chat-files:
--   - SELECT: participants de la conversation
--   - INSERT: sender du message
--   - DELETE: sender du message

COMMIT;

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================

-- Vérifier si un utilisateur peut uploader:
-- SELECT can_upload_file('<user_id>', 5242880); -- 5MB

-- Mettre à jour le quota après upload:
-- SELECT update_storage_quota('<user_id>', 5242880, 'add');

-- Recalculer le quota d'un utilisateur:
-- SELECT recalculate_storage_quota('<user_id>');

-- Ajouter un attachment à un message:
-- INSERT INTO message_attachments (message_id, file_url, file_name, file_size, file_type)
-- VALUES ('<message_id>', 'https://...', 'document.pdf', 1048576, 'application/pdf');


-- [20251231000003_site_templates_and_images.sql]
-- ============================================================================
-- MIGRATION: Site Templates & Images
-- Date: 2025-12-31
-- Description: Tables pour templates de mini-sites et bibliothèque d'images
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TABLE: site_templates
-- Description: Templates pré-configurés pour les mini-sites
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'corporate', 'ecommerce', 'portfolio', 'event',
    'landing', 'startup', 'agency', 'product', 'blog', 'minimal'
  )),
  thumbnail text,
  sections jsonb DEFAULT '[]'::jsonb,
  premium boolean DEFAULT false,
  popularity integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_templates_category ON public.site_templates(category);
CREATE INDEX IF NOT EXISTS idx_site_templates_popularity ON public.site_templates(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_site_templates_premium ON public.site_templates(premium);

-- RLS
ALTER TABLE public.site_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site templates" ON public.site_templates;
CREATE POLICY "Anyone can view site templates" ON public.site_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site templates" ON public.site_templates;
CREATE POLICY "Admins can manage site templates" ON public.site_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

-- ============================================================================
-- 2. TABLE: site_images
-- Description: Bibliothèque d'images pour les mini-sites
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  name text NOT NULL,
  size bigint NOT NULL,
  storage_path text NOT NULL,

  -- Ownership
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  exhibitor_id uuid REFERENCES public.exhibitors(id) ON DELETE CASCADE,

  -- Metadata
  mime_type text,
  width integer,
  height integer,
  alt_text text,
  tags text[] DEFAULT '{}',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_images_user_id ON public.site_images(user_id);
CREATE INDEX IF NOT EXISTS idx_site_images_exhibitor_id ON public.site_images(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_site_images_created_at ON public.site_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_images_tags ON public.site_images USING GIN(tags);

-- RLS
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own images" ON public.site_images;
CREATE POLICY "Users can view their own images" ON public.site_images
  FOR SELECT USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.exhibitors
      WHERE exhibitors.id = site_images.exhibitor_id
      AND exhibitors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can upload images" ON public.site_images;
CREATE POLICY "Users can upload images" ON public.site_images
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.exhibitors
      WHERE exhibitors.id = exhibitor_id
      AND exhibitors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own images" ON public.site_images;
CREATE POLICY "Users can delete their own images" ON public.site_images
  FOR DELETE USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.exhibitors
      WHERE exhibitors.id = site_images.exhibitor_id
      AND exhibitors.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. STORAGE BUCKETS
-- ============================================================================

-- Bucket pour les images des mini-sites (via Supabase Dashboard ou CLI)
-- À créer: site-images (public: true, max size: 5MB)

-- Policies RLS pour le bucket site-images:
-- SELECT: Auth users seulement
-- INSERT: Auth users seulement
-- DELETE: Owner seulement

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_site_templates_updated_at ON public.site_templates;
CREATE TRIGGER update_site_templates_updated_at
  BEFORE UPDATE ON public.site_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_trigger();

DROP TRIGGER IF EXISTS update_site_images_updated_at ON public.site_images;
CREATE TRIGGER update_site_images_updated_at
  BEFORE UPDATE ON public.site_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_trigger();

-- ============================================================================
-- 5. SEED DEFAULT TEMPLATES
-- ============================================================================

-- Template Corporate
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-corporate-1',
  'Corporate Professional',
  'Template professionnel pour entreprises établies avec sections complètes',
  'corporate',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "Solutions d''Excellence pour l''Industrie Maritime",
        "subtitle": "Leader mondial en technologie portuaire depuis 1995",
        "backgroundImage": "",
        "ctaText": "Découvrir nos solutions",
        "ctaLink": "#products"
      },
      "order": 0,
      "visible": true
    },
    {
      "id": "about-1",
      "type": "about",
      "content": {
        "title": "Notre Expertise",
        "description": "Avec plus de 25 ans d''expérience, nous accompagnons les ports du monde entier dans leur transformation digitale.",
        "image": ""
      },
      "order": 1,
      "visible": true
    },
    {
      "id": "products-1",
      "type": "products",
      "content": {
        "title": "Nos Solutions",
        "items": []
      },
      "order": 2,
      "visible": true
    },
    {
      "id": "contact-1",
      "type": "contact",
      "content": {
        "title": "Contactez-nous",
        "email": "contact@example.com",
        "phone": "+212 5XX XXX XXX",
        "address": "",
        "formFields": ["name", "email", "company", "message"]
      },
      "order": 3,
      "visible": true
    }
  ]'::jsonb,
  false,
  250
)
ON CONFLICT (id) DO NOTHING;

-- Template Startup
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-startup-1',
  'Startup Moderne',
  'Design moderne et dynamique pour startups innovantes',
  'startup',
  'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "Innovation Maritime 🚀",
        "subtitle": "La prochaine génération de solutions portuaires intelligentes",
        "backgroundImage": "",
        "ctaText": "Rejoignez la révolution",
        "ctaLink": "#about"
      },
      "order": 0,
      "visible": true
    },
    {
      "id": "about-1",
      "type": "about",
      "content": {
        "title": "Notre Mission",
        "description": "Révolutionner l''industrie maritime avec l''IA et l''IoT pour créer des ports plus efficaces et durables.",
        "image": ""
      },
      "order": 1,
      "visible": true
    }
  ]'::jsonb,
  false,
  180
)
ON CONFLICT (id) DO NOTHING;

-- Template E-commerce
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-ecommerce-1',
  'E-commerce Pro',
  'Template optimisé pour la vente en ligne avec galerie produits',
  'ecommerce',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "Équipements Maritimes Premium",
        "subtitle": "Livraison mondiale • Garantie 5 ans • Support 24/7",
        "backgroundImage": "",
        "ctaText": "Voir le catalogue",
        "ctaLink": "#products"
      },
      "order": 0,
      "visible": true
    },
    {
      "id": "products-1",
      "type": "products",
      "content": {
        "title": "Nos Produits Phares",
        "items": []
      },
      "order": 1,
      "visible": true
    }
  ]'::jsonb,
  true,
  320
)
ON CONFLICT (id) DO NOTHING;

-- Template Landing Page
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-landing-1',
  'Landing Page Impact',
  'Page d''atterrissage avec fort taux de conversion',
  'landing',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "Transformez Votre Port en Hub Intelligent",
        "subtitle": "Augmentez l''efficacité de 40% dès le premier mois",
        "backgroundImage": "",
        "ctaText": "Demander une démo gratuite",
        "ctaLink": "#contact"
      },
      "order": 0,
      "visible": true
    },
    {
      "id": "contact-1",
      "type": "contact",
      "content": {
        "title": "Démarrez Maintenant",
        "email": "demo@example.com",
        "phone": "+212 5XX XXX XXX",
        "address": "",
        "formFields": ["name", "email", "company", "phone"]
      },
      "order": 2,
      "visible": true
    }
  ]'::jsonb,
  false,
  200
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================

-- Créer un mini-site depuis un template:
-- SELECT * FROM site_templates WHERE category = 'corporate';
-- INSERT INTO mini_sites (title, slug, sections, exhibitor_id, template_id)
-- SELECT 'Mon Site', 'mon-site', sections, '<exhibitor_id>', id
-- FROM site_templates WHERE id = 'template-corporate-1';

-- Récupérer tous les templates d'une catégorie:
-- SELECT * FROM site_templates WHERE category = 'startup' ORDER BY popularity DESC;

-- Incrémenter la popularité d'un template:
-- UPDATE site_templates SET popularity = popularity + 1 WHERE id = 'template-corporate-1';


-- [20260101000001_restrict_partnership_level_update.sql]
-- Migration: Restreindre la modification du niveau de sponsoring aux administrateurs uniquement
-- Created: 2026-01-01
-- Description: Empêche les partenaires de modifier leur propre niveau de sponsoring (partnership_level)
--              Seuls les administrateurs peuvent modifier ce champ critique

-- ============================================
-- 1. PARTNER_PROFILES: Restrictions RLS
-- ============================================

-- Activer RLS sur la table si ce n'est pas déjà fait
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Partners can update their own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Partners can update own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Partners can update profile except partnership_level" ON public.partner_profiles;
DROP POLICY IF EXISTS "Admins can update all partner profile fields" ON public.partner_profiles;

-- Politique de lecture pour les partenaires
CREATE POLICY "Partners can view own profile"
  ON public.partner_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );

-- Politique: Les partenaires peuvent mettre à jour leur profil (le trigger bloquera partnership_level)
CREATE POLICY "Partners can update own profile"
  ON public.partner_profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'partner'
    )
  );

-- Politique: Les administrateurs peuvent tout faire
CREATE POLICY "Admins can manage all partner profiles"
  ON public.partner_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );

-- ============================================
-- 2. PARTNERS: Restrictions RLS
-- ============================================

-- Vérifier si la table partners existe et ajouter des restrictions similaires
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners' AND table_schema = 'public') THEN
    
    -- Activer RLS
    EXECUTE 'ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY';
    
    -- Supprimer les anciennes politiques
    EXECUTE 'DROP POLICY IF EXISTS "Partners can update own data" ON public.partners';
    EXECUTE 'DROP POLICY IF EXISTS "Partners can update except sponsorship_level" ON public.partners';
    
    -- Politique: Les partenaires peuvent mettre à jour leurs données
    -- Le trigger bloquera la modification de sponsorship_level
    EXECUTE '
      CREATE POLICY "Partners can update own partner data"
        ON public.partners
        FOR UPDATE
        TO authenticated
        USING (
          user_id = auth.uid()
        )
    ';
    
    RAISE NOTICE 'Politique RLS appliquée à la table partners';
  END IF;
END $$;

-- ============================================
-- 3. COMMENTAIRES POUR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN public.partner_profiles.partnership_level IS 
  'Niveau de partenariat (museum, silver, gold, platinium). RÉSERVÉ AUX ADMINISTRATEURS - les partenaires ne peuvent pas modifier ce champ.';

-- ============================================
-- 4. FONCTION DE VALIDATION (optionnelle)
-- ============================================

-- Créer une fonction de validation pour bloquer les tentatives de modification
CREATE OR REPLACE FUNCTION public.prevent_partner_level_modification()
RETURNS TRIGGER AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Vérifier si l'utilisateur actuel est un admin
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND type = 'admin'
  ) INTO is_admin;
  
  -- Si l'utilisateur n'est pas admin et tente de modifier partnership_level/sponsorship_level
  IF NOT is_admin THEN
    -- Pour partner_profiles
    IF TG_TABLE_NAME = 'partner_profiles' AND 
       OLD.partnership_level IS DISTINCT FROM NEW.partnership_level THEN
      RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier le niveau de partenariat'
        USING HINT = 'Contactez un administrateur pour modifier votre niveau de sponsoring';
    END IF;
    
    -- Pour partners
    IF TG_TABLE_NAME = 'partners' AND 
       OLD.sponsorship_level IS DISTINCT FROM NEW.sponsorship_level THEN
      RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier le niveau de sponsoring'
        USING HINT = 'Contactez un administrateur pour modifier votre niveau de sponsoring';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger sur partner_profiles
DROP TRIGGER IF EXISTS enforce_partnership_level_admin_only ON public.partner_profiles;
CREATE TRIGGER enforce_partnership_level_admin_only
  BEFORE UPDATE ON public.partner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_partner_level_modification();

-- Appliquer le trigger sur partners si elle existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners' AND table_schema = 'public') THEN
    EXECUTE '
      DROP TRIGGER IF EXISTS enforce_sponsorship_level_admin_only ON public.partners;
      CREATE TRIGGER enforce_sponsorship_level_admin_only
        BEFORE UPDATE ON public.partners
        FOR EACH ROW
        EXECUTE FUNCTION public.prevent_partner_level_modification()
    ';
    RAISE NOTICE 'Trigger appliqué à la table partners';
  END IF;
END $$;


-- [20260101000002_partner_media_approval_workflow.sql]
-- Migration: Workflow de validation des médias partenaires
-- Created: 2026-01-01
-- Description: Ajoute un système d'approbation admin pour les médias créés par les partenaires

BEGIN;

-- ============================================
-- 1. MODIFIER LA TABLE media_contents
-- ============================================

-- Ajouter un champ pour identifier le créateur (admin vs partenaire)
ALTER TABLE public.media_contents 
  ADD COLUMN IF NOT EXISTS created_by_type text DEFAULT 'admin' CHECK (created_by_type IN ('admin', 'partner', 'exhibitor')),
  ADD COLUMN IF NOT EXISTS created_by_id uuid,
  ADD COLUMN IF NOT EXISTS approved_by_admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Modifier le CHECK constraint du statut pour inclure les nouveaux statuts
ALTER TABLE public.media_contents 
  DROP CONSTRAINT IF EXISTS media_contents_status_check;

ALTER TABLE public.media_contents 
  ADD CONSTRAINT media_contents_status_check 
  CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'rejected', 'archived'));

-- Commentaires pour documentation
COMMENT ON COLUMN public.media_contents.status IS 
  'Statut du média: draft (brouillon), pending_approval (en attente de validation admin), approved (validé), published (publié), rejected (rejeté), archived (archivé)';

COMMENT ON COLUMN public.media_contents.created_by_type IS 
  'Type de créateur: admin (équipe SIB), partner (partenaire sponsor), exhibitor (exposant)';

COMMENT ON COLUMN public.media_contents.created_by_id IS 
  'ID du créateur (référence users.id)';

COMMENT ON COLUMN public.media_contents.approved_by_admin_id IS 
  'ID de l''administrateur qui a approuvé le média';

COMMENT ON COLUMN public.media_contents.rejection_reason IS 
  'Raison du rejet si le média est rejeté par un admin';

-- ============================================
-- 2. FONCTION TRIGGER POUR AUTO-APPROVAL ADMIN
-- ============================================

-- Les médias créés par les admins sont automatiquement approuvés
CREATE OR REPLACE FUNCTION public.auto_approve_admin_media()
RETURNS TRIGGER AS $$
BEGIN
  -- Si créé par un admin, approuver automatiquement
  IF NEW.created_by_type = 'admin' AND NEW.status = 'draft' THEN
    NEW.status := 'approved';
    NEW.approved_by_admin_id := NEW.created_by_id;
    NEW.approved_at := now();
  END IF;
  
  -- Si créé par un partenaire, mettre en pending_approval
  IF NEW.created_by_type = 'partner' AND NEW.status = 'draft' THEN
    NEW.status := 'pending_approval';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS trigger_auto_approve_media ON public.media_contents;
CREATE TRIGGER trigger_auto_approve_media
  BEFORE INSERT ON public.media_contents
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_admin_media();

-- ============================================
-- 3. POLITIQUES RLS
-- ============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Public can view published media" ON public.media_contents;
DROP POLICY IF EXISTS "Partners can create media" ON public.media_contents;
DROP POLICY IF EXISTS "Partners can view own media" ON public.media_contents;
DROP POLICY IF EXISTS "Admins can manage all media" ON public.media_contents;

-- Activer RLS
ALTER TABLE public.media_contents ENABLE ROW LEVEL SECURITY;

-- Politique 1: Lecture publique des médias approuvés/publiés
CREATE POLICY "Public can view approved media"
  ON public.media_contents
  FOR SELECT
  TO public
  USING (status IN ('approved', 'published'));

-- Politique 2: Les partenaires peuvent créer des médias
CREATE POLICY "Partners can create media"
  ON public.media_contents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by_type = 'partner'
    AND created_by_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'partner'
    )
  );

-- Politique 3: Les partenaires peuvent voir leurs propres médias
CREATE POLICY "Partners can view own media"
  ON public.media_contents
  FOR SELECT
  TO authenticated
  USING (
    created_by_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );

-- Politique 4: Les partenaires peuvent mettre à jour leurs médias en draft/pending
CREATE POLICY "Partners can update own pending media"
  ON public.media_contents
  FOR UPDATE
  TO authenticated
  USING (
    created_by_id = auth.uid()
    AND status IN ('draft', 'pending_approval', 'rejected')
  )
  WITH CHECK (
    created_by_id = auth.uid()
    AND status IN ('draft', 'pending_approval')
  );

-- Politique 5: Les admins peuvent tout faire
CREATE POLICY "Admins can manage all media"
  ON public.media_contents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );

-- ============================================
-- 4. INDEX POUR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_media_contents_status ON public.media_contents(status);
CREATE INDEX IF NOT EXISTS idx_media_contents_created_by ON public.media_contents(created_by_type, created_by_id);
CREATE INDEX IF NOT EXISTS idx_media_contents_pending ON public.media_contents(status) WHERE status = 'pending_approval';

-- ============================================
-- 5. VUE POUR LES MÉDIAS EN ATTENTE
-- ============================================

CREATE OR REPLACE VIEW public.pending_partner_media AS
SELECT 
  mc.*,
  u.name as creator_name,
  u.email as creator_email,
  pp.company_name as partner_company
FROM public.media_contents mc
LEFT JOIN public.users u ON mc.created_by_id = u.id
LEFT JOIN public.partner_profiles pp ON mc.created_by_id = pp.user_id
WHERE mc.status = 'pending_approval'
  AND mc.created_by_type = 'partner'
ORDER BY mc.created_at DESC;

-- Permissions sur la vue
GRANT SELECT ON public.pending_partner_media TO authenticated;

-- ============================================
-- 6. FONCTION POUR APPROUVER UN MÉDIA
-- ============================================

CREATE OR REPLACE FUNCTION public.approve_partner_media(
  media_id uuid,
  admin_id uuid
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  is_admin boolean;
BEGIN
  -- Vérifier que l'utilisateur est admin
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = admin_id AND type = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Seuls les administrateurs peuvent approuver des médias'
    );
  END IF;
  
  -- Approuver le média
  UPDATE public.media_contents
  SET 
    status = 'approved',
    approved_by_admin_id = admin_id,
    approved_at = now(),
    rejection_reason = NULL
  WHERE id = media_id
    AND status = 'pending_approval';
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Média approuvé avec succès'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Média non trouvé ou déjà traité'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. FONCTION POUR REJETER UN MÉDIA
-- ============================================

CREATE OR REPLACE FUNCTION public.reject_partner_media(
  media_id uuid,
  admin_id uuid,
  reason text
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  is_admin boolean;
BEGIN
  -- Vérifier que l'utilisateur est admin
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = admin_id AND type = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Seuls les administrateurs peuvent rejeter des médias'
    );
  END IF;
  
  -- Rejeter le média
  UPDATE public.media_contents
  SET 
    status = 'rejected',
    rejection_reason = reason,
    updated_at = now()
  WHERE id = media_id
    AND status = 'pending_approval';
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Média rejeté'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Média non trouvé ou déjà traité'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;


-- [20260102000001_fix_notifications_table.sql]
-- Migration de correction pour la table notifications
-- Assure que la structure est correcte et que les policies RLS permettent l'insertion

-- Supprimer l'ancienne table si elle existe avec l'ancien schéma
DO $$ 
BEGIN
  -- Vérifier si la table existe avec l'ancien schéma (colonne 'read' au lieu de 'is_read')
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'read'
  ) THEN
    -- Renommer read en is_read
    ALTER TABLE notifications RENAME COLUMN read TO is_read;
  END IF;

  -- Ajouter les colonnes manquantes si elles n'existent pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE notifications ADD COLUMN title text NOT NULL DEFAULT 'Notification';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE notifications ADD COLUMN category text DEFAULT 'general';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'action_url'
  ) THEN
    ALTER TABLE notifications ADD COLUMN action_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE notifications ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN expires_at timestamptz;
  END IF;
END $$;

-- Activer RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Créer les policies mises à jour
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- IMPORTANT: Policy pour permettre l'insertion de notifications
-- Cette policy permet à n'importe quel utilisateur authentifié d'insérer des notifications
-- pour d'autres utilisateurs (nécessaire pour les notifications de connexion, etc.)
CREATE POLICY "Authenticated users can insert notifications" ON notifications
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Vérifier la structure finale
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'notifications'
  AND column_name IN ('id', 'user_id', 'title', 'message', 'type', 'category', 'is_read', 'action_url', 'metadata', 'created_at', 'expires_at');
  
  IF column_count = 11 THEN
    RAISE NOTICE '✅ Table notifications correctement configurée avec % colonnes', column_count;
  ELSE
    RAISE WARNING '⚠️ Table notifications a % colonnes sur 11 attendues', column_count;
  END IF;
END $$;


-- [20260106000001_security_rpc_functions.sql]
-- 🔐 SECURITY RPC FUNCTIONS FOR APPOINTMENT VALIDATION
-- Created: 6 Jan 2026
-- These functions provide server-side validation for all appointment operations

-- ============================================================================
-- 1. VALIDATE APPOINTMENT QUOTA
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_appointment_quota(
  p_user_id UUID,
  p_visitor_level TEXT DEFAULT 'free'
)
RETURNS TABLE (
  is_valid BOOLEAN,
  current_count INTEGER,
  allowed_quota INTEGER,
  message TEXT
) AS $$
DECLARE
  v_count INTEGER;
  v_quota INTEGER;
BEGIN
  -- Determine quota based on visitor level
  CASE p_visitor_level
    WHEN 'free' THEN v_quota := 0;
    WHEN 'premium' THEN v_quota := 10;
    WHEN 'vip' THEN v_quota := 10;
    ELSE v_quota := 0;
  END CASE;

  -- Count confirmed appointments for this user
  SELECT COUNT(*) INTO v_count
  FROM appointments
  WHERE visitor_id = p_user_id AND status = 'confirmed';

  RETURN QUERY SELECT
    (v_count < v_quota) AS is_valid,
    v_count,
    v_quota,
    CASE
      WHEN v_count >= v_quota THEN format('Quota exceeded: %s/%s appointments', v_count, v_quota)
      ELSE 'OK'
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. VALIDATE TIME SLOT CREATION PERMISSION
-- ============================================================================
CREATE OR REPLACE FUNCTION can_create_time_slot(p_user_id UUID)
RETURNS TABLE (
  is_allowed BOOLEAN,
  user_type TEXT,
  reason TEXT
) AS $$
DECLARE
  v_user_type TEXT;
BEGIN
  -- Get user type
  SELECT type INTO v_user_type
  FROM users
  WHERE id = p_user_id;

  -- Only exhibitor and partner types can create time slots
  IF v_user_type IS NULL THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'User not found';
  ELSIF v_user_type NOT IN ('exhibitor', 'partner') THEN
    RETURN QUERY SELECT false, v_user_type, format('Permission denied: %s cannot create time slots', v_user_type);
  ELSE
    RETURN QUERY SELECT true, v_user_type, 'OK';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. VALIDATE APPOINTMENT STATUS UPDATE
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_appointment_update(
  p_appointment_id UUID,
  p_new_status TEXT,
  p_actor_id UUID
)
RETURNS TABLE (
  is_valid BOOLEAN,
  reason TEXT,
  appointment_record JSONB
) AS $$
DECLARE
  v_appointment RECORD;
  v_actor_type TEXT;
  v_current_status TEXT;
BEGIN
  -- Get appointment
  SELECT * INTO v_appointment
  FROM appointments
  WHERE id = p_appointment_id;

  IF v_appointment IS NULL THEN
    RETURN QUERY SELECT false, 'Appointment not found', NULL::JSONB;
    RETURN;
  END IF;

  -- Get actor type
  SELECT type INTO v_actor_type
  FROM users
  WHERE id = p_actor_id;

  v_current_status := v_appointment.status;

  -- Validate status transitions
  CASE
    WHEN v_current_status = 'pending' AND p_new_status IN ('confirmed', 'rejected') THEN
      -- Exhibitor can confirm/reject pending
      IF v_actor_type = 'exhibitor' AND v_appointment.exhibitor_id = p_actor_id THEN
        RETURN QUERY SELECT true, 'OK', row_to_json(v_appointment)::JSONB;
      ELSE
        RETURN QUERY SELECT false, 'Only exhibitor can change status', row_to_json(v_appointment)::JSONB;
      END IF;
    WHEN v_current_status = 'confirmed' AND p_new_status = 'cancelled' THEN
      -- Visitor or exhibitor can cancel
      IF v_actor_type IN ('visitor', 'exhibitor') THEN
        RETURN QUERY SELECT true, 'OK', row_to_json(v_appointment)::JSONB;
      ELSE
        RETURN QUERY SELECT false, 'Permission denied', row_to_json(v_appointment)::JSONB;
      END IF;
    ELSE
      RETURN QUERY SELECT false, format('Invalid status transition: %s -> %s', v_current_status, p_new_status), row_to_json(v_appointment)::JSONB;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. CHECK USER PAYMENT STATUS
-- ============================================================================
CREATE OR REPLACE FUNCTION check_payment_status(p_exhibitor_id UUID)
RETURNS TABLE (
  is_paid BOOLEAN,
  payment_status TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  stand_size TEXT
) AS $$
DECLARE
  v_exhibitor RECORD;
BEGIN
  SELECT * INTO v_exhibitor
  FROM users
  WHERE id = p_exhibitor_id AND type = 'exhibitor';

  IF v_exhibitor IS NULL THEN
    RETURN QUERY SELECT false, 'Not an exhibitor', NULL::TIMESTAMP WITH TIME ZONE, NULL::TEXT;
    RETURN;
  END IF;

  -- Return payment info from profile
  RETURN QUERY SELECT
    (v_exhibitor.profile->>'payment_status' = 'paid')::BOOLEAN,
    COALESCE(v_exhibitor.profile->>'payment_status', 'unpaid'),
    (v_exhibitor.profile->>'payment_date')::TIMESTAMP WITH TIME ZONE,
    v_exhibitor.profile->>'stand_size';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. ATOMIC APPOINTMENT CREATION (WITH QUOTA CHECK)
-- ============================================================================
CREATE OR REPLACE FUNCTION create_appointment_atomic(
  p_visitor_id UUID,
  p_exhibitor_id UUID,
  p_time_slot_id UUID,
  p_visitor_level TEXT,
  p_message TEXT DEFAULT ''
)
RETURNS TABLE (
  success BOOLEAN,
  appointment_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_new_appointment_id UUID;
  v_quota_check RECORD;
  v_count INTEGER;
BEGIN
  -- 1. Validate quota
  SELECT * INTO v_quota_check
  FROM validate_appointment_quota(p_visitor_id, p_visitor_level);

  IF NOT v_quota_check.is_valid THEN
    RETURN QUERY SELECT false, NULL::UUID, v_quota_check.message;
    RETURN;
  END IF;

  -- 2. Create appointment in transaction
  BEGIN
    INSERT INTO appointments (
      id,
      visitor_id,
      exhibitor_id,
      time_slot_id,
      status,
      message,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      p_visitor_id,
      p_exhibitor_id,
      p_time_slot_id,
      'pending',
      p_message,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_new_appointment_id;

    RETURN QUERY SELECT true, v_new_appointment_id, 'Appointment created successfully';
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, NULL::UUID, SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT EXECUTE ON FUNCTION validate_appointment_quota(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_time_slot(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_appointment_update(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_payment_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_appointment_atomic(UUID, UUID, UUID, TEXT, TEXT) TO authenticated;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================
COMMENT ON FUNCTION validate_appointment_quota IS 'Validates if a user has remaining quota for appointments';
COMMENT ON FUNCTION can_create_time_slot IS 'Checks if user has permission to create time slots (exhibitor/partner only)';
COMMENT ON FUNCTION validate_appointment_update IS 'Validates appointment status transitions based on user role';
COMMENT ON FUNCTION check_payment_status IS 'Returns payment status of an exhibitor';
COMMENT ON FUNCTION create_appointment_atomic IS 'Creates appointment with atomic quota validation';


-- [20260106000002_push_notifications_tables.sql]
-- Migration: Create Push Notification Tables
-- Purpose: Support Firebase Cloud Messaging and web push notifications
-- Date: 2026-01-06
-- Phase: 4 - Push Notifications (Bug #8)

-- 1. Push Subscriptions Table
-- Stores user push notification subscriptions for web push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL, -- Web push endpoint URL
  keys jsonb NOT NULL, -- { "p256dh": "...", "auth": "..." }
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  UNIQUE(user_id, endpoint)
);

-- 2. Notifications Devices Table  
-- Stores device tokens for Firebase Cloud Messaging (web and mobile)
CREATE TABLE IF NOT EXISTS notifications_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token text NOT NULL, -- Firebase Cloud Messaging token
  platform text NOT NULL, -- 'web', 'android', 'ios'
  browser_name text, -- 'Chrome', 'Safari', 'Firefox', 'Edge', etc.
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  UNIQUE(user_id, device_token)
);

-- 3. Enable RLS on push subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for push_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Enable RLS on notifications devices
ALTER TABLE notifications_devices ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for notifications_devices
CREATE POLICY "Users can view their own devices"
  ON notifications_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices"
  ON notifications_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices"
  ON notifications_devices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices"
  ON notifications_devices FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Service role policies (for backend)
CREATE POLICY "Service role can manage subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage devices"
  ON notifications_devices FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_notifications_devices_user ON notifications_devices(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notifications_devices_token ON notifications_devices(device_token);
CREATE INDEX IF NOT EXISTS idx_notifications_devices_platform ON notifications_devices(platform);

-- 9. Create trigger to update updated_at on push_subscriptions
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscriptions_updated_at_trigger
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- 10. Create trigger to update updated_at on notifications_devices
CREATE OR REPLACE FUNCTION update_notifications_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_devices_updated_at_trigger
BEFORE UPDATE ON notifications_devices
FOR EACH ROW
EXECUTE FUNCTION update_notifications_devices_updated_at();

-- 11. Add comment documentation
COMMENT ON TABLE push_subscriptions IS 'Web push notification subscriptions for browser push notifications using Web Push API and VAPID';
COMMENT ON TABLE notifications_devices IS 'Device tokens for Firebase Cloud Messaging (FCM) supporting web and mobile push notifications';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'The Web Push endpoint URL provided by the browser';
COMMENT ON COLUMN push_subscriptions.keys IS 'JSONB object with p256dh and auth keys for encryption';
COMMENT ON COLUMN notifications_devices.device_token IS 'Firebase Cloud Messaging registration token unique to device/browser';
COMMENT ON COLUMN notifications_devices.platform IS 'Platform: web, android, ios';
COMMENT ON COLUMN notifications_devices.browser_name IS 'Browser name for analytics: Chrome, Safari, Firefox, Edge, etc.';

-- 12. Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications_devices TO authenticated;

-- 13. Grant access to service role (for backend/functions)
GRANT ALL ON push_subscriptions TO service_role;
GRANT ALL ON notifications_devices TO service_role;


-- [20260106000003_atomic_transaction_functions.sql]
-- Database Transactions - Atomic Operations for SIB 2026
-- Purpose: Ensure data consistency across multi-table operations
-- Phase: 4 - Missing Implementations (Bug #11)
-- Date: January 6, 2026

/**
 * EXISTING ATOMIC TRANSACTIONS:
 * 
 * 1. book_appointment_atomic() - Already implemented (20251030000001_atomic_appointment_booking.sql)
 *    - Updates appointments table
 *    - Updates time_slots table (currentBookings)
 *    - Uses row-level locking with FOR UPDATE
 *    - Implicit transaction via SECURITY DEFINER
 * 
 * 2. Payment operations - Handled at application level with Supabase service role
 * 
 * NEEDED ATOMIC TRANSACTIONS (Bug #11):
 */

-- 1. UPDATE APPOINTMENT STATUS WITH NOTIFICATIONS
-- When changing appointment status, must also:
--    - Update appointments table
--    - Update notifications table (send notification)
--    - Update user activity log
CREATE OR REPLACE FUNCTION update_appointment_status_atomic(
  p_appointment_id uuid,
  p_new_status text,
  p_visitor_id uuid,
  p_exhibitor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status text;
  v_result jsonb;
BEGIN
  -- 1. Lock the appointment row
  SELECT status INTO v_old_status
  FROM appointments
  WHERE id = p_appointment_id AND visitor_id = p_visitor_id
  FOR UPDATE;

  IF v_old_status IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Appointment not found or permission denied'
    );
  END IF;

  -- 2. Update appointment status (ATOMIC with lock)
  UPDATE appointments
  SET status = p_new_status, updated_at = now()
  WHERE id = p_appointment_id;

  -- 3. Record status change in activity log
  INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_visitor_id,
    'appointment_status_updated',
    'appointment',
    p_appointment_id,
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_new_status,
      'timestamp', now()
    )
  );

  -- 4. Create notification for status change
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (
    p_visitor_id,
    'Appointment ' || p_new_status,
    'Your appointment status has been updated to: ' || p_new_status,
    'appointment_status',
    'appointment',
    p_appointment_id
  );

  -- 5. Return success
  v_result := jsonb_build_object(
    'success', true,
    'appointment_id', p_appointment_id,
    'old_status', v_old_status,
    'new_status', p_new_status
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION update_appointment_status_atomic TO authenticated;

COMMENT ON FUNCTION update_appointment_status_atomic IS
  'Atomically updates appointment status, creates notification, and logs activity in single transaction';

---

-- 2. CANCEL APPOINTMENT WITH SLOT REFUND
-- When canceling appointment, must also:
--    - Update appointments table (status = cancelled)
--    - Update time_slots table (decrement currentBookings)
--    - Create refund record (if paid)
--    - Log activity
CREATE OR REPLACE FUNCTION cancel_appointment_atomic(
  p_appointment_id uuid,
  p_visitor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_time_slot_id uuid;
  v_exhibitor_id uuid;
  v_appointment_status text;
  v_result jsonb;
BEGIN
  -- 1. Lock and fetch appointment data
  SELECT 
    status, time_slot_id, exhibitor_id
  INTO 
    v_appointment_status, v_time_slot_id, v_exhibitor_id
  FROM appointments
  WHERE id = p_appointment_id AND visitor_id = p_visitor_id
  FOR UPDATE;

  IF v_appointment_status IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Appointment not found or permission denied'
    );
  END IF;

  -- 2. Check if already cancelled
  IF v_appointment_status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Appointment is already cancelled'
    );
  END IF;

  -- 3. Update appointment status
  UPDATE appointments
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_appointment_id;

  -- 4. Decrement time slot bookings
  UPDATE time_slots
  SET currentBookings = GREATEST(0, currentBookings - 1),
      available = (currentBookings - 1) < max_bookings,
      updated_at = now()
  WHERE id = v_time_slot_id;

  -- 5. Log activity
  INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_visitor_id,
    'appointment_cancelled',
    'appointment',
    p_appointment_id,
    jsonb_build_object(
      'time_slot_id', v_time_slot_id,
      'exhibitor_id', v_exhibitor_id,
      'timestamp', now()
    )
  );

  -- 6. Create notification
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (
    p_visitor_id,
    'Appointment Cancelled',
    'Your appointment has been cancelled and the time slot is now available for others.',
    'appointment_cancelled',
    'appointment',
    p_appointment_id
  );

  v_result := jsonb_build_object(
    'success', true,
    'appointment_id', p_appointment_id,
    'time_slot_id', v_time_slot_id,
    'message', 'Appointment cancelled successfully'
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_appointment_atomic TO authenticated;

COMMENT ON FUNCTION cancel_appointment_atomic IS
  'Atomically cancels appointment, refunds slot, logs activity, and notifies user in single transaction';

---

-- 3. PAYMENT PROCESSING TRANSACTION
-- When processing payment, must also:
--    - Create payment_requests record
--    - Update visitor subscription tier
--    - Record payment event
--    - Send confirmation notification
CREATE OR REPLACE FUNCTION process_subscription_payment_atomic(
  p_visitor_id uuid,
  p_tier_name text,
  p_amount decimal,
  p_payment_method text,
  p_transaction_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier_id uuid;
  v_old_tier text;
  v_result jsonb;
BEGIN
  -- 1. Lock visitor profile row
  SELECT visitor_level INTO v_old_tier
  FROM visitor_profiles
  WHERE user_id = p_visitor_id
  FOR UPDATE;

  -- 2. Get tier information
  SELECT id INTO v_tier_id
  FROM visitor_tiers
  WHERE name = p_tier_name
  LIMIT 1;

  IF v_tier_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid subscription tier'
    );
  END IF;

  -- 3. Create payment record
  INSERT INTO payment_requests (
    user_id, tier_id, amount, status, payment_method, stripe_transaction_id
  )
  VALUES (
    p_visitor_id, v_tier_id, p_amount, 'completed', p_payment_method, p_transaction_id
  );

  -- 4. Update visitor subscription tier
  UPDATE visitor_profiles
  SET 
    visitor_level = p_tier_name,
    paid_tier_expires_at = CASE 
      WHEN p_tier_name = 'free' THEN NULL
      ELSE now() + INTERVAL '1 year'
    END,
    updated_at = now()
  WHERE user_id = p_visitor_id;

  -- 5. Log activity
  INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_visitor_id,
    'subscription_upgraded',
    'subscription',
    v_tier_id,
    jsonb_build_object(
      'old_tier', v_old_tier,
      'new_tier', p_tier_name,
      'amount', p_amount,
      'payment_method', p_payment_method,
      'timestamp', now()
    )
  );

  -- 6. Create confirmation notification
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (
    p_visitor_id,
    'Subscription Upgraded',
    'Your subscription has been upgraded to ' || p_tier_name || '. You now have access to ' || 
    CASE WHEN p_tier_name = 'vip' THEN 'VIP features' 
         WHEN p_tier_name = 'premium' THEN 'Premium features'
         ELSE 'Standard features'
    END || '.',
    'subscription_upgraded',
    'subscription',
    v_tier_id
  );

  v_result := jsonb_build_object(
    'success', true,
    'visitor_id', p_visitor_id,
    'tier_name', p_tier_name,
    'old_tier', v_old_tier,
    'amount', p_amount,
    'message', 'Payment processed successfully'
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION process_subscription_payment_atomic TO authenticated;

COMMENT ON FUNCTION process_subscription_payment_atomic IS
  'Atomically processes subscription payment, updates tier, logs activity, and notifies user in single transaction';

---

-- 4. MESSAGE CREATION WITH NOTIFICATION
-- When creating a new message, must also:
--    - Insert into messages table
--    - Create unread notification for recipient
--    - Update conversation last_message_at
--    - Log activity
CREATE OR REPLACE FUNCTION send_message_atomic(
  p_sender_id uuid,
  p_recipient_id uuid,
  p_message_text text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id uuid;
  v_conversation_id uuid;
  v_result jsonb;
BEGIN
  -- 1. Find or create conversation (with lock)
  SELECT id INTO v_conversation_id
  FROM chat_conversations
  WHERE (participant_one_id = p_sender_id AND participant_two_id = p_recipient_id)
     OR (participant_one_id = p_recipient_id AND participant_two_id = p_sender_id)
  LIMIT 1
  FOR UPDATE;

  -- Create conversation if doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO chat_conversations (participant_one_id, participant_two_id)
    VALUES (p_sender_id, p_recipient_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  -- 2. Insert message
  INSERT INTO chat_messages (conversation_id, sender_id, content)
  VALUES (v_conversation_id, p_sender_id, p_message_text)
  RETURNING id INTO v_message_id;

  -- 3. Update conversation last message
  UPDATE chat_conversations
  SET last_message_at = now(), last_message_preview = p_message_text
  WHERE id = v_conversation_id;

  -- 4. Create notification for recipient
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (
    p_recipient_id,
    'New Message',
    p_message_text,
    'new_message',
    'message',
    v_message_id
  );

  -- 5. Log activity
  INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_sender_id,
    'message_sent',
    'message',
    v_message_id,
    jsonb_build_object(
      'recipient_id', p_recipient_id,
      'conversation_id', v_conversation_id,
      'timestamp', now()
    )
  );

  v_result := jsonb_build_object(
    'success', true,
    'message_id', v_message_id,
    'conversation_id', v_conversation_id,
    'timestamp', now()
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION send_message_atomic TO authenticated;

COMMENT ON FUNCTION send_message_atomic IS
  'Atomically sends message, creates/updates conversation, logs activity, and notifies recipient in single transaction';

---

-- 5. EXHIBITOR PROFILE UPDATE WITH SLOT INVALIDATION
-- When exhibitor updates profile, must also:
--    - Update exhibitor_profiles table
--    - Invalidate future time slots if needed
--    - Create audit log
--    - Notify affected visitors if applicable
CREATE OR REPLACE FUNCTION update_exhibitor_profile_atomic(
  p_exhibitor_id uuid,
  p_profile_data jsonb,
  p_invalidate_slots boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_slots_invalidated integer := 0;
BEGIN
  -- 1. Lock exhibitor profile
  UPDATE exhibitor_profiles
  SET 
    company_name = COALESCE(p_profile_data->>'company_name', company_name),
    description = COALESCE(p_profile_data->>'description', description),
    logo_url = COALESCE(p_profile_data->>'logo_url', logo_url),
    website = COALESCE(p_profile_data->>'website', website),
    updated_at = now()
  WHERE user_id = p_exhibitor_id;

  -- 2. Optionally invalidate future slots
  IF p_invalidate_slots THEN
    -- Cancel future time slots
    UPDATE time_slots
    SET available = false, updated_at = now()
    WHERE exhibitor_id = p_exhibitor_id
      AND slot_date >= CURRENT_DATE
      AND availability_status != 'cancelled';

    GET DIAGNOSTICS v_slots_invalidated = ROW_COUNT;

    -- Notify affected visitors of cancelled slots
    INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
    SELECT DISTINCT a.visitor_id,
      'Appointment Time Slot Cancelled',
      'Your appointment time slot has been cancelled. Please book a new one.',
      'slot_cancelled',
      'time_slot',
      ts.id
    FROM appointments a
    JOIN time_slots ts ON a.time_slot_id = ts.id
    WHERE ts.exhibitor_id = p_exhibitor_id
      AND ts.slot_date >= CURRENT_DATE
      AND a.status = 'pending';
  END IF;

  -- 3. Create audit log
  INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_exhibitor_id,
    'profile_updated',
    'exhibitor',
    p_exhibitor_id,
    jsonb_build_object(
      'changes', p_profile_data,
      'slots_invalidated', v_slots_invalidated,
      'timestamp', now()
    )
  );

  v_result := jsonb_build_object(
    'success', true,
    'exhibitor_id', p_exhibitor_id,
    'slots_invalidated', v_slots_invalidated,
    'message', 'Profile updated successfully'
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION update_exhibitor_profile_atomic TO authenticated;

COMMENT ON FUNCTION update_exhibitor_profile_atomic IS
  'Atomically updates exhibitor profile, optionally invalidates slots, and notifies affected users in single transaction';

---

-- SUMMARY OF TRANSACTION GUARANTEES:
-- 
-- All atomic transaction functions use:
-- 1. SECURITY DEFINER - Execute with function owner's permissions
-- 2. Row-level locking (FOR UPDATE) - Prevent race conditions
-- 3. Explicit transaction semantics - All operations succeed or all fail
-- 4. Error handling - Return JSON result with success/error status
-- 5. Audit logging - All changes recorded in user_activity_log
-- 6. Notifications - Users notified of important changes
--
-- Benefits:
-- ✅ No partial updates (all-or-nothing semantics)
-- ✅ No data corruption from concurrent operations
-- ✅ Complete audit trail of all changes
-- ✅ User notifications for important events
-- ✅ Data consistency across related tables
-- ✅ Performance optimized with minimal locking


-- [20260118000001_add_server_side_quota_verification.sql]
-- Migration: Add server-side quota verification for B2B appointments
-- Description: Prevents quota bypass by enforcing limits at database level
-- Date: 2026-01-18
-- Security: CRITICAL - Prevents fraud

-- ============================================================================
-- FONCTION: get_user_b2b_quota
-- Retourne le quota B2B d'un utilisateur selon son type
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_b2b_quota(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_user_type text;
  v_visitor_level text;
  v_quota integer;
BEGIN
  -- Récupérer le type et niveau de l'utilisateur
  SELECT type, visitor_level
  INTO v_user_type, v_visitor_level
  FROM users
  WHERE id = p_user_id;

  -- Déterminer le quota selon le type
  -- RÈGLES MÉTIER:
  -- - Exposants/Partenaires: ILLIMITÉ (999999)
  -- - Visiteurs VIP/Premium: 10 RDV
  -- - Visiteurs Gratuits: 0 RDV
  v_quota := CASE
    -- Types avec quota illimité
    WHEN v_user_type IN ('exhibitor', 'partner', 'admin', 'security') THEN 999999

    -- Visiteurs selon leur niveau
    WHEN v_user_type = 'visitor' THEN
      CASE v_visitor_level
        WHEN 'vip' THEN 10
        WHEN 'premium' THEN 10
        WHEN 'free' THEN 0
        ELSE 0
      END

    -- Par défaut: aucun quota
    ELSE 0
  END;

  RETURN v_quota;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_b2b_quota IS
'Retourne le quota de rendez-vous B2B autorisé pour un utilisateur selon son type et niveau';

-- ============================================================================
-- FONCTION: check_b2b_quota_available
-- Vérifie si un utilisateur peut encore prendre un RDV
-- ============================================================================
CREATE OR REPLACE FUNCTION check_b2b_quota_available(p_user_id uuid)
RETURNS json AS $$
DECLARE
  v_quota integer;
  v_active_count integer;
  v_remaining integer;
BEGIN
  -- Obtenir le quota
  v_quota := get_user_b2b_quota(p_user_id);

  -- Compter les RDV actifs (pending + confirmed)
  SELECT COUNT(*)
  INTO v_active_count
  FROM appointments
  WHERE visitor_id = p_user_id
    AND status IN ('pending', 'confirmed')
    AND deleted_at IS NULL;

  -- Calculer les RDV restants
  v_remaining := GREATEST(0, v_quota - v_active_count);

  -- Retourner le résultat
  RETURN json_build_object(
    'quota', v_quota,
    'used', v_active_count,
    'remaining', v_remaining,
    'available', (v_quota > v_active_count OR v_quota = 999999),
    'is_unlimited', (v_quota = 999999)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_b2b_quota_available IS
'Vérifie la disponibilité du quota B2B pour un utilisateur';

-- ============================================================================
-- FONCTION AMÉLIORÉE: book_appointment_atomic
-- Ajout de la vérification de quota côté serveur
-- ============================================================================
CREATE OR REPLACE FUNCTION book_appointment_atomic(
  p_visitor_id uuid,
  p_time_slot_id uuid,
  p_message text DEFAULT ''
)
RETURNS json AS $$
DECLARE
  v_slot_exhibitor_id uuid;
  v_slot_available boolean;
  v_slot_max_bookings integer;
  v_current_bookings integer;
  v_new_appointment_id uuid;
  v_quota_check json;
BEGIN
  -- 🔐 ÉTAPE 1: Vérifier le quota B2B côté serveur
  v_quota_check := check_b2b_quota_available(p_visitor_id);

  IF NOT (v_quota_check->>'available')::boolean THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Quota de rendez-vous atteint pour votre niveau',
      'quota_info', v_quota_check
    );
  END IF;

  -- ÉTAPE 2: Récupérer les infos du time slot avec LOCK
  SELECT exhibitor_id, available, max_bookings
  INTO v_slot_exhibitor_id, v_slot_available, v_slot_max_bookings
  FROM time_slots
  WHERE id = p_time_slot_id
  FOR UPDATE; -- Lock pessimiste

  -- Vérifier que le slot existe
  IF v_slot_exhibitor_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Créneau horaire introuvable'
    );
  END IF;

  -- Vérifier que le slot est disponible
  IF NOT v_slot_available THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ce créneau n''est plus disponible'
    );
  END IF;

  -- ÉTAPE 3: Vérifier que le visiteur n'a pas déjà réservé ce slot
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE visitor_id = p_visitor_id
      AND time_slot_id = p_time_slot_id
      AND status IN ('pending', 'confirmed')
      AND deleted_at IS NULL
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Vous avez déjà réservé ce créneau'
    );
  END IF;

  -- ÉTAPE 4: Compter les réservations actuelles pour ce slot
  SELECT COUNT(*)
  INTO v_current_bookings
  FROM appointments
  WHERE time_slot_id = p_time_slot_id
    AND status IN ('pending', 'confirmed')
    AND deleted_at IS NULL;

  -- Vérifier la capacité max
  IF v_current_bookings >= v_slot_max_bookings THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ce créneau est complet'
    );
  END IF;

  -- ÉTAPE 5: Créer le rendez-vous
  INSERT INTO appointments (
    visitor_id,
    exhibitor_id,
    time_slot_id,
    status,
    message,
    created_at
  )
  VALUES (
    p_visitor_id,
    v_slot_exhibitor_id,
    p_time_slot_id,
    'pending', -- Status initial: en attente de confirmation
    p_message,
    NOW()
  )
  RETURNING id INTO v_new_appointment_id;

  -- ÉTAPE 6: Mettre à jour current_bookings du time_slot
  UPDATE time_slots
  SET current_bookings = v_current_bookings + 1
  WHERE id = p_time_slot_id;

  -- ÉTAPE 7: Retourner le succès avec les infos
  RETURN json_build_object(
    'success', true,
    'appointment_id', v_new_appointment_id,
    'quota_info', v_quota_check,
    'message', 'Demande de rendez-vous envoyée avec succès'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Gérer les erreurs
    RETURN json_build_object(
      'success', false,
      'error', 'Erreur lors de la réservation: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION book_appointment_atomic IS
'Réserve un rendez-vous B2B de manière atomique avec vérification de quota côté serveur';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Autoriser tous les utilisateurs authentifiés à appeler ces fonctions
GRANT EXECUTE ON FUNCTION get_user_b2b_quota(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_b2b_quota_available(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION book_appointment_atomic(uuid, uuid, text) TO authenticated;

-- ============================================================================
-- TESTS DE SÉCURITÉ
-- ============================================================================

-- Test 1: Vérifier qu'un visiteur gratuit a un quota de 0
DO $$
DECLARE
  v_test_quota integer;
BEGIN
  -- Créer un utilisateur test
  INSERT INTO users (id, email, type, visitor_level)
  VALUES ('00000000-0000-0000-0000-000000000001', 'test_free@test.com', 'visitor', 'free')
  ON CONFLICT (id) DO UPDATE SET visitor_level = 'free';

  -- Vérifier le quota
  v_test_quota := get_user_b2b_quota('00000000-0000-0000-0000-000000000001');

  IF v_test_quota != 0 THEN
    RAISE EXCEPTION 'ÉCHEC TEST: Visiteur gratuit devrait avoir quota = 0, obtenu = %', v_test_quota;
  END IF;

  RAISE NOTICE '✅ Test 1 réussi: Visiteur gratuit a quota = 0';
END $$;

-- Test 2: Vérifier qu'un exposant a un quota illimité
DO $$
DECLARE
  v_test_quota integer;
BEGIN
  INSERT INTO users (id, email, type)
  VALUES ('00000000-0000-0000-0000-000000000002', 'test_exhibitor@test.com', 'exhibitor')
  ON CONFLICT (id) DO UPDATE SET type = 'exhibitor';

  v_test_quota := get_user_b2b_quota('00000000-0000-0000-0000-000000000002');

  IF v_test_quota != 999999 THEN
    RAISE EXCEPTION 'ÉCHEC TEST: Exposant devrait avoir quota = 999999, obtenu = %', v_test_quota;
  END IF;

  RAISE NOTICE '✅ Test 2 réussi: Exposant a quota illimité (999999)';
END $$;

-- Test 3: Vérifier qu'un visiteur VIP a un quota de 10
DO $$
DECLARE
  v_test_quota integer;
BEGIN
  INSERT INTO users (id, email, type, visitor_level)
  VALUES ('00000000-0000-0000-0000-000000000003', 'test_vip@test.com', 'visitor', 'vip')
  ON CONFLICT (id) DO UPDATE SET visitor_level = 'vip';

  v_test_quota := get_user_b2b_quota('00000000-0000-0000-0000-000000000003');

  IF v_test_quota != 10 THEN
    RAISE EXCEPTION 'ÉCHEC TEST: Visiteur VIP devrait avoir quota = 10, obtenu = %', v_test_quota;
  END IF;

  RAISE NOTICE '✅ Test 3 réussi: Visiteur VIP a quota = 10';
END $$;

-- Nettoyage des utilisateurs de test
DELETE FROM users WHERE email LIKE 'test_%@test.com';

RAISE NOTICE '========================================';
RAISE NOTICE '✅ Migration terminée avec succès';
RAISE NOTICE '🔐 Vérification de quota côté serveur activée';
RAISE NOTICE '========================================';


-- [20260123000002_add_atomic_view_increment.sql]
-- Migration: Add atomic view increment function for mini-sites
-- Description: Reduces 3 queries to 1 RPC call for better performance
-- Date: 2026-01-23
-- Performance: CRITICAL - Fixes N+1 query pattern

-- ============================================================================
-- FONCTION: increment_minisite_views
-- Incrémente atomiquement le compteur de vues d'un mini-site
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_minisite_views(p_exhibitor_id uuid)
RETURNS json AS $$
DECLARE
  v_user_id uuid;
  v_old_count integer;
  v_new_count integer;
BEGIN
  -- Étape 1: Déterminer si p_exhibitor_id est un exhibitor.id ou user_id
  -- Essayer d'abord comme exhibitor.id
  SELECT user_id INTO v_user_id
  FROM exhibitors
  WHERE id = p_exhibitor_id;

  -- Si pas trouvé, c'est peut-être déjà un user_id
  IF v_user_id IS NULL THEN
    v_user_id := p_exhibitor_id;
  END IF;

  -- Étape 2: Incrémenter atomiquement le view_count
  UPDATE mini_sites
  SET
    view_count = COALESCE(view_count, 0) + 1,
    updated_at = NOW()
  WHERE exhibitor_id = v_user_id
  RETURNING view_count INTO v_new_count;

  -- Si aucune ligne n'a été mise à jour, le mini-site n'existe pas
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Mini-site not found',
      'exhibitor_id', p_exhibitor_id,
      'user_id', v_user_id
    );
  END IF;

  v_old_count := v_new_count - 1;

  -- Retourner le résultat
  RETURN json_build_object(
    'success', true,
    'old_count', v_old_count,
    'new_count', v_new_count,
    'exhibitor_id', p_exhibitor_id,
    'user_id', v_user_id
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Gérer les erreurs
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'exhibitor_id', p_exhibitor_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_minisite_views IS
'Incrémente atomiquement le compteur de vues d''un mini-site (réduit 3 queries à 1 RPC)';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================
-- Autoriser tous les utilisateurs authentifiés et anonymes à appeler cette fonction
GRANT EXECUTE ON FUNCTION increment_minisite_views(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_minisite_views(uuid) TO anon;

-- ============================================================================
-- TESTS
-- ============================================================================
DO $$
DECLARE
  v_test_user_id uuid := '00000000-0000-0000-0000-000000000099';
  v_test_exhibitor_id uuid := '00000000-0000-0000-0000-000000000098';
  v_result json;
BEGIN
  -- Créer un utilisateur test
  INSERT INTO users (id, email, type, name)
  VALUES (v_test_user_id, 'test_views@test.com', 'exhibitor', 'Test Exhibitor')
  ON CONFLICT (id) DO NOTHING;

  -- Créer un exposant test
  INSERT INTO exhibitors (id, user_id, company_name, category, sector, description)
  VALUES (
    v_test_exhibitor_id,
    v_test_user_id,
    'Test Company Views',
    'technology',
    'IT',
    'Test description'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Créer un mini-site test
  INSERT INTO mini_sites (exhibitor_id, theme, view_count, is_published)
  VALUES (v_test_user_id, 'default', 0, true)
  ON CONFLICT (exhibitor_id) DO UPDATE
  SET view_count = 0;

  -- Test 1: Incrémenter avec exhibitor.id
  v_result := increment_minisite_views(v_test_exhibitor_id);
  IF NOT (v_result->>'success')::boolean THEN
    RAISE EXCEPTION 'ÉCHEC TEST 1: Incrémentation avec exhibitor.id a échoué: %', v_result;
  END IF;
  IF (v_result->>'new_count')::integer != 1 THEN
    RAISE EXCEPTION 'ÉCHEC TEST 1: view_count devrait être 1, obtenu: %', v_result->>'new_count';
  END IF;
  RAISE NOTICE '✅ Test 1 réussi: Incrémentation avec exhibitor.id';

  -- Test 2: Incrémenter avec user_id directement
  v_result := increment_minisite_views(v_test_user_id);
  IF NOT (v_result->>'success')::boolean THEN
    RAISE EXCEPTION 'ÉCHEC TEST 2: Incrémentation avec user_id a échoué: %', v_result;
  END IF;
  IF (v_result->>'new_count')::integer != 2 THEN
    RAISE EXCEPTION 'ÉCHEC TEST 2: view_count devrait être 2, obtenu: %', v_result->>'new_count';
  END IF;
  RAISE NOTICE '✅ Test 2 réussi: Incrémentation avec user_id';

  -- Test 3: Incrémenter plusieurs fois (race condition test)
  FOR i IN 1..5 LOOP
    v_result := increment_minisite_views(v_test_user_id);
  END LOOP;
  IF (v_result->>'new_count')::integer != 7 THEN
    RAISE EXCEPTION 'ÉCHEC TEST 3: view_count devrait être 7, obtenu: %', v_result->>'new_count';
  END IF;
  RAISE NOTICE '✅ Test 3 réussi: Incrémentations multiples (race condition safe)';

  -- Test 4: Exhibitor inexistant
  v_result := increment_minisite_views('00000000-0000-0000-0000-000000000001');
  IF (v_result->>'success')::boolean THEN
    RAISE EXCEPTION 'ÉCHEC TEST 4: Devrait échouer pour exhibitor inexistant';
  END IF;
  RAISE NOTICE '✅ Test 4 réussi: Gestion des exhibitors inexistants';

  -- Nettoyage
  DELETE FROM mini_sites WHERE exhibitor_id = v_test_user_id;
  DELETE FROM exhibitors WHERE id = v_test_exhibitor_id;
  DELETE FROM users WHERE id = v_test_user_id;

END $$;

RAISE NOTICE '========================================';
RAISE NOTICE '✅ Migration terminée avec succès';
RAISE NOTICE '⚡ Fonction increment_minisite_views créée';
RAISE NOTICE '📊 Performance: 3 queries → 1 RPC call';
RAISE NOTICE '========================================';


-- [20260125000001_fix_visitor_quotas.sql]
-- Migration pour corriger les quotas visiteurs selon le cahier des charges
-- FREE: 0 RDV | VIP/PREMIUM: 10 RDV

-- 1. Vérifier et ajouter TOUTES les colonnes manquantes si nécessaire
DO $$ 
BEGIN
  -- Ajouter la colonne name si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='name') THEN
    ALTER TABLE visitor_levels ADD COLUMN name text;
  END IF;
  
  -- Ajouter la colonne description si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='description') THEN
    ALTER TABLE visitor_levels ADD COLUMN description text;
  END IF;
  
  -- Ajouter la colonne price_monthly si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='price_monthly') THEN
    ALTER TABLE visitor_levels ADD COLUMN price_monthly numeric DEFAULT 0;
  END IF;
  
  -- Ajouter la colonne price_annual si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='price_annual') THEN
    ALTER TABLE visitor_levels ADD COLUMN price_annual numeric DEFAULT 0;
  END IF;
  
  -- Ajouter la colonne features si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='features') THEN
    ALTER TABLE visitor_levels ADD COLUMN features jsonb DEFAULT '{}';
  END IF;
  
  -- Ajouter la colonne quotas si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='quotas') THEN
    ALTER TABLE visitor_levels ADD COLUMN quotas jsonb DEFAULT '{}';
  END IF;
  
  -- Ajouter la colonne display_order si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='display_order') THEN
    ALTER TABLE visitor_levels ADD COLUMN display_order integer DEFAULT 0;
  END IF;
END $$;

-- 2. Mettre à jour les quotas pour le niveau FREE (0 rendez-vous)
UPDATE visitor_levels
SET 
  features = '{"appointments": 0, "connections": 10, "minisite_views": true, "chat": true}'::jsonb,
  quotas = '{"appointments": 0, "connections_per_day": 10, "favorites": 20}'::jsonb
WHERE level = 'free';

-- 3. Mettre à jour les quotas pour le niveau VIP (10 rendez-vous)
UPDATE visitor_levels
SET 
  name = 'Pass VIP Premium',
  description = 'Accès VIP avec 10 rendez-vous B2B et tous les avantages premium - 700€ TTC',
  price_monthly = 700.00,
  price_annual = 700.00,
  features = '{"appointments": 10, "connections": 9999, "minisite_views": true, "chat": true, "priority_support": true, "concierge": true, "private_lounge": true}'::jsonb,
  quotas = '{"appointments": 10, "connections_per_day": 9999, "favorites": 9999}'::jsonb,
  display_order = 2
WHERE level = 'vip';

-- 4. Mettre à jour PREMIUM pour être un alias de VIP (10 rendez-vous)
UPDATE visitor_levels
SET 
  name = 'Pass VIP Premium (alias)',
  description = 'Alias pour le Pass VIP Premium - 700€ TTC',
  price_monthly = 700.00,
  price_annual = 700.00,
  features = '{"appointments": 10, "connections": 9999, "minisite_views": true, "chat": true, "priority_support": true, "concierge": true, "private_lounge": true}'::jsonb,
  quotas = '{"appointments": 10, "connections_per_day": 9999, "favorites": 9999}'::jsonb,
  display_order = 3
WHERE level = 'premium';

-- 5. Vérification des valeurs (commentaire pour référence)
-- SELECT level, name, (quotas->>'appointments')::int as rdv_quota 
-- FROM visitor_levels 
-- ORDER BY display_order;
-- 
-- Résultat attendu:
-- free     | Pass Gratuit              | 0
-- vip      | Pass VIP Premium          | 10
-- premium  | Pass VIP Premium (alias)  | 10


-- [20260128000001_fix_demo_exhibitors_standarea.sql]
-- Fix: Update demo exhibitor accounts with standArea in profile
-- This ensures demo accounts show correct quotas based on stand size

-- Update exhibitor profiles with standArea
UPDATE public.users 
SET profile = jsonb_set(profile, '{standArea}', '54'::jsonb)
WHERE email = 'exhibitor-54m@test.sib2026.ma';

UPDATE public.users 
SET profile = jsonb_set(profile, '{standArea}', '36'::jsonb)
WHERE email = 'exhibitor-36m@test.sib2026.ma';

UPDATE public.users 
SET profile = jsonb_set(profile, '{standArea}', '18'::jsonb)
WHERE email = 'exhibitor-18m@test.sib2026.ma';

UPDATE public.users 
SET profile = jsonb_set(profile, '{standArea}', '9'::jsonb)
WHERE email = 'exhibitor-9m@test.sib2026.ma';

-- Verify the updates
SELECT email, profile->>'standArea' as stand_area FROM public.users 
WHERE email LIKE 'exhibitor-%@test.sib2026.ma'
ORDER BY email;


-- [20260202000001_create_vip_visitor_slots.sql]
-- Table pour les créneaux de disponibilité des visiteurs VIP
CREATE TABLE IF NOT EXISTS visitor_vip_time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER DEFAULT 60,
  type TEXT DEFAULT 'hybrid',
  max_bookings INTEGER DEFAULT 2,
  current_bookings INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  location TEXT DEFAULT 'Stand/Visio',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_visitor_vip_slots_user_id ON visitor_vip_time_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_vip_slots_date ON visitor_vip_time_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_visitor_vip_slots_available ON visitor_vip_time_slots(available);

-- RLS policies
ALTER TABLE visitor_vip_time_slots ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent voir les créneaux disponibles
CREATE POLICY "Anyone can view available VIP visitor slots"
  ON visitor_vip_time_slots FOR SELECT
  USING (available = true);

-- Les visiteurs VIP peuvent voir et gérer leurs propres créneaux
CREATE POLICY "VIP visitors can manage their own slots"
  ON visitor_vip_time_slots FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage all VIP visitor slots"
  ON visitor_vip_time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );


-- [20260202000002_extend_time_slots_for_all_users.sql]
-- Migration: Ajouter support pour partenaires et VIP visitors à time_slots
-- Cette migration ajoute une colonne user_id optionnelle et relâche la contrainte sur exhibitor_id

ALTER TABLE time_slots
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Ajouter un index pour user_id
CREATE INDEX IF NOT EXISTS idx_time_slots_user_id ON time_slots(user_id);

-- Vérifier que au moins l'un des deux (exhibitor_id OU user_id) est défini
ALTER TABLE time_slots
DROP CONSTRAINT IF EXISTS check_slot_owner;

ALTER TABLE time_slots
ADD CONSTRAINT check_slot_owner CHECK (
  (exhibitor_id IS NOT NULL AND user_id IS NULL)
  OR (exhibitor_id IS NULL AND user_id IS NOT NULL)
);

-- Vérifier que exhibitor_id est maintenant NULLABLE (pour permettre l'utilisation de user_id seul)
ALTER TABLE time_slots
ALTER COLUMN exhibitor_id DROP NOT NULL;

-- Mettre à jour les RLS policies pour accepter les deux types
DROP POLICY IF EXISTS "Anyone can view available time slots" ON time_slots;
DROP POLICY IF EXISTS "Partners can manage their own slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can manage their own slots" ON time_slots;
DROP POLICY IF EXISTS "Admins can manage all slots" ON time_slots;

-- Politique de SELECT pour tous
CREATE POLICY "Anyone can view available time slots"
  ON time_slots FOR SELECT
  USING (available = true OR auth.uid() IN (
    SELECT id FROM users WHERE user_type = 'admin'
  ));

-- Politique pour les propriétaires (exhibitors, partners, or VIP visitors)
CREATE POLICY "Users can manage their own slots"
  ON time_slots FOR ALL
  USING (
    -- Propriétaire exhibitor
    exhibitor_id IN (
      SELECT id FROM exhibitors
      WHERE user_id = auth.uid()
    )
    -- Propriétaire user_id (partner ou VIP visitor)
    OR user_id = auth.uid()
    -- Admin
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
    )
  )
  WITH CHECK (
    exhibitor_id IN (
      SELECT id FROM exhibitors
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Politique pour admins
CREATE POLICY "Admins can manage all time slots"
  ON time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
    )
  );


-- [20260208000001_add_exhibitor_delete_policy.sql]
-- Migration: Ajouter la policy DELETE sur la table exhibitors pour les admins
-- La table exhibitors a RLS activé avec des policies SELECT/UPDATE mais PAS de policy DELETE
-- Cela empêche les admins de supprimer des exposants

-- Supprimer l'ancienne policy si elle existe
DROP POLICY IF EXISTS "Admin can delete exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "admin_delete_exhibitors" ON exhibitors;

-- Créer la policy permettant aux admins de supprimer des exposants
CREATE POLICY "admin_delete_exhibitors" ON exhibitors
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
  );

-- Vérification
COMMENT ON POLICY "admin_delete_exhibitors" ON exhibitors 
  IS 'Permet aux utilisateurs admin de supprimer des exposants';


-- [20260214000001_add_publication_control.sql]
-- ============================================================================
-- MIGRATION: Add publication control for partners and exhibitors
-- Date: 2026-02-14
-- Description: Add is_published field to control visibility of partners and exhibitors
-- ============================================================================

BEGIN;

-- Add is_published column to partners table
ALTER TABLE public.partners
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Add is_published column to exhibitors table  
ALTER TABLE public.exhibitors
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_partners_is_published ON public.partners(is_published);
CREATE INDEX IF NOT EXISTS idx_exhibitors_is_published ON public.exhibitors(is_published);

-- Update existing records to published (for smooth migration)
UPDATE public.partners SET is_published = true WHERE is_published IS NULL;
UPDATE public.exhibitors SET is_published = true WHERE is_published IS NULL;

-- Add comments
COMMENT ON COLUMN public.partners.is_published IS 'Controls if partner profile is visible publicly. Admin controls this field.';
COMMENT ON COLUMN public.exhibitors.is_published IS 'Controls if exhibitor profile is visible publicly. Admin controls this field.';

COMMIT;


-- [20260217_create_email_templates.sql]
-- Table pour stocker les templates d'emails personnalisables
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index pour recherche rapide par clé
CREATE INDEX idx_email_templates_key ON email_templates(template_key);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Admin peut tout faire
CREATE POLICY "Admin can manage email templates"
  ON email_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Tout le monde peut lire les templates actifs (pour l'Edge Function)
CREATE POLICY "Anyone can read active email templates"
  ON email_templates
  FOR SELECT
  USING (is_active = true);

-- Insertion des templates par défaut
INSERT INTO email_templates (template_key, name, description, subject, html_content, text_content, variables) VALUES
(
  'visitor_welcome_free',
  'Bienvenue Visiteur Gratuit',
  'Email de bienvenue pour les visiteurs avec pass gratuit',
  '🎉 Bienvenue à SIB 2026 - Pass Gratuit Confirmé',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue à SIB 2026</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bienvenue à SIB 2026</h1>
    <p style="color: #e8f5e9; margin: 10px 0 0 0; font-size: 16px;">Pass Gratuit confirmé</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Bonjour <strong>{{name}}</strong>,</p>

    <p style="font-size: 16px;">
      Félicitations ! Votre inscription gratuite au <strong>Salon International des Ports et de la Logistique Maritime (SIB) 2026</strong> a été confirmée avec succès.
    </p>

    <div style="background: white; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #16a34a;">✅ Votre Pass Gratuit inclut :</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Accès au salon SIB 2026</li>
        <li>Badge QR sécurisé d''entrée</li>
        <li>Accès aux zones publiques et hall d''exposition</li>
        <li>Participation aux conférences publiques</li>
      </ul>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #d97706;">📅 Informations du salon</h3>
      <p style="margin: 5px 0;"><strong>Dates :</strong> 15-18 Avril 2026</p>
      <p style="margin: 5px 0;"><strong>Lieu :</strong> Parc des Expositions de Casablanca, Maroc</p>
      <p style="margin: 5px 0;"><strong>Horaires :</strong> 9h00 - 18h00</p>
    </div>

    <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #0369a1;">📞 Besoin d''aide ?</h3>
      <p style="margin: 5px 0;">Email : <a href="mailto:contact@sib2026.com" style="color: #0ea5e9;">contact@sib2026.com</a></p>
      <p style="margin: 5px 0;">Téléphone : +212 5 22 XX XX XX</p>
    </div>

    <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
      Nous avons hâte de vous accueillir au SIB 2026 !<br>
      L''équipe SIB
    </p>
  </div>
</body>
</html>',
  'Bonjour {{name}},

Félicitations ! Votre inscription gratuite au Salon International des Ports et de la Logistique Maritime (SIB) 2026 a été confirmée avec succès.

VOTRE PASS GRATUIT INCLUT :
- Accès au salon SIB 2026
- Badge QR sécurisé d''entrée
- Accès aux zones publiques et hall d''exposition
- Participation aux conférences publiques

INFORMATIONS DU SALON :
Dates : 15-18 Avril 2026
Lieu : Parc des Expositions de Casablanca, Maroc
Horaires : 9h00 - 18h00

Nous avons hâte de vous accueillir au SIB 2026 !
L''équipe SIB',
  '["name", "email", "level"]'::jsonb
),
(
  'visitor_welcome_vip',
  'Bienvenue Visiteur VIP',
  'Email de bienvenue pour les visiteurs VIP avec demande de paiement',
  '👑 Compte VIP créé - Finaliser le paiement - SIB 2026',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compte VIP créé</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">👑 Compte VIP Premium Créé</h1>
    <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Finalisez votre paiement pour activer votre accès</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Bonjour <strong>{{name}}</strong>,</p>

    <p style="font-size: 16px;">
      Votre compte <strong>Pass VIP Premium</strong> pour SIB 2026 a été créé avec succès ! 🎉
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #d97706;">⚠️ Action requise : Finaliser le paiement</h3>
      <p style="margin: 10px 0;">
        Pour activer votre accès VIP et profiter de tous les avantages premium, veuillez finaliser le paiement de <strong>700 EUR</strong>.
      </p>
    </div>

    <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
      Merci d''avoir choisi le Pass VIP Premium !<br>
      L''équipe SIB
    </p>
  </div>
</body>
</html>',
  'Bonjour {{name}},

Votre compte Pass VIP Premium pour SIB 2026 a été créé avec succès !

ACTION REQUISE : FINALISER LE PAIEMENT
Pour activer votre accès VIP, veuillez finaliser le paiement de 700 EUR.

Merci d''avoir choisi le Pass VIP Premium !
L''équipe SIB',
  '["name", "email", "level"]'::jsonb
);

COMMENT ON TABLE email_templates IS 'Templates d''emails personnalisables par les administrateurs';
COMMENT ON COLUMN email_templates.template_key IS 'Clé unique pour identifier le template (ex: visitor_welcome_free)';
COMMENT ON COLUMN email_templates.variables IS 'Liste des variables disponibles pour ce template (ex: ["name", "email", "level"])';


-- [20260218000001_fix_partner_logo_update.sql]
-- Migration: Fixer les policies RLS pour permettre aux partenaires de mettre à jour leur logo
-- Created: 2026-02-18
-- Description: Crée les tables nécessaires et configure les policies RLS pour permettre la mise à jour des profils partenaires

-- ============================================
-- 0. CRÉATION DES TABLES SI NÉCESSAIRES
-- ============================================

-- Créer la table partner_profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.partner_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  description text,
  logo_url text,
  website text,
  country text,
  partnership_level text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer les index si nécessaires
CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON public.partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_partnership_level ON public.partner_profiles(partnership_level);

-- ============================================
-- 1. PARTNER_PROFILES TABLE: Fix RLS Policies
-- ============================================

-- Activer RLS sur la table si ce n'est pas déjà fait
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies (si elles existent)
DROP POLICY IF EXISTS "Partners can update own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Partners can view own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Admins can manage partner profiles" ON public.partner_profiles;
DROP POLICY IF EXISTS "Partners can update their own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Admins can manage all partner profiles" ON public.partner_profiles;
DROP POLICY IF EXISTS "Partners can insert own profile" ON public.partner_profiles;

-- Policy: Les partenaires peuvent lire leur propre profil
CREATE POLICY "Partners can view own profile"
  ON public.partner_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Les partenaires peuvent mettre à jour leur profil (incluant logo_url)
CREATE POLICY "Partners can update own profile"
  ON public.partner_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Insertion pour les nouveaux profils
CREATE POLICY "Partners can insert own profile"
  ON public.partner_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 2. STORAGE: Fix RLS Policies pour les logos
-- ============================================

-- Créer le bucket partner-logos s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-logos',
  'partner-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

-- Supprimer les anciennes policies du storage
DROP POLICY IF EXISTS "Public can read partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete partner logos" ON storage.objects;

-- Politique de lecture publique pour les logos
CREATE POLICY "Public can read partner logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'partner-logos');

-- Politique pour uploader des logos (utilisateurs authentifiés)
CREATE POLICY "Authenticated users can upload partner logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'partner-logos');

-- Politique pour mettre à jour les logos
CREATE POLICY "Authenticated users can update partner logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'partner-logos')
  WITH CHECK (bucket_id = 'partner-logos');

-- Politique pour supprimer les logos
CREATE POLICY "Authenticated users can delete partner logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'partner-logos');

-- ============================================
-- 3. VERIFICATION
-- ============================================

-- Vérifier que les policies sont créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'partner_profiles'
ORDER BY tablename, policyname;

-- Vérifier que le bucket existe
SELECT id, name, public FROM storage.buckets WHERE id = 'partner-logos';


-- [20260218000002_fix_exhibitor_logo_update.sql]
-- Migration: Fixer les policies RLS pour permettre aux exposants de mettre à jour leur logo
-- Created: 2026-02-18
-- Description: Crée les tables nécessaires et configure les policies RLS pour permettre la mise à jour des profils exposants

-- ============================================
-- 0. CRÉATION DE LA TABLE SI NÉCESSAIRE
-- ============================================

-- Créer la table exhibitor_profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.exhibitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  description text,
  logo_url text,
  website text,
  country text,
  sector text,
  category text,
  stand_number text,
  stand_area numeric DEFAULT 9.0 CHECK (stand_area > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer les index si nécessaires
CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_user_id ON public.exhibitor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_stand_area ON public.exhibitor_profiles(stand_area);

-- ============================================
-- 1. EXHIBITOR_PROFILES TABLE: Fix RLS Policies
-- ============================================

-- Activer RLS sur la table si ce n'est pas déjà fait
ALTER TABLE public.exhibitor_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies (si elles existent)
DROP POLICY IF EXISTS "Exhibitors can update own profile" ON public.exhibitor_profiles;
DROP POLICY IF EXISTS "Exhibitors can view own profile" ON public.exhibitor_profiles;
DROP POLICY IF EXISTS "Exhibitors can insert own profile" ON public.exhibitor_profiles;
DROP POLICY IF EXISTS "Exhibitors can read own data" ON public.exhibitor_profiles;
DROP POLICY IF EXISTS "Exhibitors can update own data" ON public.exhibitor_profiles;
DROP POLICY IF EXISTS "Public can read approved exhibitors" ON public.exhibitor_profiles;

-- Policy: Les exposants peuvent lire leur propre profil
CREATE POLICY "Exhibitors can view own profile"
  ON public.exhibitor_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Les exposants peuvent mettre à jour leur profil (incluant logo_url)
CREATE POLICY "Exhibitors can update own profile"
  ON public.exhibitor_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Insertion pour les nouveaux profils
CREATE POLICY "Exhibitors can insert own profile"
  ON public.exhibitor_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Public peut lire tous les profils exposants (pour le catalogue)
CREATE POLICY "Public can read exhibitor profiles"
  ON public.exhibitor_profiles
  FOR SELECT
  TO public
  USING (true);

-- ============================================
-- 2. STORAGE: Fix RLS Policies pour les logos
-- ============================================

-- Créer le bucket exhibitor-logos s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exhibitor-logos',
  'exhibitor-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

-- Supprimer les anciennes policies du storage
DROP POLICY IF EXISTS "Public can read exhibitor logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload exhibitor logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update exhibitor logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete exhibitor logos" ON storage.objects;

-- Politique de lecture publique pour les logos
CREATE POLICY "Public can read exhibitor logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'exhibitor-logos');

-- Politique pour uploader des logos (utilisateurs authentifiés)
CREATE POLICY "Authenticated users can upload exhibitor logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'exhibitor-logos');

-- Politique pour mettre à jour les logos
CREATE POLICY "Authenticated users can update exhibitor logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'exhibitor-logos')
  WITH CHECK (bucket_id = 'exhibitor-logos');

-- Politique pour supprimer les logos
CREATE POLICY "Authenticated users can delete exhibitor logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'exhibitor-logos');

-- ============================================
-- 3. VERIFICATION
-- ============================================

-- Vérifier que les policies sont créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'exhibitor_profiles'
ORDER BY tablename, policyname;

-- Vérifier que le bucket existe
SELECT id, name, public FROM storage.buckets WHERE id = 'exhibitor-logos';


-- [20260218000003_fix_exhibitors_rls.sql]
-- Migration: Corriger les policies RLS pour la table exhibitors
-- Date: 2026-02-18
-- Problème: Les admins ne peuvent pas modifier les exposants

-- ============================================
-- 1. SUPPRIMER LES ANCIENNES POLICIES
-- ============================================
DROP POLICY IF EXISTS "exhibitors_select_all" ON exhibitors;
DROP POLICY IF EXISTS "exhibitors_update_own" ON exhibitors;
DROP POLICY IF EXISTS "exhibitors_update_admin" ON exhibitors;
DROP POLICY IF EXISTS "exhibitors_insert_admin" ON exhibitors;
DROP POLICY IF EXISTS "exhibitors_delete_admin" ON exhibitors;
DROP POLICY IF EXISTS "Allow public read" ON exhibitors;
DROP POLICY IF EXISTS "Allow owner update" ON exhibitors;
DROP POLICY IF EXISTS "Allow admin update" ON exhibitors;
DROP POLICY IF EXISTS "Allow admin insert" ON exhibitors;
DROP POLICY IF EXISTS "Allow admin delete" ON exhibitors;

-- ============================================
-- 2. ACTIVER RLS SI PAS DÉJÀ FAIT
-- ============================================
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CRÉER LES NOUVELLES POLICIES
-- ============================================

-- SELECT: Tout le monde peut lire les exposants
CREATE POLICY "exhibitors_select_all" ON exhibitors
  FOR SELECT
  USING (true);

-- INSERT: Admins peuvent créer des exposants
CREATE POLICY "exhibitors_insert_admin" ON exhibitors
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
  );

-- UPDATE: Admins peuvent modifier TOUS les exposants
-- OU l'exposant peut modifier son propre profil
CREATE POLICY "exhibitors_update_admin_or_owner" ON exhibitors
  FOR UPDATE
  USING (
    -- Admin peut tout modifier
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
    OR
    -- L'exposant peut modifier son propre profil
    user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
    OR
    user_id = auth.uid()
  );

-- DELETE: Seuls les admins peuvent supprimer
CREATE POLICY "exhibitors_delete_admin" ON exhibitors
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
  );

-- ============================================
-- 4. VÉRIFICATION
-- ============================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'exhibitors';


-- [20260223000000_fix_news_articles_columns.sql]
-- Migration pour standardiser les colonnes de news_articles
-- Date: 2026-02-23

-- Renommer image_url en featured_image
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'image_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'featured_image'
  ) THEN
    ALTER TABLE news_articles RENAME COLUMN image_url TO featured_image;
    RAISE NOTICE 'Colonne image_url renommée en featured_image';
  END IF;
END $$;

-- Renommer published en is_published pour cohérence
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'published'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE news_articles RENAME COLUMN published TO is_published;
    RAISE NOTICE 'Colonne published renommée en is_published';
  END IF;
END $$;

-- Ajouter slug si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE news_articles ADD COLUMN slug text;
    RAISE NOTICE 'Colonne slug ajoutée';
  END IF;
END $$;

-- Ajouter title_en si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'title_en'
  ) THEN
    ALTER TABLE news_articles ADD COLUMN title_en text;
    RAISE NOTICE 'Colonne title_en ajoutée';
  END IF;
END $$;

-- Ajouter excerpt_en si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'excerpt_en'
  ) THEN
    ALTER TABLE news_articles ADD COLUMN excerpt_en text;
    RAISE NOTICE 'Colonne excerpt_en ajoutée';
  END IF;
END $$;

-- Ajouter content_en si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'content_en'
  ) THEN
    ALTER TABLE news_articles ADD COLUMN content_en text;
    RAISE NOTICE 'Colonne content_en ajoutée';
  END IF;
END $$;

-- Créer un index sur slug pour la recherche rapide
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles(slug);

-- Créer un index sur is_published et published_at
DROP INDEX IF EXISTS idx_news_published;
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news_articles(is_published, published_at);

-- Commentaires
COMMENT ON COLUMN news_articles.featured_image IS 'URL de l''image principale de l''article';
COMMENT ON COLUMN news_articles.is_published IS 'Indicateur si l''article est publié';
COMMENT ON COLUMN news_articles.slug IS 'Slug URL-friendly pour l''article';
COMMENT ON COLUMN news_articles.title_en IS 'Titre en anglais';
COMMENT ON COLUMN news_articles.excerpt_en IS 'Extrait en anglais';
COMMENT ON COLUMN news_articles.content_en IS 'Contenu complet en anglais';


-- [atomic_appointment_booking.sql]
-- Fonction RPC pour booking atomique de rendez-vous
-- Prévient les race conditions et l'overbooking

-- Drop function if exists
DROP FUNCTION IF EXISTS book_appointment_atomic;

-- Create atomic booking function
CREATE OR REPLACE FUNCTION book_appointment_atomic(
  p_time_slot_id UUID,
  p_visitor_id UUID,
  p_exhibitor_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot RECORD;
  v_appointment_id UUID;
  v_result JSON;
BEGIN
  -- Lock the time slot row FOR UPDATE (prevents concurrent bookings)
  SELECT * INTO v_slot
  FROM time_slots
  WHERE id = p_time_slot_id
  FOR UPDATE;

  -- Check if slot exists
  IF v_slot IS NULL THEN
    RAISE EXCEPTION 'Time slot not found';
  END IF;

  -- Check if slot belongs to exhibitor
  IF v_slot.exhibitor_id != p_exhibitor_id THEN
    RAISE EXCEPTION 'Time slot does not belong to this exhibitor';
  END IF;

  -- Check if slot is available
  IF NOT v_slot.available THEN
    RAISE EXCEPTION 'Time slot is not available';
  END IF;

  -- Check if slot is not full
  IF v_slot.current_bookings >= v_slot.max_bookings THEN
    RAISE EXCEPTION 'Time slot is fully booked';
  END IF;

  -- Check if appointment is in the future
  IF v_slot.start_time < NOW() THEN
    RAISE EXCEPTION 'Cannot book past time slots';
  END IF;

  -- Check if visitor already has an appointment at this time
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE visitor_id = p_visitor_id
    AND time_slot_id IN (
      SELECT id FROM time_slots
      WHERE start_time = v_slot.start_time
    )
    AND status != 'cancelled'
  ) THEN
    RAISE EXCEPTION 'You already have an appointment at this time';
  END IF;

  -- Create appointment
  INSERT INTO appointments (
    id,
    time_slot_id,
    visitor_id,
    exhibitor_id,
    status,
    notes,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_time_slot_id,
    p_visitor_id,
    p_exhibitor_id,
    'confirmed',
    p_notes,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_appointment_id;

  -- Update slot booking count
  UPDATE time_slots
  SET
    current_bookings = current_bookings + 1,
    available = (current_bookings + 1) < max_bookings,
    updated_at = NOW()
  WHERE id = p_time_slot_id;

  -- Return success result
  SELECT json_build_object(
    'success', true,
    'appointment_id', v_appointment_id,
    'time_slot_id', p_time_slot_id,
    'current_bookings', v_slot.current_bookings + 1,
    'available', (v_slot.current_bookings + 1) < v_slot.max_bookings
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    SELECT json_build_object(
      'success', false,
      'error', SQLERRM
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION book_appointment_atomic TO authenticated;

-- Create atomic cancel function
CREATE OR REPLACE FUNCTION cancel_appointment_atomic(
  p_appointment_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_appointment RECORD;
  v_result JSON;
BEGIN
  -- Lock appointment FOR UPDATE
  SELECT * INTO v_appointment
  FROM appointments
  WHERE id = p_appointment_id
  FOR UPDATE;

  -- Check if appointment exists
  IF v_appointment IS NULL THEN
    RAISE EXCEPTION 'Appointment not found';
  END IF;

  -- Check if user is authorized (visitor or exhibitor)
  IF v_appointment.visitor_id != p_user_id AND
     v_appointment.exhibitor_id NOT IN (
       SELECT id FROM exhibitors WHERE user_id = p_user_id
     ) THEN
    RAISE EXCEPTION 'Not authorized to cancel this appointment';
  END IF;

  -- Check if appointment is not already cancelled
  IF v_appointment.status = 'cancelled' THEN
    RAISE EXCEPTION 'Appointment is already cancelled';
  END IF;

  -- Update appointment status
  UPDATE appointments
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_appointment_id;

  -- Decrease slot booking count
  UPDATE time_slots
  SET
    current_bookings = GREATEST(0, current_bookings - 1),
    available = true,
    updated_at = NOW()
  WHERE id = v_appointment.time_slot_id;

  -- Return success
  SELECT json_build_object(
    'success', true,
    'appointment_id', p_appointment_id
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'error', SQLERRM
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cancel_appointment_atomic TO authenticated;

-- Comments
COMMENT ON FUNCTION book_appointment_atomic IS 'Atomic appointment booking with row-level locking to prevent race conditions and overbooking';
COMMENT ON FUNCTION cancel_appointment_atomic IS 'Atomic appointment cancellation with proper slot count management';


-- [deactivate_old_bank_account.sql]
-- ============================================
-- DÉSACTIVER L'ANCIEN COMPTE BANCAIRE
-- ============================================
-- Ce script désactive l'ancien compte Banque Internationale du Maroc
-- et garde uniquement le nouveau compte LINECO EVENTS / Attijariwafa bank actif

-- Désactiver tous les anciens comptes sauf Attijariwafa bank
UPDATE public.bank_transfer_info
SET is_active = false
WHERE bank_name != 'Attijariwafa bank'
  AND is_active = true;

-- Vérifier que seul le bon compte est actif
SELECT 
  id,
  bank_name,
  account_holder,
  iban,
  bic_swift,
  is_active,
  created_at
FROM public.bank_transfer_info
ORDER BY created_at DESC;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Seul le compte LINECO EVENTS / Attijariwafa bank doit être actif (is_active = true)
-- L'ancien compte SIB EVENT SARL / Banque Internationale doit être inactif (is_active = false)


-- [enable_rls_security.sql]
-- Enable Row Level Security (RLS) on all tables
-- CRITICAL pour la sécurité : empêche les accès non autorisés

-- ============================================================
-- USERS TABLE
-- ============================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- Policy: Admins can update all users
CREATE POLICY "Admins can update all users"
ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- ============================================================
-- EXHIBITORS TABLE
-- ============================================================

ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active/approved exhibitors (public)
CREATE POLICY "Public can read approved exhibitors"
ON exhibitors FOR SELECT
USING (status = 'approved');

-- Policy: Exhibitors can read own data
CREATE POLICY "Exhibitors can read own data"
ON exhibitors FOR SELECT
USING (user_id = auth.uid());

-- Policy: Exhibitors can update own data
CREATE POLICY "Exhibitors can update own data"
ON exhibitors FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage exhibitors"
ON exhibitors FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read products
CREATE POLICY "Public can read products"
ON products FOR SELECT
USING (true);

-- Policy: Exhibitors can manage own products
CREATE POLICY "Exhibitors can manage own products"
ON products FOR ALL
USING (
  exhibitor_id IN (
    SELECT id FROM exhibitors WHERE user_id = auth.uid()
  )
);

-- Policy: Admins can manage all products
CREATE POLICY "Admins can manage all products"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- ============================================================
-- APPOINTMENTS TABLE
-- ============================================================

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Visitors can read own appointments
CREATE POLICY "Visitors can read own appointments"
ON appointments FOR SELECT
USING (visitor_id = auth.uid());

-- Policy: Exhibitors can read appointments with them
CREATE POLICY "Exhibitors can read their appointments"
ON appointments FOR SELECT
USING (
  exhibitor_id IN (
    SELECT id FROM exhibitors WHERE user_id = auth.uid()
  )
);

-- Policy: Visitors can create appointments
CREATE POLICY "Visitors can create appointments"
ON appointments FOR INSERT
WITH CHECK (visitor_id = auth.uid());

-- Policy: Visitors can cancel own appointments
CREATE POLICY "Visitors can cancel own appointments"
ON appointments FOR UPDATE
USING (visitor_id = auth.uid())
WITH CHECK (visitor_id = auth.uid());

-- Policy: Exhibitors can manage their appointments
CREATE POLICY "Exhibitors can manage their appointments"
ON appointments FOR ALL
USING (
  exhibitor_id IN (
    SELECT id FROM exhibitors WHERE user_id = auth.uid()
  )
);

-- ============================================================
-- MINI_SITES TABLE
-- ============================================================

ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published mini-sites
CREATE POLICY "Public can read published mini-sites"
ON mini_sites FOR SELECT
USING (status = 'published');

-- Policy: Exhibitors can manage own mini-sites
CREATE POLICY "Exhibitors can manage own mini-sites"
ON mini_sites FOR ALL
USING (
  exhibitor_id IN (
    SELECT id FROM exhibitors WHERE user_id = auth.uid()
  )
);

-- Policy: Admins can manage all mini-sites
CREATE POLICY "Admins can manage all mini-sites"
ON mini_sites FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- ============================================================
-- EVENTS TABLE
-- ============================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read events
CREATE POLICY "Public can read events"
ON events FOR SELECT
USING (true);

-- Policy: Admins can manage events
CREATE POLICY "Admins can manage events"
ON events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- ============================================================
-- MESSAGES TABLE (if exists)
-- ============================================================

ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages sent to/from them
CREATE POLICY "Users can read own messages"
ON messages FOR SELECT
USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);

-- Policy: Users can send messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- ============================================================
-- CONNECTIONS TABLE (networking)
-- ============================================================

ALTER TABLE IF EXISTS connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read connections involving them
CREATE POLICY "Users can read own connections"
ON connections FOR SELECT
USING (
  user1_id = auth.uid() OR user2_id = auth.uid()
);

-- Policy: Users can create connections
CREATE POLICY "Users can create connections"
ON connections FOR INSERT
WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read own notifications
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Policy: Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- SUMMARY
-- ============================================================

-- Toutes les tables ont maintenant RLS activé
-- Les politiques garantissent que :
-- 1. Les utilisateurs ne voient que leurs propres données
-- 2. Les données publiques sont accessibles à tous
-- 3. Les admins ont accès complet
-- 4. Les exhibitors gèrent leurs propres produits/mini-sites/RDV
-- 5. Les visiteurs gèrent leurs propres RDV et connexions

-- Pour vérifier que RLS est activé partout :
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

