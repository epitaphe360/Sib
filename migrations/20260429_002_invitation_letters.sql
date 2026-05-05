-- ============================================================
-- MODULE 2 : Lettres d'Invitation
-- Workflow : Demande → Admin accepte/refuse → Email envoyé
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invitation_letters (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Demandeur (exposant ou sponsor)
  requester_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_type   TEXT NOT NULL CHECK (requester_type IN ('exhibitor', 'partner')),
  exhibitor_id     UUID REFERENCES public.exhibitors(id) ON DELETE CASCADE,
  partner_id       UUID REFERENCES public.partners(id)  ON DELETE CASCADE,
  requester_company TEXT NOT NULL,
  requester_stand   TEXT,

  -- Informations du destinataire
  recipient_first_name   TEXT NOT NULL,
  recipient_last_name    TEXT NOT NULL,
  recipient_nationality  TEXT NOT NULL,
  recipient_passport_no  TEXT NOT NULL,
  recipient_passport_exp DATE NOT NULL,
  recipient_company      TEXT NOT NULL,
  recipient_position     TEXT NOT NULL,
  recipient_email        TEXT NOT NULL,
  recipient_phone        TEXT NOT NULL,
  recipient_country      TEXT NOT NULL,
  recipient_city         TEXT NOT NULL,

  -- Informations de visite
  visit_purpose    TEXT NOT NULL,
  visit_dates      TEXT[] NOT NULL,          -- ex: ['2026-01-29', '2026-01-30']
  letter_language  TEXT DEFAULT 'fr' CHECK (letter_language IN ('fr', 'ar', 'en')),

  -- Workflow admin
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_id         UUID REFERENCES auth.users(id),
  admin_note       TEXT,
  processed_at     TIMESTAMPTZ,

  -- Email tracking
  email_sent_at    TIMESTAMPTZ,
  letter_pdf_url   TEXT,

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_invitation_letters_requester ON public.invitation_letters(requester_id);
CREATE INDEX IF NOT EXISTS idx_invitation_letters_status    ON public.invitation_letters(status);
CREATE INDEX IF NOT EXISTS idx_invitation_letters_created   ON public.invitation_letters(created_at DESC);

-- RLS
ALTER TABLE public.invitation_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "requester_manage_own_letters" ON public.invitation_letters
  USING (requester_id = auth.uid())
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "admin_all_letters" ON public.invitation_letters
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin'
  ));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_invitation_letters_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invitation_letters_updated_at
  BEFORE UPDATE ON public.invitation_letters
  FOR EACH ROW EXECUTE FUNCTION update_invitation_letters_updated_at();
