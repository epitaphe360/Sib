-- Migration: Corriger la durée de validité des badges
-- Date: 2026-05-14
-- Problème: Les badges expiraient après 3 jours → scanner Flutter retournait "accès refusé"
-- Fix: Exposants, partenaires et admins → 1 an; visiteurs → 90 jours

-- 1. Remettre à jour tous les badges expirés ou expirant bientôt
UPDATE user_badges
SET 
  valid_until = CASE
    WHEN user_type = 'admin'    THEN now() + interval '2 years'
    WHEN user_type = 'exhibitor' THEN now() + interval '1 year'
    WHEN user_type = 'partner'  THEN now() + interval '1 year'
    ELSE now() + interval '90 days'  -- visiteurs
  END,
  status = 'active',
  updated_at = now()
WHERE status IN ('active', 'expired')
  AND valid_until < (now() + interval '30 days');

-- 2. Remplacer la fonction upsert_user_badge avec des durées plus longues
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
  -- Déterminer niveau d'accès et validité selon le type
  IF p_user_type = 'visitor' THEN
    IF p_user_level = 'premium' OR p_user_level = 'vip' THEN
      v_access_level := 'vip';
    ELSE
      v_access_level := 'standard';
    END IF;
    v_valid_until := now() + interval '90 days';
  ELSIF p_user_type = 'exhibitor' THEN
    v_access_level := 'exhibitor';
    v_valid_until := now() + interval '1 year';
  ELSIF p_user_type = 'partner' THEN
    v_access_level := 'partner';
    v_valid_until := now() + interval '1 year';
  ELSIF p_user_type = 'admin' THEN
    v_access_level := 'admin';
    v_valid_until := now() + interval '2 years';
  ELSE
    v_access_level := 'standard';
    v_valid_until := now() + interval '90 days';
  END IF;

  -- Vérifier si un badge existe déjà pour cet utilisateur
  SELECT * INTO v_badge FROM user_badges WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- Générer un code de badge unique
    v_badge_code := generate_badge_code(p_user_id);

    -- Insérer le nouveau badge
    INSERT INTO user_badges (
      user_id, badge_code, user_type, user_level,
      full_name, company_name, position, email, phone, avatar_url,
      stand_number, access_level, valid_until, status,
      valid_from, created_at, updated_at
    ) VALUES (
      p_user_id, v_badge_code, p_user_type, p_user_level,
      p_full_name, p_company_name, p_position, p_email, p_phone, p_avatar_url,
      p_stand_number, v_access_level, v_valid_until, 'active',
      now(), now(), now()
    )
    RETURNING * INTO v_badge;
  ELSE
    -- Mettre à jour le badge existant
    UPDATE user_badges SET
      user_type    = p_user_type,
      user_level   = p_user_level,
      full_name    = COALESCE(p_full_name, full_name),
      company_name = COALESCE(p_company_name, company_name),
      position     = COALESCE(p_position, position),
      email        = COALESCE(p_email, email),
      phone        = COALESCE(p_phone, phone),
      avatar_url   = COALESCE(p_avatar_url, avatar_url),
      stand_number = COALESCE(p_stand_number, stand_number),
      access_level = v_access_level,
      valid_until  = v_valid_until,
      status       = 'active',
      updated_at   = now()
    WHERE user_id = p_user_id
    RETURNING * INTO v_badge;
  END IF;

  RETURN v_badge;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION upsert_user_badge IS
'Crée ou met à jour un badge utilisateur. Validité: visiteurs 90j, exposants/partenaires 1 an, admins 2 ans.';
