-- Migration: Ajout des champs manquants pour la fiche catalogue complète SIB 2026
-- Alignement avec la FICHE CATALOGUE SIB 2024

ALTER TABLE public.catalogue_entries
  ADD COLUMN IF NOT EXISTS sector               text,
  ADD COLUMN IF NOT EXISTS fax                  text,
  ADD COLUMN IF NOT EXISTS gsm                  text,
  ADD COLUMN IF NOT EXISTS zip_code             text,
  ADD COLUMN IF NOT EXISTS contact_direct_phone text,
  ADD COLUMN IF NOT EXISTS contact_direct_email text,
  ADD COLUMN IF NOT EXISTS youtube_url          text,
  ADD COLUMN IF NOT EXISTS products_services    text;

-- Index secteur pour filtres futurs
CREATE INDEX IF NOT EXISTS idx_catalogue_entries_sector ON public.catalogue_entries(sector);
