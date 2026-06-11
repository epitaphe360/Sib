-- Messagerie mobile : colonnes manquantes, RLS conversations, RPC sécurisées

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS receiver_id uuid;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
    CREATE POLICY "Users can create conversations"
      ON conversations FOR INSERT TO authenticated
      WITH CHECK (
        auth.uid() = created_by
        AND auth.uid() = ANY(participants)
      );

    DROP POLICY IF EXISTS "Participants can update conversations" ON conversations;
    CREATE POLICY "Participants can update conversations"
      ON conversations FOR UPDATE TO authenticated
      USING (auth.uid() = ANY(participants))
      WITH CHECK (auth.uid() = ANY(participants));
  END IF;
END $$;

-- Trouve ou crée une conversation directe (contourne RLS INSERT côté client)
CREATE OR REPLACE FUNCTION get_or_create_conversation(p_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_sender_id uuid;
BEGIN
  v_sender_id := auth.uid();
  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;
  IF p_other_user_id IS NULL OR p_other_user_id = v_sender_id THEN
    RAISE EXCEPTION 'Destinataire invalide';
  END IF;

  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE type = 'direct'
    AND participants @> ARRAY[v_sender_id, p_other_user_id]
    AND participants <@ ARRAY[v_sender_id, p_other_user_id]
  LIMIT 1;

  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (type, participants, created_by, is_active)
    VALUES ('direct', ARRAY[v_sender_id, p_other_user_id], v_sender_id, true)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- Envoie un message direct (crée la conversation si besoin)
CREATE OR REPLACE FUNCTION send_direct_message(
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
  IF p_content IS NULL OR btrim(p_content) = '' THEN
    RAISE EXCEPTION 'Message vide';
  END IF;

  v_conversation_id := get_or_create_conversation(p_receiver_id);

  INSERT INTO messages (conversation_id, sender_id, receiver_id, content, message_type)
  VALUES (v_conversation_id, v_sender_id, p_receiver_id, btrim(p_content), COALESCE(p_message_type, 'text'))
  RETURNING id INTO v_message_id;

  UPDATE conversations
  SET last_message_at = now(), updated_at = now()
  WHERE id = v_conversation_id;

  RETURN v_message_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_or_create_conversation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION send_direct_message(uuid, text, text) TO authenticated;
