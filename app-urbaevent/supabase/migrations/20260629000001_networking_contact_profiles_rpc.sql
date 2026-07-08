-- Profils contacts networking / scans — lecture autorisée uniquement si lien (connexion ou lead stand)

CREATE OR REPLACE FUNCTION public.get_networking_contact_profiles(p_ids uuid[])
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  user_type text,
  company text,
  job_title text,
  phone text,
  stand_number text,
  sector text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
BEGIN
  IF auth.uid() IS NULL OR p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.email,
    u.type::text AS user_type,
    COALESCE(
      CASE WHEN u.type = 'exhibitor' THEN ex.company_name END,
      NULLIF(trim(u.profile->>'company'), '')
    )::text AS company,
    COALESCE(
      NULLIF(trim(u.profile->>'job_title'), ''),
      NULLIF(trim(u.profile->>'position'), '')
    )::text AS job_title,
    NULLIF(trim(u.profile->>'phone'), '')::text AS phone,
    ex.stand_number::text AS stand_number,
    ex.sector::text AS sector
  FROM public.users u
  LEFT JOIN public.exhibitors ex
    ON ex.user_id = u.id AND u.type = 'exhibitor'
  WHERE u.id = ANY(p_ids)
    AND u.id IS DISTINCT FROM auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.connections c
        WHERE (c.requester_id = auth.uid() AND c.addressee_id = u.id)
           OR (c.addressee_id = auth.uid() AND c.requester_id = u.id)
      )
      OR EXISTS (
        SELECT 1 FROM public.exhibitor_leads el
        WHERE (el.visitor_user_id = auth.uid() AND el.exhibitor_user_id = u.id)
           OR (el.exhibitor_user_id = auth.uid() AND el.visitor_user_id = u.id)
      )
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_networking_contact_profiles(uuid[]) TO authenticated;

COMMENT ON FUNCTION public.get_networking_contact_profiles IS
  'Profils contacts visibles pour Mes scans / Réseau (connexion ou scan stand uniquement)';
