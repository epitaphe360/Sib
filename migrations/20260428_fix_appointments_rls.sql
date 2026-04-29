-- ============================================================
-- Migration : Fix RLS policies on appointments table
-- Date: 2026-04-28
-- Problème : La politique SELECT/UPDATE n'inclut pas les partenaires
--            (qui ne sont pas dans la table exhibitors)
--            ni le cas où exhibitor_id = users.id directement.
-- Fix      : Ajouter `OR auth.uid() = exhibitor_id` dans les policies
-- ============================================================

-- 1. Supprimer les policies existantes (elles sont recréées avec le bon USING)
DROP POLICY IF EXISTS "Users can view their appointments"     ON appointments;
DROP POLICY IF EXISTS "Exhibitors can update appointments"   ON appointments;
DROP POLICY IF EXISTS "Users can see own appointments only"  ON appointments;

-- 2. Nouvelle politique SELECT
--    Couvre :
--      - Visiteur           : auth.uid() = visitor_id
--      - Exposant (exhibitors table)  : auth.uid() = exhibitors.user_id WHERE exhibitors.id = exhibitor_id
--      - Partenaire / user_id direct  : auth.uid() = exhibitor_id
CREATE POLICY "Users can view their appointments"
  ON appointments FOR SELECT
  USING (
    auth.uid() = visitor_id
    OR auth.uid() = exhibitor_id
    OR auth.uid() IN (
      SELECT user_id FROM exhibitors WHERE id = exhibitor_id
    )
  );

-- 3. Nouvelle politique UPDATE
--    Couvre les mêmes cas (accept/reject par exposant ou partenaire)
CREATE POLICY "Exhibitors can update appointments"
  ON appointments FOR UPDATE
  USING (
    auth.uid() = exhibitor_id
    OR auth.uid() IN (
      SELECT user_id FROM exhibitors WHERE id = exhibitor_id
    )
  );

-- 4. S'assurer que la politique DELETE (cancel) couvre aussi les exposants/partenaires
DROP POLICY IF EXISTS "Users can cancel their own appointments" ON appointments;

CREATE POLICY "Users can cancel their own appointments"
  ON appointments FOR DELETE
  USING (
    auth.uid() = visitor_id
    OR auth.uid() = exhibitor_id
    OR auth.uid() IN (
      SELECT user_id FROM exhibitors WHERE id = exhibitor_id
    )
  );
