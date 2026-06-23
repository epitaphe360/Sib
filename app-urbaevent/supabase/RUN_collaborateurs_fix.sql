-- ============================================================
-- SCRIPT UNIQUE : coller TOUT dans Supabase SQL Editor -> Run
-- Fichier : supabase/RUN_collaborateurs_fix.sql
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_collaborator_auth_link(p_email text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_count integer := 0;
BEGIN
  UPDATE public.stand_collaborators sc
  SET auth_user_id = au.id, updated_at = now()
  FROM auth.users au
  WHERE lower(au.email) = lower(sc.email)
    AND sc.auth_user_id IS NULL
    AND (p_email IS NULL OR lower(sc.email) = lower(p_email));
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.ensure_collaborator_user_profile(p_collaborator_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  sc public.stand_collaborators%ROWTYPE;
  v_company text;
BEGIN
  SELECT * INTO sc FROM public.stand_collaborators WHERE id = p_collaborator_id;
  IF sc.auth_user_id IS NULL THEN RETURN; END IF;

  SELECT COALESCE(e.company_name, p.company_name, sc.email)
  INTO v_company
  FROM public.stand_collaborators s
  LEFT JOIN public.exhibitors e ON e.id = s.exhibitor_id
  LEFT JOIN public.partners p ON p.id = s.partner_id
  WHERE s.id = p_collaborator_id;

  INSERT INTO public.users (id, email, name, type, status, profile, created_at)
  VALUES (
    sc.auth_user_id,
    lower(sc.email),
    trim(sc.first_name || ' ' || sc.last_name),
    'exhibitor',
    'active',
    jsonb_build_object('company', v_company, 'role', 'collaborator'),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email   = EXCLUDED.email,
    name    = EXCLUDED.name,
    type    = EXCLUDED.type,
    status  = EXCLUDED.status,
    profile = COALESCE(public.users.profile, '{}'::jsonb) || EXCLUDED.profile;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.finalize_stand_collaborator(p_collaborator_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  sc public.stand_collaborators%ROWTYPE;
  v_company text;
  v_stand text;
BEGIN
  SELECT * INTO sc FROM public.stand_collaborators WHERE id = p_collaborator_id;
  IF NOT FOUND OR sc.auth_user_id IS NULL THEN RETURN false; END IF;

  PERFORM public.ensure_collaborator_user_profile(p_collaborator_id);

  SELECT e.company_name, e.stand_number INTO v_company, v_stand
  FROM public.exhibitors e WHERE e.id = sc.exhibitor_id;

  IF v_company IS NULL THEN
    SELECT p.company_name, NULL INTO v_company, v_stand
    FROM public.partners p WHERE p.id = sc.partner_id;
  END IF;

  PERFORM public.upsert_user_badge(
    sc.auth_user_id, 'exhibitor', NULL,
    trim(sc.first_name || ' ' || sc.last_name),
    v_company, COALESCE(sc.position, 'Collaborateur'),
    lower(sc.email), sc.phone, NULL, v_stand
  );

  UPDATE public.stand_collaborators
  SET badge_generated = true, updated_at = now()
  WHERE id = p_collaborator_id;
  RETURN true;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.repair_all_stand_collaborators()
RETURNS TABLE(out_email text, out_auth_linked boolean, out_badge_ok boolean, out_detail text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  r public.stand_collaborators%ROWTYPE;
  v_auth_linked boolean;
  v_ok boolean;
BEGIN
  PERFORM public.sync_collaborator_auth_link(NULL);

  FOR r IN
    SELECT * FROM public.stand_collaborators WHERE status = 'active' ORDER BY created_at
  LOOP
    v_auth_linked := r.auth_user_id IS NOT NULL;

    IF NOT v_auth_linked THEN
      SELECT EXISTS(SELECT 1 FROM auth.users au WHERE lower(au.email) = lower(r.email))
      INTO v_auth_linked;
      IF v_auth_linked THEN
        PERFORM public.sync_collaborator_auth_link(r.email);
        SELECT sc.auth_user_id IS NOT NULL INTO v_auth_linked
        FROM public.stand_collaborators sc WHERE sc.id = r.id;
      END IF;
    END IF;

    IF NOT v_auth_linked THEN
      out_email := r.email; out_auth_linked := false; out_badge_ok := false;
      out_detail := 'Compte Auth manquant - creer dans Authentication puis relancer repair_all_stand_collaborators()';
      RETURN NEXT;
    ELSE
      v_ok := public.finalize_stand_collaborator(r.id);
      out_email := r.email; out_auth_linked := true; out_badge_ok := v_ok;
      out_detail := CASE WHEN v_ok THEN 'OK - profil + badge generes' ELSE 'Echec generation badge' END;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.trg_stand_collaborator_auto_finalize()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF NEW.auth_user_id IS NOT NULL AND NEW.status = 'active'
     AND (TG_OP = 'INSERT' OR NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id OR NEW.badge_generated IS NOT TRUE)
  THEN
    PERFORM public.finalize_stand_collaborator(NEW.id);
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_stand_collaborator_auto_finalize ON public.stand_collaborators;
CREATE TRIGGER trg_stand_collaborator_auto_finalize
  AFTER INSERT OR UPDATE OF auth_user_id, status, badge_generated
  ON public.stand_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_stand_collaborator_auto_finalize();

SELECT * FROM public.repair_all_stand_collaborators();
