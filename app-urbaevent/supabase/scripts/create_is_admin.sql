-- Create helper is_admin function required by policies
-- Idempotent: CREATE OR REPLACE

CREATE OR REPLACE FUNCTION public.is_admin(p_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = p_uid AND type = 'admin'
  );
$$;

-- Ensure only expected roles can execute (adjust if you use a different role)
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Quick verification query (run after applying):
-- SELECT proname, oidvectortypes(proargtypes) FROM pg_proc WHERE proname = 'is_admin';
