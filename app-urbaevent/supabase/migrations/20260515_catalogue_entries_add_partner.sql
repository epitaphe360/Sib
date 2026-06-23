-- Migration: Ajout partner_id et source_type dans catalogue_entries
-- Date: 2026-05-15
-- Permet de lier les fiches catalogue aux partenaires (en plus des exposants)
-- et d'identifier la source de chaque fiche

ALTER TABLE public.catalogue_entries
  ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'exhibitor'
    CHECK (source_type IN ('exhibitor', 'partner'));

-- Index pour les requêtes par partenaire
CREATE INDEX IF NOT EXISTS idx_catalogue_entries_partner ON public.catalogue_entries(partner_id);

-- Rétrocompatibilité : les fiches existantes avec exhibitor_id gardent source_type='exhibitor'
UPDATE public.catalogue_entries
  SET source_type = 'exhibitor'
  WHERE source_type IS NULL AND exhibitor_id IS NOT NULL;
