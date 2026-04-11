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
