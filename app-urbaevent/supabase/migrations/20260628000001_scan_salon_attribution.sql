-- Attribution salon sur scans (access_logs, connections, exhibitor_leads)

ALTER TABLE public.connections
  ADD COLUMN IF NOT EXISTS salon_id text,
  ADD COLUMN IF NOT EXISTS salon_name text;

ALTER TABLE public.exhibitor_leads
  ADD COLUMN IF NOT EXISTS salon_id text,
  ADD COLUMN IF NOT EXISTS salon_name text;

ALTER TABLE public.access_logs
  ADD COLUMN IF NOT EXISTS salon_id text,
  ADD COLUMN IF NOT EXISTS salon_name text;

CREATE INDEX IF NOT EXISTS idx_access_logs_scanned_by ON public.access_logs (scanned_by, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_salon ON public.access_logs (salon_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_connections_salon ON public.connections (salon_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exhibitor_leads_salon ON public.exhibitor_leads (salon_id, scanned_at DESC);

DROP POLICY IF EXISTS "Visitors can view leads where they were scanned" ON public.exhibitor_leads;
CREATE POLICY "Visitors can view leads where they were scanned"
  ON public.exhibitor_leads FOR SELECT
  TO authenticated
  USING (visitor_user_id = auth.uid());
