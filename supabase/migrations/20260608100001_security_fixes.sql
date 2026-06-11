-- =============================================================================
-- CORRECTIFS SÉCURITÉ CRITIQUES — SIB 2026
-- Migration: 20260608100001_security_fixes.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- FIX 1 (P1 HIGH): news_articles — RLS: "published = true OR true" est toujours
-- vrai et expose les brouillons au public.
-- Origine: migrations/20250930112332_20250930_complete_schema.sql ligne 171
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read published news" ON news_articles;

CREATE POLICY "Anyone can read published news"
  ON news_articles FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can read all news"
  ON news_articles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- FIX 2 (P1 HIGH): app_settings — tout utilisateur authentifié peut lire les
-- paramètres de l'application (potentiellement des clés API stockées dedans).
-- Origine: migrations/20260608000002_create_app_settings_table.sql
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Lecture app_settings authentifiée" ON app_settings;

CREATE POLICY "Admins read app_settings"
  ON app_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Les edge functions utilisent service_role → pas de politique nécessaire pour elles.

-- -----------------------------------------------------------------------------
-- FIX 3 (P1 HIGH): check_email_registered — accessible par anon.
-- Énumération d'emails sans authentification.
-- -----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.check_email_registered(text) FROM anon;
-- Garder pour authenticated uniquement (déjà accordé)

-- -----------------------------------------------------------------------------
-- FIX 4 (P1 HIGH): check_email_exists — accessible par anon.
-- -----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.check_email_exists(text) FROM anon;

-- -----------------------------------------------------------------------------
-- FIX 5 (P1 HIGH): register_new_user — accessible par anon + type arbitraire.
-- Deux surcharges coexistent (signatures différentes) — on les supprime toutes
-- et on recrée une seule version sécurisée.
-- -----------------------------------------------------------------------------

-- Révoquer l'accès anon sur la version existante (signature exacte requise)
REVOKE EXECUTE ON FUNCTION public.register_new_user(
  uuid, text, text, text, text, text, jsonb
) FROM anon;

-- Supprimer la version existante pour la recréer avec la logique sécurisée
DROP FUNCTION IF EXISTS public.register_new_user(uuid, text, text, text, text, text, jsonb);

-- Recréer une seule version sécurisée (signature compatible avec l'original)
CREATE FUNCTION public.register_new_user(
  p_id            uuid,
  p_email         text,
  p_name          text,
  p_type          text,
  p_visitor_level text    DEFAULT NULL,
  p_status        text    DEFAULT 'active',
  p_profile       jsonb   DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_type text;
  v_safe_type   text;
BEGIN
  IF p_id IS NULL OR p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'register_new_user: p_id et p_email sont obligatoires';
  END IF;

  -- Déterminer si le caller est un rôle privilégié
  IF auth.uid() IS NOT NULL THEN
    SELECT type INTO v_caller_type FROM public.users WHERE id = auth.uid();
  END IF;

  -- Forcer le type à 'visitor' sauf pour les rôles admin/service_client
  IF v_caller_type IN ('admin', 'service_client') THEN
    v_safe_type := p_type;
  ELSE
    -- Ignorer le paramètre p_type fourni — toujours visitor
    v_safe_type := 'visitor';
  END IF;

  -- Validation du type final
  IF v_safe_type NOT IN ('visitor', 'exhibitor', 'partner', 'admin', 'security', 'service_client') THEN
    RAISE EXCEPTION 'register_new_user: type invalide "%"', v_safe_type;
  END IF;

  INSERT INTO public.users (id, email, name, type, visitor_level, status, profile)
  VALUES (
    p_id,
    lower(trim(p_email)),
    trim(p_name),
    v_safe_type,
    p_visitor_level,
    COALESCE(p_status, 'active'),
    COALESCE(p_profile, '{}')
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Accès uniquement aux utilisateurs authentifiés (plus d'accès anon)
GRANT EXECUTE ON FUNCTION public.register_new_user(uuid, text, text, text, text, text, jsonb)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_new_user(uuid, text, text, text, text, text, jsonb)
  TO service_role;

-- -----------------------------------------------------------------------------
-- FIX 6 (P2 MEDIUM): catalogue_entries — UPDATE USING(true) permet à tout
-- utilisateur authentifié de modifier n'importe quelle entrée.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can update catalogue entries" ON catalogue_entries;

CREATE POLICY "Exhibitors update own catalogue entries"
  ON catalogue_entries FOR UPDATE
  USING (
    exhibitor_id IN (
      SELECT id FROM exhibitors WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'
    )
  )
  WITH CHECK (
    exhibitor_id IN (
      SELECT id FROM exhibitors WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- FIX 7 (P2 MEDIUM): Fonction is_admin() sans récursion pour les politiques RLS
-- Remplace les SELECT FROM users imbriqués dans les politiques de la table users
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND type = 'admin'
  );
$$;

-- Ne pas exposer au public
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- Remplacer les politiques récursives sur users
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- RÉSUMÉ DES CORRECTIONS
-- =============================================================================
-- 1. news_articles: RLS corrigée (OR true supprimé) — brouillons non exposés
-- 2. app_settings: Lecture restreinte aux admins uniquement
-- 3. check_email_registered: anon révoqué
-- 4. check_email_exists: anon révoqué  
-- 5. register_new_user: anon révoqué + type forcé à 'visitor'
-- 6. catalogue_entries UPDATE: restreint aux propriétaires
-- 7. is_admin(): fonction non récursive pour les politiques users
-- =============================================================================
