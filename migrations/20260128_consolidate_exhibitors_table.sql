-- Migration: Consolidate exhibitor_profiles into exhibitors table
-- Date: 2026-01-28
-- Purpose: Use single table for exhibitors to avoid data duplication

-- Step 1: Check both tables structure and count
-- SELECT COUNT(*) FROM exhibitors;
-- SELECT COUNT(*) FROM exhibitor_profiles;

-- Step 2: Migrate any missing data from exhibitor_profiles to exhibitors
INSERT INTO exhibitors (id, user_id, company_name, category, sector, description, logo_url, website, verified, featured, contact_info, created_at, updated_at)
SELECT 
  id,
  user_id,
  company_name,
  -- Map category values to valid enum values
  (CASE 
    WHEN category::text IN ('institutional', 'port-industry', 'port-operations', 'academic') THEN category::text
    WHEN category::text ILIKE '%startup%' OR category::text ILIKE '%tech%' THEN 'port-industry'
    WHEN category::text ILIKE '%port%' THEN 'port-operations'
    ELSE 'port-industry'
  END)::exhibitor_category as category,
  sector,
  description,
  logo_url,
  website,
  false as verified,
  false as featured,
  jsonb_build_object(
    'email', email,
    'phone', phone,
    'address', '',
    'city', '',
    'country', 'France'
  ) as contact_info,
  NOW() as created_at,
  NOW() as updated_at
FROM exhibitor_profiles
WHERE id NOT IN (SELECT id FROM exhibitors)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify migration
-- SELECT COUNT(*) FROM exhibitors;

-- Step 4: Drop exhibitor_profiles table (only after verifying data is safe)
-- DROP TABLE IF EXISTS exhibitor_profiles CASCADE;

-- Alternative: Just disable the table if you want to keep it as backup
-- ALTER TABLE exhibitor_profiles RENAME TO exhibitor_profiles_archived;

COMMIT;
