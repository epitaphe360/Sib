-- Tables déjà présentes en prod — versionnées pour aligner les environnements locaux / CI.
-- RPC join_speed_networking_session : insert table + sync JSONB participants (compteur mobile).

CREATE TABLE IF NOT EXISTS public.speed_networking_participants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.speed_networking_sessions(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status     text NOT NULL DEFAULT 'registered',
  joined_at  timestamptz DEFAULT now(),
  UNIQUE (session_id, user_id)
);

ALTER TABLE public.speed_networking_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS snp_own_read ON public.speed_networking_participants;
DROP POLICY IF EXISTS snp_own_insert ON public.speed_networking_participants;

CREATE POLICY snp_own_read ON public.speed_networking_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY snp_own_insert ON public.speed_networking_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.badge_replacements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  old_badge_code text,
  new_badge_code text,
  reason         text,
  replaced_by    uuid REFERENCES public.users(id),
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.badge_replacements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS br_sc_all ON public.badge_replacements;

CREATE POLICY br_sc_all ON public.badge_replacements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type IN ('admin', 'service_client')
    )
  );

CREATE OR REPLACE FUNCTION public.join_speed_networking_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_max int;
  v_participants jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT max_participants, COALESCE(participants, '[]'::jsonb)
  INTO v_max, v_participants
  FROM public.speed_networking_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  IF v_participants @> to_jsonb(v_user_id::text) THEN
    RETURN;
  END IF;

  IF v_max IS NOT NULL AND jsonb_array_length(v_participants) >= v_max THEN
    RAISE EXCEPTION 'Session full';
  END IF;

  INSERT INTO public.speed_networking_participants (session_id, user_id, status)
  VALUES (p_session_id, v_user_id, 'registered')
  ON CONFLICT (session_id, user_id) DO NOTHING;

  UPDATE public.speed_networking_sessions
  SET
    participants = v_participants || to_jsonb(v_user_id::text),
    updated_at = now()
  WHERE id = p_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_speed_networking_session(uuid) TO authenticated;
