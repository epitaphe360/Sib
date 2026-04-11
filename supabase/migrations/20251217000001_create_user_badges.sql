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
