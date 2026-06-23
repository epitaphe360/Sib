-- Mobile app: exhibitor lead capture + Realtime for push listeners

-- ============================================================
-- exhibitor_leads — scans contacts au stand (app mobile exposant)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exhibitor_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  badge_code text,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exhibitor_leads_exhibitor ON public.exhibitor_leads (exhibitor_user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitor_leads_scanned_at ON public.exhibitor_leads (scanned_at DESC);

ALTER TABLE public.exhibitor_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Exhibitors can view own leads" ON public.exhibitor_leads;
CREATE POLICY "Exhibitors can view own leads"
  ON public.exhibitor_leads FOR SELECT
  USING (auth.uid() = exhibitor_user_id);

DROP POLICY IF EXISTS "Exhibitors can insert own leads" ON public.exhibitor_leads;
CREATE POLICY "Exhibitors can insert own leads"
  ON public.exhibitor_leads FOR INSERT
  WITH CHECK (auth.uid() = exhibitor_user_id);

DROP POLICY IF EXISTS "Admins can manage all exhibitor leads" ON public.exhibitor_leads;
CREATE POLICY "Admins can manage all exhibitor leads"
  ON public.exhibitor_leads FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

GRANT SELECT, INSERT ON public.exhibitor_leads TO authenticated;

COMMENT ON TABLE public.exhibitor_leads IS 'Contacts visiteurs scannés par les exposants (app mobile)';

-- ============================================================
-- Realtime — notifications locales mobile (RDV, messages, admin)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payment_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'registration_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registration_requests;
  END IF;
END $$;
