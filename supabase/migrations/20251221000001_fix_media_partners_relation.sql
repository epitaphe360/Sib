-- Migration: Fix media_contents to partners relationship for PostgREST
-- Date: 2024-12-21
-- Description: Ensure the foreign key relationship is recognized by PostgREST

-- Drop and recreate the foreign key to ensure it's properly indexed
DO $$
BEGIN
  -- Check if the foreign key exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'media_contents_sponsor_partner_id_fkey'
    AND table_name = 'media_contents'
  ) THEN
    -- FK exists, nothing to do
    RAISE NOTICE 'Foreign key media_contents_sponsor_partner_id_fkey already exists';
  ELSE
    -- Create the foreign key if it doesn't exist
    BEGIN
      ALTER TABLE public.media_contents
        ADD CONSTRAINT media_contents_sponsor_partner_id_fkey
        FOREIGN KEY (sponsor_partner_id) REFERENCES public.partners(id) ON DELETE SET NULL;
      RAISE NOTICE 'Foreign key media_contents_sponsor_partner_id_fkey created';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Foreign key already exists (duplicate_object)';
    END;
  END IF;
END $$;

-- Add a comment to help PostgREST recognize the relationship
COMMENT ON CONSTRAINT media_contents_sponsor_partner_id_fkey ON public.media_contents 
IS 'Foreign key linking media content to sponsor partner';

-- Ensure the index exists for the FK
CREATE INDEX IF NOT EXISTS idx_media_contents_sponsor_partner 
ON public.media_contents(sponsor_partner_id);

-- Grant necessary permissions
GRANT SELECT ON public.partners TO anon;
GRANT SELECT ON public.partners TO authenticated;
GRANT SELECT ON public.media_contents TO anon;
GRANT SELECT ON public.media_contents TO authenticated;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
