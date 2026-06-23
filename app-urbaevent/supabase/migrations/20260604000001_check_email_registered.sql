-- Vérification email (connexion magic link mobile) — évite d'exposer les erreurs SMTP
CREATE OR REPLACE FUNCTION public.check_email_registered(p_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE lower(email) = lower(trim(p_email))
  );
$$;

REVOKE ALL ON FUNCTION public.check_email_registered(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_email_registered(text) TO anon, authenticated, service_role;
