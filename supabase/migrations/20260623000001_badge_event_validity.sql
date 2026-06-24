-- Badge valide pendant la période de l'événement (si dates fournies par l'app)
-- Supprime l'ancienne surcharge (10 args) pour éviter "function name is not unique"

DROP FUNCTION IF EXISTS public.upsert_user_badge(
  uuid, text, text, text, text, text, text, text, text, text
);

DROP FUNCTION IF EXISTS public.upsert_user_badge(
  uuid, text, text, text, text, text, text, text, text, text, timestamptz, timestamptz
);

CREATE OR REPLACE FUNCTION public.upsert_user_badge(
  p_user_id uuid,
  p_user_type text,
  p_user_level text DEFAULT NULL,
  p_full_name text DEFAULT NULL,
  p_company_name text DEFAULT NULL,
  p_position text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL,
  p_stand_number text DEFAULT NULL,
  p_valid_from timestamptz DEFAULT NULL,
  p_valid_until timestamptz DEFAULT NULL
)
RETURNS user_badges AS $$
DECLARE
  v_badge user_badges;
  v_badge_code text;
  v_access_level text;
  v_valid_from timestamptz;
  v_valid_until timestamptz;
BEGIN
  IF p_user_type = 'visitor' THEN
    IF p_user_level = 'premium' OR p_user_level = 'vip' THEN
      v_access_level := 'vip';
    ELSE
      v_access_level := 'standard';
    END IF;
    v_valid_from := COALESCE(p_valid_from, now());
    v_valid_until := COALESCE(p_valid_until, now() + interval '90 days');
  ELSIF p_user_type = 'exhibitor' THEN
    v_access_level := 'exhibitor';
    v_valid_from := COALESCE(p_valid_from, now());
    v_valid_until := COALESCE(p_valid_until, now() + interval '1 year');
  ELSIF p_user_type = 'partner' THEN
    v_access_level := 'partner';
    v_valid_from := COALESCE(p_valid_from, now());
    v_valid_until := COALESCE(p_valid_until, now() + interval '1 year');
  ELSIF p_user_type = 'admin' THEN
    v_access_level := 'admin';
    v_valid_from := COALESCE(p_valid_from, now());
    v_valid_until := COALESCE(p_valid_until, now() + interval '2 years');
  ELSE
    v_access_level := 'standard';
    v_valid_from := COALESCE(p_valid_from, now());
    v_valid_until := COALESCE(p_valid_until, now() + interval '90 days');
  END IF;

  SELECT * INTO v_badge FROM user_badges WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    v_badge_code := generate_badge_code(p_user_id);
    INSERT INTO user_badges (
      user_id, badge_code, user_type, user_level,
      full_name, company_name, position, email, phone, avatar_url,
      stand_number, access_level, valid_until, valid_from, status,
      created_at, updated_at
    ) VALUES (
      p_user_id, v_badge_code, p_user_type, p_user_level,
      p_full_name, p_company_name, p_position, p_email, p_phone, p_avatar_url,
      p_stand_number, v_access_level, v_valid_until, v_valid_from, 'active',
      now(), now()
    )
    RETURNING * INTO v_badge;
  ELSE
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
      valid_from   = v_valid_from,
      valid_until  = v_valid_until,
      status       = 'active',
      updated_at   = now()
    WHERE user_id = p_user_id
    RETURNING * INTO v_badge;
  END IF;

  RETURN v_badge;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.upsert_user_badge(
  uuid, text, text, text, text, text, text, text, text, text, timestamptz, timestamptz
) IS 'Crée ou met à jour un badge. Si p_valid_from/p_valid_until sont fournis, la validité correspond à la période du salon.';

-- Corriger les badges visiteurs SIB 2026 déjà créés avec valid_until incorrecte
UPDATE user_badges
SET
  valid_from = '2026-11-25T08:00:00+01:00'::timestamptz,
  valid_until = '2026-11-29T23:59:59+01:00'::timestamptz,
  status = 'active',
  updated_at = now()
WHERE user_type = 'visitor'
  AND status IN ('active', 'expired')
  AND valid_until < '2026-11-25T08:00:00+01:00'::timestamptz;
