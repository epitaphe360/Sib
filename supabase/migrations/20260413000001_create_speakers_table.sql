-- ============================================================
-- Création de la table speakers (intervenants SIB)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.speakers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  title       text NOT NULL DEFAULT '',
  company     text NOT NULL DEFAULT '',
  bio         text,
  photo_url   text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS speakers_updated_at ON public.speakers;
CREATE TRIGGER speakers_updated_at
  BEFORE UPDATE ON public.speakers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;

-- Lecture publique (page /speakers visible par tous)
DROP POLICY IF EXISTS "speakers_select_all" ON public.speakers;
CREATE POLICY "speakers_select_all"
  ON public.speakers FOR SELECT
  USING (true);

-- Écriture réservée aux admins
DROP POLICY IF EXISTS "speakers_insert_admin" ON public.speakers;
CREATE POLICY "speakers_insert_admin"
  ON public.speakers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

DROP POLICY IF EXISTS "speakers_update_admin" ON public.speakers;
CREATE POLICY "speakers_update_admin"
  ON public.speakers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

DROP POLICY IF EXISTS "speakers_delete_admin" ON public.speakers;
CREATE POLICY "speakers_delete_admin"
  ON public.speakers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

-- Index pour l'ordre d'affichage
CREATE INDEX IF NOT EXISTS speakers_sort_order_idx ON public.speakers (sort_order);

-- Données de démo (quelques intervenants types SIB)
INSERT INTO public.speakers (first_name, last_name, title, company, sort_order)
VALUES
  ('Mohammed', 'BENCHAÂBANE', 'Ministre délégué chargé des Relations avec le Parlement', 'Gouvernement du Maroc', 1),
  ('Sanae', 'ELAMRANI', 'Directrice des Affaires multilatérales', 'Ministère des Affaires Étrangères', 2),
  ('Nisrine', 'IOUZZI', 'Présidente', 'Fédération Nationale du Bâtiment et des Travaux Publics', 3),
  ('Geraint', 'EVANS', 'CEO', 'UK Major Ports Group', 4),
  ('Anass', 'KETTANI', 'Directeur', 'Institut Supérieur d''Enseignement Maritime (ISEM)', 5)
ON CONFLICT DO NOTHING;
