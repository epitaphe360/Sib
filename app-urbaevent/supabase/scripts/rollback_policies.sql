-- Rollback for final_fix.sql
-- This script attempts to revert the changes made by `final_fix.sql`.
-- Run in Supabase SQL editor if you need to restore previous policy state.

BEGIN;

-- 1) Revoke public SELECT on public_users and drop view
REVOKE SELECT ON public.public_users FROM public;
DROP VIEW IF EXISTS public.public_users;

-- 2) Drop admin helper function
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- 3) Remove policies created by final_fix.sql (they are dropped if exist)
ALTER TABLE IF EXISTS public.exhibitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read exhibitors" ON public.exhibitors;

ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read products" ON public.products;

ALTER TABLE IF EXISTS public.mini_sites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published mini-sites" ON public.mini_sites;

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
-- Note: this rollback will NOT restore any custom policies that existed prior to
-- running final_fix.sql. If you had bespoke rules, re-create them manually.

COMMIT;

-- After running this, re-create any prior policies you want. Keep backups of your
-- original policies before applying fixes.
-- ROLLBACK: revert final_fix.sql changes
BEGIN;

-- Drop helper
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

-- Drop public view
DROP VIEW IF EXISTS public.public_users CASCADE;

-- Remove public read policies added earlier
DROP POLICY IF EXISTS "Public can read exhibitors" ON public.exhibitors;
DROP POLICY IF EXISTS "Public can read products" ON public.products;
DROP POLICY IF EXISTS "Public can read published mini-sites" ON public.mini_sites;

-- NOTE: This rollback does not restore prior policy definitions. If vous voulez
-- restaurer les anciennes policies, fournissez les exports précédents et je
-- générerai un script de restauration complet.

COMMIT;
