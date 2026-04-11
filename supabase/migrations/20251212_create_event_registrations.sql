-- Migration: Création table event_registrations
-- Date: 2025-12-12
-- Description: Table pour gérer les inscriptions aux événements

-- Table event_registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registration_type text DEFAULT 'standard',
  status text NOT NULL DEFAULT 'confirmed',
  registered_at timestamptz DEFAULT now(),
  attended_at timestamptz,
  notes text,
  special_requirements text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Contrainte d'unicité: un utilisateur ne peut s'inscrire qu'une fois par événement
  UNIQUE(event_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

-- RLS (Row Level Security)
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres inscriptions
CREATE POLICY "Users can view own event registrations"
  ON event_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent créer leurs propres inscriptions
CREATE POLICY "Users can create own event registrations"
  ON event_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent mettre à jour leurs propres inscriptions
CREATE POLICY "Users can update own event registrations"
  ON event_registrations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs propres inscriptions
CREATE POLICY "Users can delete own event registrations"
  ON event_registrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Les admins peuvent tout voir
CREATE POLICY "Admins can view all event registrations"
  ON event_registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Policy: Les admins peuvent tout modifier
CREATE POLICY "Admins can manage all event registrations"
  ON event_registrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Fonction trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_event_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_registrations_updated_at_trigger
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_event_registrations_updated_at();

-- Fonction pour compter les inscrits d'un événement
CREATE OR REPLACE FUNCTION count_event_registrations(p_event_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM event_registrations
    WHERE event_id = p_event_id
    AND status = 'confirmed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
