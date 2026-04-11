-- Migration pour les tables de réseautage
-- Date: 2025-10-04

-- Table pour les connexions entre utilisateurs
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_connected_user_id ON connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- Table pour les favoris
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorited_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, favorited_user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_favorited_user_id ON favorites(favorited_user_id);

-- Table pour les quotas quotidiens (sécurisé côté serveur)
CREATE TABLE IF NOT EXISTS daily_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  connections_count INTEGER NOT NULL DEFAULT 0,
  messages_count INTEGER NOT NULL DEFAULT 0,
  meetings_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_daily_quotas_user_date ON daily_quotas(user_id, date);

-- Table pour les logs de scraping (pour le monitoring)
CREATE TABLE IF NOT EXISTS scraping_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  message TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_scraping_logs_created_at ON scraping_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_level ON scraping_logs(level);

-- Fonction pour mettre à jour le timestamp updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour connections
DROP TRIGGER IF EXISTS update_connections_updated_at ON connections;
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour daily_quotas
DROP TRIGGER IF EXISTS update_daily_quotas_updated_at ON daily_quotas;
CREATE TRIGGER update_daily_quotas_updated_at
  BEFORE UPDATE ON daily_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour obtenir les connexions d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_connections(p_user_id UUID)
RETURNS TABLE (
  connection_id UUID,
  connected_user_id UUID,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.connected_user_id,
    c.status,
    c.created_at
  FROM connections c
  WHERE c.user_id = p_user_id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les favoris d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_favorites(p_user_id UUID)
RETURNS TABLE (
  favorite_id UUID,
  favorited_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.favorited_user_id,
    f.created_at
  FROM favorites f
  WHERE f.user_id = p_user_id
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier et incrémenter les quotas quotidiens
CREATE OR REPLACE FUNCTION check_and_increment_quota(
  p_user_id UUID,
  p_action TEXT -- 'connection', 'message', ou 'meeting'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
  v_max_quota INTEGER;
  v_user_type TEXT;
  v_pass_type TEXT;
BEGIN
  -- Récupérer le type d'utilisateur et le pass
  SELECT type, visitor_level INTO v_user_type, v_pass_type
  FROM users
  WHERE id = p_user_id;

  -- Définir les quotas selon le type d'utilisateur et le pass
  IF v_user_type = 'visitor' THEN
    CASE v_pass_type
      WHEN 'free' THEN v_max_quota := 2;
      WHEN 'basic' THEN v_max_quota := 5;
      WHEN 'premium' THEN v_max_quota := 10;
      WHEN 'vip' THEN v_max_quota := 999; -- Illimité
      ELSE v_max_quota := 2;
    END CASE;
  ELSE
    v_max_quota := 999; -- Illimité pour exposants et partenaires
  END IF;

  -- Créer ou récupérer le quota du jour
  INSERT INTO daily_quotas (user_id, date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, date) DO NOTHING;

  -- Récupérer le compteur actuel
  IF p_action = 'connection' THEN
    SELECT connections_count INTO v_current_count
    FROM daily_quotas
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  ELSIF p_action = 'message' THEN
    SELECT messages_count INTO v_current_count
    FROM daily_quotas
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  ELSIF p_action = 'meeting' THEN
    SELECT meetings_count INTO v_current_count
    FROM daily_quotas
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  END IF;

  -- Vérifier si le quota est atteint
  IF v_current_count >= v_max_quota THEN
    RETURN FALSE;
  END IF;

  -- Incrémenter le compteur
  IF p_action = 'connection' THEN
    UPDATE daily_quotas
    SET connections_count = connections_count + 1
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  ELSIF p_action = 'message' THEN
    UPDATE daily_quotas
    SET messages_count = messages_count + 1
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  ELSIF p_action = 'meeting' THEN
    UPDATE daily_quotas
    SET meetings_count = meetings_count + 1
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour la documentation
COMMENT ON TABLE connections IS 'Table pour gérer les connexions entre utilisateurs du réseau';
COMMENT ON TABLE favorites IS 'Table pour gérer les favoris des utilisateurs';
COMMENT ON TABLE daily_quotas IS 'Table pour gérer les quotas quotidiens d''actions de réseautage';
COMMENT ON TABLE scraping_logs IS 'Table pour stocker les logs du service de scraping de mini-sites';
