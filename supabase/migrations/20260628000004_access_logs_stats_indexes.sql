-- Index pour statistiques admin à grande échelle (200k+ visiteurs / millions de scans)

CREATE INDEX IF NOT EXISTS idx_access_logs_granted_user
  ON public.access_logs (user_id)
  WHERE status = 'granted' AND user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_access_logs_granted_salon_user
  ON public.access_logs (salon_id, user_id)
  WHERE status = 'granted' AND user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_access_logs_status_salon
  ON public.access_logs (status, salon_id);

CREATE INDEX IF NOT EXISTS idx_access_logs_accessed_at_desc
  ON public.access_logs (accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_connections_created_at_desc
  ON public.connections (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_exhibitor_leads_scanned_at_desc
  ON public.exhibitor_leads (scanned_at DESC);
