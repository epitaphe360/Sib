-- Migration: Corriger les policies RLS pour la table exhibitors
-- Date: 2026-02-18
-- Problème: Les admins ne peuvent pas modifier les exposants

-- ============================================
-- 1. SUPPRIMER LES ANCIENNES POLICIES
-- ============================================
DROP POLICY IF EXISTS "exhibitors_select_all" ON exhibitors;
DROP POLICY IF EXISTS "exhibitors_update_own" ON exhibitors;
DROP POLICY IF EXISTS "exhibitors_update_admin" ON exhibitors;
DROP POLICY IF EXISTS "exhibitors_insert_admin" ON exhibitors;
DROP POLICY IF EXISTS "exhibitors_delete_admin" ON exhibitors;
DROP POLICY IF EXISTS "Allow public read" ON exhibitors;
DROP POLICY IF EXISTS "Allow owner update" ON exhibitors;
DROP POLICY IF EXISTS "Allow admin update" ON exhibitors;
DROP POLICY IF EXISTS "Allow admin insert" ON exhibitors;
DROP POLICY IF EXISTS "Allow admin delete" ON exhibitors;

-- ============================================
-- 2. ACTIVER RLS SI PAS DÉJÀ FAIT
-- ============================================
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CRÉER LES NOUVELLES POLICIES
-- ============================================

-- SELECT: Tout le monde peut lire les exposants
CREATE POLICY "exhibitors_select_all" ON exhibitors
  FOR SELECT
  USING (true);

-- INSERT: Admins peuvent créer des exposants
CREATE POLICY "exhibitors_insert_admin" ON exhibitors
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
  );

-- UPDATE: Admins peuvent modifier TOUS les exposants
-- OU l'exposant peut modifier son propre profil
CREATE POLICY "exhibitors_update_admin_or_owner" ON exhibitors
  FOR UPDATE
  USING (
    -- Admin peut tout modifier
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
    OR
    -- L'exposant peut modifier son propre profil
    user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
    OR
    user_id = auth.uid()
  );

-- DELETE: Seuls les admins peuvent supprimer
CREATE POLICY "exhibitors_delete_admin" ON exhibitors
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
  );

-- ============================================
-- 4. VÉRIFICATION
-- ============================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'exhibitors';
