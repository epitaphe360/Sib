-- Fix: LiveEventManager — colonnes manquantes dans media_contents
-- La table media_contents n'a pas les colonnes utilisées par le gestionnaire live

ALTER TABLE public.media_contents
  ADD COLUMN IF NOT EXISTS is_live          boolean       DEFAULT false,
  ADD COLUMN IF NOT EXISTS viewers_count    integer       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS host_name        text,
  ADD COLUMN IF NOT EXISTS guest_name       text,
  ADD COLUMN IF NOT EXISTS stream_key       text,
  ADD COLUMN IF NOT EXISTS rtmp_url         text,
  ADD COLUMN IF NOT EXISTS scheduled_date   timestamptz,
  ADD COLUMN IF NOT EXISTS recording_url    text;
