-- Fonction publique pour vérifier si un email existe dans public.users
-- SECURITY DEFINER = s'exécute avec les droits du propriétaire (bypasse RLS)
-- Accessible via la clé anon sans authentification
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE email = lower(trim(p_email))
  );
$$;

-- Autoriser l'accès public (anon + authenticated)
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO authenticated;
