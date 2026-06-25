-- Scan badge complet : validation + journal access_logs (comme l'app mobile sécurité)
-- Garantit que chaque scan QR est stocké en base.

CREATE OR REPLACE FUNCTION public.record_badge_scan(
  p_qr_data text,
  p_zone text DEFAULT 'public',
  p_scanned_by uuid DEFAULT NULL,
  p_scanner_device text DEFAULT 'mobile-scanner',
  p_salon_id uuid DEFAULT NULL,
  p_salon_name text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_result json;
  v_success boolean;
  v_user json;
  v_reason text;
BEGIN
  v_result := public.validate_scanned_badge(p_qr_data);
  v_success := COALESCE((v_result->>'success')::boolean, false);
  v_user := v_result->'user';
  v_reason := v_result->>'error';

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
    event
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
    COALESCE(p_salon_name, 'SIB 2026')
  );

  RETURN (v_result::jsonb || jsonb_build_object(
    'logged', true,
    'access_log_status', CASE WHEN v_success THEN 'granted' ELSE 'denied' END
  ))::json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.record_badge_scan IS
'Valide un QR (app ou imprimé) et enregistre le scan dans access_logs. Utilisé par scanners et tests de charge.';

-- Staff / sécurité peut appeler via JWT
GRANT EXECUTE ON FUNCTION public.record_badge_scan TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_badge_scan TO service_role;
