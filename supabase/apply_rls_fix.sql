-- Script d'application pour corriger les erreurs API Supabase
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- OU via: psql -h db.xxx.supabase.co -U postgres -d postgres -f apply_rls_fix.sql

-- VERSION 3.0 - FINAL - Correction des colonnes time_slots (exhibitor_id)

-- Ce script applique la migration complète: 20251107000003_fix_rls_final.sql
-- Il crée les tables manquantes ET applique les politiques RLS avec les bonnes colonnes

\i migrations/20251107000003_fix_rls_final.sql

-- Vérification que les tables existent
SELECT
    table_name,
    CASE
      WHEN table_type = 'BASE TABLE' THEN '✅ Table exists'
      ELSE '❌ Missing'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('registration_requests', 'users', 'mini_sites', 'time_slots', 'news_articles', 'exhibitors', 'products', 'partners')
ORDER BY table_name;
