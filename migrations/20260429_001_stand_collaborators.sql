-- ============================================================
-- MODULE 1 : Collaborateurs de Stand
-- Permet aux exposants et sponsors d'ajouter des collaborateurs
-- qui reçoivent un login/badge propre
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stand_collaborators (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_type      TEXT NOT NULL CHECK (owner_type IN ('exhibitor', 'partner')),
  exhibitor_id    UUID REFERENCES public.exhibitors(id) ON DELETE CASCADE,
  partner_id      UUID REFERENCES public.partners(id)  ON DELETE CASCADE,
  -- Informations personnelles du collaborateur
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  position        TEXT DEFAULT 'Staff Stand',
  -- Compte auth généré
  auth_user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  temp_password   TEXT, -- stocké temporairement, effacé après 1ère connexion
  credentials_sent_at TIMESTAMPTZ,
  -- Badge
  badge_generated BOOLEAN DEFAULT FALSE,
  badge_url       TEXT,
  -- Statut
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_stand_collaborators_owner     ON public.stand_collaborators(owner_id);
CREATE INDEX IF NOT EXISTS idx_stand_collaborators_exhibitor ON public.stand_collaborators(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_stand_collaborators_partner   ON public.stand_collaborators(partner_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stand_collaborators_email ON public.stand_collaborators(email);

-- RLS
ALTER TABLE public.stand_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_manage_collaborators" ON public.stand_collaborators
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "admin_all_collaborators" ON public.stand_collaborators
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin'
  ));

CREATE POLICY "collaborator_view_own" ON public.stand_collaborators
  USING (auth_user_id = auth.uid());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_stand_collaborators_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stand_collaborators_updated_at
  BEFORE UPDATE ON public.stand_collaborators
  FOR EACH ROW EXECUTE FUNCTION update_stand_collaborators_updated_at();
