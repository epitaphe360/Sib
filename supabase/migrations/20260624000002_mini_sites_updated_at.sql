-- Colonne updated_at manquante sur mini_sites (PostgREST schema cache)
ALTER TABLE public.mini_sites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger auto-update si absent
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_mini_sites_updated_at ON public.mini_sites;
CREATE TRIGGER update_mini_sites_updated_at
  BEFORE UPDATE ON public.mini_sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

NOTIFY pgrst, 'reload schema';
