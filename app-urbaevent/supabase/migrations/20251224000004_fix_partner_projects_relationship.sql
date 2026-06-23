-- =====================================================
-- MIGRATION: Fix Partner Projects Relationship
-- =====================================================

-- 1. Add user_id to partner_projects to allow direct join with users table
-- This is required for the query in SupabaseService.getUserByEmail
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_projects' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE partner_projects ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Populate user_id from partners table
-- We link partner_projects to users via the partners table
UPDATE partner_projects pp
SET user_id = p.user_id
FROM partners p
WHERE pp.partner_id = p.id
AND pp.user_id IS NULL;

-- 3. Add index for performance
CREATE INDEX IF NOT EXISTS idx_partner_projects_user_id ON partner_projects(user_id);

-- 4. Update RLS policies to include user_id check if needed
-- (The existing policy is public view, so it's fine for now)
