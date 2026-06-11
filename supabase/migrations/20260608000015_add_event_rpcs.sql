-- ============================================================
-- RPC : increment / decrement compteur inscriptions événement
-- ============================================================
CREATE OR REPLACE FUNCTION increment_event_registered(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'events'
  ) THEN
    UPDATE public.events
    SET registered = COALESCE(registered, 0) + 1
    WHERE id = p_event_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_event_registered(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'events'
  ) THEN
    UPDATE public.events
    SET registered = GREATEST(COALESCE(registered, 0) - 1, 0)
    WHERE id = p_event_id;
  END IF;
END;
$$;
