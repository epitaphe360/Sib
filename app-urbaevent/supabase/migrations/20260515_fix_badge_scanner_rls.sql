-- ============================================================
-- Fix: RLS user_badges - autoriser le scan par les agents authentifiés
-- Contexte: L'app Flutter zone scanner (sib_zone_scanner) est connectée
-- avec un compte opérateur. La policy existante ne laisse voir que son
-- propre badge (user_id = auth.uid()), ce qui bloque la lecture des
-- badges des participants → "Badge inconnu ou non enregistré".
-- ============================================================

-- Supprimer d'abord les policies existantes pour SELECT afin d'éviter les conflits
DROP POLICY IF EXISTS "Authenticated users can scan any badge" ON user_badges;

-- Permettre à tout utilisateur authentifié de LIRE n'importe quel badge
-- (les badges sont des credentials publics présentés à l'entrée)
-- Cela permet au scanner de zone de valider les badges de tous les participants.
CREATE POLICY "Authenticated users can scan any badge"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

-- Note: Les policies d'écriture (INSERT/UPDATE) restent inchangées :
--   - Les utilisateurs ne peuvent modifier QUE leur propre badge
--   - Les admins peuvent tout gérer
-- Cette policy ne crée pas de risque de sécurité car les données du badge
-- (nom, société, type d'accès) sont visibles sur le badge physique lui-même.
