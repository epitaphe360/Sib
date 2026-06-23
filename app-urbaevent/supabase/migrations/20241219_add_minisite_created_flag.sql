-- Add minisite_created flag to users table
-- This flag tracks whether an exhibitor has created their mini-site

-- Add column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'minisite_created'
  ) THEN
    ALTER TABLE public.users
    ADD COLUMN minisite_created BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_minisite_created
ON public.users(id, minisite_created)
WHERE role = 'exhibitor';

-- Add comment
COMMENT ON COLUMN public.users.minisite_created IS
'Flag indicating whether the exhibitor has created their mini-site (true) or not (false). Used to trigger the mini-site setup popup on first login after account activation.';

-- Update existing exhibitors without mini-site to false (explicit)
UPDATE public.users
SET minisite_created = false
WHERE role = 'exhibitor'
AND minisite_created IS NULL;
