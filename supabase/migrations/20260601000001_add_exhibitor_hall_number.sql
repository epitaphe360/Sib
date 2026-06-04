-- Ajout du numéro de hall pour l'annuaire exposants SIB 2026
ALTER TABLE public.exhibitors
  ADD COLUMN IF NOT EXISTS hall_number text;

COMMENT ON COLUMN public.exhibitors.hall_number IS 'Numéro de hall pour l''annuaire exposants';
