-- ============================================================
-- MIGRATION: Tables manquantes identifiées par audit
-- Date: 2026-04-12
-- 12 tables présentes dans le code mais absentes des migrations
-- ============================================================

-- ============================================================
-- 1. page_views — tracking des visites de pages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  unique_view boolean DEFAULT false,
  user_id uuid,
  user_type text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON public.page_views (user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views (path);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read page_views" ON public.page_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

CREATE POLICY "Anyone can insert page_views" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 2. api_logs — logs des appels API et temps de réponse
-- ============================================================
CREATE TABLE IF NOT EXISTS public.api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text,
  path text,
  status_code int,
  response_time int,
  user_id uuid,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON public.api_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON public.api_logs (user_id);

ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read api_logs" ON public.api_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

CREATE POLICY "Service can insert api_logs" ON public.api_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 3. admin_logs — journal des actions administrateur
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  description text,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  admin_user text,
  admin_user_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user_id ON public.admin_logs (admin_user_id);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin_logs" ON public.admin_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

CREATE POLICY "Admins can insert admin_logs" ON public.admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

-- ============================================================
-- 4. analytics — événements d'analytics comportementaux
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics (event_type);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read analytics" ON public.analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

CREATE POLICY "Authenticated users can insert analytics" ON public.analytics
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 5. user_profiles — profils enrichis pour le matching
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  name text,
  email text,
  interests text[] DEFAULT '{}',
  industry text,
  looking_for text[] DEFAULT '{}',
  offering text[] DEFAULT '{}',
  location text,
  role text,
  avatar text,
  company text,
  regions text[] DEFAULT '{}',
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry ON public.user_profiles (industry);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles" ON public.user_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage own profile" ON public.user_profiles
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 6. networking_interactions — interactions entre utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.networking_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('view', 'like', 'message', 'meeting', 'connection')),
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_networking_from_user ON public.networking_interactions (from_user_id);
CREATE INDEX IF NOT EXISTS idx_networking_to_user ON public.networking_interactions (to_user_id);
CREATE INDEX IF NOT EXISTS idx_networking_type ON public.networking_interactions (type);

ALTER TABLE public.networking_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own interactions" ON public.networking_interactions
  FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can insert interactions" ON public.networking_interactions
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- ============================================================
-- 7. match_scores — scores de compatibilité entre utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.match_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 uuid NOT NULL,
  user_id_2 uuid NOT NULL,
  score_boost int DEFAULT 0,
  base_score int DEFAULT 0,
  total_score int GENERATED ALWAYS AS (base_score + score_boost) STORED,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id_1, user_id_2)
);

CREATE INDEX IF NOT EXISTS idx_match_scores_user1 ON public.match_scores (user_id_1);
CREATE INDEX IF NOT EXISTS idx_match_scores_user2 ON public.match_scores (user_id_2);

ALTER TABLE public.match_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own match scores" ON public.match_scores
  FOR SELECT USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

CREATE POLICY "Service can manage match scores" ON public.match_scores
  FOR ALL USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- ============================================================
-- 8. speed_networking_sessions — sessions de speed networking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.speed_networking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid,
  name text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  duration int NOT NULL DEFAULT 5,
  max_participants int DEFAULT 20,
  participants jsonb DEFAULT '[]',
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  matches jsonb DEFAULT '[]',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_speed_networking_event_id ON public.speed_networking_sessions (event_id);
CREATE INDEX IF NOT EXISTS idx_speed_networking_status ON public.speed_networking_sessions (status);
CREATE INDEX IF NOT EXISTS idx_speed_networking_start_time ON public.speed_networking_sessions (start_time);

ALTER TABLE public.speed_networking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sessions" ON public.speed_networking_sessions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage sessions" ON public.speed_networking_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type IN ('admin', 'exhibitor'))
  );

-- ============================================================
-- 9. speakers — intervenants des conférences
-- ============================================================
CREATE TABLE IF NOT EXISTS public.speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  title text,
  company text,
  bio text,
  photo_url text,
  sort_order int DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_speakers_sort_order ON public.speakers (sort_order);
CREATE INDEX IF NOT EXISTS idx_speakers_is_published ON public.speakers (is_published);

ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published speakers" ON public.speakers
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage speakers" ON public.speakers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

-- ============================================================
-- 10. press_accreditations — demandes d'accréditation presse
-- ============================================================
CREATE TABLE IF NOT EXISTS public.press_accreditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  media_name text NOT NULL,
  media_type text,
  job_title text,
  country text,
  coverage_plan text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_press_accreditations_status ON public.press_accreditations (status);
CREATE INDEX IF NOT EXISTS idx_press_accreditations_email ON public.press_accreditations (email);
CREATE INDEX IF NOT EXISTS idx_press_accreditations_created_at ON public.press_accreditations (created_at DESC);

ALTER TABLE public.press_accreditations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage press accreditations" ON public.press_accreditations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

CREATE POLICY "Anyone can submit press accreditation" ON public.press_accreditations
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 11. user_activity_log — historique des activités utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON public.user_activity_log (action);

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activity" ON public.user_activity_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service can insert activity" ON public.user_activity_log
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all activity" ON public.user_activity_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

-- ============================================================
-- 12. pending_partner_media — médias partenaires en attente de validation
-- (DROP la VIEW existante et recrée comme TABLE)
-- ============================================================
DROP VIEW IF EXISTS public.pending_partner_media;
CREATE TABLE IF NOT EXISTS public.pending_partner_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('video', 'audio', 'image', 'document', 'webinar', 'podcast', 'live')),
  category text,
  thumbnail_url text,
  video_url text,
  file_url text,
  duration int,
  creator_name text,
  creator_email text,
  partner_company text,
  created_by_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pending_partner_media_status ON public.pending_partner_media (status);
CREATE INDEX IF NOT EXISTS idx_pending_partner_media_created_by ON public.pending_partner_media (created_by_id);
CREATE INDEX IF NOT EXISTS idx_pending_partner_media_created_at ON public.pending_partner_media (created_at DESC);

ALTER TABLE public.pending_partner_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can submit media" ON public.pending_partner_media
  FOR INSERT WITH CHECK (created_by_id = auth.uid());

CREATE POLICY "Partners can read own pending media" ON public.pending_partner_media
  FOR SELECT USING (created_by_id = auth.uid());

CREATE POLICY "Admins can manage all pending media" ON public.pending_partner_media
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

-- ============================================================
-- RPC: approve_partner_media (utilisé dans PartnerMediaApprovalPage)
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_partner_media(
  media_id uuid,
  admin_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_media public.pending_partner_media%ROWTYPE;
BEGIN
  SELECT * INTO v_media FROM public.pending_partner_media WHERE id = media_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Media not found');
  END IF;

  -- Mettre à jour le statut
  UPDATE public.pending_partner_media
  SET status = 'approved',
      reviewed_by = admin_id,
      reviewed_at = now()
  WHERE id = media_id;

  -- Insérer dans media_contents si la table existe
  INSERT INTO public.media_contents (
    title, description, type, thumbnail_url, file_url, created_by, created_at
  )
  SELECT
    v_media.title,
    v_media.description,
    v_media.type,
    v_media.thumbnail_url,
    COALESCE(v_media.video_url, v_media.file_url),
    v_media.created_by_id,
    now()
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_contents');

  RETURN jsonb_build_object('success', true, 'media_id', media_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
