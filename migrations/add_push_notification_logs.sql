-- Migration : Table historique des notifications push
-- À exécuter dans Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS push_notification_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT        NOT NULL,
  message          TEXT        NOT NULL,
  audience         TEXT        NOT NULL DEFAULT 'all'
                               CHECK (audience IN ('all', 'visitors', 'vip', 'exhibitors', 'agents')),
  recipient_count  INT         DEFAULT 0,
  sent_at          TIMESTAMPTZ DEFAULT now(),
  sent_by          UUID        REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE push_notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins seulement - push logs" ON push_notification_logs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin')
  );

-- Index pour l'ordre chronologique
CREATE INDEX IF NOT EXISTS idx_push_logs_sent_at ON push_notification_logs (sent_at DESC);
