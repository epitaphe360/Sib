-- Migration: Add stand_area column to exhibitors table
-- Date: 2026-05-14
-- Reason: ExhibitorManagementPage queries stand_area but it only existed in exhibitor_profiles

ALTER TABLE public.exhibitors
  ADD COLUMN IF NOT EXISTS stand_area numeric DEFAULT 9.0 CHECK (stand_area > 0 AND stand_area <= 200);

CREATE INDEX IF NOT EXISTS idx_exhibitors_stand_area ON public.exhibitors (stand_area);
