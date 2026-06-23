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
