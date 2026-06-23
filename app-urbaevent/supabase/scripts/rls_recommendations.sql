-- RLS recommendations for appointments table
-- These are example policies. Adapt role names and column names to your schema.

-- 1) Allow authenticated users to INSERT their own appointments
-- Assumes JWT `sub` maps to users.id and that anon/public role is restricted.

-- Enable RLS on table
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;

-- Policy: allow users to insert their own appointments
CREATE POLICY "users_can_insert_own_appointments"
  ON public.appointments
  FOR INSERT
  -- auth.uid() is text; cast to uuid to compare with visitor_id
  WITH CHECK (visitor_id = auth.uid()::uuid);

-- Policy: allow users to SELECT their own appointments
CREATE POLICY "users_can_select_own_appointments"
  ON public.appointments
  FOR SELECT
  USING (visitor_id = auth.uid()::uuid);

-- Policy: allow users to update their own appointments (only allowed status changes)
CREATE POLICY "users_can_update_own_status"
  ON public.appointments
  FOR UPDATE
  -- Ensure the row belongs to the user
  USING (visitor_id = auth.uid()::uuid)
  -- WITH CHECK limits the new row values: users can only change to safe statuses
  WITH CHECK (visitor_id = auth.uid()::uuid AND status IN ('pending','cancelled'));

-- Admin/service-role: full access - create similar policies for service role usage if needed.

-- Note: Replace auth.uid() usage according to your Postgres/Supabase JWT claims mapping
-- and test policies carefully in a staging environment before production.
