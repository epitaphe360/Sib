-- Correctifs transverses tableaux de bord : quotas VIP, messagerie, speed networking,
-- connexions, leads exposant (collaborateurs), approbation inscriptions admin.

-- ============================================================================
-- Quota B2B : pending_payment compte comme gratuit (pas premium illimité)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_b2b_quota(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_user_type text;
  v_visitor_level text;
  v_status text;
  v_effective_level text;
BEGIN
  SELECT type, visitor_level, status
  INTO v_user_type, v_visitor_level, v_status
  FROM public.users
  WHERE id = p_user_id;

  IF v_user_type = 'visitor' THEN
    IF v_status = 'pending_payment' THEN
      v_effective_level := 'free';
    ELSE
      v_effective_level := COALESCE(v_visitor_level, 'free');
    END IF;

    RETURN CASE v_effective_level
      WHEN 'vip' THEN 999999
      WHEN 'premium' THEN 999999
      ELSE 0
    END;
  END IF;

  RETURN CASE
    WHEN v_user_type IN ('exhibitor', 'partner', 'admin', 'security') THEN 999999
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- Visiteur actif premium/vip (messages, speed networking)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_active_premium_visitor(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type text;
  v_level text;
  v_status text;
BEGIN
  SELECT type, visitor_level, status
  INTO v_type, v_level, v_status
  FROM public.users
  WHERE id = p_user_id;

  IF v_type IS DISTINCT FROM 'visitor' THEN
    RETURN true;
  END IF;

  IF v_status IS DISTINCT FROM 'active' THEN
    RETURN false;
  END IF;

  RETURN COALESCE(v_level, 'free') IN ('premium', 'vip');
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_active_premium_visitor(uuid) TO authenticated;

-- ============================================================================
-- Messagerie : réservée aux VIP actifs (visiteurs)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.send_direct_message(
  p_receiver_id uuid,
  p_content text,
  p_message_type text DEFAULT 'text'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_message_id uuid;
  v_sender_id uuid;
BEGIN
  v_sender_id := auth.uid();
  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;
  IF NOT public.is_active_premium_visitor(v_sender_id) THEN
    RAISE EXCEPTION 'Messagerie réservée au Pass Premium VIP';
  END IF;
  IF p_content IS NULL OR btrim(p_content) = '' THEN
    RAISE EXCEPTION 'Message vide';
  END IF;

  v_conversation_id := public.get_or_create_conversation(p_receiver_id);

  INSERT INTO messages (conversation_id, sender_id, receiver_id, content, message_type)
  VALUES (v_conversation_id, v_sender_id, p_receiver_id, btrim(p_content), COALESCE(p_message_type, 'text'))
  RETURNING id INTO v_message_id;

  UPDATE conversations
  SET last_message_at = now(), updated_at = now()
  WHERE id = v_conversation_id;

  RETURN v_message_id;
END;
$$;

-- ============================================================================
-- Speed networking : VIP actifs uniquement
-- ============================================================================
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
  IF NOT public.is_active_premium_visitor(v_user_id) THEN
    RAISE EXCEPTION 'Speed networking réservé au Pass Premium VIP';
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

-- ============================================================================
-- Connexions : RPC avec quota journalier (fuseau Africa/Casablanca)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.request_networking_connection(p_addressee_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requester_id uuid := auth.uid();
  v_existing_id uuid;
  v_today_count integer;
  v_max_daily integer;
  v_new_id uuid;
BEGIN
  IF v_requester_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;
  IF p_addressee_id IS NULL OR p_addressee_id = v_requester_id THEN
    RAISE EXCEPTION 'Destinataire invalide';
  END IF;

  SELECT id INTO v_existing_id
  FROM public.connections
  WHERE status <> 'rejected'
    AND (
      (requester_id = v_requester_id AND addressee_id = p_addressee_id)
      OR (requester_id = p_addressee_id AND addressee_id = v_requester_id)
    )
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'Connexion déjà existante';
  END IF;

  SELECT COUNT(*) INTO v_today_count
  FROM public.connections
  WHERE requester_id = v_requester_id
    AND created_at >= (date_trunc('day', now() AT TIME ZONE 'Africa/Casablanca') AT TIME ZONE 'Africa/Casablanca');

  v_max_daily := CASE
    WHEN public.is_active_premium_visitor(v_requester_id) THEN 1000
    WHEN EXISTS (SELECT 1 FROM public.users WHERE id = v_requester_id AND type = 'visitor') THEN 20
    ELSE 1000
  END;

  IF v_today_count >= v_max_daily THEN
    RAISE EXCEPTION 'Limite quotidienne de connexions atteinte';
  END IF;

  INSERT INTO public.connections (requester_id, addressee_id, status)
  VALUES (v_requester_id, p_addressee_id, 'pending')
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_networking_connection(uuid) TO authenticated;

-- ============================================================================
-- Leads exposant : owner + collaborateurs
-- ============================================================================
DROP POLICY IF EXISTS "Exhibitors can view own leads" ON public.exhibitor_leads;
DROP POLICY IF EXISTS "Exhibitors can insert own leads" ON public.exhibitor_leads;

CREATE POLICY "Exhibitors can view stand leads"
  ON public.exhibitor_leads FOR SELECT
  USING (
    auth.uid() = exhibitor_user_id
    OR EXISTS (
      SELECT 1 FROM public.stand_collaborators sc
      WHERE sc.auth_user_id = auth.uid()
        AND sc.owner_id = exhibitor_user_id
        AND sc.status = 'active'
    )
  );

CREATE POLICY "Exhibitors can insert stand leads"
  ON public.exhibitor_leads FOR INSERT
  WITH CHECK (
    auth.uid() = exhibitor_user_id
    OR EXISTS (
      SELECT 1 FROM public.stand_collaborators sc
      WHERE sc.auth_user_id = auth.uid()
        AND sc.owner_id = exhibitor_user_id
        AND sc.status = 'active'
    )
  );
