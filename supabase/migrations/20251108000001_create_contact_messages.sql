-- Migration: Création table contact_messages
-- Date: 2025-11-08
-- Description: Table pour stocker les messages de contact du formulaire

-- Créer la table contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  subject VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES users(id),
  response_notes TEXT,

  -- Index pour recherche rapide
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Commentaires
COMMENT ON TABLE contact_messages IS 'Messages de contact envoyés via le formulaire du site';
COMMENT ON COLUMN contact_messages.status IS 'Statut du message: new, in_progress, resolved, archived';
COMMENT ON COLUMN contact_messages.subject IS 'Sujet: exhibitor, visitor, partnership, support, other';

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut créer un message de contact (anonyme)
CREATE POLICY "Anyone can create contact message"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Seuls les admins peuvent lire les messages
CREATE POLICY "Admins can view all contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Policy: Seuls les admins peuvent mettre à jour les messages
CREATE POLICY "Admins can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();
