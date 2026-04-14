-- ============================================================
-- MIGRATION : Table event_registrations (e-badges)
-- À exécuter dans Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id      uuid REFERENCES public.salons(id) ON DELETE SET NULL,
  type          text NOT NULL DEFAULT 'visitor',   -- visitor | exhibitor | agent | vip
  status        text NOT NULL DEFAULT 'pending',   -- pending | confirmed | rejected
  confirmed     boolean DEFAULT NULL,              -- NULL=en attente, true=confirmé, false=rejeté
  booth         text DEFAULT NULL,                 -- numéro de stand (exposants uniquement)
  qr_token      text DEFAULT NULL,                 -- token signé pour le QR code (généré par Edge Function)
  qr_expires_at timestamptz DEFAULT NULL,          -- expiration du token QR
  checked_in_at timestamptz DEFAULT NULL,          -- horodatage du check-in à l'entrée
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Index pour retrouver les inscriptions d'un utilisateur rapidement
CREATE INDEX IF NOT EXISTS event_registrations_user_id_idx
  ON public.event_registrations (user_id);

-- Index pour retrouver les inscriptions d'un salon
CREATE INDEX IF NOT EXISTS event_registrations_salon_id_idx
  ON public.event_registrations (salon_id);

-- Contrainte : un utilisateur ne peut s'inscrire qu'une fois par salon
ALTER TABLE public.event_registrations
  DROP CONSTRAINT IF EXISTS event_registrations_user_salon_unique;
ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_user_salon_unique
  UNIQUE (user_id, salon_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_event_registrations_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_event_registrations_updated_at ON public.event_registrations;
CREATE TRIGGER set_event_registrations_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_registrations_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Un utilisateur peut voir uniquement ses propres inscriptions
DROP POLICY IF EXISTS "Users can view own registrations" ON public.event_registrations;
CREATE POLICY "Users can view own registrations"
  ON public.event_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- Un utilisateur peut créer sa propre inscription
DROP POLICY IF EXISTS "Users can insert own registration" ON public.event_registrations;
CREATE POLICY "Users can insert own registration"
  ON public.event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les admins et agents peuvent voir toutes les inscriptions
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.event_registrations;
CREATE POLICY "Admins can view all registrations"
  ON public.event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND type IN ('admin', 'agent')
    )
  );

-- Les admins peuvent tout modifier
DROP POLICY IF EXISTS "Admins can update registrations" ON public.event_registrations;
CREATE POLICY "Admins can update registrations"
  ON public.event_registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND type = 'admin'
    )
  );

-- Vérification
SELECT COUNT(*) as total_registrations FROM public.event_registrations;
