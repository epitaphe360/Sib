ALTER TABLE lab.email_messages
  ADD COLUMN IF NOT EXISTS body text;

ALTER TABLE lab.supplier_deadlines
  ADD COLUMN IF NOT EXISTS reminded_at timestamptz,
  ADD COLUMN IF NOT EXISTS late_notified_at timestamptz;
