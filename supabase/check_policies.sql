-- Quick checks for final_fix.sql
-- Run these queries in Supabase SQL editor.

-- 1) As anon (no special role) - use the REST API or run via SQL as anon key mimic
--    Check that exhibitors are readable:
SELECT count(*) AS exhibitors_count FROM public.exhibitors;

-- 2) Check that mini_sites only returns published records
SELECT id, published FROM public.mini_sites LIMIT 10;

-- 3) Verify public_users view exists and is safe
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'public_users';

-- 4) Test is_admin function (replace with a known admin uuid if available)
-- SELECT public.is_admin('00000000-0000-0000-0000-000000000000');

-- 5) Verify policies present for tables
SELECT pol.polname AS policy_name, tbl.relname AS table_name
FROM pg_policy pol
JOIN pg_class tbl ON pol.polrelid = tbl.oid
WHERE tbl.relname IN ('exhibitors','products','mini_sites','users');
