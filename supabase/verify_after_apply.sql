-- Verification script to run AFTER applying supabase/combined_apply.sql
-- Run this whole file in Supabase SQL Editor. It will NOT persist the quota test (ROLLBACK).

-- 1) Verify visitor_level column exists
SELECT column_name
FROM information_schema.columns
WHERE table_schema='public' AND table_name='users' AND column_name='visitor_level';

-- 2) Verify functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema='public' AND routine_name IN ('create_visitor_safe','check_visitor_quota','is_admin');

-- 3) Triggers on appointments
SELECT tgname, tgenabled, pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgrelid = 'public.appointments'::regclass;

-- 4) public_users view columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='public_users';

-- 5) Policies details (USING / WITH CHECK)
SELECT tbl.relname AS table_name,
       pol.polname AS policy_name,
       pol.polcmd AS command,
       pg_get_expr(pol.polqual, pol.polrelid) AS using_expr,
       pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expr
FROM pg_policy pol
JOIN pg_class tbl ON pol.polrelid = tbl.oid
WHERE tbl.relname IN ('users','exhibitors','products','mini_sites','appointments')
ORDER BY tbl.relname, pol.polname;

-- 6) Transactional test of visitor quota trigger (will ROLLBACK)
BEGIN;

-- Upsert a temporary test user (adjust email if needed)
-- Note: the 3rd argument is the user account type (enum user_type). Use 'visitor' here.
SELECT public.create_visitor_safe('test+quota@example.com','Test Runner','visitor','free','{}'::jsonb) AS u;

-- Confirm visitor_level for the test user
SELECT id, email, visitor_level FROM public.users WHERE email='test+quota@example.com' LIMIT 1;

-- Attempt to insert a confirmed appointment for the user (expected: exception for free -> quota 0)
-- If the trigger works, this INSERT will fail. The surrounding transaction will be rolled back.
WITH u AS (SELECT id FROM public.users WHERE email='test+quota@example.com' LIMIT 1)
INSERT INTO public.appointments (visitor_id, status)
SELECT id, 'confirmed' FROM u;

ROLLBACK;

-- 7) Helpful diagnostics if the INSERT succeeded (run separately if needed)
-- SELECT COUNT(*) AS confirmed_count FROM public.appointments a JOIN public.users u ON a.visitor_id=u.id WHERE u.email='test+quota@example.com' AND a.status='confirmed';
-- SELECT visitor_level FROM public.users WHERE email='test+quota@example.com';

-- End of verification script
