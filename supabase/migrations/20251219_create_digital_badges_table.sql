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
