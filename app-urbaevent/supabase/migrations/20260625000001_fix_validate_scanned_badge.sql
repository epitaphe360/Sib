-- Fix validate_scanned_badge : colonnes users réelles (name, visitor_level, partner_tier)
-- + valid_from pour badges événement + JSON QR mobile {"code":"..."}

CREATE OR REPLACE FUNCTION public.validate_scanned_badge(p_qr_data text)
RETURNS json AS $$
DECLARE
  v_qr_data text;
  v_user_badge user_badges%ROWTYPE;
  v_digital_badge digital_badges%ROWTYPE;
  v_user_info json;
BEGIN
  v_qr_data := trim(p_qr_data);

  -- QR JSON mobile : {"code":"BADGE-CODE",...}
  IF v_qr_data LIKE '{%' THEN
    BEGIN
      v_qr_data := COALESCE(
        (v_qr_data::jsonb ->> 'code'),
        (v_qr_data::jsonb ->> 'badge_code'),
        (v_qr_data::jsonb ->> 'qr_data'),
        v_qr_data
      );
    EXCEPTION
      WHEN OTHERS THEN
        NULL;
    END;
  END IF;

  -- 1. Badge statique (user_badges)
  BEGIN
    SELECT * INTO v_user_badge
    FROM user_badges
    WHERE badge_code = v_qr_data
      AND status = 'active'
      AND (valid_from IS NULL OR valid_from <= now())
      AND valid_until > now();

    IF FOUND THEN
      UPDATE user_badges
      SET scan_count = COALESCE(scan_count, 0) + 1,
          last_scanned_at = now()
      WHERE id = v_user_badge.id
      RETURNING * INTO v_user_badge;

      SELECT json_build_object(
        'id', COALESCE(u.id, p.id, v_user_badge.user_id),
        'full_name', COALESCE(u.name, p.name, v_user_badge.full_name),
        'email', COALESCE(u.email, p.email, v_user_badge.email),
        'phone', COALESCE(v_user_badge.phone, p.phone),
        'company_name', COALESCE(v_user_badge.company_name, p.company_name),
        'avatar_url', COALESCE(v_user_badge.avatar_url, p.logo_url),
        'user_type', COALESCE(u.type::text, v_user_badge.user_type, 'visitor'),
        'user_level', COALESCE(
          u.visitor_level,
          v_user_badge.user_level,
          p.partnership_level,
          'free'
        ),
        'partner_tier', u.partner_tier,
        'status', u.status
      )
      INTO v_user_info
      FROM users u
      LEFT JOIN partners p ON p.id = v_user_badge.user_id
      WHERE u.id = v_user_badge.user_id
         OR p.id = v_user_badge.user_id;

      IF v_user_info IS NULL THEN
        v_user_info := json_build_object(
          'id', v_user_badge.user_id,
          'full_name', v_user_badge.full_name,
          'email', v_user_badge.email,
          'user_type', v_user_badge.user_type,
          'user_level', v_user_badge.user_level
        );
      END IF;

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
      NULL;
  END;

  -- 2. Badge dynamique (digital_badges JWT stocké)
  BEGIN
    SELECT db.* INTO v_digital_badge
    FROM digital_badges db
    WHERE db.current_token = v_qr_data
      AND db.is_active = true
      AND db.token_expires_at > now();

    IF FOUND THEN
      UPDATE digital_badges
      SET scan_count = COALESCE(scan_count, 0) + 1,
          last_scanned_at = now()
      WHERE id = v_digital_badge.id
      RETURNING * INTO v_digital_badge;

      SELECT json_build_object(
        'id', u.id,
        'full_name', COALESCE(u.name, v_digital_badge.full_name),
        'email', u.email,
        'phone', v_digital_badge.phone,
        'company_name', v_digital_badge.company_name,
        'avatar_url', COALESCE(v_digital_badge.photo_url, v_user_badge.avatar_url),
        'user_type', u.type::text,
        'user_level', COALESCE(u.visitor_level, 'free'),
        'partner_tier', u.partner_tier,
        'status', u.status
      )
      INTO v_user_info
      FROM users u
      WHERE u.id = v_digital_badge.user_id;

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
      NULL;
  END;

  RETURN json_build_object(
    'success', false,
    'error', 'Badge non trouvé ou expiré',
    'message', 'Ce badge n''est pas valide. Il peut être expiré ou révoqué.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.validate_scanned_badge(text) IS
'Valide badge statique (badge_code ou JSON) ou dynamique (digital_badges). Colonnes users alignées schéma SIB.';
