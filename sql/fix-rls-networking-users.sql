-- ===============================================================================
-- CORRECTIF : VISIBILITÉ DU NETWORKING ET DES LISTES DE RECHERCHE D'ENTREPRISES
-- ===============================================================================
-- Problème : 
-- Récemment, pour réparer une boucle infinie RLS, la table "users" a été
-- strictement limitée à "users_select_own" (vous ne pouvez lire que votre profil).
-- Résultat : la page Networking et la recherche ne renvoient plus les 34 autres
-- entreprises, mais uniquement votre propre profil.
--
-- Solution :
-- Autoriser la LECTURE (SELECT) des profils pour tous les utilisateurs connectés
-- afin de pouvoir afficher les listes, les recommandations et le réseautage.
-- La modification (UPDATE) et la création restent bien protégées !
-- ===============================================================================

BEGIN;

-- Suppression d'anciennes règles si elles existent
DROP POLICY IF EXISTS "users_read_all_authenticated" ON public.users;

-- Création de la politique permettant à n'importe quel participant connecté 
-- de chercher et lister les membres (pour que le filtre Networking fonctionne)
CREATE POLICY "users_read_all_authenticated"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

COMMIT;

-- Afficher l'état mis à jour
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;