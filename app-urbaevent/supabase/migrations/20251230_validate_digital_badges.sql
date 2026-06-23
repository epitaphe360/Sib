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
