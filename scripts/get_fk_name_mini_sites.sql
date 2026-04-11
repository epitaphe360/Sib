-- Script SQL pour trouver le nom de la clé étrangère entre mini_sites et exhibitors
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'mini_sites'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'exhibitors';

-- Exécutez ce script dans l'éditeur SQL Supabase pour obtenir le nom exact de la clé étrangère.
-- Utilisez ce nom dans votre requête d'embed : mini_sites!NOM_DE_LA_CONTRAINTE(*)
