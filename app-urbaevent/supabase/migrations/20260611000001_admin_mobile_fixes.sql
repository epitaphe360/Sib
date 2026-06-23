-- Fixes admin mobile: alertes inscription, tarif VIP, protection admins
-- Ne pas recréer is_admin() — la version existante (p_uid ou sans argument) est conservée.

DROP POLICY IF EXISTS "Only admins can modify visitor levels" ON public.visitor_levels;

-- Compatible is_admin(uuid) ET is_admin() sans argument
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_admin'
      AND pg_get_function_identity_arguments(p.oid) = ''
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Only admins can modify visitor levels"
        ON public.visitor_levels FOR ALL
        TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $policy$;
  ELSIF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_admin'
      AND pg_get_function_identity_arguments(p.oid) = 'uuid'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Only admins can modify visitor levels"
        ON public.visitor_levels FOR ALL
        TO authenticated
        USING (public.is_admin(auth.uid()))
        WITH CHECK (public.is_admin(auth.uid()))
    $policy$;
  ELSE
    EXECUTE $policy$
      CREATE POLICY "Only admins can modify visitor levels"
        ON public.visitor_levels FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND type = 'admin'
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND type = 'admin'
          )
        )
    $policy$;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.admin_update_vip_price(new_price numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs';
  END IF;
  IF new_price IS NULL OR new_price <= 0 THEN
    RAISE EXCEPTION 'Prix invalide';
  END IF;
  UPDATE public.visitor_levels
  SET price_annual = new_price, price_monthly = new_price, updated_at = now()
  WHERE level IN ('premium', 'vip');
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_vip_price(numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_user_status(target_user_id uuid, new_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  target_type text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs';
  END IF;
  SELECT type INTO target_type FROM public.users WHERE id = target_user_id;
  IF target_type IS NULL THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;
  IF target_type = 'admin' THEN
    RAISE EXCEPTION 'Impossible de modifier le statut d''un administrateur';
  END IF;
  IF new_status NOT IN ('active', 'suspended', 'pending_payment', 'inactive') THEN
    RAISE EXCEPTION 'Statut invalide';
  END IF;
  UPDATE public.users SET status = new_status, updated_at = now() WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_status(uuid, text) TO authenticated;
