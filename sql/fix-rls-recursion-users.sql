-- ============================================================
-- FIX: infinite recursion detected in policy for relation "users"
-- ============================================================
-- CAUSE: is_admin() fait SELECT FROM public.users
--        ce SELECT déclenche la policy "Admins can manage all users"
--        qui appelle is_admin() → boucle infinie
--
-- FIX:  1) Ajouter SET row_security = off à is_admin()
--       2) Supprimer toutes les policies sur users
--       3) Recréer des policies simples NON récursives
-- ============================================================
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- URL: https://supabase.com/dashboard/project/sbyizudifmqakzxjlndr/sql/new
-- ============================================================

BEGIN;

-- -------------------------------------------------------
-- ÉTAPE 1 : Corriger la fonction is_admin
-- SET row_security = off désactive RLS pour les requêtes
-- internes à cette fonction SECURITY DEFINER
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = p_uid AND type = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;

-- -------------------------------------------------------
-- ÉTAPE 2 : Supprimer TOUTES les policies existantes
-- sur public.users (certaines peuvent être récursives)
-- -------------------------------------------------------
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all users"       ON public.users;
DROP POLICY IF EXISTS "Users can read own profile"        ON public.users;
DROP POLICY IF EXISTS "Users can read own data"           ON public.users;
DROP POLICY IF EXISTS "Users can update own data"         ON public.users;
DROP POLICY IF EXISTS "Public can read users"             ON public.users;
DROP POLICY IF EXISTS "users_select_own"                  ON public.users;
DROP POLICY IF EXISTS "users_update_own"                  ON public.users;
DROP POLICY IF EXISTS "users_admin_all"                   ON public.users;
DROP POLICY IF EXISTS "users_service_role_all"            ON public.users;
-- au cas où d'autres policies inconnues existent :
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
  END LOOP;
END;
$$;

-- -------------------------------------------------------
-- ÉTAPE 3 : Réactiver RLS et créer des policies propres
-- (SELECT auth.uid()) au lieu de auth.uid() = optimisation
-- importante pour éviter de réévaluer l'expression
-- -------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Les admins peuvent tout faire (uses is_admin qui a maintenant row_security=off)
CREATE POLICY "users_admin_all"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.is_admin((SELECT auth.uid())::uuid));

-- Le service role peut tout faire (pour les scripts admin / migrations)
CREATE POLICY "users_service_role_all"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------
-- VÉRIFICATION : afficher les policies créées
-- -------------------------------------------------------
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;

COMMIT;
