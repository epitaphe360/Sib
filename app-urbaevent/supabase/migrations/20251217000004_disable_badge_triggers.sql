-- ========================================
-- Temporarily Disable Auto-Badge Generation Triggers
-- ========================================
-- The auto_generate_user_badge triggers are querying tables/columns
-- that don't match the actual schema (camelCase vs snake_case mismatch)
--
-- This migration disables the triggers so seed data can be inserted successfully
-- Badges can be generated manually after profiles are created
-- ========================================

-- Drop triggers that auto-generate badges (they have schema mismatches)
DROP TRIGGER IF EXISTS trigger_auto_generate_badge_on_insert ON users;
DROP TRIGGER IF EXISTS trigger_auto_generate_badge_on_update ON users;
DROP TRIGGER IF EXISTS trigger_update_badge_from_exhibitor ON exhibitors;
DROP TRIGGER IF EXISTS trigger_update_badge_from_partner ON partners;

-- Also drop similar triggers on profile tables if they were created
DROP TRIGGER IF EXISTS trigger_update_badge_from_exhibitor ON exhibitor_profiles;
DROP TRIGGER IF EXISTS trigger_update_badge_from_partner ON partner_profiles;

-- Comment explaining why triggers are disabled
COMMENT ON FUNCTION auto_generate_user_badge() IS
  'DISABLED: Auto badge generation has schema mismatches.
   Trigger attempts to query camelCase columns (userId, companyName, standNumber)
   but actual tables use snake_case (user_id, company_name).
   Generate badges manually using upsert_user_badge() function after profile creation.';
