-- Migration de correction pour la table notifications
-- Assure que la structure est correcte et que les policies RLS permettent l'insertion

-- Supprimer l'ancienne table si elle existe avec l'ancien schéma
DO $$ 
BEGIN
  -- Vérifier si la table existe avec l'ancien schéma (colonne 'read' au lieu de 'is_read')
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'read'
  ) THEN
    -- Renommer read en is_read
    ALTER TABLE notifications RENAME COLUMN read TO is_read;
  END IF;

  -- Ajouter les colonnes manquantes si elles n'existent pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE notifications ADD COLUMN title text NOT NULL DEFAULT 'Notification';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE notifications ADD COLUMN category text DEFAULT 'general';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'action_url'
  ) THEN
    ALTER TABLE notifications ADD COLUMN action_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE notifications ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN expires_at timestamptz;
  END IF;
END $$;

-- Activer RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Créer les policies mises à jour
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- IMPORTANT: Policy pour permettre l'insertion de notifications
-- Cette policy permet à n'importe quel utilisateur authentifié d'insérer des notifications
-- pour d'autres utilisateurs (nécessaire pour les notifications de connexion, etc.)
CREATE POLICY "Authenticated users can insert notifications" ON notifications
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Vérifier la structure finale
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'notifications'
  AND column_name IN ('id', 'user_id', 'title', 'message', 'type', 'category', 'is_read', 'action_url', 'metadata', 'created_at', 'expires_at');
  
  IF column_count = 11 THEN
    RAISE NOTICE '✅ Table notifications correctement configurée avec % colonnes', column_count;
  ELSE
    RAISE WARNING '⚠️ Table notifications a % colonnes sur 11 attendues', column_count;
  END IF;
END $$;
