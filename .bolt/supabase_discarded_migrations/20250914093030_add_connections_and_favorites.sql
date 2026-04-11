/*
  Add social graph tables: connections and user_favorites

  - connections: manages connection requests and accepted links between users
  - user_favorites: stores a user's favorite other users

  Includes RLS policies and useful indexes
*/

-- Safety: drop if created incorrectly (only for local iteration)
-- DROP TABLE IF EXISTS connections CASCADE;
-- DROP TABLE IF EXISTS user_favorites CASCADE;

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected' | 'blocked'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_distinct_users CHECK (requester_id <> addressee_id)
);

-- Ensure uniqueness regardless of requester/addressee order
CREATE UNIQUE INDEX IF NOT EXISTS uniq_connections_pair
ON connections (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_addressee ON connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = requester_id::text OR auth.uid()::text = addressee_id::text
  );

CREATE POLICY "Users can create connection requests"
  ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = requester_id::text);

CREATE POLICY "Participants can update connection status"
  ON connections
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text = requester_id::text OR auth.uid()::text = addressee_id::text
  );

CREATE POLICY "Requester can delete pending request"
  ON connections
  FOR DELETE
  TO authenticated
  USING (
    auth.uid()::text = requester_id::text AND status = 'pending'
  );

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS connections_set_updated_at ON connections;
CREATE TRIGGER connections_set_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_user_favorite_distinct CHECK (user_id <> favorite_user_id),
  PRIMARY KEY (user_id, favorite_user_id)
);

-- Index to query who has favorited a user
CREATE INDEX IF NOT EXISTS idx_user_favorites_favorite ON user_favorites(favorite_user_id);

-- RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their favorites"
  ON user_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can add favorites for themselves"
  ON user_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can remove their own favorites"
  ON user_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);
