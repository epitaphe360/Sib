-- ============================================================================
-- MIGRATION: Add publication control for partners and exhibitors
-- Date: 2026-02-14
-- Description: Add is_published field to control visibility of partners and exhibitors
-- ============================================================================

BEGIN;

-- Add is_published column to partners table
ALTER TABLE public.partners
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Add is_published column to exhibitors table  
ALTER TABLE public.exhibitors
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_partners_is_published ON public.partners(is_published);
CREATE INDEX IF NOT EXISTS idx_exhibitors_is_published ON public.exhibitors(is_published);

-- Update existing records to published (for smooth migration)
UPDATE public.partners SET is_published = true WHERE is_published IS NULL;
UPDATE public.exhibitors SET is_published = true WHERE is_published IS NULL;

-- Add comments
COMMENT ON COLUMN public.partners.is_published IS 'Controls if partner profile is visible publicly. Admin controls this field.';
COMMENT ON COLUMN public.exhibitors.is_published IS 'Controls if exhibitor profile is visible publicly. Admin controls this field.';

COMMIT;
