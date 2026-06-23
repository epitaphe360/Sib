-- Migration: Fix badge triggers to never block INSERT on users table
-- Date: 2026-04-28
-- Problem: trigger_auto_generate_badge_on_insert was causing all visitor registrations
--          to fail if safe_jsonb() or upsert_user_badge() didn't exist / had errors.
--          Migration 20251217000004 drops them, but may not have been applied.
-- Solution: Drop problematic triggers + recreate safe_jsonb + patch the function
--           with an EXCEPTION handler so badge generation never blocks registration.

-- ============================================================
-- 1. Re-create safe_jsonb (idempotent) in case it was missed
-- ============================================================
CREATE OR REPLACE FUNCTION public.safe_jsonb(input_text text)
RETURNS jsonb AS $$
BEGIN
  IF input_text IS NULL OR input_text = '' THEN
    RETURN '{}'::jsonb;
  END IF;
  BEGIN
    RETURN input_text::jsonb;
  EXCEPTION WHEN others THEN
    RETURN '{}'::jsonb;
  END;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- ============================================================
-- 2. Drop the problematic triggers (idempotent)
-- ============================================================
DROP TRIGGER IF EXISTS trigger_auto_generate_badge_on_insert ON users;
DROP TRIGGER IF EXISTS trigger_auto_generate_badge_on_update ON users;
DROP TRIGGER IF EXISTS trigger_update_badge_from_exhibitor ON exhibitors;
DROP TRIGGER IF EXISTS trigger_update_badge_from_partner ON partners;
DROP TRIGGER IF EXISTS trigger_update_badge_from_exhibitor ON exhibitor_profiles;
DROP TRIGGER IF EXISTS trigger_update_badge_from_partner ON partner_profiles;

-- ============================================================
-- 3. Patch auto_generate_user_badge with EXCEPTION handler
--    so that even if the function is re-triggered later,
--    any error is swallowed and the INSERT succeeds.
-- ============================================================
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
BEGIN
  BEGIN
    -- Build full name safely
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

    v_email        := NEW.email;
    v_phone        := jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'phone');
    v_avatar_url   := jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'avatar');
    v_position     := jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'position');
    v_user_level   := NEW.visitor_level;

    IF NEW.type = 'visitor' THEN
      v_company_name := jsonb_extract_path_text(safe_jsonb(NEW.profile::text), 'company');
    END IF;

    PERFORM upsert_user_badge(
      p_user_id      := NEW.id,
      p_user_type    := NEW.type::text,
      p_user_level   := v_user_level,
      p_full_name    := v_full_name,
      p_company_name := v_company_name,
      p_position     := v_position,
      p_email        := v_email,
      p_phone        := v_phone,
      p_avatar_url   := v_avatar_url,
      p_stand_number := v_stand_number
    );

  EXCEPTION WHEN OTHERS THEN
    -- Badge generation is non-critical — log a warning and continue
    RAISE WARNING 'auto_generate_user_badge: badge generation failed for user % (%): %',
      NEW.id, NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
