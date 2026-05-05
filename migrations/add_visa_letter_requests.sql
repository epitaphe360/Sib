-- Migration: Demandes de lettres d'invitation visa
-- À exécuter dans Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS visa_letter_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email       TEXT NOT NULL,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  passport_number  TEXT NOT NULL,
  nationality      TEXT NOT NULL,
  date_of_birth    DATE,
  organization     TEXT,
  job_title        TEXT,
  address          TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  reviewed_at      TIMESTAMPTZ,
  reviewed_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION update_visa_letter_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_visa_letter_updated_at ON visa_letter_requests;
CREATE TRIGGER trg_visa_letter_updated_at
  BEFORE UPDATE ON visa_letter_requests
  FOR EACH ROW EXECUTE FUNCTION update_visa_letter_updated_at();

-- RLS
ALTER TABLE visa_letter_requests ENABLE ROW LEVEL SECURITY;

-- Le visiteur voit uniquement ses propres demandes
CREATE POLICY "Visiteur - voir ses demandes"
  ON visa_letter_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Le visiteur peut créer une demande
CREATE POLICY "Visiteur - créer une demande"
  ON visa_letter_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- L'admin voit toutes les demandes
CREATE POLICY "Admin - tout voir"
  ON visa_letter_requests FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'
  ));

-- Index
CREATE INDEX IF NOT EXISTS idx_visa_requests_user   ON visa_letter_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_visa_requests_status ON visa_letter_requests (status);
CREATE INDEX IF NOT EXISTS idx_visa_requests_created ON visa_letter_requests (created_at DESC);
