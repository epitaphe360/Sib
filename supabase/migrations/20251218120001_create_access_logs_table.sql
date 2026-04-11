-- ========================================
-- Create Access Logs Table for Physical Access Control
-- ========================================
-- Date: 2024-12-18
-- Purpose: Logger tous les accès physiques (accordés/refusés) avec QR codes
-- ========================================

-- ========================================
-- 1. CREATE ACCESS_LOGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User information
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_name text,
  user_type text CHECK (user_type IN ('visitor', 'partner', 'exhibitor', 'admin', 'security')),
  user_level text, -- 'free', 'premium', 'museum', 'silver', 'gold', 'platinium'

  -- Access details
  zone text, -- 'public', 'vip_lounge', 'exhibition_hall', 'backstage', etc.
  event text, -- 'conference', 'gala', 'workshop', etc.
  entrance_point text, -- 'main_entrance', 'vip_entrance', 'exhibitor_entrance'

  -- Status
  status text NOT NULL CHECK (status IN ('granted', 'denied')),
  reason text, -- Reason if denied

  -- Agent who scanned
  scanned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  scanner_device text, -- Device identifier

  -- Timestamps
  accessed_at timestamptz DEFAULT now(),

  -- Metadata
  metadata jsonb DEFAULT '{}',

  -- Indexes
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed_at ON access_logs(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_status ON access_logs(status);
CREATE INDEX IF NOT EXISTS idx_access_logs_zone ON access_logs(zone);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_type ON access_logs(user_type);

-- Index composite pour les requêtes de statistiques
CREATE INDEX IF NOT EXISTS idx_access_logs_stats
  ON access_logs(accessed_at DESC, status, user_type, zone);

-- ========================================
-- 3. CREATE RLS POLICIES
-- ========================================

ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'access_logs'
    AND policyname = 'Users can view their own access logs'
  ) THEN
    CREATE POLICY "Users can view their own access logs"
      ON access_logs FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Les admins et sécurité peuvent voir tous les logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'access_logs'
    AND policyname = 'Admins and security can view all access logs'
  ) THEN
    CREATE POLICY "Admins and security can view all access logs"
      ON access_logs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND type IN ('admin', 'security')
        )
      );
  END IF;
END $$;

-- Les agents de sécurité peuvent créer des logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'access_logs'
    AND policyname = 'Security agents can create access logs'
  ) THEN
    CREATE POLICY "Security agents can create access logs"
      ON access_logs FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND type IN ('admin', 'security')
        )
        OR auth.uid() = user_id -- Users can log their own accesses
      );
  END IF;
END $$;

-- ========================================
-- 4. CREATE HELPER FUNCTIONS
-- ========================================

-- Fonction pour obtenir les statistiques d'accès
CREATE OR REPLACE FUNCTION get_access_stats(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_zone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'granted', COUNT(*) FILTER (WHERE status = 'granted'),
    'denied', COUNT(*) FILTER (WHERE status = 'denied'),
    'by_user_type', (
      SELECT jsonb_object_agg(user_type, count)
      FROM (
        SELECT user_type, COUNT(*) as count
        FROM access_logs
        WHERE (p_start_date IS NULL OR accessed_at >= p_start_date)
        AND (p_end_date IS NULL OR accessed_at <= p_end_date)
        AND (p_zone IS NULL OR zone = p_zone)
        GROUP BY user_type
      ) sub
    ),
    'by_zone', (
      SELECT jsonb_object_agg(zone, count)
      FROM (
        SELECT zone, COUNT(*) as count
        FROM access_logs
        WHERE (p_start_date IS NULL OR accessed_at >= p_start_date)
        AND (p_end_date IS NULL OR accessed_at <= p_end_date)
        AND (p_zone IS NULL OR zone = p_zone)
        GROUP BY zone
      ) sub
    ),
    'by_hour', (
      SELECT jsonb_object_agg(hour, count)
      FROM (
        SELECT EXTRACT(HOUR FROM accessed_at) as hour, COUNT(*) as count
        FROM access_logs
        WHERE (p_start_date IS NULL OR accessed_at >= p_start_date)
        AND (p_end_date IS NULL OR accessed_at <= p_end_date)
        AND (p_zone IS NULL OR zone = p_zone)
        GROUP BY hour
        ORDER BY hour
      ) sub
    )
  )
  INTO v_stats
  FROM access_logs
  WHERE (p_start_date IS NULL OR accessed_at >= p_start_date)
  AND (p_end_date IS NULL OR accessed_at <= p_end_date)
  AND (p_zone IS NULL OR zone = p_zone);

  RETURN v_stats;
END;
$$;

-- Fonction pour obtenir les derniers accès en temps réel
CREATE OR REPLACE FUNCTION get_recent_access_logs(
  p_limit integer DEFAULT 50,
  p_zone text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_name text,
  user_type text,
  user_level text,
  zone text,
  status text,
  reason text,
  accessed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    al.user_name,
    al.user_type,
    al.user_level,
    al.zone,
    al.status,
    al.reason,
    al.accessed_at
  FROM access_logs al
  WHERE (p_zone IS NULL OR al.zone = p_zone)
  ORDER BY al.accessed_at DESC
  LIMIT p_limit;
END;
$$;

-- Fonction pour détecter les tentatives suspectes
CREATE OR REPLACE FUNCTION detect_suspicious_access()
RETURNS TABLE (
  user_id uuid,
  user_name text,
  denied_count bigint,
  last_denied_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Utilisateurs avec plus de 3 refus dans les 10 dernières minutes
  RETURN QUERY
  SELECT
    al.user_id,
    al.user_name,
    COUNT(*) as denied_count,
    MAX(al.accessed_at) as last_denied_at
  FROM access_logs al
  WHERE
    al.status = 'denied'
    AND al.accessed_at >= NOW() - INTERVAL '10 minutes'
  GROUP BY al.user_id, al.user_name
  HAVING COUNT(*) >= 3
  ORDER BY denied_count DESC;
END;
$$;

-- ========================================
-- 5. CREATE TRIGGER FOR AUTO-CLEANUP
-- ========================================

-- Trigger pour archiver les logs de plus de 30 jours
CREATE OR REPLACE FUNCTION archive_old_access_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Déplacer vers une table d'archive (à créer si nécessaire)
  -- Pour l'instant, on se contente de supprimer
  DELETE FROM access_logs
  WHERE accessed_at < NOW() - INTERVAL '30 days';
END;
$$;

-- ========================================
-- 6. REALTIME PUBLICATION
-- ========================================

-- Activer les publications en temps réel pour les logs d'accès
ALTER PUBLICATION supabase_realtime ADD TABLE access_logs;

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE access_logs IS 'Logs de tous les accès physiques au salon (accordés et refusés)';
COMMENT ON COLUMN access_logs.zone IS 'Zone d\'accès demandée (public, vip_lounge, backstage, etc.)';
COMMENT ON COLUMN access_logs.status IS 'Statut: granted (accès accordé) ou denied (accès refusé)';
COMMENT ON COLUMN access_logs.scanned_by IS 'Agent de sécurité qui a scanné le QR code';

COMMENT ON FUNCTION get_access_stats IS 'Obtenir les statistiques d\'accès agrégées';
COMMENT ON FUNCTION get_recent_access_logs IS 'Obtenir les derniers logs d\'accès en temps réel';
COMMENT ON FUNCTION detect_suspicious_access IS 'Détecter les tentatives d\'accès suspectes (multiples refus)';

-- ========================================
-- END OF MIGRATION
-- ========================================
