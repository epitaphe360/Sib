-- Migration: Créer table session_checkins
-- Date: 2026-05-06
-- Description: Enregistrements des entrées aux sessions du programme.
--   Permet de vérifier via QR code que seules les personnes inscrites
--   peuvent accéder à une session spécifique.

CREATE TABLE IF NOT EXISTS public.session_checkins (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      text        NOT NULL,
  user_id         uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  checked_in_at   timestamptz DEFAULT now(),
  checked_in_by   uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  notes           text,
  UNIQUE (session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_session_checkins_session ON public.session_checkins (session_id);
CREATE INDEX IF NOT EXISTS idx_session_checkins_user    ON public.session_checkins (user_id);

ALTER TABLE public.session_checkins ENABLE ROW LEVEL SECURITY;

-- Suppression des politiques existantes (idempotence)
DROP POLICY IF EXISTS "Users can view own checkins"      ON public.session_checkins;
DROP POLICY IF EXISTS "Admins can manage all checkins"   ON public.session_checkins;
DROP POLICY IF EXISTS "Staff can insert checkins"        ON public.session_checkins;

-- Un utilisateur peut voir ses propres checkins
CREATE POLICY "Users can view own checkins"
  ON public.session_checkins FOR SELECT
  USING (auth.uid() = user_id);

-- Admins : accès complet
CREATE POLICY "Admins can manage all checkins"
  ON public.session_checkins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.type IN ('admin', 'security')
    )
  );

-- Staff (admin/security) peut insérer des checkins
CREATE POLICY "Staff can insert checkins"
  ON public.session_checkins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.type IN ('admin', 'security')
    )
  );
