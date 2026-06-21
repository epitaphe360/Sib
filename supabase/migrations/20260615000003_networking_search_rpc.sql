-- Networking mobile : recherche participants sans ouvrir toute la table users

CREATE OR REPLACE FUNCTION public.search_networking_users(
  p_query text,
  p_exclude uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  type text,
  visitor_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  term text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  term := trim(coalesce(p_query, ''));
  IF length(term) < 2 THEN
    RETURN;
  END IF;

  term := '%' || term || '%';

  RETURN QUERY
  SELECT u.id, u.name, u.email, u.type::text, u.visitor_level::text
  FROM public.users u
  WHERE u.id IS DISTINCT FROM coalesce(p_exclude, auth.uid())
    AND u.type IN ('visitor', 'exhibitor', 'partner')
    AND u.status = 'active'
    AND (u.name ILIKE term OR u.email ILIKE term)
  ORDER BY u.name NULLS LAST
  LIMIT 20;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_networking_candidates(
  p_exclude uuid DEFAULT NULL,
  p_limit int DEFAULT 80
)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  type text,
  visitor_level text,
  profile jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT u.id, u.name, u.email, u.type::text, u.visitor_level::text, u.profile
  FROM public.users u
  WHERE u.id IS DISTINCT FROM coalesce(p_exclude, auth.uid())
    AND u.type IN ('visitor', 'exhibitor', 'partner')
    AND u.status = 'active'
  ORDER BY u.updated_at DESC NULLS LAST, u.created_at DESC
  LIMIT greatest(1, least(coalesce(p_limit, 80), 100));
END;
$$;

CREATE OR REPLACE FUNCTION public.get_networking_user_names(p_ids uuid[])
RETURNS TABLE (id uuid, name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
  SELECT u.id, u.name
  FROM public.users u
  WHERE u.id = ANY(p_ids);
$$;

GRANT EXECUTE ON FUNCTION public.search_networking_users(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_networking_candidates(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_networking_user_names(uuid[]) TO authenticated;
