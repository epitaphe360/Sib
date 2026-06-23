-- Migration: Ajouter la policy DELETE sur la table exhibitors pour les admins
-- La table exhibitors a RLS activé avec des policies SELECT/UPDATE mais PAS de policy DELETE
-- Cela empêche les admins de supprimer des exposants

-- Supprimer l'ancienne policy si elle existe
DROP POLICY IF EXISTS "Admin can delete exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "admin_delete_exhibitors" ON exhibitors;

-- Créer la policy permettant aux admins de supprimer des exposants
CREATE POLICY "admin_delete_exhibitors" ON exhibitors
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
  );

-- Vérification
COMMENT ON POLICY "admin_delete_exhibitors" ON exhibitors 
  IS 'Permet aux utilisateurs admin de supprimer des exposants';
