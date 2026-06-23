-- Migration: Créer table programme_registrations
-- Date: 2026-05-01
-- Description: Inscriptions aux sessions du programme scientifique.
--   Utilise session_id TEXT (pas UUID FK vers events) car les sessions du
--   programmeStore sont gérées séparément de la table events.

CREATE TABLE IF NOT EXISTS public.programme_registrations (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       text        NOT NULL,
  user_id          uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  registration_type text       DEFAULT 'attendee',   -- 'exhibitor' | 'partner' | 'visitor' | 'attendee'
  status           text        DEFAULT 'confirmed',
  registered_at    timestamptz DEFAULT now(),
  UNIQUE (session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_programme_reg_session ON public.programme_registrations (session_id);
CREATE INDEX IF NOT EXISTS idx_programme_reg_user   ON public.programme_registrations (user_id);

ALTER TABLE public.programme_registrations ENABLE ROW LEVEL SECURITY;

-- Suppression des politiques existantes (idempotence)
DROP POLICY IF EXISTS "Users can view own programme registrations"    ON public.programme_registrations;
DROP POLICY IF EXISTS "Users can create own programme registrations"  ON public.programme_registrations;
DROP POLICY IF EXISTS "Users can delete own programme registrations"  ON public.programme_registrations;
DROP POLICY IF EXISTS "Admins can manage all programme registrations" ON public.programme_registrations;

-- Lecture : chaque utilisateur voit ses propres inscriptions
CREATE POLICY "Users can view own programme registrations"
  ON public.programme_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- Création : un utilisateur peut créer sa propre inscription
CREATE POLICY "Users can create own programme registrations"
  ON public.programme_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Suppression : un utilisateur peut supprimer sa propre inscription
CREATE POLICY "Users can delete own programme registrations"
  ON public.programme_registrations FOR DELETE
  USING (auth.uid() = user_id);

-- Admins : accès complet
CREATE POLICY "Admins can manage all programme registrations"
  ON public.programme_registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );
