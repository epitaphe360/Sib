-- Stats admin : backfill salon_id manquant + filtre SIB inclut les scans legacy

UPDATE public.access_logs
SET
  salon_id = 'sib',
  salon_name = COALESCE(NULLIF(trim(salon_name), ''), event, 'SIB 2026')
WHERE salon_id IS NULL OR trim(salon_id) = '';

UPDATE public.connections
SET
  salon_id = 'sib',
  salon_name = COALESCE(NULLIF(trim(salon_name), ''), 'SIB 2026')
WHERE salon_id IS NULL OR trim(salon_id) = '';

UPDATE public.exhibitor_leads
SET
  salon_id = 'sib',
  salon_name = COALESCE(NULLIF(trim(salon_name), ''), 'SIB 2026')
WHERE salon_id IS NULL OR trim(salon_id) = '';

CREATE OR REPLACE FUNCTION public.get_admin_scan_statistics(p_salon_id text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type text;
  v_entry_scans bigint;
  v_unique_entrants bigint;
  v_denied_scans bigint;
  v_networking bigint;
  v_stand bigint;
  v_controller bigint;
BEGIN
  SELECT type INTO v_user_type FROM public.users WHERE id = auth.uid();
  IF v_user_type IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Accès refusé — réservé aux administrateurs';
  END IF;

  IF p_salon_id IS NULL OR p_salon_id = '' THEN
    SELECT COUNT(*) INTO v_entry_scans
      FROM public.access_logs WHERE status = 'granted';
    SELECT COUNT(DISTINCT user_id) INTO v_unique_entrants
      FROM public.access_logs WHERE status = 'granted' AND user_id IS NOT NULL;
    SELECT COUNT(*) INTO v_denied_scans
      FROM public.access_logs WHERE status = 'denied';
    SELECT COUNT(*) INTO v_networking FROM public.connections;
    SELECT COUNT(*) INTO v_stand FROM public.exhibitor_leads;
    SELECT COUNT(*) INTO v_controller FROM public.access_logs;
  ELSIF p_salon_id = 'sib' THEN
    SELECT COUNT(*) INTO v_entry_scans
      FROM public.access_logs
      WHERE status = 'granted' AND (salon_id = 'sib' OR salon_id IS NULL);
    SELECT COUNT(DISTINCT user_id) INTO v_unique_entrants
      FROM public.access_logs
      WHERE status = 'granted' AND user_id IS NOT NULL
        AND (salon_id = 'sib' OR salon_id IS NULL);
    SELECT COUNT(*) INTO v_denied_scans
      FROM public.access_logs
      WHERE status = 'denied' AND (salon_id = 'sib' OR salon_id IS NULL);
    SELECT COUNT(*) INTO v_networking
      FROM public.connections
      WHERE salon_id = 'sib' OR salon_id IS NULL;
    SELECT COUNT(*) INTO v_stand
      FROM public.exhibitor_leads
      WHERE salon_id = 'sib' OR salon_id IS NULL;
    SELECT COUNT(*) INTO v_controller
      FROM public.access_logs
      WHERE salon_id = 'sib' OR salon_id IS NULL;
  ELSE
    SELECT COUNT(*) INTO v_entry_scans
      FROM public.access_logs WHERE status = 'granted' AND salon_id = p_salon_id;
    SELECT COUNT(DISTINCT user_id) INTO v_unique_entrants
      FROM public.access_logs
      WHERE status = 'granted' AND user_id IS NOT NULL AND salon_id = p_salon_id;
    SELECT COUNT(*) INTO v_denied_scans
      FROM public.access_logs WHERE status = 'denied' AND salon_id = p_salon_id;
    SELECT COUNT(*) INTO v_networking
      FROM public.connections WHERE salon_id = p_salon_id;
    SELECT COUNT(*) INTO v_stand
      FROM public.exhibitor_leads WHERE salon_id = p_salon_id;
    SELECT COUNT(*) INTO v_controller
      FROM public.access_logs WHERE salon_id = p_salon_id;
  END IF;

  RETURN json_build_object(
    'entry_scans', COALESCE(v_entry_scans, 0),
    'unique_entrants', COALESCE(v_unique_entrants, 0),
    'denied_scans', COALESCE(v_denied_scans, 0),
    'networking_scans', COALESCE(v_networking, 0),
    'stand_scans', COALESCE(v_stand, 0),
    'controller_scans', COALESCE(v_controller, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_scan_statistics(text) TO authenticated;

COMMENT ON FUNCTION public.get_admin_scan_statistics IS
  'Comptages scans salon pour dashboard admin mobile — Tous = global, SIB inclut legacy sans salon_id';
