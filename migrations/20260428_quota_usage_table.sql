-- ============================================================
-- Migration : Création de la table quota_usage
-- Date: 2026-04-28
-- Description: Tracking de l'usage des quotas par utilisateur
-- ============================================================

-- Table principale quota_usage
CREATE TABLE IF NOT EXISTS quota_usage (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quota_type    text        NOT NULL,  -- 'connections', 'appointments', 'favorites', 'media_uploads', etc.
  current_usage integer     NOT NULL DEFAULT 0 CHECK (current_usage >= 0),
  period        text        NOT NULL DEFAULT 'daily'
                            CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly', 'lifetime')),
  reset_at      timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, quota_type, period)
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_quota_usage_user_id    ON quota_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_quota_usage_quota_type ON quota_usage(quota_type);
CREATE INDEX IF NOT EXISTS idx_quota_usage_reset_at   ON quota_usage(reset_at);
CREATE INDEX IF NOT EXISTS idx_quota_usage_created_at ON quota_usage(created_at);

-- RLS
ALTER TABLE quota_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quota_usage_select_own"  ON quota_usage;
DROP POLICY IF EXISTS "quota_usage_manage_own"  ON quota_usage;
DROP POLICY IF EXISTS "quota_usage_admin_all"   ON quota_usage;

CREATE POLICY "quota_usage_select_own"
  ON quota_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "quota_usage_manage_own"
  ON quota_usage FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quota_usage_admin_all"
  ON quota_usage FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Supprimer les versions existantes pour éviter l'ambiguïté de surcharge
DROP FUNCTION IF EXISTS get_quota_usage(uuid, text, text);
DROP FUNCTION IF EXISTS get_quota_usage(uuid, text);
DROP FUNCTION IF EXISTS increment_quota_usage(uuid, text, text, integer);
DROP FUNCTION IF EXISTS increment_quota_usage(uuid, text, text);
DROP FUNCTION IF EXISTS increment_quota_usage(uuid, text);
DROP FUNCTION IF EXISTS reset_expired_quotas();

-- Fonction utilitaire : lire le quota courant
CREATE OR REPLACE FUNCTION get_quota_usage(
  p_user_id   uuid,
  p_quota_type text,
  p_period     text DEFAULT 'daily'
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT current_usage
       FROM quota_usage
      WHERE user_id    = p_user_id
        AND quota_type = p_quota_type
        AND period     = p_period
        AND (reset_at IS NULL OR reset_at > NOW())
      LIMIT 1),
    0
  );
$$;

-- Fonction utilitaire : incrémenter un quota (upsert)
CREATE OR REPLACE FUNCTION increment_quota_usage(
  p_user_id    uuid,
  p_quota_type text,
  p_period     text    DEFAULT 'daily',
  p_increment  integer DEFAULT 1
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reset_at  timestamptz;
  v_new_usage integer;
BEGIN
  -- Calculer la prochaine date de reset selon la période
  v_reset_at := CASE p_period
    WHEN 'daily'    THEN date_trunc('day',  NOW()) + INTERVAL '1 day'
    WHEN 'weekly'   THEN date_trunc('week', NOW()) + INTERVAL '1 week'
    WHEN 'monthly'  THEN date_trunc('month',NOW()) + INTERVAL '1 month'
    WHEN 'yearly'   THEN date_trunc('year', NOW()) + INTERVAL '1 year'
    ELSE NULL  -- 'lifetime' : pas de reset
  END;

  INSERT INTO quota_usage (user_id, quota_type, period, current_usage, reset_at, updated_at)
  VALUES (p_user_id, p_quota_type, p_period, p_increment, v_reset_at, NOW())
  ON CONFLICT (user_id, quota_type, period)
  DO UPDATE SET
    current_usage = quota_usage.current_usage + p_increment,
    updated_at    = NOW()
  RETURNING current_usage INTO v_new_usage;

  RETURN v_new_usage;
END;
$$;

-- Réinitialiser les quotas expirés (à appeler via cron ou manuellement)
CREATE OR REPLACE FUNCTION reset_expired_quotas()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE quota_usage
  SET current_usage = 0,
      reset_at      = CASE period
        WHEN 'daily'   THEN NOW() + INTERVAL '1 day'
        WHEN 'weekly'  THEN NOW() + INTERVAL '1 week'
        WHEN 'monthly' THEN NOW() + INTERVAL '1 month'
        WHEN 'yearly'  THEN NOW() + INTERVAL '1 year'
        ELSE reset_at
      END,
      updated_at = NOW()
  WHERE reset_at IS NOT NULL
    AND reset_at <= NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION get_quota_usage(uuid, text, text)      TO authenticated;
GRANT EXECUTE ON FUNCTION increment_quota_usage(uuid, text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_expired_quotas()                 TO authenticated;

COMMENT ON TABLE  quota_usage IS 'Tracking de l''usage des quotas par utilisateur';
COMMENT ON COLUMN quota_usage.quota_type    IS 'Type de quota : connections, appointments, favorites, media_uploads, …';
COMMENT ON COLUMN quota_usage.current_usage IS 'Valeur courante consommée sur la période';
COMMENT ON COLUMN quota_usage.period        IS 'Granularité du reset : daily, weekly, monthly, yearly, lifetime';
COMMENT ON COLUMN quota_usage.reset_at      IS 'Date/heure à laquelle le compteur sera remis à zéro';
