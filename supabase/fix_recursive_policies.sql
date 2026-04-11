-- Diagnostic: afficher les policies pouvant causer récursion
-- Liste les policies pour users/exhibitors/products/mini_sites
SELECT schemaname, tablename, policyname, permissive, roles, cmd,
       qual::text AS using_expr, with_check::text AS check_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users','exhibitors','products','mini_sites')
ORDER BY tablename, policyname;

-- OPTIONNEL: Dump des definitions de functions référencées par les policies
-- (utile si une policy appelle une fonction)
SELECT proname, prosrc
FROM pg_proc
WHERE oid IN (
  SELECT regexp_replace(regexp_replace(qual::text, '.*\$\$(.*)\$\$.*', '\1'), '\s+', ' ', 'g')::regproc
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename IN ('users','exhibitors','products','mini_sites')
);

-- NOTE: Ne pas exécuter les commandes DROP ci-dessous sans revue. Elles sont
-- proposées uniquement si vous validez la suppression après inspection.

-- Exemple (commenté) : supprimer une policy problématique nommée "BadPolicy"
-- DROP POLICY IF EXISTS "BadPolicy" ON users;

-- Fin du script diagnostic
