-- Fix record_badge_scan: enregistrer salon_id / salon_name dans access_logs

DROP FUNCTION IF EXISTS public.record_badge_scan(text, text, uuid, text, uuid, text);

CREATE OR REPLACE FUNCTION public.record_badge_scan(
  p_qr_data text,
  p_zone text DEFAULT 'public',
  p_scanned_by uuid DEFAULT NULL,
  p_scanner_device text DEFAULT 'mobile-scanner',
  p_salon_id text DEFAULT NULL,
  p_salon_name text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_result json;
  v_success boolean;
  v_user json;
  v_reason text;
  v_salon_name text;
BEGIN
  v_result := public.validate_scanned_badge(p_qr_data);
  v_success := COALESCE((v_result->>'success')::boolean, false);
  v_user := v_result->'user';
  v_reason := v_result->>'error';
  v_salon_name := COALESCE(NULLIF(trim(p_salon_name), ''), 'SIB 2026');

  INSERT INTO public.access_logs (
    user_id,
    user_name,
    user_type,
    user_level,
    zone,
    status,
    reason,
    scanned_by,
    scanner_device,
    accessed_at,
    event,
    salon_id,
    salon_name
  ) VALUES (
    NULLIF(v_user->>'id', '')::uuid,
    v_user->>'full_name',
    v_user->>'user_type',
    v_user->>'user_level',
    COALESCE(p_zone, 'public'),
    CASE WHEN v_success THEN 'granted' ELSE 'denied' END,
    CASE WHEN v_success THEN NULL ELSE v_reason END,
    p_scanned_by,
    p_scanner_device,
    now(),
    v_salon_name,
    NULLIF(trim(p_salon_id), ''),
    v_salon_name
  );

  RETURN (v_result::jsonb || jsonb_build_object(
    'logged', true,
    'access_log_status', CASE WHEN v_success THEN 'granted' ELSE 'denied' END
  ))::json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.record_badge_scan IS
'Valide un QR (app ou imprimé) et enregistre le scan dans access_logs avec attribution salon.';

GRANT EXECUTE ON FUNCTION public.record_badge_scan TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_badge_scan TO service_role;
